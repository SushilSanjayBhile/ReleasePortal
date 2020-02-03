import { getStyle, hexToRgba } from '@coreui/coreui/dist/js/coreui-utilities';
import { CustomTooltips } from '@coreui/coreui-plugin-chartjs-custom-tooltips';
import { Chart } from 'react-chartjs-2';
export const brandPrimary = getStyle('--primary')
export const brandSuccess = getStyle('--success')
export const brandInfo = getStyle('--info')
export const brandDanger = getStyle('--danger')
export const brandPurple = getStyle('--purple')
// Card Chart 1
export const cardChartData1 = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
        {
            label: 'My First dataset',
            backgroundColor: brandDanger,
            borderColor: 'rgba(255,255,255,.55)',
            data: [65, 59, 84, 84, 51, 55, 40],
        },
    ],
};

export const cardChartOpts1 = {
    tooltips: {
        enabled: false,
        custom: CustomTooltips
    },
    maintainAspectRatio: false,
    legend: {
        display: false,
    },
    scales: {
        xAxes: [
            {
                gridLines: {
                    color: 'transparent',
                    zeroLineColor: 'transparent',
                },
                ticks: {
                    fontSize: 2,
                    fontColor: 'transparent',
                },

            }],
        yAxes: [
            {
                display: false,
                ticks: {
                    display: false,
                    min: Math.min.apply(Math, cardChartData1.datasets[0].data) - 5,
                    max: Math.max.apply(Math, cardChartData1.datasets[0].data) + 5,
                },
            }],
    },
    elements: {
        line: {
            borderWidth: 1,
        },
        point: {
            radius: 4,
            hitRadius: 10,
            hoverRadius: 4,
        },
    }
}

// Card Chart 2
export const cardChartData2 = {
    labels: ['02 Dec 2019', '09 Dec 2019', '16 Dec 2019', '23 Dec 2019', '30 Dec 2019'],
    datasets: [
        {
            label: 'Weekly Progress',
            backgroundColor: 'transparent',
            // borderColor: 'rgba(255,255,255,.55)',
            borderColor: brandInfo,
            borderWidth: 5,
            data: [1, 18, 9, 17, 34],
        },
    ],
};

export const chartData = {
    'BOS': {
        labels: ["4 November 2019", "11 November 2019", "18 November 2019", "25 November 2019", "4 December 2019", "9 December 2019", "17 December 2019", "23 December 2019", "30 December 2019"],
        datasets: [
            {
                label: 'Weekly Progress',
                backgroundColor: 'transparent',
                // borderColor: 'rgba(255,255,255,.55)',
                borderColor: brandInfo,
                borderWidth: 5,
                data: [70.5, 74.05, 76.48, 81.79, 90.82, 93.88, 95.68, 98.63, 99.43],
            },
        ],
    },
    'NYNJ': {
        labels: ["4 November 2019", "11 November 2019", "18 November 2019", "25 November 2019", "4 December 2019", "9 December 2019", "17 December 2019", "23 December 2019", "30 December 2019"],
        datasets: [
            {
                label: 'Weekly Progress',
                backgroundColor: 'transparent',
                // borderColor: 'rgba(255,255,255,.55)',
                borderColor: brandInfo,
                borderWidth: 5,
                data: [72.93, 74.61, 78.25, 82.11, 91.22, 94.42, 95.85, 98.88, 99.66],
            },
        ],
    },
    'COMMON': {
        labels: ["4 November 2019", "11 November 2019", "18 November 2019", "25 November 2019", "4 December 2019", "9 December 2019", "17 December 2019", "23 December 2019", "30 December 2019"],
        datasets: [
            {
                label: 'Weekly Progress',
                backgroundColor: 'transparent',
                // borderColor: 'rgba(255,255,255,.55)',
                borderColor: brandInfo,
                borderWidth: 5,
                data: [75.65, 79.65, 85.64, 82.88, 88.78, 95.94, 97.50, 97.66, 99.06],
            },
        ],
    },
}
export const cardChartDataPurple = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
        {
            label: 'Weekly Progress',
            backgroundColor: brandPurple,
            borderColor: 'rgba(255,255,255,.55)',
            data: [1, 18, 9, 17, 34, 22, 11],
        },
    ],
};

export const chartOptions = {
    'BOS': {
        tooltips: {
            enabled: false,
            custom: CustomTooltips
        },
        maintainAspectRatio: false,
        legend: {
            display: false,
            // display: true
        },
        scales: {
            xAxes: [
                {
                    gridLines: {},
                    // gridLines: {
                    //     color: '#00742b',
                    //     zeroLineColor: '#00742b',
                    // },
                    ticks: {
                        fontSize: 2,
                        fontColor: '#00742b',
                    },

                }],
            yAxes: [
                {
                    gridLines: {},
                    // gridLines: {
                    //     color: '#00742b',
                    //     zeroLineColor: '#00742b',
                    // },
                    // display: false,
                    ticks: {
                        display: true,
                        min: Math.min.apply(Math, chartData.BOS.datasets[0].data) - 5,
                        max: Math.max.apply(Math, chartData.BOS.datasets[0].data) + 5,
                        fontColor: '#00742b',
                    },
                }],
        },
        elements: {
            line: {
                tension: 0.00001,
                borderWidth: 1,
            },
            point: {
                radius: 4,
                hitRadius: 10,
                hoverRadius: 4,
            },
        },
    },
    'NYNJ': {
        tooltips: {
            enabled: false,
            custom: CustomTooltips
        },
        maintainAspectRatio: false,
        legend: {
            display: false,
            // display: true
        },
        scales: {
            xAxes: [
                {
                    gridLines: {},
                    // gridLines: {
                    //     color: '#00742b',
                    //     zeroLineColor: '#00742b',
                    // },
                    ticks: {
                        fontSize: 2,
                        fontColor: '#00742b',
                    },

                }],
            yAxes: [
                {
                    gridLines: {},
                    // gridLines: {
                    //     color: '#00742b',
                    //     zeroLineColor: '#00742b',
                    // },
                    // display: false,
                    ticks: {
                        display: true,
                        min: Math.min.apply(Math, chartData.NYNJ.datasets[0].data) - 5,
                        max: Math.max.apply(Math, chartData.NYNJ.datasets[0].data) + 5,
                        fontColor: '#00742b',
                    },
                }],
        },
        elements: {
            line: {
                tension: 0.00001,
                borderWidth: 1,
            },
            point: {
                radius: 4,
                hitRadius: 10,
                hoverRadius: 4,
            },
        },
    },
    'COMMON': {
        tooltips: {
            enabled: false,
            custom: CustomTooltips
        },
        maintainAspectRatio: false,
        legend: {
            display: false,
            // display: true
        },
        scales: {
            xAxes: [
                {
                    gridLines: {},
                    // gridLines: {
                    //     color: '#00742b',
                    //     zeroLineColor: '#00742b',
                    // },
                    ticks: {
                        fontSize: 2,
                        fontColor: '#00742b',
                    },

                }],
            yAxes: [
                {
                    gridLines: {},
                    // gridLines: {
                    //     color: '#00742b',
                    //     zeroLineColor: '#00742b',
                    // },
                    // display: false,
                    ticks: {
                        display: true,
                        min: Math.min.apply(Math, chartData.COMMON.datasets[0].data) - 5,
                        max: Math.max.apply(Math, chartData.COMMON.datasets[0].data) + 5,
                        fontColor: '#00742b',
                    },
                }],
        },
        elements: {
            line: {
                tension: 0.00001,
                borderWidth: 1,
            },
            point: {
                radius: 4,
                hitRadius: 10,
                hoverRadius: 4,
            },
        },
    }
}
export const cardChartOpts2 = {
    tooltips: {
        enabled: false,
        custom: CustomTooltips
    },
    maintainAspectRatio: false,
    legend: {
        display: false,
        // display: true
    },
    scales: {
        xAxes: [
            {
                gridLines: {},
                // gridLines: {
                //     color: '#00742b',
                //     zeroLineColor: '#00742b',
                // },
                ticks: {
                    fontSize: 2,
                    fontColor: '#00742b',
                },

            }],
        yAxes: [
            {
                gridLines: {},
                // gridLines: {
                //     color: '#00742b',
                //     zeroLineColor: '#00742b',
                // },
                // display: false,
                ticks: {
                    display: true,
                    min: Math.min.apply(Math, chartData.BOS.datasets[0].data) - 5,
                    max: Math.max.apply(Math, chartData.BOS.datasets[0].data) + 5,
                    fontColor: '#00742b',
                },
            }],
    },
    elements: {
        line: {
            tension: 0.00001,
            borderWidth: 1,
        },
        point: {
            radius: 4,
            hitRadius: 10,
            hoverRadius: 4,
        },
    },
};


// Card Chart 4
export const cardChartData4 = {
    labels: ['', '', '', '', '', '', '', '', '', '', '', '', '', '', '', ''],
    datasets: [
        {
            label: 'My First dataset',
            backgroundColor: 'rgba(255,255,255,.3)',
            borderColor: 'transparent',
            data: [78, 81, 80, 45, 34, 12, 40, 75, 34, 89, 32, 68, 54, 72, 18, 98],
        },
    ],
};

export const cardChartOpts4 = {
    tooltips: {
        enabled: false,
        custom: CustomTooltips
    },
    maintainAspectRatio: false,
    legend: {
        display: false,
    },
    scales: {
        xAxes: [
            {
                display: false,
                barPercentage: 0.6,
            }],
        yAxes: [
            {
                display: false,
            }],
    },
};
// Card Chart 3
export const cardChartData3 = {
    labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    datasets: [
        {
            label: 'My First dataset',
            backgroundColor: 'rgba(255,255,255,.2)',
            borderColor: 'rgba(255,255,255,.55)',
            data: [78, 81, 80, 45, 34, 12, 40],
        },
    ],
};

export const cardChartOpts3 = {
    tooltips: {
        enabled: false,
        custom: CustomTooltips
    },
    maintainAspectRatio: false,
    legend: {
        display: false,
    },
    scales: {
        xAxes: [
            {
                display: false,
            }],
        yAxes: [
            {
                display: false,
            }],
    },
    elements: {
        line: {
            borderWidth: 2,
        },
        point: {
            radius: 0,
            hitRadius: 10,
            hoverRadius: 4,
        },
    },
};

export const stackedBarChart = {
    labels: ['Domains (Total: 1100)', 'GUI (Total: 1500)'],
    datasets: [{
        label: 'Pass',
        backgroundColor: '#01D251',
        borderColor: 'white',
        borderWidth: 1,
        data: [10, 600]
    },
    {
        label: 'Blocked',
        backgroundColor: '#FFCE56',
        borderColor: 'white',
        borderWidth: 1,
        data: [300, 300]
    },
    {
        label: 'Fail',
        backgroundColor: '#d9534f',
        borderColor: 'white',
        borderWidth: 1,
        data: [300, 400]
    },
    {
        label: 'Not Tested',
        backgroundColor: 'rgba(128,128,128,0.3)',
        borderColor: 'white',
        borderWidth: 1,
        data: [300, 200]
    },
    ]
}

export const stackedBarChartOptions = {
    title: {
        display: false,
        text: '80%'
    },
    // tooltips: {
    //     mode: 'index',
    //     intersect: false
    // },
    maintainAspectRatio: false,
    responsive: true,
    scales: {
        xAxes: [{
            barPercentage: 0.4,
            stacked: true,
            gridLines: {},
            ticks: {
                beginAtZero: true,
                fontSize: 14
            },
        }],
        yAxes: [{
            barPercentage: 0.4,
            stacked: true,
            gridLines: {
                display: false,
                // color: '#fff',
                // lineColor: '#fff',
                // zeroLineColor: '#fff',
                // zeroLineWidth: 0
            },
            ticks: {
                fontSize: 14
            },
        }],
    },
    legend: {
        display: false
    },
    animation: {
        onComplete: function () {
            var chartInstance = this.chart;
            var ctx = chartInstance.ctx;
            ctx.textAlign = "left";
            ctx.font = "14px Open Sans";
            ctx.fillStyle = "rgb(4, 56, 26)";

            Chart.helpers.each(this.data.datasets.forEach(function (dataset, i) {
                var meta = chartInstance.controller.getDatasetMeta(i);
                // let total = 0;
                // Chart.helpers.each(meta.data.forEach(function (bar, index) {
                //     total  += dataset.data[index];
                // }), this)
                Chart.helpers.each(meta.data.forEach(function (bar, index) {
                    let data = dataset.data[index];
                    // if (i === 0) {
                    //     ctx.fillText(data, 50, bar._model.y + 4);
                    // } else {
                    if (bar._model.x - bar._model.base > 50) {
                        ctx.fillText(data, bar._model.x - 30, bar._model.y + 4);
                    }

                    // }
                }), this)
            }), this);
        }
    },
    pointLabelFontFamily: "Quadon Extra Bold",
    scaleFontFamily: "Quadon Extra Bold",
}