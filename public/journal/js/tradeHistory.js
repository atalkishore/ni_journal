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

          trades.forEach((trade) => {
            if (!groupedTrades[trade.group_id]) {
              groupedTrades[trade.group_id] = [];
            }
            groupedTrades[trade.group_id].push(trade);
          });

          Object.keys(groupedTrades).forEach((groupId) => {
            const group = groupedTrades[groupId];
            const firstTrade = group[0];
            const groupRowSpan = group.length;

            tableBody += `
              <tr class="table-group-header">
                <td colspan="10" class="fw-bold bg-light">
                  Group ID: ${groupId} (${group.length} Trades)
                </td>
              </tr>
            `;

            group.forEach((trade, index) => {
              tableBody += `
                <tr>
                  ${index === 0 ? `<td rowspan="${groupRowSpan}">${firstTrade.openDate || '-'}</td>` : ''}
                  ${index === 0 ? `<td rowspan="${groupRowSpan}">${firstTrade.closeDate || '-'}</td>` : ''}
                  <td>${trade.symbol || '-'}</td>
                  <td>${trade.position || '-'}</td>
                  <td>${trade.buyQuantity || 0}</td>
                  <td>${trade.sellQuantity || 0}</td>
                  <td>${trade.buyPrice || '-'}</td>
                  <td>${trade.sellPrice || '-'}</td>
                  <td>${trade.tags ? trade.tags.join(', ') : '-'}</td>
                  <td>
                    <button class="btn btn-info btn-sm">Edit</button>
                  </td>
                </tr>
              `;
            });
          });

          $('#tradeHistoryTableBody').html(tableBody);
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

  fetchTradeHistory();
});
