(function (factory) {
    typeof define === 'function' && define.amd ? define(factory) :
        factory();
})((function () {
    'use strict';

    const { merge: merge } = window._; const echartSetOption = (e, t, a, r) => { const { breakpoints: o, resize: s } = window.phoenix.utils, n = t => { Object.keys(t).forEach((a => { window.innerWidth > o[a] && e.setOption(t[a]); })); }, c = document.body; e.setOption(merge(a(), t)), s((() => { e.resize(), r && n(r); })), r && n(r), c.addEventListener("clickControl", (({ detail: { control: r } }) => { "phoenixTheme" === r && e.setOption(window._.merge(a(), t)); })); }; const resizeEcharts = () => { const e = document.querySelectorAll("[data-echart-responsive]"); e.length > 0 && e.forEach((e => { echarts.getInstanceByDom(e)?.resize(); })); }; const navbarVerticalToggle = document.querySelector(".navbar-vertical-toggle"); navbarVerticalToggle && navbarVerticalToggle.addEventListener("navbar.vertical.toggle", (e => resizeEcharts())); const echartTabs = document.querySelectorAll("[data-tab-has-echarts]"); echartTabs && echartTabs.forEach((e => { e.addEventListener("shown.bs.tab", (e => { const t = e.target, { hash: a } = t, r = a || t.dataset.bsTarget, o = document.getElementById(r.substring(1))?.querySelector("[data-echart-tab]"); o && window.echarts.init(o).resize(); })); })); const tooltipFormatter = (e, t = "MMM DD") => { let a = ""; return e.forEach((e => { a += `<div class='ms-1'>\n        <h6 class="text-700"><span class="fas fa-circle me-1 fs--2" style="color:${e.borderColor ? e.borderColor : e.color}"></span>\n          ${e.seriesName} : ${"object" == typeof e.value ? e.value[1] : e.value}\n        </h6>\n      </div>`; })), `<div>\n            <p class='mb-2 text-600'>\n              ${window.dayjs(e[0].axisValue).isValid() ? window.dayjs(e[0].axisValue).format(t) : e[0].axisValue}\n            </p>\n            ${a}\n          </div>` };

    const issuesDiscoveredChartInit = () => { const { getColor: e, getData: t } = window.phoenix.utils, i = document.querySelector(".echart-issue-chart"); if (i) { const a = t(i, "echarts"), o = window.echarts.init(i); echartSetOption(o, a, (() => ({ color: [e("info-300"), e("warning-300"), e("danger-300"), e("success-300"), e("primary")], tooltip: { trigger: "item" }, responsive: !0, maintainAspectRatio: !1, series: [{ name: "Tasks assigned to me", type: "pie", radius: ["48%", "90%"], startAngle: 30, avoidLabelOverlap: !1, label: { show: !1, position: "center", formatter: "{x|{d}%} \n {y|{b}}", rich: { x: { fontSize: 31.25, fontWeight: 800, color: e("gray-700"), padding: [0, 0, 5, 15] }, y: { fontSize: 12.8, color: e("gray-700"), fontWeight: 600 } } }, emphasis: { label: { show: !0 } }, labelLine: { show: !1 }, data: [{ value: 78, name: "Product design" }, { value: 63, name: "Development" }, { value: 56, name: "QA & Testing" }, { value: 36, name: "Customer queries" }, { value: 24, name: "R & D" }] }], grid: { bottom: 0, top: 0, left: 0, right: 0, containLabel: !1 } }))); } };

    const stackedLineChartInit = () => {
        const { getColor: e, getData: t } = window.phoenix.utils, o = document.querySelector(".echart-stacked-line-chart-example"),
            r = xLabel;
        if (o) {
            const i = t(o, "echarts"), a = window.echarts.init(o);
            echartSetOption(a, i, (() => ({
                tooltip: { trigger: "axis", padding: [7, 10], backgroundColor: e("gray-100"), borderColor: e("gray-300"), textStyle: { color: e("dark") }, borderWidth: 1, transitionDuration: 0, formatter: e => tooltipFormatter(e) },
                legend: { data: [fChartLabel[0], fChartLabel[1], "Ltp"] },
                xAxis: [{ type: "category", data: r, boundaryGap: !1, axisLine: { lineStyle: { color: e("gray-300"), type: "solid" } }, axisTick: { show: !0 }, axisLabel: { color: e("gray-400"), interval: 5, margin: 15, formatter: e => e.substring(0, 5) }, splitLine: { show: !1 } }],
                yAxis: [
                    { type: "value", name: 'left_yaxis', splitLine: { lineStyle: { color: e("gray-200"), type: "dashed" } }, boundaryGap: !1, axisLabel: { show: !0, color: e("gray-400"), margin: 15 }, axisTick: { show: !1 }, axisLine: { show: !1,onZero: 0 } },
                    { type: "value", name: 'right_yaxis', min: Math.min(ltps), max: Math.max(ltps), splitLine: { lineStyle: { color: e("gray-200"), type: "dashed" } }, boundaryGap: !1, axisLabel: { show: !0, color: e("gray-400"), margin: 15 }, axisTick: { show: !1 }, axisLine: { show: !1 } }
                ],
                series: [
                    { name: fChartLabel[0], type: "line", symbolSize: 6, itemStyle: { color: e("white"), borderColor: e("success"), borderWidth: 1, borderType: 'solid' }, lineStyle: { color: e("success"), type: 'solid' }, symbol: "none", data: ceOI },
                    { name: fChartLabel[1], type: "line", symbolSize: 10, itemStyle: { color: e("white"), borderColor: e("danger"), borderWidth: 1 }, lineStyle: { color: e("danger") }, symbol: "none", data: peOI },
                    { name: "Ltp", type: "line", yAxisIndex: 1, symbolSize: 10, itemStyle: { color: e("white"), borderColor: '#555', borderWidth: 1 }, lineStyle: { color: '#bbb', type: 'dashed' }, symbol: "none", data: ltps },
                ]
                , grid: { right: 10, left: 5, bottom: 5, top: 8, containLabel: !0 }
            })));
        }
    };
    const basicBarChartInit = () => {
        const { getColor: r, getData: t } = window.phoenix.utils,
            o = document.querySelector(".echart-basic-bar-chart-example"),
            e = fChartLabel,
            a = fChartValue;
        if (o) {
            const i = t(o, "echarts"),
                s = window.echarts.init(o); echartSetOption(s, i, (() => ({
                    tooltip: { trigger: "axis", padding: [7, 10], backgroundColor: r("gray-100"), borderColor: r("gray-300"), textStyle: { color: r("dark") }, borderWidth: 1, formatter: r => tooltipFormatter(r), transitionDuration: 0, axisPointer: { type: "none" } },
                    xAxis: { type: "category", data: e, axisLine: { lineStyle: { color: r("gray-300"), type: "solid" } }, axisTick: { show: !0 }, axisLabel: { color: r("gray-400"), formatter: r => r, margin: 15 }, splitLine: { show: !1 } },
                    yAxis: { type: "value", boundaryGap: !0, axisLabel: { show: !1, color: r("gray-400"), margin: 15 }, splitLine: { show: !0, lineStyle: { color: r("gray-200") } }, axisTick: { show: !1 }, axisLine: { show: !1 } },
                    series: [{
                        type: "bar",
                        name: "value",
                        data: [
                            {
                                value: a[0],
                                itemStyle: {
                                    color: r("success-300")
                                }
                            }, {
                                value: a[1],
                                itemStyle: {
                                    color: r("danger-300")
                                }
                            }],
                        lineStyle: { color: r("primary") },
                        itemStyle: {
                            color: r("primary"),
                        }, showSymbol: !1,
                        symbol: "circle", smooth: !1, hoverAnimation: !0
                    }],
                    grid: { right: "3%", left: "10%", bottom: "10%", top: "5%" }
                })));
        }
    };

    const stackedBarChartInit = () => {
        const { getColor: a, getData: t, rgbaColor: r } = window.phoenix.utils,
            e = document.querySelector(".echart-stacked-bar-chart-example"),
            o = [100],
            i = [200],
            s = [300],
            n = [100],
            l = [500];
        const d = { itemStyle: { shadowBlur: 10, shadowColor: r(a("dark"), .3) } };
        if (e) {
            const r = t(e, "echarts"),
                c = window.echarts.init(e);
            echartSetOption(c, r, (() => ({
                color: [a("success-300"), a("danger-300")],
                legend: { data: ["CE OI", "PE OI", "Bar3", "Bar4"], textStyle: { color: a("gray-700") }, left: 0 },
                toolbox: { feature: { magicType: { type: ["stack", "tiled"] } }, iconStyle: { borderColor: a("gray-700"), borderWidth: 1 } },
                tooltip: { trigger: "item", padding: [7, 10], backgroundColor: a("gray-100"), borderColor: a("gray-300"), borderWidth: 1, transitionDuration: 0, axisPointer: { type: "none" } },
                xAxis: { data: o, splitLine: { show: !1 }, splitArea: { show: !1 }, axisLabel: { color: a("gray-600") }, axisLine: { lineStyle: { color: a("gray-400") } } },
                yAxis: { splitLine: { lineStyle: { color: a("gray-200") } }, axisLabel: { color: a("gray-600") } },
                series: [
                    { name: "Bar1", type: "bar", stack: "one", emphasis: d, data: i },
                    { name: "Bar2", type: "bar", stack: "one", emphasis: d, data: s },
                ],
                grid: { top: "10%", bottom: 10, left: 5, right: 7, containLabel: !0 }
            })));
        }
    };

    const lineLogChartInit = () => {
        const { getColor: e, getData: o } = window.phoenix.utils,
            t = document.querySelector(".echart-line-log-chart-example");
        if (t) {
            const r = o(t, "echarts"),
                i = window.echarts.init(t);
            echartSetOption(i, r, (() => ({
                tooltip: { trigger: "axis", padding: [7, 10], backgroundColor: e("gray-100"), borderColor: e("gray-300"), borderWidth: 1, transitionDuration: 0, axisPointer: { type: "none" }, formatter: e => tooltipFormatter(e) }, 
                xAxis: { type: "category", axisLine: { lineStyle: { color: e("gray-300") } }, axisLabel: { color: e("gray-600") }, splitLine: { show: !1 }, data: Array.from(Array(10).keys()).map((e => e + 1)) }, 
                yAxis: { type: "log", axisLabel: { color: e("gray-600") }, splitLine: { lineStyle: { color: e("gray-200") } } }, series: [{ name: "Index Of 3", type: "line", data: [1, 3, 9, 27, 81, 247, 741, 2223, 6669], symbolSize: 7, itemStyle: { color: e("white"), borderColor: e("danger"), borderWidth: 2 }, lineStyle: { color: e("danger") }, symbol: "circle" }, { name: "Index of 2", type: "line", data: [1, 2, 4, 8, 16, 32, 64, 128, 256], symbolSize: 7, itemStyle: { color: e("white"), borderColor: e("success"), borderWidth: 2 }, lineStyle: { color: e("success") }, symbol: "circle" }, { name: "Index of 1/2", type: "line", data: [.5, 1 / 4, 1 / 8, 1 / 16, 1 / 32, 1 / 64, 1 / 128, 1 / 256, 1 / 512], symbolSize: 7, itemStyle: { color: e("white"), borderColor: e("info"), borderWidth: 2 }, lineStyle: { color: e("info") }, symbol: "circle" }], grid: { right: 10, left: 5, bottom: 5, top: 10, containLabel: !0 }
            })));
        }
    };


    const { docReady: docReady } = window.phoenix.utils;
    docReady(issuesDiscoveredChartInit),
        docReady(basicBarChartInit),
        docReady(stackedBarChartInit),
        docReady(stackedLineChartInit);

}));