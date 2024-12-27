$(document).ready(function () {
  // Fetch trade history on page load
  function fetchTradeHistory() {
    $.ajax({
      url: '/journal/api/tradeHistory/getTradeHistory',
      method: 'GET',
      success: function (response) {
        if (response.status === 'Success') {
          const trades = response.data;
          let tableBody = '';

          trades.forEach((trade) => {
            tableBody += `
                <tr>
                  <td>${trade.openDate || '-'}</td>
                  <td>${trade.closeDate || '-'}</td>
                  <td>${trade.symbol || '-'}</td>
                  <td>${trade.position || '-'}</td>
                  <td>${trade.buyQuantity || 0}</td>
                  <td>${trade.sellQuantity || 0}</td>
                  <td>${trade.buyPrice || '-'}</td>
                  <td>${trade.sellPrice || '-'}</td>
                  <td>${trade.tags ? trade.tags.join(', ') : '-'}</td>
                  <td>
                    <button class="btn btn-info btn-sm">View</button>
                  </td>
                </tr>
              `;
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
