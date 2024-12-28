document.addEventListener('DOMContentLoaded', function () {
  const tradeId = window.location.pathname.split('/').pop();

  async function loadTradeData() {
    if (!tradeId) {
      alert('Trade ID is missing in the URL.');
      return;
    }

    try {
      const response = await fetch(`/journal/api/trades/${tradeId}`);
      if (!response.ok) throw new Error('Failed to fetch trade data');

      const data = await response.json();
      const trade = data.data;

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

      loadStrategies(trade.strategy);
    } catch (error) {
      alert('Failed to load trade data. Please try again.');
      console.error('Error loading trade data:', error);
    }
  }

  async function loadStrategies(selectedStrategy = '') {
    try {
      const response = await fetch('/journal/api/strategies');
      if (!response.ok) throw new Error('Failed to fetch strategies');

      const strategies = await response.json();
      const strategiesDropdown = document.getElementById('strategies');
      strategiesDropdown.innerHTML =
        '<option value="">Select a strategy</option>';
      strategies.data.forEach((strategy) => {
        const isSelected = strategy.name === selectedStrategy ? 'selected' : '';
        const option = `<option value="${strategy.name}" ${isSelected}>${strategy.name}</option>`;
        strategiesDropdown.insertAdjacentHTML('beforeend', option);
      });
    } catch (error) {
      alert('Failed to load strategies.');
      console.error('Error loading strategies:', error);
    }
  }

  document
    .getElementById('editTradeForm')
    .addEventListener('submit', async function (e) {
      e.preventDefault();

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
          .map((tag) => tag.trim()),
        transactionCost:
          parseFloat(document.getElementById('transactionCost').value) || 0,
        targetPrice:
          parseFloat(document.getElementById('targetPrice').value) || null,
        stopLoss: parseFloat(document.getElementById('stopLoss').value) || null,
        tradeNotes: document.getElementById('tradeNotes').value || '',
      };

      try {
        const response = await fetch(`/journal/api/trades/${tradeId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedTrade),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || 'Failed to update trade');
        }

        alert('Trade updated successfully!');
        window.location.href = '/journal/trades';
      } catch (error) {
        alert(`Error updating trade: ${error.message}`);
        console.error('Error updating trade:', error);
      }
    });

  loadTradeData();
});
