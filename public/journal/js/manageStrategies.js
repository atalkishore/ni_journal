$(document).ready(function () {
  const MAX_STRATEGIES = 10;

  const fetchStrategies = () => {
    $.ajax({
      url: '/journal/api/strategy',
      type: 'GET',
      success: function (strategies) {
        const tableBody = $('#strategyTableBody');
        tableBody.empty();

        strategies.data?.forEach((strategy, index) => {
          tableBody.append(`
              <tr>
                <td>${index + 1}) <span class='ms-3'>${strategy.name}</span>
                  <button class="btn btn-outline-info ms-2 mb-1 editStrategyButton"  style ="font-size: 12px; padding: 2px 6px;"data-id="${strategy._id}" data-name="${strategy.name}">
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
          url: '/journal/api/strategy',
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
      url: `/journal/api/strategy/${strategyId}`,
      type: 'PUT',
      contentType: 'application/json',
      data: JSON.stringify({ name: strategyName }),
      success: function () {
        $('#editStrategyModal').modal('hide');
        fetchStrategies();

        const toastHtml = `
          <div class="d-flex position-fixed top-0 end-0 p-3" style="z-index: 1055;">
            <div class="toast show align-items-center text-white bg-success border-0" role="alert" data-bs-autohide="true" aria-live="assertive" aria-atomic="true">
              <div class="d-flex">
                <div class="toast-body">
                  Strategy updated successfully!
                </div>
                <button class="btn ms-2 p-0 btn-close-white" type="button" data-bs-dismiss="toast" aria-label="Close">
                  <span class="uil uil-times fs-1"></span>
                </button>
              </div>
            </div>
          </div>
        `;

        $('body').append(toastHtml);
        setTimeout(() => {
          $('.toast').remove();
        }, 2000);
      },
      error: function () {
        const toastHtml = `
          <div class="d-flex position-fixed top-0 end-0 p-3" style="z-index: 1055;">
            <div class="toast show align-items-center text-white bg-danger border-0" role="alert" data-bs-autohide="true" aria-live="assertive" aria-atomic="true">
              <div class="d-flex">
                <div class="toast-body">
                  Failed to update strategy. Please try again.
                </div>
                <button class="btn ms-2 p-0 btn-close-white" type="button" data-bs-dismiss="toast" aria-label="Close">
                  <span class="uil uil-times fs-1"></span>
                </button>
              </div>
            </div>
          </div>
        `;

        $('body').append(toastHtml);
        setTimeout(() => {
          $('.toast').remove();
        }, 2000);
      },
    });
  });

  fetchStrategies();
});
