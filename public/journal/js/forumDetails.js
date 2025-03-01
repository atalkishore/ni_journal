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
        btn.text(`Like (${response.data.likes})`);
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
        $('.comments-list').append(`
                    <div class="p-2 border-bottom">
                        <strong>${response.data.userName}</strong>: ${response.data.comment}
                        <small class="text-muted">${new Date(response.data.timestamp).toLocaleString()}</small>
                    </div>
                `);
        $('.comment-text').val('');
      },
    });
  });
});
