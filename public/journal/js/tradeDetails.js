$(document).ready(function () {
  const pathSegments = window.location.pathname.split('/');
  const tradeId = pathSegments[pathSegments.length - 1];

  if (!tradeId || tradeId.length !== 24) {
    showToast('Invalid Trade ID. Please try again.', 'danger');
    setTimeout(() => {
      window.location.href = '/journal/trades';
    }, 1000);
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

        showToast('Trade details fetched successfully!', 'success');
      },
      error: function (xhr) {
        showToast('Failed to fetch trade details. Please try again.', 'danger');
        setTimeout(() => {
          window.location.href = '/journal/trades';
        }, 1500);
      },
    });
  }

  $('#backButton').on('click', function () {
    window.location.href = '/journal/trades';
  });

  fetchTradeDetails();
});

function showToast(message, type) {
  const toast = $(`
    <div class="alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3" role="alert" style="z-index: 1055;">
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    </div>
  `);

  $('body').append(toast);

  setTimeout(() => {
    toast.alert('close');
  }, 1000);
}
