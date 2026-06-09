/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { createChart, exportPNG, exportSVG, getPalette, getPaletteNames, PALETTES, interpolateColors, setupChartSize, setupExportPanel } from '../_shared/chart-core.js';
import { createDataEditor } from '../_shared/chart-data.js';

mountToolHeader();

/* ========== 1. 常量 ========== */
const DEFAULT_DATA = [
  ['', '一月', '二月', '三月', '四月', '五月'],
  ['系列1', 150, 230, 224, 218, 135],
  ['系列2', 320, 132, 301, 334, 190],
];

/* ========== 2. 状态 ========== */
let palette    = 'default';
let useCustom  = false;
let colorMode  = 'pick';        // 'pick' | 'gradient'
let customColors = [];
let gradStart  = '#165DFF';
let gradEnd    = '#00B42A';
let direction  = 'v';
let stacked    = false;
let showLegend = true;
let showLabel  = false;
let barRadius  = 4;
let legendPos  = 'center';
/* ========== 3. DOM 引用 ========== */
const chartDom      = $('#chart');
const legendCheck   = $('[data-opt="legend"]');
const labelCheck    = $('[data-opt="label"]');
const radiusRange   = $('[data-opt="radius"]');
const radiusVal     = $('[data-val-radius]');
const customArea    = $('[data-custom-colors]');
const pickersRow    = $('[data-color-pickers]');
const gradPreview   = $('[data-grad-preview]');
const gradStartEl   = $('[data-grad-start]');
const gradEndEl     = $('[data-grad-end]');

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

/* ========== 6. 颜色解析 ========== */
function getColors() {
  if (!useCustom) return getPalette(palette);
  return customColors.length ? [...customColors] : getPalette('default');
}

/* ========== 7. 数据 → ECharts option ========== */
function buildOption(data) {
  const colors     = getColors();
  const categories = data[0].slice(1);
  const isH        = direction === 'h';

  const series = data.slice(1).map(row => ({
    name: String(row[0]),
    type: 'bar',
    data: row.slice(1).map(v => Number(v) || 0),
    stack: stacked ? 'total' : undefined,
    label: {
      show: showLabel,
      position: isH ? 'right' : 'top',
      fontSize: 11,
    },
    itemStyle: {
      borderRadius: isH
        ? [0, barRadius, barRadius, 0]
        : [barRadius, barRadius, 0, 0],
    },
  }));

  const catAxis = { type: 'category', data: categories, axisTick: { alignWithLabel: true } };
  const valAxis = { type: 'value' };

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
    tooltip: { trigger: 'axis', axisPointer: { type: 'shadow' } },
    legend,
    grid: {
      left: '3%', right: '4%',
      top: topOffset,
      bottom: bottomOffset,
      containLabel: true,
    },
    xAxis: isH ? valAxis : catAxis,
    yAxis: isH ? catAxis : valAxis,
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

// "自定义" 按钮
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

// 逐个 / 渐变 切换
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

// 逐个配色
function syncColorPickers() {
  const data  = editor.getData();
  const count = data.length - 1;
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
    label.textContent = data[i + 1]?.[0] || `${i + 1}`;
    const idx = i;
    input.addEventListener('input', () => { customColors[idx] = input.value; updateChart(); });
    wrap.append(input, label);
    pickersRow.appendChild(wrap);
  }
  customColors = customColors.slice(0, count);
}

// 渐变生成
function applyGradient() {
  const count = editor.getData().length - 1;
  customColors = interpolateColors(gradStart, gradEnd, count);
  gradPreview.style.background = `linear-gradient(to right, ${gradStart}, ${gradEnd})`;
  updateChart();
}

function updateGradPreview() {
  gradPreview.style.background = `linear-gradient(to right, ${gradStart}, ${gradEnd})`;
}

on(gradStartEl, 'input', () => { gradStart = gradStartEl.value; applyGradient(); });
on(gradEndEl,   'input', () => { gradEnd   = gradEndEl.value;   applyGradient(); });
updateGradPreview();

/* ========== 12. 样式控件 ========== */

// 通用 segmented control 点击
function bindSeg(selector, cb) {
  on($(selector), 'click', e => {
    const btn = e.target.closest('[data-val]');
    if (!btn) return;
    $(selector).querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    cb(btn.dataset.val);
  });
}

bindSeg('[data-direction]', v => { direction = v; updateChart(); });
bindSeg('[data-stack]',     v => { stacked = v === 'on'; updateChart(); });
bindSeg('[data-legend-pos]', v => { legendPos = v; updateChart(); });

// 图例 toggle + 联动禁用位置
const legendSeg = $('[data-legend-pos]');
function syncLegendSeg() {
  legendSeg.classList.toggle('is-disabled', !showLegend);
}
on(legendCheck, 'change', () => { showLegend = legendCheck.checked; syncLegendSeg(); updateChart(); });
syncLegendSeg();

// 数据标签
on(labelCheck, 'change', () => { showLabel = labelCheck.checked; updateChart(); });

// 圆角
on(radiusRange, 'input', () => {
  barRadius = +radiusRange.value;
  radiusVal.textContent = barRadius;
  updateChart();
});

/* ========== 13. 导出 ========== */
setupExportPanel(chart, '柱状图.png', chartSize);

/* ========== 14. 初始渲染 ========== */
updateChart();
