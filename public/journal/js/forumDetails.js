$(document).ready(function () {
  $('.comment-toggle').click(function () {
    $('.comment-section').toggle();
  });

  $('.like-btn').click(function () {
    let postId = $(this).data('id');
    let btn = $(this);

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
      error: function (xhr, status, error) {
        alert('Error liking post. Check console for details.');
      },
    });
  });

  $('.add-comment').click(function () {
    let postId = $(this).data('id');
    let commentText = $('.comment-text').val().trim();
    if (!commentText) return alert('Comment cannot be empty!');

    $.ajax({
      url: '/forum/api/comment',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ postId, comment: commentText }),
      success: function (response) {
        let newComment = response?.data?.data?.data;

        if (newComment) {
          let userName = newComment.userName || 'Unknown';
          let comment = newComment.comment || 'No content';
          let timestamp = newComment.createdAt
            ? new Date(newComment.createdAt).toLocaleString()
            : 'No Date';

          $('.comments-list').append(`
            <div class="p-2 border-bottom">
                <strong>${userName}</strong>: ${comment}
                <small class="text-muted">${timestamp}</small>
            </div>
          `);
          $('.comment-text').val('');
        } else {
          alert('Failed to add comment. Please try again.');
        }
      },
      error: function (xhr, status, error) {
        alert('Error posting comment.');
      },
    });
  });
});
