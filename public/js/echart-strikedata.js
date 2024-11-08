(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
        factory();
})((function () {
    'use strict';

    const { merge: merge } = window._;
    const echartSetOption = (e, t, a, r) => { const { breakpoints: o, resize: s } = window.phoenix.utils, n = t => { Object.keys(t).forEach((a => { window.innerWidth > o[a] && e.setOption(t[a]); })); }, c = document.body; e.setOption(merge(a(), t)), s((() => { e.resize(), r && n(r); })), r && n(r), c.addEventListener("clickControl", (({ detail: { control: r } }) => { "phoenixTheme" === r && e.setOption(window._.merge(a(), t)); })); }; const resizeEcharts = () => { const e = document.querySelectorAll("[data-echart-responsive]"); e.length > 0 && e.forEach((e => { echarts.getInstanceByDom(e)?.resize(); })); }; const navbarVerticalToggle = document.querySelector(".navbar-vertical-toggle"); navbarVerticalToggle && navbarVerticalToggle.addEventListener("navbar.vertical.toggle", (e => resizeEcharts())); const echartTabs = document.querySelectorAll("[data-tab-has-echarts]"); echartTabs && echartTabs.forEach((e => { e.addEventListener("shown.bs.tab", (e => { const t = e.target, { hash: a } = t, r = a || t.dataset.bsTarget, o = document.getElementById(r.substring(1))?.querySelector("[data-echart-tab]"); o && window.echarts.init(o).resize(); })); })); const tooltipFormatter = (e, t = "MMM DD") => { let a = ""; return e.forEach((e => { a += `<div class='ms-1'>\n        <h6 class="text-700"><span class="fas fa-circle me-1 fs--2" style="color:${e.borderColor ? e.borderColor : e.color}"></span>\n          ${e.seriesName} : ${"object" == typeof e.value ? e.value[1] : e.value}\n        </h6>\n      </div>`; })), `<div>\n            <p class='mb-2 text-600'>\n              ${window.dayjs(e[0].axisValue).isValid() ? window.dayjs(e[0].axisValue).format(t) : e[0].axisValue}\n            </p>\n            ${a}\n          </div>` };

    const stackedLineChartInit = (selector, xAxisLegend = [], chartLabel = ["Label1", "Label2","Ltp"], dataChartA = [], dataChartB = [], dataChartC = []) => {
        const { getColor: e, getData: t } = window.phoenix.utils, o = document.querySelector(selector),
            r = xAxisLegend;
        if (o) {
            const i = t(o, "echarts"), a = window.echarts.init(o);
            echartSetOption(a, i, (() => ({
                tooltip: { trigger: "axis", padding: [7, 10], backgroundColor: e("gray-100"), borderColor: e("gray-300"), textStyle: { color: e("dark") }, borderWidth: 1, transitionDuration: 0, formatter: e => tooltipFormatter(e) },
                legend: { data: [chartLabel[0], chartLabel[1], chartLabel[2]] },
                xAxis: [{ type: "category", data: r, boundaryGap: !1, axisLine: { lineStyle: { color: e("gray-300"), type: "solid" } }, axisTick: { show: !0 }, axisLabel: { color: e("gray-400"), interval: 2, margin: 15, formatter: e => e.substring(0, 6) }, splitLine: { show: !1 } }],
                yAxis: [
                    { type: "value", name: 'left_yaxis', splitLine: { lineStyle: { color: e("gray-200"), type: "dashed" } }, boundaryGap: !1, axisLabel: { show: !0, color: e("gray-400"), margin: 15 }, axisTick: { show: !1 }, axisLine: { show: !1, onZero: 0 } },
                    { type: "value", name: 'right_yaxis', min: Math.min(dataChartC), max: Math.max(dataChartC), splitLine: { lineStyle: { color: e("gray-200"), type: "dashed" } }, boundaryGap: !1, axisLabel: { show: !0, color: e("gray-400"), margin: 15 }, axisTick: { show: !1 }, axisLine: { show: !1 } }
                ],
                series: [
                    { name: chartLabel[0], type: "line", symbolSize: 6, itemStyle: { color: e("white"), borderColor: e("success"), borderWidth: 1, borderType: 'solid' }, lineStyle: { color: e("success"), type: 'solid' }, symbol: "none", data: dataChartA },
                    { name: chartLabel[1], type: "line", symbolSize: 10, itemStyle: { color: e("white"), borderColor: e("danger"), borderWidth: 1 }, lineStyle: { color: e("danger") }, symbol: "none", data: dataChartB },
                    { name: chartLabel[2], type: "line", yAxisIndex: 1, symbolSize: 10, itemStyle: { color: e("white"), borderColor: '#555', borderWidth: 1 }, lineStyle: { color: '#bbb', type: 'dashed' }, symbol: "none", data: dataChartC },
                ]
                , grid: { right: 10, left: 5, bottom: 5, top: 8, containLabel: !0 }
            })));

            document.querySelectorAll('#strikeAnalysisTabs [data-bs-toggle="tab"]').forEach(tab => {
                tab.addEventListener('shown.bs.tab', (event) => {
                    a.resize();
                });
            });
        }
    };
    const initializeCharts = () => {

        stackedLineChartInit('.echart-strikedata-ltp', xLabel, ltpChartLabel, ceLtpOI, peLtpOI, ltps);
        stackedLineChartInit('.echart-strikedata-oi', xLabel, oiChartLabel, ceOI, peOI, ltps);
        stackedLineChartInit('.echart-strikedata-coi', xLabel, coiChartLabel, ceCOI, peCOI, ltps);
        stackedLineChartInit('.echart-strikedata-volume', xLabel, volChartLabel, volCeOI, volPeOI, ltps);
        stackedLineChartInit('.echart-strikedata-iv', xLabel, ivChartLabel, ivCe, ivPe, ltps);
    };


    const { docReady: docReady } = window.phoenix.utils;
    docReady(initializeCharts);
}));