document.addEventListener('DOMContentLoaded', function () {
  const tradeId = window.location.pathname.split('/')[3]; // Extract trade ID from the URL

  // Function to load trade data and auto-populate the form
  function loadTradeData() {
    if (!tradeId) {
      alert('Trade ID is missing in the URL. Please try again.');
      return;
    }

    fetch(`/journal/api/trades/${tradeId}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch trade data');
        return res.json();
      })
      .then((trade) => {
        // Populate form fields with trade data
        document.getElementById('instrument').value = trade.instrument || '';
        document.getElementById('symbol').value = trade.symbol || '';
        document.getElementById('position').value = trade.position || '';
        document.getElementById('quantity').value = trade.quantity || '';
        document.getElementById('price').value = trade.price || '';
        document.getElementById('transactionCost').value =
          trade.transactionCost || '0.00';
        document.getElementById('targetPrice').value = trade.targetPrice || '';
        document.getElementById('stopLoss').value = trade.stopLoss || '';
        document.getElementById('tradeNotes').value = trade.tradeNotes || '';
        document.getElementById('tags').value = trade.tags
          ? trade.tags.join(', ')
          : '';
        loadStrategies(trade.strategy); // Load strategies and pre-select the current strategy
      })
      .catch(() => alert('Failed to load trade data. Please try again.'));
  }

  // Function to load strategies and populate the dropdown
  function loadStrategies(selectedStrategy = '') {
    $.ajax({
      url: '/journal/api/strategies',
      type: 'GET',
      success: function (strategies) {
        const strategiesDropdown = $('#strategies');
        strategiesDropdown.empty(); // Clear existing options

        // Add default placeholder option
        strategiesDropdown.append(
          '<option value="">Select a strategy</option>'
        );

        // Append strategies to the dropdown
        strategies.forEach((strategy) => {
          const isSelected =
            strategy.name === selectedStrategy ? 'selected' : '';
          const option = `<option value="${strategy.name}" ${isSelected}>${strategy.name}</option>`;
          strategiesDropdown.append(option);
        });
      },
      error: function (xhr) {
        alert('Failed to load strategies: ' + xhr.responseText);
      },
    });
  }

  // Back button navigation
  document.getElementById('backButton').addEventListener('click', function () {
    window.location.href = '/journal/trades';
  });

  // Handle form submission for editing the trade
  document
    .getElementById('editTradeForm')
    .addEventListener('submit', function (e) {
      e.preventDefault(); // Prevent default form submission

      if (!tradeId) {
        alert('Trade ID is missing. Cannot update trade.');
        return;
      }

      const updatedTrade = {
        instrument: document.getElementById('instrument').value,
        symbol: document.getElementById('symbol').value,
        position: document.getElementById('position').value,
        quantity: parseInt(document.getElementById('quantity').value, 10) || 0,
        price: parseFloat(document.getElementById('price').value) || 0,
        strategy: document.getElementById('strategies').value,
        tags: document
          .getElementById('tags')
          .value.split(',')
          .map((tag) => tag.trim()), // Convert comma-separated tags into array
        transactionCost:
          parseFloat(document.getElementById('transactionCost').value) || 0,
        targetPrice:
          parseFloat(document.getElementById('targetPrice').value) || null,
        stopLoss: parseFloat(document.getElementById('stopLoss').value) || null,
        tradeNotes: document.getElementById('tradeNotes').value || '',
      };

      fetch(`/journal/api/updateTrade/${tradeId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedTrade),
      })
        .then((response) => {
          if (response.ok) {
            alert('Trade updated successfully!');
            window.location.href = '/journal/trades';
          } else {
            response.text().then((text) => {
              alert(`Failed to update trade: ${text}`);
            });
          }
        })
        .catch(() =>
          alert('An error occurred while updating the trade. Please try again.')
        );
    });

  // Load trade data and strategies on page load
  loadTradeData();
});
