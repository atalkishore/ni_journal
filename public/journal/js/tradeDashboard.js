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
        const thisYearPnL = data.thisYearPnL ? parseFloat(data.thisYearPnL) : 0;
        const lastMonthPnL = data.lastMonthPnL
          ? parseFloat(data.lastMonthPnL)
          : 0;
        const winningDays = data.winningDays ? parseInt(data.winningDays) : 0;
        const losingDays = data.losingDays ? parseInt(data.losingDays) : 0;

        $('#last-day-pnl-value').text(`₹${lastDayPnL.toFixed(2)}`);
        $('#last-day-pnl-change').text(
          `${lastDayPnLChange >= 0 ? '↑' : '↓'} ${Math.abs(lastDayPnLChange).toFixed(2)}%`
        );
        $('#lastMonthPnL').text(lastMonthPnL.toFixed(2));
        $('#last-year-pnl-value').text(`₹${thisYearPnL.toFixed(2)}`);
        $('#winning-days').text(winningDays);
        $('#losing-days').text(losingDays);

        renderPNLChart(data.pnlEvolution || { dates: [], totalPnL: [] });
      } else {
        renderPNLChart({ dates: [], totalPnL: [] });
      }
    },
    error: function () {
      renderPNLChart({ dates: [], totalPnL: [] });
    },
  });
}

function renderPNLChart(pnlEvolution) {
  const chartDom = document.getElementById('line-chart');
  if (!chartDom) {
    return;
  }

  if (chartDom.echartsInstance) {
    chartDom.echartsInstance.dispose();
  }
  const myChart = echarts.init(chartDom);
  chartDom.echartsInstance = myChart;

  const hasData =
    pnlEvolution.dates.length > 0 && pnlEvolution.totalPnL.length > 0;

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
      data: pnlEvolution.dates.length
        ? pnlEvolution.dates
        : ['Day 1', 'Day 2', 'Day 3'],
      axisLabel: { rotate: 45 },
    },
    yAxis: {
      type: 'value',
      axisLabel: { formatter: '₹{value}' },
      min: 0,
      splitLine: { show: true },
    },
    series: hasData
      ? [
          {
            name: 'Total PnL',
            type: 'line',
            data: pnlEvolution.totalPnL || [],
            areaStyle: { opacity: 0.2 },
            itemStyle: { color: '#4CAF50' },
            smooth: true,
          },
        ]
      : [{ name: 'Total PnL', type: 'line', data: [] }],
    graphic: [
      {
        type: 'text',
        left: 'center',
        top: 'middle',
        style: {
          text: hasData ? '' : 'No PnL Data Available',
          fontSize: 16,
          fontWeight: 'bold',
          fill: '#888',
        },
      },
    ],
  };

  myChart.setOption(option);
  window.addEventListener('resize', () => myChart.resize());
}

fetchDashboardSummary();
