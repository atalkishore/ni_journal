$(document).ready(function () {
  $('#postForm').submit(function (e) {
    e.preventDefault();
    let postContent = $('#postMessage').val().trim();
    if (!postContent) return alert('Post cannot be empty!');

    $.ajax({
      url: '/forum/api/posts',
      type: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ content: postContent }),
      success: function () {
        $('#postMessage').val('');
        window.location.href = '/forum/';
        loadPosts();
      },
      error: function (xhr) {},
    });
  });

  // $(document).on('click', '.like-btn', function () {
  //   let postId = $(this).data('id');
  //   let btn = $(this);

  //   $.ajax({
  //     url: `/forum/api/posts/${postId}/like`,
  //     method: 'POST',
  //     success: function (response) {
  //       if (response.data && typeof response.data.likes !== 'undefined') {
  //         let updatedLikes = response.data.likes;
  //         let liked = response.data.liked;

  //         btn.text(
  //           liked ? `Liked (${updatedLikes})` : `Like (${updatedLikes})`
  //         );
  //         btn.toggleClass('btn-primary btn-outline-primary');
  //       } else {
  //       }
  //     },
  //     error: function (xhr) {},
  //   });
  // });

  // $(document).off('click', '.add-comment').on('click', '.add-comment', function () {

  //   let postId = $(this).data('id'); // Get post ID
  //   let commentText = $(this).siblings('.comment-text').val().trim();
  //   let commentList = $(this).siblings('.comments-list');

  //   if (!commentText) return alert('Comment cannot be empty!');

  //   $.ajax({
  //     url: '/forum/api/comment',
  //     method: 'POST',
  //     contentType: 'application/json',
  //     data: JSON.stringify({ postId, comment: commentText }),
  //     success: function (response) {

  //       if (response.success && response.data) {
  //         let newComment = response.data;

  //         commentList.append(`
  //           <div class="p-2 border-bottom">
  //             <strong>${newComment.userName}</strong>: ${newComment.comment}
  //             <small class="text-muted">${new Date(newComment.timestamp).toLocaleString()}</small>
  //           </div>
  //         `);

  //         $(this).siblings('.comment-text').val(''); // Clear input
  //       } else {
  //         alert(response.message || 'Failed to add comment!');
  //       }
  //     },
  //     error: function (err) {
  //       alert('Failed to add comment. Try again.');
  //     },
  //   });
  // });

  // $(document).on('click', '.reply-btn', function () {
  //   $(this).closest('.p-2').find('.reply-input').toggle();
  // });

  // $(document).on('click', '.post-reply', function () {
  //   let commentId = $(this).data('id');
  //   let postId = $(this).data('postid');
  //   let replyText = $(this).siblings('.reply-text').val().trim();
  //   let btn = $(this);

  //   if (!replyText) return alert('Reply cannot be empty!');

  //   $.ajax({
  //     url: '/forum/api/reply',
  //     method: 'POST',
  //     contentType: 'application/json',
  //     data: JSON.stringify({ commentId, postId, reply: replyText }),
  //     success: function (response) {
  //       if (response.data) {
  //         let replyData = response.data.data;

  //         $(btn).closest('.reply-input').before(`
  //             <div class="p-2 border-start border-primary ms-3">
  //               <strong>${replyData.userName}</strong>: ${replyData.reply}
  //               <small class="text-muted d-block">${new Date(replyData.createdAt).toLocaleString()}</small>
  //             </div>
  //           `);

  //         btn.siblings('.reply-text').val('');
  //         btn.closest('.reply-input').hide();
  //       }
  //     },
  //   });
  // });
});
