/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { createChart, exportPNG, exportSVG, setupChartSize, setupExportPanel } from '../_shared/chart-core.js';
import { createDataEditor } from '../_shared/chart-data.js';

mountToolHeader();

/* ========== 1. 常量 ========== */
const DEFAULT_DATA = [
  ['指标', '值'],
  ['完成率', 72],
];

/* ========== 2. 状态 ========== */
let gaugeStyle  = 'default';   // 'default' | 'progress' | 'grade'
let gaugeMin    = 0;
let gaugeMax    = 100;
let showSplit   = true;
let showTick    = true;
/* ========== 3. DOM 引用 ========== */
const chartDom      = $('#chart');
const minInput      = $('[data-opt="min"]');
const maxInput      = $('[data-opt="max"]');
const splitCheck    = $('[data-opt="splitLine"]');
const tickCheck     = $('[data-opt="axisTick"]');

/* ========== 4. 图表实例 ========== */
const chart = createChart(chartDom);

/* ========== 5. 数据编辑器 ========== */
const editor = createDataEditor($('[data-editor]'), {
  data: DEFAULT_DATA,
  onChange: () => updateChart(),
});

/* ========== 6. 颜色常量 ========== */
const GRADE_COLORS = [
  [0.3, '#00B42A'],
  [0.7, '#F7BA1E'],
  [1,   '#F53F3F'],
];

/* ========== 7. 数据 → ECharts option ========== */
function buildOption(data) {
  const items = data.slice(1).map(row => ({
    name: String(row[0]),
    value: Number(row[1]) || 0,
  }));

  const count = items.length;

  if (gaugeStyle === 'progress') {
    return buildProgressGauge(items, count);
  }

  // 经典 / 分段
  const seriesData = items.map((item, i) => {
    const angle = count > 1
      ? { title: { offsetCenter: [`${(i - (count - 1) / 2) * 40}%`, '70%'] },
          detail: { offsetCenter: [`${(i - (count - 1) / 2) * 40}%`, '85%'] } }
      : {};
    return { ...item, ...angle };
  });

  return {
    series: [{
      type: 'gauge',
      min: gaugeMin,
      max: gaugeMax,
      startAngle: 225,
      endAngle: -45,
      pointer: { show: true, length: '60%', width: 6 },
      progress: { show: false },
      axisLine: {
        lineStyle: {
          width: 20,
          color: gaugeStyle === 'grade' ? GRADE_COLORS : [[1, '#165DFF']],
        },
      },
      axisTick: {
        show: showTick,
        distance: -30,
        length: 6,
        lineStyle: { color: '#999', width: 1 },
      },
      splitLine: {
        show: showSplit,
        distance: -30,
        length: 12,
        lineStyle: { color: '#999', width: 2 },
      },
      axisLabel: { distance: 38, fontSize: 11, color: '#666' },
      title: { fontSize: 14, color: '#333', offsetCenter: [0, '70%'] },
      detail: {
        fontSize: 28,
        fontWeight: 600,
        color: 'inherit',
        valueAnimation: true,
        offsetCenter: [0, '85%'],
        formatter: '{value}',
      },
      data: seriesData,
    }],
  };
}

function buildProgressGauge(items, count) {
  const series = items.map((item, i) => ({
    type: 'gauge',
    min: gaugeMin,
    max: gaugeMax,
    startAngle: 225,
    endAngle: -45,
    radius: `${85 - i * 18}%`,
    pointer: { show: false },
    progress: {
      show: true,
      width: 14,
      roundCap: true,
      itemStyle: {
        color: ['#165DFF', '#00B42A', '#F77234', '#722ED1', '#14C9C9'][i % 5],
      },
    },
    axisLine: {
      lineStyle: { width: 14, color: [[1, '#e8e8e8']] },
      roundCap: true,
    },
    axisTick: { show: false },
    splitLine: { show: false },
    axisLabel: { show: i === 0, distance: 28, fontSize: 11, color: '#666' },
    title: {
      fontSize: 12,
      color: '#666',
      offsetCenter: [0, `${-30 + i * 30}%`],
    },
    detail: {
      fontSize: count > 1 ? 18 : 28,
      fontWeight: 600,
      color: 'inherit',
      valueAnimation: true,
      offsetCenter: [0, `${-15 + i * 30}%`],
      formatter: '{value}',
    },
    data: [item],
  }));

  return { series };
}

function updateChart() {
  chart.setOption(buildOption(editor.getData()), true);
}

/* ========== 8. 尺寸控制（公共） ========== */
const chartSize = setupChartSize(chartDom, $('[data-opt="width"]'), $('[data-opt="height"]'));

/* ========== 9. 手风琴折叠 ========== */
document.querySelectorAll('.cs-header').forEach(header => {
  header.addEventListener('click', () => {
    header.closest('.cs-section').classList.toggle('is-open');
  });
});

/* ========== 10. 样式控件 ========== */

function bindSeg(selector, cb) {
  on($(selector), 'click', e => {
    const btn = e.target.closest('[data-val]');
    if (!btn) return;
    $(selector).querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    cb(btn.dataset.val);
  });
}

bindSeg('[data-style]', v => { gaugeStyle = v; updateChart(); });

// 范围
on(minInput, 'change', () => { gaugeMin = +minInput.value || 0; updateChart(); });
on(maxInput, 'change', () => { gaugeMax = +maxInput.value || 100; updateChart(); });

// 刻度线
on(splitCheck, 'change', () => { showSplit = splitCheck.checked; updateChart(); });

// 刻度标记
on(tickCheck, 'change', () => { showTick = tickCheck.checked; updateChart(); });

/* ========== 11. 导出 ========== */
setupExportPanel(chart, '仪表盘.png', chartSize);

/* ========== 12. 初始渲染 ========== */
updateChart();
