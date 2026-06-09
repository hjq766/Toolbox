/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on, escapeHtml } from '../../public/scripts/utils/dom.js';
import { createChart, setupChartSize, setupExportPanel } from '../_shared/chart-core.js';
import { createDataEditor } from '../_shared/chart-data.js';

mountToolHeader();

/* ========== 1. 常量 ========== */
const DEFAULT_DATA = [
  ['',      '周一', '周二', '周三', '周四', '周五', '周六', '周日'],
  ['00-06', 10, 5,  8,  3,  2,  15, 18],
  ['06-12', 45, 50, 48, 52, 47, 30, 25],
  ['12-18', 65, 70, 68, 72, 67, 55, 45],
  ['18-24', 80, 75, 85, 70, 90, 95, 88],
];

/* ========== 2. 状态 ========== */
let colorLow   = '#d4e8ff';
let colorHigh  = '#165DFF';
let showLabel  = false;
let showVMap   = true;
let rangeMode  = 'auto';   // 'auto' | 'manual'
let vMin       = 0;
let vMax       = 100;

/* ========== 3. DOM 引用 ========== */
const chartDom     = $('#chart');
const colorLowEl   = $('[data-opt="color-low"]');
const colorHighEl  = $('[data-opt="color-high"]');
const gradPreview  = $('[data-grad-preview]');
const labelCheck   = $('[data-opt="label"]');
const vmapCheck    = $('[data-opt="visualmap"]');
const rangeManual  = $('[data-range-manual]');
const vMinEl       = $('[data-opt="vmin"]');
const vMaxEl       = $('[data-opt="vmax"]');

/* ========== 4. 图表实例 ========== */
const chart = createChart(chartDom);

/* ========== 5. 数据编辑器 ========== */
const editor = createDataEditor($('[data-editor]'), {
  data: DEFAULT_DATA,
  onChange: () => updateChart(),
});

/* ========== 6. 数据 → ECharts option ========== */
function buildOption(data) {
  const xCats = data[0].slice(1);
  // y 轴从下往上，让表格第一行对应图表底部，视觉更自然
  const yCats = data.slice(1).map(r => String(r[0])).reverse();

  /* 将 2D 数组展平为 [x, y, value] 格式 */
  const flatData = [];
  let autoMin = Infinity, autoMax = -Infinity;
  for (let r = 1; r < data.length; r++) {
    for (let c = 1; c < data[r].length; c++) {
      const v = Number(data[r][c]) || 0;
      const x = c - 1;
      // y 轴反转：第一数据行映射到索引最大值
      const y = data.length - 1 - r;
      flatData.push([x, y, v]);
      if (v < autoMin) autoMin = v;
      if (v > autoMax) autoMax = v;
    }
  }

  let minVal = rangeMode === 'manual' ? Math.min(vMin, vMax) : autoMin;
  let maxVal = rangeMode === 'manual' ? Math.max(vMin, vMax) : autoMax;
  if (!Number.isFinite(minVal) || !Number.isFinite(maxVal)) [minVal, maxVal] = [0, 1];
  if (minVal === maxVal) maxVal = minVal + 1;

  const visualMap = showVMap
    ? {
        min: minVal, max: maxVal,
        calculable: true,
        orient: 'horizontal',
        left: 'center',
        bottom: 0,
        inRange: { color: [colorLow, colorHigh] },
        textStyle: { fontSize: 11 },
      }
    : {
        min: minVal, max: maxVal,
        show: false,
        inRange: { color: [colorLow, colorHigh] },
      };

  return {
    tooltip: {
      position: 'top',
      formatter: p => {
        const rowName = yCats[p.value[1]];
        const colName = xCats[p.value[0]];
        return `${escapeHtml(rowName)} / ${escapeHtml(colName)}：<b>${p.value[2]}</b>`;
      },
    },
    grid: {
      left: '3%', right: '4%',
      top: 10,
      bottom: showVMap ? 56 : 12,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: xCats,
      position: 'top',
      splitArea: { show: true },
      axisLabel: { fontSize: 12 },
    },
    yAxis: {
      type: 'category',
      data: yCats,
      splitArea: { show: true },
      axisLabel: { fontSize: 12 },
    },
    visualMap,
    series: [{
      name: '热力值',
      type: 'heatmap',
      data: flatData,
      label: {
        show: showLabel,
        fontSize: 11,
        color: 'inherit',
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0, 0, 0, .3)',
        },
      },
    }],
  };
}

function updateChart() {
  chart.setOption(buildOption(editor.getData()), true);
}

/* ========== 7. 尺寸控制 ========== */
const chartSize = setupChartSize(chartDom, $('[data-opt="width"]'), $('[data-opt="height"]'));

/* ========== 8. 手风琴折叠 ========== */
document.querySelectorAll('.cs-header').forEach(h => {
  h.addEventListener('click', () => h.closest('.cs-section').classList.toggle('is-open'));
});

/* ========== 9. 颜色控件 ========== */
function syncGradPreview() {
  gradPreview.style.background = `linear-gradient(to right, ${colorLow}, ${colorHigh})`;
}

on(colorLowEl,  'input', () => { colorLow  = colorLowEl.value;  syncGradPreview(); updateChart(); });
on(colorHighEl, 'input', () => { colorHigh = colorHighEl.value; syncGradPreview(); updateChart(); });
syncGradPreview();

/* ========== 10. 数值范围模式 ========== */
function bindSeg(selector, cb) {
  on($(selector), 'click', e => {
    const btn = e.target.closest('[data-val]');
    if (!btn) return;
    $(selector).querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    cb(btn.dataset.val);
  });
}

bindSeg('[data-range-mode]', v => {
  rangeMode = v;
  rangeManual.hidden = v === 'auto';
  updateChart();
});

on(vMinEl, 'input', () => { vMin = +vMinEl.value; updateChart(); });
on(vMaxEl, 'input', () => { vMax = +vMaxEl.value; updateChart(); });

/* ========== 11. 标签 / 色阶图例 ========== */
on(labelCheck, 'change', () => { showLabel = labelCheck.checked; updateChart(); });
on(vmapCheck,  'change', () => { showVMap  = vmapCheck.checked;  updateChart(); });

/* ========== 12. 导出 ========== */
setupExportPanel(chart, '热力图.png', chartSize);

/* ========== 13. 初始渲染 ========== */
updateChart();
