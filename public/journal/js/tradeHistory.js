/* eslint-disable no-undef */
$(document).ready(function () {
  function fetchTradeHistory() {
    $.ajax({
      url: '/journal/api/tradeHistory/',
      method: 'GET',
      success: function (response) {
        if (response.status === 'success') {
          const trades = response.data;
          let tableBody = '';
          // const groupedTrades = {};
          const openBadge =
            '<span class="badge badge-phoenix badge-phoenix-warning">Open</span>';
          // Group trades by group_id
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
          $('.btn-link').on('click', function () {
            const groupId = $(this).data('group-id');
            fetchTrades(groupId);
          });
        } else {
          alert('Failed to fetch trade history: ' + response.message);
        }
      },
      error: function (error) {
        console.error('Error fetching trade history:', error);
        alert('An error occurred while fetching trade history.');
      },
    });
  }

  function fetchTrades(groupId) {
    $.ajax({
      url: `/journal/api/trades?groupId=${groupId}`,
      type: 'GET',
      // defaultLoader: false
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
        console.error('Error fetching trades:', error);
        alert('Failed to fetch trades. Please try again later.');
      },
    });
  }

  fetchTradeHistory();
});
