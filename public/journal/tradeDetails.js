$(document).ready(function () {
  if (!tradeId) {
    alert('Invalid Trade ID. Please try again.');
    window.location.href = '/journal/trades';
    return;
  }

  function fetchTradeDetails() {
    $.ajax({
      url: `/journal/api/trades/${tradeId}`,
      type: 'GET',
      success: function (tradeJson) {
        const trade = tradeJson.data;
        $('#loadingSpinner').hide();

        $('#tradeDateTime').text(
          new Date(trade.tradeDate).toLocaleString() || '-'
        );
        $('#instrument').text(trade.instrument || '-');
        $('#symbol').text(trade.symbol || '-');
        $('#quantity').text(trade.quantity || '-');
        $('#position').text(trade.position || '-');
        $('#entryPrice').text(trade.entryPrice || '-');
        $('#targetPrice').text(trade.targetPrice || '-');
        $('#stopLoss').text(trade.stopLoss || '-');
        $('#strategy').text(trade.strategy || '-');

        if (trade.tags && trade.tags.length > 0) {
          const tagBadges = trade.tags
            .map((tag) => `<span class="badge bg-info">${tag}</span>`)
            .join('');
          $('#tags').html(tagBadges);
        } else {
          $('#tags').text('-');
        }

        $('#transactionCost').text(trade.brokerage || '0');
        $('#tradeNotes').text(trade.tradeNotes || '-');

        if (trade.screenshots && trade.screenshots.length > 0) {
          const screenshotLinks = trade.screenshots
            .map(
              (url, index) =>
                `<a href="${url}" target="_blank" class="btn btn-link btn-sm">Screenshot ${
                  index + 1
                }</a>`
            )
            .join(' ');
          $('#screenshots').html(screenshotLinks);
        } else {
          $('#screenshots').text('-');
        }

        $('#tradeDetailsContent').show();
      },
      error: function () {
        alert('Failed to fetch trade details. Please try again.');
        window.location.href = '/journal/trades';
      },
    });
  }

  $('#backButton').on('click', function () {
    window.location.href = '/journal/trades';
  });

  fetchTradeDetails();
});
