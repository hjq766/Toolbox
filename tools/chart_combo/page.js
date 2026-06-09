/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { createChart, setupChartSize, setupExportPanel } from '../_shared/chart-core.js';
import { createDataEditor } from '../_shared/chart-data.js';
import { setupChartColors } from '../_shared/chart-colors.js';

mountToolHeader();

/* ========== 1. 常量 ========== */
const DEFAULT_DATA = [
  ['', '1月', '2月', '3月', '4月', '5月', '6月'],
  ['销售额', 820, 932, 901, 934, 1290, 1330],
  ['同比增长', 12, 15, 8, 22, 18, 25],
];

/* ========== 2. 状态 ========== */
/** @type {{ type: 'bar'|'line', axis: 'left'|'right' }[]} */
let seriesMeta   = [
  { type: 'bar', axis: 'left' },
  { type: 'line', axis: 'right' },
];
let dualAxis     = true;
let leftAxisName = '销售额（万元）';
let rightAxisName = '同比增长（%）';
let smooth       = false;
let showLegend   = true;
let showLabel    = false;
let legendPos    = 'center';
let barRadius    = 4;
let lineWidth    = 2;

/* ========== 3. DOM 引用 ========== */
const chartDom      = $('#chart');
const seriesListEl  = $('[data-series-list]');
const legendCheck   = $('[data-opt="legend"]');
const labelCheck    = $('[data-opt="label"]');
const dualAxisCheck = $('[data-opt="dual-axis"]');
const axisNamesEl   = $('[data-axis-names]');
const axisLeftEl    = $('[data-opt="axis-left"]');
const axisRightEl   = $('[data-opt="axis-right"]');
const radiusRange   = $('[data-opt="radius"]');
const radiusVal     = $('[data-val-radius]');
const lwRange       = $('[data-opt="line-width"]');
const lwVal         = $('[data-val-line-width]');
const customArea    = $('[data-custom-colors]');
const pickersRow    = $('[data-color-pickers]');
const gradPreview   = $('[data-grad-preview]');

/* ========== 4. 图表实例 ========== */
const chart = createChart(chartDom);

/* ========== 5. 系列元数据 ========== */
function syncSeriesMeta(count) {
  while (seriesMeta.length < count) {
    const i = seriesMeta.length;
    seriesMeta.push({
      type: i === 0 ? 'bar' : 'line',
      axis: i === 0 ? 'left' : 'right',
    });
  }
  seriesMeta = seriesMeta.slice(0, count);
}

function defaultAxisFor(type) {
  return type === 'line' ? 'right' : 'left';
}

function renderSeriesList() {
  const data = editor.getData();
  const count = data.length - 1;
  syncSeriesMeta(count);
  seriesListEl.innerHTML = '';

  for (let i = 0; i < count; i++) {
    const meta = seriesMeta[i];
    const name = String(data[i + 1]?.[0] || `系列${i + 1}`);
    const row = document.createElement('div');
    row.className = 'u-col u-gap-2';
    row.style.cssText = 'padding:var(--space-2);border:1px solid var(--border-subtle);border-radius:var(--radius-sm)';

    const head = document.createElement('div');
    head.className = 'u-strong';
    head.style.fontSize = 'var(--text-sm)';
    head.textContent = name;

    const typeRow = document.createElement('div');
    typeRow.className = 'co-row';
    typeRow.innerHTML = `
      <span class="co-label">类型</span>
      <div class="co-seg" data-series-type="${i}">
        <button type="button" class="${meta.type === 'bar' ? 'active' : ''}" data-val="bar">柱状</button>
        <button type="button" class="${meta.type === 'line' ? 'active' : ''}" data-val="line">折线</button>
      </div>
    `;

    const axisRow = document.createElement('div');
    axisRow.className = 'co-row';
    axisRow.dataset.seriesAxis = String(i);
    axisRow.hidden = !dualAxis;
    axisRow.innerHTML = `
      <span class="co-label">坐标轴</span>
      <div class="co-seg" data-series-axis="${i}">
        <button type="button" class="${meta.axis === 'left' ? 'active' : ''}" data-val="left">左轴</button>
        <button type="button" class="${meta.axis === 'right' ? 'active' : ''}" data-val="right">右轴</button>
      </div>
    `;

    row.append(head, typeRow, axisRow);
    seriesListEl.appendChild(row);
  }
}

/* ========== 6. 数据编辑器 ========== */
const editor = createDataEditor($('[data-editor]'), {
  data: DEFAULT_DATA,
  onChange: () => {
    renderSeriesList();
    chartColors.syncForDataChange();
    updateChart();
  },
});

/* ========== 8. 数据 → ECharts option ========== */
function buildOption(data) {
  const colors = chartColors.getColors();
  const axisPointerColor = getComputedStyle(document.documentElement)
    .getPropertyValue('--fg-muted').trim() || '#999';
  const categories = data[0].slice(1);
  const count = data.length - 1;
  syncSeriesMeta(count);

  const useDual = dualAxis && seriesMeta.some(m => m.axis === 'right');

  const series = data.slice(1).map((row, i) => {
    const meta = seriesMeta[i];
    const vals = row.slice(1).map(v => Number(v) || 0);
    const yAxisIndex = useDual ? (meta.axis === 'right' ? 1 : 0) : 0;

    if (meta.type === 'bar') {
      return {
        name: String(row[0]),
        type: 'bar',
        yAxisIndex,
        data: vals,
        barMaxWidth: 48,
        label: { show: showLabel, position: 'top', fontSize: 11 },
        itemStyle: { borderRadius: [barRadius, barRadius, 0, 0] },
      };
    }
    return {
      name: String(row[0]),
      type: 'line',
      yAxisIndex,
      data: vals,
      smooth,
      showSymbol: true,
      symbolSize: 6,
      lineStyle: { width: lineWidth },
      label: { show: showLabel, position: 'top', fontSize: 11 },
    };
  });

  const isBottom = legendPos === 'bottom';
  let legend;
  if (showLegend) {
    legend = {
      data: series.map(s => s.name),
      ...(isBottom
        ? { bottom: 0, left: 'center' }
        : { top: 8, left: legendPos }),
    };
  }

  const topOffset = 10 + (showLegend && !isBottom ? 32 : 0);
  const bottomOffset = (showLegend && isBottom ? 36 : 12) + (useDual ? 4 : 0);

  const yAxis = useDual
    ? [
        {
          type: 'value',
          name: leftAxisName,
          nameTextStyle: { fontSize: 11, padding: [0, 0, 0, 4] },
          axisLabel: { fontSize: 11 },
          splitLine: { lineStyle: { type: 'dashed' } },
        },
        {
          type: 'value',
          name: rightAxisName,
          position: 'right',
          nameTextStyle: { fontSize: 11, padding: [0, 4, 0, 0] },
          axisLabel: { fontSize: 11 },
          splitLine: { show: false },
        },
      ]
    : [{
        type: 'value',
        axisLabel: { fontSize: 11 },
        splitLine: { lineStyle: { type: 'dashed' } },
      }];

  return {
    color: colors,
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross', crossStyle: { color: axisPointerColor } },
    },
    legend,
    grid: {
      left: '3%',
      right: useDual ? '6%' : '4%',
      top: topOffset,
      bottom: bottomOffset,
      containLabel: true,
    },
    xAxis: {
      type: 'category',
      data: categories,
      axisPointer: { type: 'shadow' },
      axisLabel: { fontSize: 11 },
    },
    yAxis,
    series,
  };
}

function updateChart() {
  chart.setOption(buildOption(editor.getData()), true);
}

function syncAxisNamesPanel() {
  const show = dualAxis;
  axisNamesEl.hidden = !show;
  seriesListEl.querySelectorAll('[data-series-axis]').forEach(el => { el.hidden = !show; });
}

/* ========== 9. 尺寸 ========== */
const chartSize = setupChartSize(chartDom, $('[data-opt="width"]'), $('[data-opt="height"]'));

/* ========== 10. 手风琴 ========== */
document.querySelectorAll('.cs-header').forEach(header => {
  header.addEventListener('click', () => {
    header.closest('.cs-section').classList.toggle('is-open');
  });
});

/* ========== 11. 系列设置事件 ========== */
on(seriesListEl, 'click', e => {
  const typeBtn = e.target.closest('[data-series-type] [data-val]');
  if (typeBtn) {
    const wrap = typeBtn.closest('[data-series-type]');
    const i = +wrap.dataset.seriesType;
    seriesMeta[i].type = typeBtn.dataset.val;
    if (dualAxis) seriesMeta[i].axis = defaultAxisFor(seriesMeta[i].type);
    renderSeriesList();
    updateChart();
    return;
  }
  const axisBtn = e.target.closest('[data-series-axis] [data-val]');
  if (axisBtn) {
    const wrap = axisBtn.closest('[data-series-axis]');
    const i = +wrap.dataset.seriesAxis;
    seriesMeta[i].axis = axisBtn.dataset.val;
    wrap.querySelectorAll('button').forEach(b => b.classList.toggle('active', b === axisBtn));
    updateChart();
  }
});

/* ========== 12. 配色方案 ========== */
const chartColors = setupChartColors({
  editor,
  paletteGrid: $('[data-palette]'),
  customArea,
  colorModeEl: $('[data-color-mode]'),
  pickersRow,
  gradPreview,
  gradStartEl: $('[data-grad-start]'),
  gradEndEl: $('[data-grad-end]'),
  onChange: updateChart,
});

/* ========== 13. 样式控件 ========== */
function bindSeg(selector, cb) {
  on($(selector), 'click', e => {
    const btn = e.target.closest('[data-val]');
    if (!btn) return;
    $(selector).querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    cb(btn.dataset.val);
  });
}

bindSeg('[data-smooth]', v => { smooth = v === 'on'; updateChart(); });
bindSeg('[data-legend-pos]', v => { legendPos = v; updateChart(); });

const legendSeg = $('[data-legend-pos]');
function syncLegendSeg() { legendSeg.classList.toggle('is-disabled', !showLegend); }
on(legendCheck, 'change', () => { showLegend = legendCheck.checked; syncLegendSeg(); updateChart(); });
syncLegendSeg();

on(labelCheck, 'change', () => { showLabel = labelCheck.checked; updateChart(); });

on(dualAxisCheck, 'change', () => {
  dualAxis = dualAxisCheck.checked;
  syncAxisNamesPanel();
  updateChart();
});

on(axisLeftEl, 'input', () => { leftAxisName = axisLeftEl.value; updateChart(); });
on(axisRightEl, 'input', () => { rightAxisName = axisRightEl.value; updateChart(); });

on(radiusRange, 'input', () => {
  barRadius = +radiusRange.value;
  radiusVal.textContent = barRadius;
  updateChart();
});

on(lwRange, 'input', () => {
  lineWidth = +lwRange.value;
  lwVal.textContent = lineWidth;
  updateChart();
});

/* ========== 14. 导出 ========== */
setupExportPanel(chart, '折柱组合图.png', chartSize);

/* ========== 15. 初始渲染 ========== */
renderSeriesList();
syncAxisNamesPanel();
updateChart();
