function fetchDashboardSummary() {
  $.ajax({
    url: '/journal/api/dashboard',
    method: 'GET',
    dataType: 'json',
    success: function (response) {
      if (response.status && response.data) {
        const data = response.data;

        const lastDayPnL = parseFloat(data.lastDayPnL) || 0;
        const lastDayPnLChange = parseFloat(data.lastDayPnLChange) || 0;
        const pnlThisMonth = parseFloat(data.pnlThisMonth) || 0;
        const pnlThisYear = parseFloat(data.pnlThisYear) || 0;

        $('#last-day-pnl-value').text(`₹${lastDayPnL.toFixed(2)}`);
        $('#last-day-pnl-change').text(
          `${lastDayPnLChange > 0 ? '↑' : '↓'} ${Math.abs(lastDayPnLChange).toFixed(2)}%`
        );
        $('#this-month-pnl-card h3').text(`$${pnlThisMonth.toFixed(2)}`);
        $('#this-year-pnl-card h3').text(`$${pnlThisYear.toFixed(2)}`);

        if (
          data.pnlEvolution?.dates?.length &&
          data.pnlEvolution.totalPnL?.length
        ) {
          renderPNLChart(data.pnlEvolution);
        } else {
          displayErrorMessage('line-chart', 'No PnL evolution data available.');
        }
      } else {
        displayErrorMessage(
          'dashboard-summary',
          response.message || 'Failed to load dashboard summary.'
        );
      }
    },
    error: function () {
      displayErrorMessage(
        'dashboard-summary',
        'Failed to load dashboard summary.'
      );
    },
  });
}

function renderPNLChart(pnlEvolution) {
  const chartDom = document.getElementById('line-chart');
  if (!chartDom) {
    displayErrorMessage('line-chart', 'Failed to render chart.');
    return;
  }

  const myChart = echarts.init(chartDom);

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(34, 40, 52, 0.9)',
      borderColor: '#373E53',
      textStyle: { color: '#eff2f6' },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: pnlEvolution.dates || [],
    },
    yAxis: { type: 'value' },
    series: [
      {
        name: 'Total PnL',
        type: 'line',
        data: pnlEvolution.totalPnL || [],
        areaStyle: {},
        itemStyle: { color: '#4CAF50' },
      },
      {
        name: 'Daily PnL',
        type: 'line',
        data: pnlEvolution.dailyPnL || [],
        areaStyle: { opacity: 0 },
        itemStyle: { color: '#85a9ff' },
      },
    ],
  };

  myChart.setOption(option);
  window.addEventListener('resize', () => myChart.resize());
}

function displayErrorMessage(containerId, message) {
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `<div class="alert alert-danger">${message}</div>`;
  } else {
    console.error(`Element with ID "${containerId}" not found.`);
  }
}

fetchDashboardSummary();
