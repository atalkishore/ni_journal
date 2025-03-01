$(document).ready(function () {
  function loadPosts() {
    $.ajax({
      url: '/forum/api/posts',
      method: 'GET',
      success: function (response) {
        $('#postsContainer').html('');
        response.data.forEach((post) => {
          $('#postsContainer').append(`
            <div class="card mb-3 post-card" data-id="${post._id}">
              <div class="card-body">
                <h5 class="card-title">Posted by: ${post.userName}</h5>
                <p class="card-text">${post.content}</p>
                <small class="text-muted">Posted on: ${new Date(post.createdAt).toLocaleString()}</small>
              </div>
            </div>
          `);
        });

        $('.post-card').click(function () {
          let postId = $(this).data('id');
          window.location.href = `/forum/${postId}`;
        });
      },
      error: function (xhr) {
        console.error('Error loading posts:', xhr);
      },
    });
  }

  $('#addPostBtn').click(function () {
    window.location.href = '/forum/add';
  });

  loadPosts();
});
