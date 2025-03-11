$(document).ready(function () {
  $(document).on('click', '.comment-toggle', function () {
    let postId = $(this)
      .closest('.card-body')
      .find('.add-comment')
      .attr('data-post-id');

    if (!postId) {
      alert(' Error: Post ID is missing.');
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
            commentsList.append(`
                <div class="p-2 border-bottom d-flex justify-content-between align-items-center">
                    <div>
                        <strong>${comment.userName}</strong>: ${comment.comment}
                        <small class="text-muted">${new Date(comment.createdAt).toLocaleString()}</small>
                    </div>
                    <button class="btn btn-sm btn-outline-success comment-like-btn" 
                        data-comment-id="${comment._id}" 
                        data-post-id="${postId}">
                        <i class="uil uil-thumbs-up"></i> Like (${comment.likes})
                    </button>
                </div>
            `);
          });
        } else {
          commentsList.html('<p>No comments found.</p>');
        }
      },
      error: function (xhr) {
        alert('Error fetching comments.');
      },
    });
  });

  $(document).on('click', '.like-btn', function () {
    let postId = $(this).attr('data-id');
    let btn = $(this);

    if (!postId) {
      alert(' Error: Post ID is missing.');
      return;
    }

    $.ajax({
      url: `/forum/api/posts/${postId}/like`,
      method: 'POST',
      success: function (response) {
        if (response.status === 'success' && response.data) {
          let likeCount = response.data.likes;
          let liked = response.data.liked;

          btn.text(`${liked ? 'Unlike' : 'Like'} (${likeCount})`);
        } else {
          alert('⚠ Failed to like the post.');
        }
      },
      error: function (xhr) {
        alert('Error liking post.');
      },
    });
  });

  $(document).on('click', '.add-comment', function () {
    let postId = $(this).attr('data-post-id');
    let commentText = $(this).siblings('.comment-text').val().trim();

    if (!postId) {
      alert(' Error: Post ID is missing.');
      return;
    }

    if (!commentText) {
      alert(' Please enter a comment.');
      return;
    }

    let commentsList = $(this)
      .closest('.comment-section')
      .find('.comments-list');

    $.ajax({
      url: '/forum/api/comment',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ postId, comment: commentText }),
      success: function (response) {
        let newComment = response?.data?.data?.data;
        if (newComment) {
          commentsList.append(`
              <div class="p-2 border-bottom d-flex justify-content-between align-items-center">
                  <div>
                      <strong>${newComment.userName || 'Unknown'}</strong>: ${newComment.comment || 'No content'}
                      <small class="text-muted">${new Date(newComment.createdAt).toLocaleString()}</small>
                  </div>
                  <button class="btn btn-sm btn-outline-success comment-like-btn" 
                      data-comment-id="${newComment._id}" 
                      data-post-id="${postId}">
                      <i class="uil uil-thumbs-up"></i> Like (0)
                  </button>
              </div>
          `);
          $(this).siblings('.comment-text').val('');
        } else {
          alert('Failed to add comment. Please try again.');
        }
      },
      error: function (xhr) {
        alert('Error posting comment.');
      },
    });
  });

  $(document).on('click', '.comment-like-btn', function () {
    let commentId = $(this).attr('data-comment-id');
    let postId = $(this).attr('data-post-id');
    let btn = $(this);

    if (!commentId || !postId) {
      alert(' Error: Comment ID or Post ID is missing.');
      return;
    }

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
      error: function (xhr) {
        alert('Error liking comment.');
      },
    });
  });
});
