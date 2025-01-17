/* eslint-disable no-undef */
$(document).ready(function () {
  let currentPage = 1;
  const limit = 4;

  function fetchTradeHistory(page = 1) {
    const symbol = $('#symbolFilter').val();
    const startDate = $('#startDateFilter').val();
    const endDate = $('#endDateFilter').val();
    const position = $('#positionFilter').val(); // Ensure this matches server-side values

    const filters = {
      page,
      limit,
      ...(symbol && { symbol }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
      ...(position && { position }),
    };

    $.ajax({
      url: `/journal/api/tradeHistory?page=${page}&limit=${limit}`,
      method: 'GET',
      data: filters,
      success: function (response) {
        if (response.status === 'success') {
          const trades = response.data.trades;
          const totalPages = response.data.totalPages;
          const totalTrades = response.data.totalHistoryCount;
          const start = (page - 1) * limit + 1;
          const end = Math.min(page * limit, totalTrades);
          let tableBody = '';
          const openBadge =
            '<span class="badge badge-phoenix badge-phoenix-warning">Open</span>';

          $('#tradeCountInfo').text(
            `${start} to ${end} of ${totalTrades} trades`
          );

          if (!Array.isArray(trades)) {
            alert('Invalid response format from the server.');
            return;
          }

          trades.forEach((trade) => {
            tableBody += `
              <tr>
                <td>${trade.startDate || '-'}</td>
                <td>${trade.isOpen ? openBadge : trade.endDate || '-'}</td>
                <td>${trade.symbol || '-'}</td>
                <td>${trade.position || '-'}</td>
                <td>${trade.buyQty || 0}</td>
                <td>${trade.sellQty || 0}</td>
                <td>${trade.buyAvg || '-'}</td>
                <td>${trade.sellAvg || '-'}</td>
                <td>
                  <button class="btn btn-link btn-sm text-info" data-group-id="${trade.groupId}" data-bs-toggle="modal" data-bs-target="#groupModal">
                    <i class="fa-solid fa-link"></i>
                  </button>
                </td>
              </tr>
            `;
          });

          $('#tradeHistoryTableBody').html(tableBody);
          setupPagination(totalPages, page);

          $('.btn-link').on('click', function () {
            const groupId = $(this).data('group-id');
            fetchTrades(groupId);
          });
        } else {
          alert('Failed to fetch trade history: ' + response.message);
        }
      },
      error: function (error) {
        alert('An error occurred while fetching trade history.');
      },
    });
  }

  function fetchTrades(groupId) {
    $.ajax({
      url: `/journal/api/trades?groupId=${groupId}`,
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

        trades.data.forEach((trade) => {
          const row = `
            <tr>
              <td>${new Date(trade.tradeDate).toLocaleDateString()} ${new Date(trade.tradeDate).toLocaleTimeString()}</td>
              <td>${trade.quantity}</td>
              <td>${trade.position}</td>
              <td>${trade.entryPrice}</td>
            </tr>`;
          tableBody.append(row);
        });
      },
      error: function (xhr, status, error) {
        alert('Failed to fetch trades. Please try again later.');
      },
    });
  }

  function setupPagination(totalPages, currentPage) {
    const pagination = $('#tradeHistoryPagination');
    pagination.empty();

    if (currentPage > 1) {
      pagination.append(
        `<li class="page-item"><a class="page-link" href="#" data-page="${currentPage - 1}">Previous</a></li>`
      );
    }

    for (let i = 1; i <= totalPages; i++) {
      pagination.append(
        `<li class="page-item ${i === currentPage ? 'active' : ''}"><a class="page-link" href="#" data-page="${i}">${i}</a></li>`
      );
    }

    if (currentPage < totalPages) {
      pagination.append(
        `<li class="page-item"><a class="page-link" href="#" data-page="${currentPage + 1}">Next</a></li>`
      );
    }

    pagination.find('a').on('click', function (e) {
      e.preventDefault();
      const page = $(this).data('page');
      fetchTradeHistory(page);
    });
  }

  $('#applyFilter').on('click', function () {
    currentPage = 1;
    fetchTradeHistory(currentPage);
  });

  $('#resetFilters').on('click', function () {
    $('#symbolFilter').val('');
    $('#openDateFilter').val('');
    $('#closeDateFilter').val('');
    $('#positionFilter').val('');
    currentPage = 1;
    fetchTradeHistory(currentPage);
  });

  fetchTradeHistory(currentPage);
});
