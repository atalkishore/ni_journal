// Initialize the chart
const chartDom = document.getElementById('line-chart');
const myChart = echarts.init(chartDom);

// Chart configuration
const option = {
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(34, 40, 52, 0.9)',
    borderColor: '#373E53',
    textStyle: {
      color: '#eff2f6',
    },
  },
  xAxis: {
    type: 'category',
    boundaryGap: false,
    data: [
      '24-06-28',
      '24-07-02',
      '24-07-09',
      '24-07-12',
      '24-07-16',
      '24-07-22',
      '24-07-30',
      '24-08-05',
      '24-08-10',
      '24-08-15',
    ],
  },
  yAxis: {
    type: 'value',
  },
  series: [
    {
      name: 'Total PnL',
      type: 'line',
      data: [
        10000, 10500, 11000, 11500, 12000, 15000, 18000, 20000, 21000, 25000,
      ],
      areaStyle: {},
      itemStyle: {
        color: '#4CAF50',
      },
    },
    {
      name: 'Daily PnL',
      type: 'line',
      data: [0, 500, 500, 500, 500, 3000, 3000, 2000, 1000, 4000],
      areaStyle: { opacity: 0 },
      itemStyle: {
        color: '#85a9ff',
      },
    },
  ],
};

// Set option and render chart
myChart.setOption(option);

// Make the chart responsive
window.addEventListener('resize', () => {
  myChart.resize();
});
