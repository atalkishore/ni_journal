$(document).ready(function () {
  const MAX_STRATEGIES = 10;

  const fetchStrategies = () => {
    $.ajax({
      url: '/journal/api/strategy',
      type: 'GET',
      success: function (response) {
        let strategies = [];
        if (Array.isArray(response)) {
          strategies = response;
        } else if (response.data && Array.isArray(response.data)) {
          strategies = response.data;
        } else {
          console.error('Unexpected response format:', response);
          alert('Failed to load strategies: invalid response format.');
          return;
        }

        const tableBody = $('#strategyTableBody');
        tableBody.empty();

        strategies.forEach((strategy) => {
          tableBody.append(`
            <tr>
              <td>${strategy.name}</td>
              <td>${strategy._id}</td>
              <td>1</td>
              <td>${new Date(strategy.createdAt).toLocaleString()}</td>
              <td>${strategy.updatedAt ? new Date(strategy.updatedAt).toLocaleString() : '-'}</td>
              <td>
                <button class="btn btn-outline-info me-1 mb-1 editStrategyButton" 
                  style="font-size: 12px; padding: 2px 6px;" 
                  data-id="${strategy._id}" 
                  data-name="${strategy.name}">
                  <i class="uil uil-edit"></i> Edit
                </button>
              </td>
            </tr>
          `);
        });

        if (strategies.length >= MAX_STRATEGIES) {
          $('#addStrategyButton')
            .prop('disabled', true)
            .attr('title', 'Maximum strategies limit reached.');
        } else {
          $('#addStrategyButton').prop('disabled', false).removeAttr('title');
        }

        $('.editStrategyButton').on('click', function () {
          const strategyId = $(this).data('id');
          const strategyName = $(this).data('name');

          $('#editStrategyId').val(strategyId);
          $('#editStrategyName').val(strategyName);
          $('#editStrategyModal').modal('show');
        });
      },
      error: function () {
        alert('Failed to fetch strategies. Please try again.');
      },
    });
  };

  $('#addStrategyForm').on('submit', function (e) {
    e.preventDefault();
    const strategyName = $('#strategyName').val();

    $.ajax({
      url: '/journal/api/strategy',
      type: 'GET',
      success: function (strategies) {
        if (strategies.length >= MAX_STRATEGIES) {
          alert('You cannot add more than 10 strategies.');
          return;
        }

        $.ajax({
          url: '/journal/api/strategy/add',
          type: 'POST',
          contentType: 'application/json',
          data: JSON.stringify({ name: strategyName }),
          success: function () {
            $('#addStrategyModal').modal('hide');
            $('#strategyName').val('');
            fetchStrategies();

            const toastHtml = `<div class="toast align-items-center text-bg-success border-0" role="alert" aria-live="assertive" aria-atomic="true" style="position: fixed; top: 20px; right: 20px; z-index: 1055;">
                <div class="d-flex">
                  <div class="toast-body">
                    <span class="fas fa-check-circle text-white me-2"></span>
                    Strategy added successfully!
                  </div>
                  <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
                </div>
              </div>`;

            const toastContainer = $(toastHtml);
            $('body').append(toastContainer);
            const toast = new bootstrap.Toast(toastContainer[0]);
            toast.show();

            setTimeout(() => {
              toast.hide();
            }, 2000);

            toastContainer.on('hidden.bs.toast', function () {
              toastContainer.remove();
            });
          },
          error: function () {
            alert('Failed to add strategy. Please try again.');
          },
        });
      },
      error: function () {
        alert('Failed to check strategy count. Please try again.');
      },
    });
  });

  $('#editStrategyForm').on('submit', function (e) {
    e.preventDefault();

    const strategyId = $('#editStrategyId').val();
    const strategyName = $('#editStrategyName').val();

    $.ajax({
      url: `/journal/api/strategy/edit/${strategyId}`,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({ name: strategyName }),
      success: function () {
        $('#editStrategyModal').modal('hide');
        fetchStrategies();
        alert('Strategy updated successfully!');
      },
      error: function () {
        alert('Failed to update strategy. Please try again.');
      },
    });
  });

  fetchStrategies();
});
