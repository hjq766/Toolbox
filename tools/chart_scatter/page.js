/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { createChart, exportPNG, exportSVG, getPalette, getPaletteNames, PALETTES, interpolateColors, setupChartSize, setupExportPanel } from '../_shared/chart-core.js';
import { createDataEditor } from '../_shared/chart-data.js';

mountToolHeader();

/* ========== 1. 常量 ========== */
const DEFAULT_DATA = [
  ['x', '系列1', '系列2'],
  [10, 8.0, 9.1],
  [20, 6.9, 8.1],
  [30, 7.6, 8.7],
  [40, 8.8, 8.8],
  [50, 8.3, 9.3],
  [60, 10.0, 8.1],
  [70, 7.2, 6.1],
  [80, 4.3, 3.1],
  [90, 10.8, 9.1],
  [100, 4.8, 7.3],
];

/* ========== 2. 状态 ========== */
let palette     = 'default';
let useCustom   = false;
let colorMode   = 'pick';
let customColors = [];
let gradStart   = '#165DFF';
let gradEnd     = '#00B42A';
let symbolType  = 'circle';
let symbolSize  = 10;
let showLegend  = true;
let showLabel   = false;
let legendPos   = 'center';
/* ========== 3. DOM 引用 ========== */
const chartDom    = $('#chart');
const legendCheck = $('[data-opt="legend"]');
const labelCheck  = $('[data-opt="label"]');
const sizeRange   = $('[data-opt="symbolSize"]');
const sizeVal     = $('[data-val-symbolSize]');
const customArea  = $('[data-custom-colors]');
const pickersRow  = $('[data-color-pickers]');
const gradPreview = $('[data-grad-preview]');
const gradStartEl = $('[data-grad-start]');
const gradEndEl   = $('[data-grad-end]');

/* ========== 4. 图表实例 ========== */
const chart = createChart(chartDom);

/* ========== 5. 数据编辑器 ========== */
const editor = createDataEditor($('[data-editor]'), {
  data: DEFAULT_DATA,
  onChange: () => {
    if (useCustom && colorMode === 'pick') syncColorPickers();
    if (useCustom && colorMode === 'gradient') applyGradient();
    updateChart();
  },
});

/* ========== 6. 颜色工具 ========== */
function getColors() {
  if (!useCustom) return getPalette(palette);
  return customColors.length ? [...customColors] : getPalette('default');
}

/* ========== 7. 数据 → ECharts option ========== */
function buildOption(data) {
  const colors = getColors();
  const xValues = data.slice(1).map(row => Number(row[0]) || 0);

  const series = data[0].slice(1).map((name, si) => ({
    name: String(name),
    type: 'scatter',
    data: data.slice(1).map(row => [Number(row[0]) || 0, Number(row[si + 1]) || 0]),
    symbolSize,
    symbol: symbolType,
    label: {
      show: showLabel,
      position: 'top',
      fontSize: 11,
      formatter: p => p.value[1],
    },
  }));

  const isBottom = legendPos === 'bottom';
  let legend = undefined;
  if (showLegend) {
    legend = {
      data: series.map(s => s.name),
      ...(isBottom
        ? { bottom: 0, left: 'center' }
        : { top: 8, left: legendPos }),
    };
  }

  const topOffset = 10 + (showLegend && !isBottom ? 28 : 0);
  const bottomOffset = showLegend && isBottom ? 36 : 12;

  return {
    color: colors,
    tooltip: {
      trigger: 'item',
      formatter: p => `${p.seriesName}<br/>x: ${p.value[0]}, y: ${p.value[1]}`,
    },
    legend,
    grid: {
      left: '3%', right: '4%',
      top: topOffset,
      bottom: bottomOffset,
      containLabel: true,
    },
    xAxis: { type: 'value', scale: true },
    yAxis: { type: 'value', scale: true },
    series,
  };
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

/* ========== 10. 配色方案 ========== */
const paletteGrid = $('[data-palette]');

getPaletteNames().forEach(name => {
  const colors = PALETTES[name];
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = `palette-item${name === palette ? ' active' : ''}`;
  btn.dataset.pal = name;
  btn.innerHTML = colors.slice(0, 5).map(c =>
    `<span style="background:${c}"></span>`
  ).join('');
  paletteGrid.appendChild(btn);
});

const customPalBtn = document.createElement('button');
customPalBtn.type = 'button';
customPalBtn.className = 'palette-item';
customPalBtn.dataset.pal = '_custom';
customPalBtn.innerHTML = '<span style="flex:1;height:14px;border-radius:2px;background:conic-gradient(#e74c3c,#f1c40f,#2ecc71,#3498db,#9b59b6,#e74c3c)"></span>';
customPalBtn.title = '自定义配色';
paletteGrid.appendChild(customPalBtn);

on(paletteGrid, 'click', e => {
  const btn = e.target.closest('[data-pal]');
  if (!btn) return;
  paletteGrid.querySelectorAll('.palette-item').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  if (btn.dataset.pal === '_custom') {
    useCustom = true;
    customArea.hidden = false;
    if (colorMode === 'pick') syncColorPickers();
    else applyGradient();
  } else {
    useCustom = false;
    palette = btn.dataset.pal;
    customArea.hidden = true;
  }
  updateChart();
});

/* ========== 11. 自定义配色 ========== */
on($('[data-color-mode]'), 'click', e => {
  const btn = e.target.closest('[data-val]');
  if (!btn) return;
  $('[data-color-mode]').querySelectorAll('.btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  colorMode = btn.dataset.val;
  $('[data-mode-pick]').hidden    = colorMode !== 'pick';
  $('[data-mode-gradient]').hidden = colorMode !== 'gradient';
  if (colorMode === 'pick') syncColorPickers();
  else applyGradient();
  updateChart();
});

function syncColorPickers() {
  const data  = editor.getData();
  const count = data[0].length - 1;
  const fallback = getPalette(palette);
  pickersRow.innerHTML = '';
  for (let i = 0; i < count; i++) {
    if (!customColors[i]) customColors[i] = fallback[i % fallback.length];
    const wrap  = document.createElement('div');
    wrap.className = 'color-picker-item';
    const input = document.createElement('input');
    input.type  = 'color';
    input.value = customColors[i];
    const label = document.createElement('span');
    label.textContent = data[0][i + 1] || `${i + 1}`;
    const idx = i;
    input.addEventListener('input', () => { customColors[idx] = input.value; updateChart(); });
    wrap.append(input, label);
    pickersRow.appendChild(wrap);
  }
  customColors = customColors.slice(0, count);
}

function applyGradient() {
  const count = editor.getData()[0].length - 1;
  customColors = interpolateColors(gradStart, gradEnd, count);
  gradPreview.style.background = `linear-gradient(to right, ${gradStart}, ${gradEnd})`;
  updateChart();
}

on(gradStartEl, 'input', () => { gradStart = gradStartEl.value; applyGradient(); });
on(gradEndEl,   'input', () => { gradEnd   = gradEndEl.value;   applyGradient(); });
gradPreview.style.background = `linear-gradient(to right, ${gradStart}, ${gradEnd})`;

/* ========== 12. 样式控件 ========== */

function bindSeg(selector, cb) {
  on($(selector), 'click', e => {
    const btn = e.target.closest('[data-val]');
    if (!btn) return;
    $(selector).querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    cb(btn.dataset.val);
  });
}

bindSeg('[data-symbol-type]', v => { symbolType = v; updateChart(); });
bindSeg('[data-legend-pos]',  v => { legendPos = v; updateChart(); });

const legendSeg = $('[data-legend-pos]');
function syncLegendSeg() { legendSeg.classList.toggle('is-disabled', !showLegend); }
on(legendCheck, 'change', () => { showLegend = legendCheck.checked; syncLegendSeg(); updateChart(); });
syncLegendSeg();

on(labelCheck, 'change', () => { showLabel = labelCheck.checked; updateChart(); });

// 点大小
on(sizeRange, 'input', () => {
  symbolSize = +sizeRange.value;
  sizeVal.textContent = symbolSize;
  updateChart();
});

/* ========== 13. 导出 ========== */
setupExportPanel(chart, '散点图.png', chartSize);

/* ========== 14. 初始渲染 ========== */
updateChart();
