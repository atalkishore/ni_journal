let tradeToDeleteId = null;

function fetchTrades() {
  $.ajax({
    url: '/journal/api/trades',
    type: 'GET',
    success: function (trades) {
      const tableBody = $('#tradeTable');
      tableBody.empty();

      if (trades.length === 0) {
        tableBody.append(
          '<tr><td colspan="11" class="text-center">No trades found.</td></tr>'
        );
        return;
      }

      trades.forEach((trade) => {
        const row = `
          <tr>
            <td>${new Date(trade.tradeDate).toLocaleDateString()} ${new Date(trade.tradeDate).toLocaleTimeString()}</td>
            <td>${trade.instrument}</td>
            <td>${trade.symbol}</td>
            <td>${trade.quantity}</td>
            <td>${trade.position}</td>
            <td>${trade.entryPrice}</td>
            <td>${trade.account || 'Default account'}</td>
            <td>${trade.targetPrice || '-'}</td>
            <td>${trade.strategy || '-'}</td>
            <td>${trade.tradeNotes || '-'}</td>
            <td class="text-center">
              <button class="btn btn-outline-danger btn-sm delete-trade me-1" data-id="${trade._id}" data-bs-toggle="modal" data-bs-target="#deleteTradeModal">
                <i class="fa-solid fa-trash"></i>
              </button>
              <button class="btn btn-outline-info btn-sm details-trade me-1" data-id="${trade._id}">
                <i class="fa-solid fa-circle-info"></i>
              </button>
              <button class="btn btn-outline-warning btn-sm edit-trade me-1" data-id="${trade._id}">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-outline-primary btn-sm link-trade me-1" data-id="${trade._id}">
                <i class="uil uil-link-h"></i>
              </button>
            </td>
          </tr>`;
        tableBody.append(row);
      });

      attachEventHandlers();
    },
    error: function (xhr, status, error) {
      console.error('Error fetching trades:', error);
      alert('Failed to fetch trades. Please try again later.');
    },
  });
}

function attachEventHandlers() {
  $('.delete-trade').on('click', function () {
    tradeToDeleteId = $(this).data('id');
  });

  $('#confirmDeleteTrade').on('click', function () {
    if (tradeToDeleteId) {
      $.ajax({
        url: `/journal/api/trades/${tradeToDeleteId}`,
        type: 'DELETE',
        success: function (response) {
          $('#deleteTradeModal').modal('hide');
          showToast(response.message, 'success');
          fetchTrades();
        },
        error: function () {
          $('#deleteTradeModal').modal('hide');
          showToast('Failed to delete the trade.', 'danger');
        },
      });
    }
  });

  $('.edit-trade').on('click', function () {
    const tradeId = $(this).data('id');
    window.location.href = `/journal/trades/${tradeId}/edit`;
  });

  $('.details-trade').on('click', function () {
    const tradeId = $(this).data('id');
    window.location.href = `/journal/trades/${tradeId}`;
  });
}

function showToast(message, type) {
  const toast = $(`
      <div class="toast align-items-center text-bg-${type} border-0 show" role="alert" aria-live="assertive" aria-atomic="true" style="position: fixed; top: 20px; right: 20px; z-index: 1055;">
        <div class="d-flex">
          <div class="toast-body">
            ${message}
          </div>
          <button type="button" class="btn-close me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
      </div>
    `);

  $('body').append(toast);

  setTimeout(() => {
    toast.toast('hide');
    toast.remove();
  }, 2000);
}

$('#tradeFilter').on('keyup', function () {
  const filterText = $(this).val().toLowerCase();
  $('#tradeTable tr').each(function () {
    const rowText = $(this).text().toLowerCase();
    $(this).toggle(rowText.includes(filterText));
  });
});

fetchTrades();
