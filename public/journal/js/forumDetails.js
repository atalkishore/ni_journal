$(document).ready(function () {
  $(document).on('click', '.comment-toggle', function () {
    let postId = $(this)
      .closest('.card-body')
      .find('.add-comment')
      .attr('data-post-id');

    if (!postId) {
      alert('⚠️ Error: Post ID is missing.');
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
                          <div class="p-2 border-bottom">
                              <strong>${comment.userName}</strong>: ${comment.comment}
                              <small class="text-muted">${new Date(comment.createdAt).toLocaleString()}</small>
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
      alert('⚠️ Error: Post ID is missing.');
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
      alert('⚠️ Error: Post ID is missing.');
      return;
    }

    if (!commentText) {
      alert('⚠️ Please enter a comment.');
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
                      <div class="p-2 border-bottom">
                          <strong>${newComment.userName || 'Unknown'}</strong>: ${newComment.comment || 'No content'}
                          <small class="text-muted">${new Date(newComment.createdAt).toLocaleString()}</small>
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
});
