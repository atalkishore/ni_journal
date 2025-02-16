$(document).ready(function () {
  function loadPosts() {
    $.ajax({
      url: '/forum/api/posts',
      method: 'GET',
      success: function (response) {
        $('#postsContainer').html('');
        response.data.forEach((post) => {
          $('#postsContainer').append(`
                        <div class="card mb-3">
                            <div class="card-body">
                                <h5 class="card-title">Posted by: ${post.userName}</h5>
                                <p class="card-text">${post.content}</p>
                                <button class="btn btn-outline-primary btn-sm like-btn" data-id="${post._id}">Like (${post.likes})</button>
                                <button class="btn btn-outline-secondary btn-sm comment-btn" data-id="${post._id}">Comments (${post.comments.length})</button>

                                <div class="comment-section mt-2" data-postid="${post._id}" style="display:none;">
                                    <div class="comments-list">
                                        ${post.comments
                                          .map(
                                            (comment) => `
                                            <div class="p-2 border-bottom">
                                                <strong>${comment.userName}</strong>: ${comment.text} 
                                                <small class="text-muted">${new Date(comment.timestamp).toLocaleString()}</small>
                                            </div>
                                        `
                                          )
                                          .join('')}
                                    </div>
                                    <textarea class="form-control mt-2 comment-text" placeholder="Write a comment..."></textarea>
                                    <button class="btn btn-sm btn-success mt-2 add-comment" data-id="${post._id}">Post Comment</button>
                                </div>
                            </div>
                        </div>
                    `);
        });
      },
      error: function (xhr) {},
    });
  }

  loadPosts();

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
        loadPosts();
      },
      error: function (xhr) {},
    });
  });

  $(document).on('click', '.like-btn', function () {
    let postId = $(this).data('id');
    let btn = $(this);

    $.ajax({
      url: `/forum/api/posts/${postId}/like`,
      method: 'POST',
      success: function (response) {
        if (response.data && typeof response.data.likes !== 'undefined') {
          let updatedLikes = response.data.likes;
          let liked = response.data.liked;

          btn.text(
            liked ? `Liked (${updatedLikes})` : `Like (${updatedLikes})`
          );
          btn.toggleClass('btn-primary btn-outline-primary');
        } else {
        }
      },
      error: function (xhr) {},
    });
  });

  $(document).on('click', '.comment-btn', function () {
    $(this).siblings('.comment-section').toggle();
  });

  $(document).on('click', '.add-comment', function () {
    let postId = $(this).data('id');
    let commentText = $(this).siblings('.comment-text').val().trim();
    let commentList = $(this).siblings('.comments-list');
    if (!commentText) return alert('Comment cannot be empty!');

    $.ajax({
      url: '/forum/api/comment',
      method: 'POST',
      contentType: 'application/json',
      data: JSON.stringify({ postId, comment: commentText }),
      success: function (response) {
        commentList.append(`
                    <div class="p-2 border-bottom">
                        <strong>${response.data.userName}</strong>: ${response.data.text}
                    </div>
                `);
      },
    });
  });
});
