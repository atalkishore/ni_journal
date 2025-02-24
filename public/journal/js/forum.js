$(document).ready(function () {
  function loadPosts() {
    $.ajax({
      url: '/forum/api/posts',
      method: 'GET',
      success: function (response) {
        $('#postsContainer').html('');

        response.data.forEach((post) => {
          let commentsHTML = post.comments
            .map((comment) => {
              return `
                  <div class="p-2 border-bottom">
                    <strong>${comment.userName}</strong>: ${comment.text || comment.comment}
                    <small class="text-muted d-block">${new Date(comment.timestamp || comment.createdAt).toLocaleString()}</small>
                    
                    <!-- Like and Reply Buttons -->
                    <div class="d-flex align-items-center mt-1">
                      <button class="btn btn-outline-primary btn-sm like-comment-btn me-2"
                        data-id="${comment._id}"
                        data-postid="${post._id}">
                        <i class="uil uil-thumbs-up"></i> (${comment.likes || 0})
                      </button>
                      <button class="btn btn-outline-secondary btn-sm reply-btn"
                        data-id="${comment._id}"
                        data-postid="${post._id}">
                        <i class="uil uil-corner-up-left-alt"></i> Reply
                      </button>
                    </div>

                    <!-- Reply Input Field (Initially Hidden) -->
                    <div class="reply-input mt-2" style="display: none;">
                      <textarea class="form-control mt-2 reply-text" placeholder="Write a reply..."></textarea>
                      <button class="btn btn-sm btn-success mt-2 post-reply w-100" data-id="${comment._id}" data-postid="${post._id}">Post Reply</button>
                    </div>
                  </div>
                `;
            })
            .join('');

          $('#postsContainer').append(`
              <div class="card mb-4 shadow-sm">
                <div class="card-body">
                  <h5 class="card-title">
                    <i class="uil uil-user-circle"></i> ${post.userName}
                  </h5>
                  <p class="card-text">${post.content}</p>
                  <div class="d-flex justify-content-between">
                    <button class="btn btn-outline-primary btn-sm like-btn" data-id="${post._id}">
                      <i class="uil uil-thumbs-up"></i> Like (${post.likes})
                    </button>
                    <button class="btn btn-outline-secondary btn-sm comment-btn" data-id="${post._id}">
                      <i class="uil uil-comments"></i> Comments (${post.comments.length})
                    </button>
                  </div>

                  <!-- Comments Section -->
                  <div class="comment-section mt-3 p-3 border rounded bg-light" data-postid="${post._id}" style="display:none;">
                    <div class="comments-list">${commentsHTML}</div>
                    <textarea class="form-control mt-2 comment-text" placeholder="Write a comment..."></textarea>
                    <button class="btn btn-sm btn-success mt-2 add-comment w-100" data-id="${post._id}">Post Comment</button>
                  </div>
                </div>
              </div>
            `);
        });
      },
    });
  }

  loadPosts();

  $(document).on('click', '.like-btn', function () {
    let postId = $(this).data('id');
    let btn = $(this);

    $.ajax({
      url: `/forum/api/posts/${postId}/like`,
      method: 'POST',
      success: function (response) {
        if (response.data) {
          let updatedLikes = response.data.likes;
          let liked = response.data.liked;

          btn.html(
            `<i class="uil uil-thumbs-up"></i> ${liked ? 'Liked' : 'Like'} (${updatedLikes})`
          );
          btn.toggleClass('btn-primary btn-outline-primary');
        }
      },
    });
  });

  $(document).on('click', '.like-comment-btn', function () {
    let commentId = $(this).data('id');
    let postId = $(this).data('postid');
    let btn = $(this);

    $.ajax({
      url: `/forum/api/posts/${postId}/comments/${commentId}/commentlike`,
      method: 'POST',
      success: function (response) {
        if (response.data) {
          let newLikes = response.data.likes;
          let liked = response.data.liked;

          btn.html(`<i class="uil uil-thumbs-up"></i> (${newLikes})`);
          btn.toggleClass('btn-primary btn-outline-primary');
        }
      },
    });
  });

  $(document).on('click', '.comment-btn', function () {
    $(this).closest('.card-body').find('.comment-section').toggle();
  });

  $(document).on('click', '.add-comment', function () {
    let postId = $(this).data('id');
    let commentText = $(this).siblings('.comment-text').val().trim();
    let commentList = $(this).siblings('.comments-list');
    let btn = $(this);

    if (!commentText) return alert('Comment cannot be empty!');

    $.ajax({
      url: '/forum/api/comment',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ postId, comment: commentText }),
      success: function (response) {
        if (response.data) {
          let commentData = response.data.data;

          commentList.append(`
              <div class="p-2 border-bottom">
                <strong>${commentData.userName}</strong>: ${commentData.comment}
                <small class="text-muted d-block">${new Date(commentData.createdAt).toLocaleString()}</small>

                <!-- Like and Reply Buttons -->
                <div class="d-flex align-items-center mt-1">
                  <button class="btn btn-outline-primary btn-sm like-comment-btn me-2"
                    data-id="${commentData._id}"
                    data-postid="${postId}">
                    <i class="uil uil-thumbs-up"></i> (0)
                  </button>
                  <button class="btn btn-outline-secondary btn-sm reply-btn"
                    data-id="${commentData._id}"
                    data-postid="${postId}">
                    <i class="uil uil-corner-up-left-alt"></i> Reply
                  </button>
                </div>

                <!-- Reply Input Field (Initially Hidden) -->
                <div class="reply-input mt-2" style="display: none;">
                  <textarea class="form-control mt-2 reply-text" placeholder="Write a reply..."></textarea>
                  <button class="btn btn-sm btn-success mt-2 post-reply w-100" data-id="${commentData._id}" data-postid="${postId}">Post Reply</button>
                </div>
              </div>
            `);

          btn.siblings('.comment-text').val('');
        }
      },
    });
  });

  $(document).on('click', '.reply-btn', function () {
    $(this).closest('.p-2').find('.reply-input').toggle();
  });

  $(document).on('click', '.post-reply', function () {
    let commentId = $(this).data('id');
    let postId = $(this).data('postid');
    let replyText = $(this).siblings('.reply-text').val().trim();
    let btn = $(this);

    if (!replyText) return alert('Reply cannot be empty!');

    $.ajax({
      url: '/forum/api/reply',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ commentId, postId, reply: replyText }),
      success: function (response) {
        if (response.data) {
          let replyData = response.data.data;

          $(btn).closest('.reply-input').before(`
              <div class="p-2 border-start border-primary ms-3">
                <strong>${replyData.userName}</strong>: ${replyData.reply}
                <small class="text-muted d-block">${new Date(replyData.createdAt).toLocaleString()}</small>
              </div>
            `);

          btn.siblings('.reply-text').val('');
          btn.closest('.reply-input').hide();
        }
      },
    });
  });
});
