$(document).ready(function () {
  $(document).on('click', '.comment-toggle', function () {
    let postId = $(this)
      .closest('.card-body')
      .find('.add-comment')
      .attr('data-post-id');

    if (!postId) {
      alert('Error: Post ID is missing.');
      return;
    }

    let commentSection = $(this).siblings('.comment-section');
    commentSection.toggle();

    $.ajax({
      url: `/forum/api/comment/${postId}`,
      method: 'GET',
      success: function (response) {
        let commentsList = commentSection.find('.comments-list');
        commentsList.html('');

        if (response.status === 'success' && response.data) {
          response.data.forEach((comment) => {
            let commentHTML = `
              <div class="p-2 border-bottom">
                  <div class="d-flex justify-content-between align-items-center">
                      <div>
                          <strong>${comment.userName}</strong>: ${comment.comment}
                          <small class="text-muted">${new Date(comment.createdAt).toLocaleString()}</small>
                      </div>
                      <div>
                          <button class="btn btn-sm btn-outline-success comment-like-btn" 
                              data-comment-id="${comment._id}" 
                              data-post-id="${postId}">
                              <i class="uil uil-thumbs-up"></i> Like (${comment.likes})
                          </button>
                          <button class="btn btn-sm btn-outline-primary reply-toggle" data-comment-id="${comment._id}">
                              <i class="uil uil-comment-alt-message"></i> Reply
                          </button>
                      </div>
                  </div>

                  <!-- Reply Box -->
                  <div class="reply-section mt-2" data-comment-id="${comment._id}" style="display: none;">
                      <input type="text" class="form-control reply-text" placeholder="Write a reply...">
                      <button class="btn btn-sm btn-primary add-reply mt-1" data-comment-id="${comment._id}" data-post-id="${postId}">Post Reply</button>
                      <div class="replies-list mt-2"></div>
                  </div>
              </div>
            `;

            commentsList.append(commentHTML);
          });

          response.data.forEach((comment) => {
            fetchReplies(postId, comment._id);
          });
        } else {
          commentsList.html('<p>No comments found.</p>');
        }
      },
      error: function () {
        alert('Error fetching comments.');
      },
    });
  });

  $(document).on('click', '.add-comment', function () {
    let postId = $(this).attr('data-post-id');
    let commentText = $(this).siblings('.comment-text').val().trim();
    let commentsList = $(this)
      .closest('.comment-section')
      .find('.comments-list');

    if (!postId || !commentText) {
      alert('Error: Post ID is missing or comment is empty.');
      return;
    }

    $.ajax({
      url: '/forum/api/comment',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ postId, comment: commentText }),
      success: function (response) {
        let newComment = response?.data?.data?.data;
        if (newComment) {
          commentsList.append(`
            <div class="p-2 border-bottom">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${newComment.userName || 'Unknown'}</strong>: ${newComment.comment || 'No content'}
                        <small class="text-muted">${new Date(newComment.createdAt).toLocaleString()}</small>
                    </div>
                    <div>
                        <button class="btn btn-sm btn-outline-success comment-like-btn" 
                            data-comment-id="${newComment._id}" 
                            data-post-id="${postId}">
                            <i class="uil uil-thumbs-up"></i> Like (0)
                        </button>
                        <button class="btn btn-sm btn-outline-primary reply-toggle" data-comment-id="${newComment._id}">
                            <i class="uil uil-comment-alt-message"></i> Reply
                        </button>
                    </div>
                </div>

                <div class="reply-section mt-2" data-comment-id="${newComment._id}" style="display: none;">
                    <input type="text" class="form-control reply-text" placeholder="Write a reply...">
                    <button class="btn btn-sm btn-primary add-reply mt-1" data-comment-id="${newComment._id}" data-post-id="${postId}">Post Reply</button>
                    <div class="replies-list mt-2"></div>
                </div>
            </div>
          `);
          $(this).siblings('.comment-text').val('');
        } else {
          alert('Failed to add comment.');
        }
      },
      error: function () {
        alert('Error posting comment.');
      },
    });
  });

  $(document).on('click', '.comment-like-btn', function () {
    let commentId = $(this).attr('data-comment-id');
    let postId = $(this).attr('data-post-id');
    let btn = $(this);

    $.ajax({
      url: `/forum/api/posts/${postId}/comments/${commentId}/commentlike`,
      method: 'POST',
      success: function (response) {
        if (response.status === 'success' && response.data) {
          let likeCount =
            response.data.likes !== undefined ? response.data.likes : 0;
          let liked = response.data.liked;
          btn.html(
            `<i class="uil uil-thumbs-up"></i> ${liked ? 'Unlike' : 'Like'} (${likeCount})`
          );
        } else {
          alert('Failed to like the comment.');
        }
      },
      error: function () {
        alert('Error liking comment.');
      },
    });
  });

  $(document).on('click', '.reply-toggle', function () {
    let commentId = $(this).attr('data-comment-id');
    $(`.reply-section[data-comment-id="${commentId}"]`).toggle();
  });

  $(document).on('click', '.add-reply', function () {
    let commentId = $(this).attr('data-comment-id');
    let postId = $(this).attr('data-post-id');
    let replyText = $(this).siblings('.reply-text').val().trim();
    let repliesList = $(this).siblings('.replies-list');

    if (!replyText) {
      alert('Please enter a reply.');
      return;
    }

    $.ajax({
      url: `/forum/api/posts/${postId}/comments/${commentId}/reply`,
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ reply: replyText }),
      success: function (response) {
        let newReply = response.data;
        if (newReply) {
          repliesList.append(`
            <div class="p-2 border-bottom">
                <strong>${newReply.userName || 'Unknown'}</strong>: ${newReply.reply || 'No content'}
                <small class="text-muted">${new Date(newReply.createdAt).toLocaleString()}</small>
            </div>
          `);
          $(this).siblings('.reply-text').val('');
        } else {
          alert('Failed to add reply.');
        }
      },
      error: function () {
        alert('Error posting reply.');
      },
    });
  });

  function fetchReplies(postId, commentId) {
    $.ajax({
      url: `/forum/api/posts/${postId}/comments/${commentId}/replies`,
      method: 'GET',
      success: function (response) {
        let repliesList = $(
          `.reply-section[data-comment-id="${commentId}"] .replies-list`
        );
        repliesList.html('');

        if (response.status === 'success' && response.data.length > 0) {
          response.data.forEach((reply) => {
            repliesList.append(`
              <div class="p-2 border-bottom">
                  <strong>${reply.userName || 'Unknown'}</strong>: ${reply.reply || 'No content'}
                  <small class="text-muted">${new Date(reply.createdAt).toLocaleString()}</small>
              </div>
            `);
          });
        }
      },
      error: function () {
        console.error(`Error fetching replies for comment ${commentId}`);
      },
    });
  }

  $(document).on('click', '.like-btn', function () {
    let postId = $(this).attr('data-id');
    let btn = $(this);

    if (!postId) {
      alert('Error: Post ID is missing.');
      return;
    }

    $.ajax({
      url: `/forum/api/posts/${postId}/like`,
      method: 'POST',
      success: function (response) {
        if (response.status === 'success' && response.data) {
          let likeCount = response.data.likeCount ?? 0;
          let liked = response.data.liked ?? false;

          btn.text(`${liked ? 'Unlike' : 'Like'} (${likeCount})`);
        } else {
          alert('Failed to like the post.');
        }
      },
      error: function (xhr) {
        alert('Error liking post.');
      },
    });
  });
});
