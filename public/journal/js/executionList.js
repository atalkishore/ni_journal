let tradeToDeleteId = null;
let currentPage = 1;
const tradesPerPage = 4;

function fetchTrades(page = 1, filters = {}) {
  const queryParams = new URLSearchParams({
    page,
    limit: tradesPerPage,
    ...filters,
  }).toString();

  $.ajax({
    url: `/journal/api/trades?${queryParams}`,
    type: 'GET',
    success: function (response) {
      const trades = response.data.data;
      const totalPages = response.data.totalPages;
      const totalTrades = response.data.totalTrades;
      const tableBody = $('#tradeTable');
      tableBody.empty();

      if (trades.length === 0) {
        tableBody.append(
          '<tr><td colspan="11" class="text-center">No trades found.</td></tr>'
        );
        return;
      }

      const startEntry = (page - 1) * tradesPerPage + 1;
      const endEntry = Math.min(page * tradesPerPage, totalTrades);

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
              </td>
            </tr>`;
        tableBody.append(row);
      });

      attachEventHandlers();

      renderPaginationControls(totalPages, page);

      $('#tradeCountInfo').text(
        ` ${startEntry} to ${endEntry} of ${totalTrades} Trades`
      );
    },
    error: function (xhr, status, error) {
      showToast('Failed to fetch trades. Please try again later.', 'danger');
    },
  });
}

function renderPaginationControls(totalPages, currentPage) {
  const paginationContainer = $('.pagination');
  paginationContainer.empty();

  paginationContainer.append(`
      <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage - 1}" aria-disabled="${currentPage === 1}">Previous</a>
      </li>
    `);

  for (let i = 1; i <= totalPages; i++) {
    paginationContainer.append(`
        <li class="page-item ${i === currentPage ? 'active' : ''}">
          <a class="page-link" href="#" data-page="${i}">${i}</a>
        </li>
      `);
  }

  paginationContainer.append(`
      <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
        <a class="page-link" href="#" data-page="${currentPage + 1}" aria-disabled="${currentPage === totalPages}">Next</a>
      </li>
    `);

  $('.pagination .page-link').on('click', function (e) {
    e.preventDefault();
    const page = $(this).data('page');
    if (page > 0 && page <= totalPages) {
      applyFilters(page);
    }
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
          applyFilters(currentPage);
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

function applyFilters(page = 1) {
  const filters = {
    symbol: $('#symbolFilter').val()?.toUpperCase(),
    instrument: $('#instrumentFilter').val(),
    startDate: $('#startDateFilter').val(),
    endDate: $('#endDateFilter').val(),
    position: $('#positionFilter').val(),
    status: $('#statusFilter').val(),
  };

  if (filters.startDate && filters.endDate) {
    const startDate = new Date(filters.startDate);
    const endDate = new Date(filters.endDate);

    if (startDate > endDate) {
      showToast('Start date cannot be greater than end date.', 'danger');
      return;
    }
  }

  fetchTrades(page, filters);
}

$('#symbolFilter').on('keyup', function () {
  this.value = this.value.toUpperCase();
});

$('#applyFilters').on('click', function () {
  applyFilters();
});

$('#resetFilters').on('click', function () {
  $('#filtersForm')[0].reset();
  fetchTrades(1);
});

$(document).ready(function () {
  fetchTrades(currentPage);
});
