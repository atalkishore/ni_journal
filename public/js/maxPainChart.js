$(document).ready(function () {
// <script >
    const options = {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
            xAxes: [{
                stacked: true,
                barPercentage: 0.5,
                categoryPercentage: 1
            }],
            yAxes: [{
                stacked: true,
                ticks: {
                    callback: function (labelValue, index, values) {
                        return Math.abs(Number(labelValue)) >= 1.0e+9

                            ? Math.abs(Number(labelValue)) / 1.0e+9 + 'B'
                            // Six Zeroes for Millions
                            : Math.abs(Number(labelValue)) >= 1.0e+6

                                ? Math.abs(Number(labelValue)) / 1.0e+6 + 'M'
                                // Three Zeroes for Thousands
                                : Math.abs(Number(labelValue)) >= 1.0e+3

                                    ? Math.abs(Number(labelValue)) / 1.0e+3 + 'K'

                                    : Math.abs(Number(labelValue))
                    }
                }
            }]
        },
        tooltips: {
            position: 'nearest',
            mode: 'index',
            intersect: false,
        }
    }
    let ctx = document.getElementById('myChart').getContext('2d');
    ctx.clearRect(0, 0, 400, 400)
    animationLoader = -200;
    if (isTendView) {
        let maxVal = Math.max(...chartDataSymbol.data);
        let minVal = Math.min(...chartDataSymbol.data);
        let diff = Math.min(0.1 * chartData.maxPainStrike, maxVal - minVal)/2;
        maxVal += diff;
        minVal = Math.max(0, minVal - diff);
        let myChart = new Chart(ctx,
            {
                "type": "line",
                "data": {
                    "labels": chartDataSymbol.labels,
                    "datasets": [{
                        "label": "Max-Pain Strike",
                        "data": chartDataSymbol.data,
                        "fill": false,
                        "backgroundColor": '#039be5',
                        "borderColor": "#039be5"
                    }]
                },
                "options": {
                    responsive: true,
                    maintainAspectRatio: false,
                    spanGaps: true,
                    scales: {
                        xAxes: [{
                            stacked: true,
                            barPercentage: 0.5,
                        }],
                        yAxes: [{
                            ticks: {
                                // beginAtZero:true,
                                min: parseInt(minVal),
                                max: parseInt(maxVal)
                            },
                            position:"left"
                        }]
                    },
                    tooltips: {
                        position: 'nearest',
                        mode: 'index',
                        intersect: false,
                    },
                }
            });
    } else {
        let myChart = new Chart(ctx, {
            type: 'bar',
            data: chartDataSymbol,
            options: options
        });
    }
// </script>

})
;
