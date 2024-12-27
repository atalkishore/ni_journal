$(document).ready(function () {
  function fetchTradeHistory() {
    $.ajax({
      url: '/journal/api/tradeHistory/getTradeHistory',
      method: 'GET',
      success: function (response) {
        if (response.status === 'Success') {
          const trades = response.data;
          let tableBody = '';
          const groupedTrades = {};

          // Group trades by group_id
          trades.forEach((trade) => {
            if (!groupedTrades[trade.group_id]) {
              groupedTrades[trade.group_id] = [];
            }
            groupedTrades[trade.group_id].push(trade);
          });

          // Render only one row per group
          Object.keys(groupedTrades).forEach((groupId) => {
            const group = groupedTrades[groupId];
            const firstTrade = group[0];

            tableBody += `
              <tr>
                <td>${firstTrade.openDate || '-'}</td>
                <td>${firstTrade.closeDate || '-'}</td>
                <td>${firstTrade.symbol || '-'}</td>
                <td>${firstTrade.position || '-'}</td>
                <td>${firstTrade.buyQuantity || 0}</td>
                <td>${firstTrade.sellQuantity || 0}</td>
                <td>${firstTrade.buyPrice || '-'}</td>
                <td>${firstTrade.sellPrice || '-'}</td>
                <td>${firstTrade.tags ? firstTrade.tags.join(', ') : '-'}</td>
                <td>
                  <button class="btn btn-link btn-sm text-info" data-group-id="${groupId}" data-bs-toggle="modal" data-bs-target="#groupModal">
                    <i class="fa-solid fa-link"></i>
                  </button>
                </td>
              </tr>
            `;
          });

          $('#tradeHistoryTableBody').html(tableBody);

          // Attach click event to group link buttons
          $('.btn-link').on('click', function () {
            const groupId = $(this).data('group-id');
            displayGroupDetails(groupedTrades[groupId]);
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

  function displayGroupDetails(group) {
    let groupDetails = `<ul class="list-group">`;
    group.forEach((trade) => {
      groupDetails += `
        <li class="list-group-item">
          <strong>Symbol:</strong> ${trade.symbol || '-'} |
          <strong>Position:</strong> ${trade.position || '-'} |
          <strong>Buy Qty:</strong> ${trade.buyQuantity || 0} |
          <strong>Sell Qty:</strong> ${trade.sellQuantity || 0} |
          <strong>Buy Price:</strong> ${trade.buyPrice || '-'} |
          <strong>Sell Price:</strong> ${trade.sellPrice || '-'} |
          <strong>Tags:</strong> ${trade.tags ? trade.tags.join(', ') : '-'}
        </li>
      `;
    });
    groupDetails += `</ul>`;
    $('#groupDetails').html(groupDetails);
  }

  fetchTradeHistory();
});
