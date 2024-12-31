let tradeToDeleteId = null;
let currentPage = 1;
let totalPages = 0;

function fetchTrades(page = 1) {
  $.ajax({
    url: `/journal/api/trades?page=${page}&limit=4`,
    type: 'GET',
    success: function (response) {
      const {
        data: trades,
        currentPage: currPage,
        totalPages: total,
      } = response;
      const tableBody = $('#tradeTable');
      tableBody.empty();
      totalPages = total;

      if (trades.length === 0) {
        tableBody.append(
          '<tr><td colspan="11" class="text-center">No trades found.</td></tr>'
        );
        return;
      }

      trades.forEach((trade) => {
        const row = `
          <tr>
            <td>${new Date(trade.tradeDate).toLocaleDateString()} ${new Date(
              trade.tradeDate
            ).toLocaleTimeString()}</td>
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
              <button class="btn btn-outline-danger btn-sm delete-trade" data-id="${
                trade._id
              }" data-bs-toggle="modal" data-bs-target="#deleteTradeModal">
                <i class="fa-solid fa-trash"></i>
              </button>
              <button class="btn btn-outline-info btn-sm details-trade" data-id="${
                trade._id
              }">
                <i class="fa-solid fa-circle-info"></i>
              </button>
              <button class="btn btn-outline-warning btn-sm edit-trade" data-id="${
                trade._id
              }">
                <i class="fa-solid fa-pen-to-square"></i>
              </button>
              <button class="btn btn-outline-primary btn-sm link-trade" data-id="${
                trade._id
              }">
                <i class="uil uil-link-h"></i>
              </button>
            </td>
          </tr>`;
        tableBody.append(row);
      });

      updatePagination(currPage, totalPages);
      attachEventHandlers();
    },
    error: function () {
      alert('Failed to fetch trades. Please try again later.');
    },
  });
}

function updatePagination(currentPage, totalPages) {
  const pagination = $('.pagination');
  pagination.empty();

  const prevDisabled = currentPage === 1 ? 'disabled' : '';
  const nextDisabled = currentPage === totalPages ? 'disabled' : '';

  pagination.append(`
    <li class="page-item ${prevDisabled}">
      <a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a>
    </li>
  `);

  for (let i = 1; i <= totalPages; i++) {
    const active = i === currentPage ? 'active' : '';
    pagination.append(`
      <li class="page-item ${active}">
        <a class="page-link" href="#" data-page="${i}">${i}</a>
      </li>
    `);
  }

  pagination.append(`
    <li class="page-item ${nextDisabled}">
      <a class="page-link" href="#" data-page="${currentPage + 1}">Next</a>
    </li>
  `);

  attachPaginationHandlers();
}

function attachPaginationHandlers() {
  $('.pagination .page-link').on('click', function (e) {
    e.preventDefault();
    const page = parseInt($(this).data('page'));
    if (page && page > 0 && page <= totalPages) {
      currentPage = page;
      fetchTrades(currentPage);
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

$(document).ready(function () {
  fetchTrades();
});
