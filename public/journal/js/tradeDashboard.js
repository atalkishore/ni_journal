function fetchDashboardSummary() {
  $.ajax({
    url: '/journal/api/dashboard',
    method: 'GET',
    dataType: 'json',
    success: function (response) {
      if (response.status === 'success' && response.data) {
        const data = response.data;

        const lastDayPnL = data.lastDayPnL ? parseFloat(data.lastDayPnL) : 0;
        const lastDayPnLChange = data.lastDayPnLChange
          ? parseFloat(data.lastDayPnLChange)
          : 0;
        const pnlThisMonth = data.pnlThisMonth
          ? parseFloat(data.pnlThisMonth)
          : 0;
        const pnlThisYear = data.pnlThisYear ? parseFloat(data.pnlThisYear) : 0;
        const lastMonthPnL = data.lastMonthPnL
          ? parseFloat(data.lastMonthPnL)
          : 0;
        const winningDays = data.winningDays ? parseInt(data.winningDays) : 0;
        const losingDays = data.losingDays ? parseInt(data.losingDays) : 0;

        $('#last-day-pnl-value').text(`₹${lastDayPnL.toFixed(2)}`);
        $('#last-day-pnl-change').text(
          `${lastDayPnLChange >= 0 ? '↑' : '↓'} ${Math.abs(lastDayPnLChange).toFixed(2)}%`
        );
        $('#this-month-pnl-card h3').text(`₹${pnlThisMonth.toFixed(2)}`);
        $('#this-year-pnl-card h3').text(`₹${pnlThisYear.toFixed(2)}`);
        $('#lastMonthPnL').text(lastMonthPnL.toFixed(2));
        $('#winning-days').text(winningDays);
        $('#losing-days').text(losingDays);

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
    error: function (xhr, status, error) {
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

  if (chartDom.echartsInstance) {
    chartDom.echartsInstance.dispose();
  }
  const myChart = echarts.init(chartDom);
  chartDom.echartsInstance = myChart;

  const option = {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(34, 40, 52, 0.9)',
      borderColor: '#373E53',
      textStyle: { color: '#eff2f6' },
      formatter: function (params) {
        let tooltipText = `<strong>${params[0].axisValue}</strong><br>`;
        params.forEach((item) => {
          tooltipText += `<span style="color:${item.color}">●</span> ${item.seriesName}: ₹${item.value.toFixed(2)}<br>`;
        });
        return tooltipText;
      },
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: pnlEvolution.dates || [],
      axisLabel: { rotate: 45 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '₹{value}' },
    },
    series: [
      {
        name: 'Total PnL',
        type: 'line',
        data: pnlEvolution.totalPnL || [],
        areaStyle: { opacity: 0.2 },
        itemStyle: { color: '#4CAF50' },
        smooth: true,
      },
      {
        name: 'Daily PnL',
        type: 'line',
        data: pnlEvolution.dailyPnL || [],
        areaStyle: { opacity: 0 },
        itemStyle: { color: '#85a9ff' },
        smooth: true,
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
