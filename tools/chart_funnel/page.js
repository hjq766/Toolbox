/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { createChart, exportPNG, exportSVG, getPalette, getPaletteNames, PALETTES, interpolateColors, setupChartSize, setupExportPanel } from '../_shared/chart-core.js';
import { createDataEditor } from '../_shared/chart-data.js';

mountToolHeader();

/* ========== 1. 常量 ========== */
const DEFAULT_DATA = [
  ['阶段', '值'],
  ['展示', 100],
  ['点击', 80],
  ['访问', 60],
  ['咨询', 40],
  ['订单', 20],
];

/* ========== 2. 状态 ========== */
let palette     = 'default';
let useCustom   = false;
let colorMode   = 'pick';
let customColors = [];
let gradStart   = '#165DFF';
let gradEnd     = '#00B42A';
let sortOrder   = 'descending';
let funnelAlign = 'center';
let labelPos    = 'left';
let showLegend  = true;
let legendPos   = 'center';
let gap         = 2;
/* ========== 3. DOM 引用 ========== */
const chartDom    = $('#chart');
const legendCheck = $('[data-opt="legend"]');
const gapRange    = $('[data-opt="gap"]');
const gapVal      = $('[data-val-gap]');
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
  const funnelData = data.slice(1).map(row => ({
    name: String(row[0]),
    value: Number(row[1]) || 0,
  }));

  const showLabels = labelPos !== 'none';

  const isBottom = legendPos === 'bottom';
  let legend = undefined;
  if (showLegend) {
    legend = {
      data: funnelData.map(d => d.name),
      ...(isBottom
        ? { bottom: 0, left: 'center' }
        : { top: 8, left: legendPos }),
    };
  }

  return {
    color: colors,
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}',
    },
    legend,
    series: [{
      type: 'funnel',
      left: '10%',
      top: showLegend && !isBottom ? 40 : 16,
      bottom: showLegend && isBottom ? 40 : 16,
      width: '80%',
      sort: sortOrder,
      funnelAlign,
      gap,
      data: funnelData,
      label: {
        show: showLabels,
        position: labelPos === 'inside' ? 'inside' : labelPos,
        formatter: '{b}\n{c}',
        fontSize: 12,
      },
      labelLine: {
        show: showLabels && labelPos !== 'inside',
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth: 1,
      },
      emphasis: {
        label: { fontSize: 14 },
      },
    }],
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

function applyGradient() {
  const count = editor.getData().length - 1;
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

bindSeg('[data-sort]',       v => { sortOrder = v; updateChart(); });
bindSeg('[data-align]',      v => { funnelAlign = v; updateChart(); });
bindSeg('[data-label-pos]',  v => { labelPos = v; updateChart(); });
bindSeg('[data-legend-pos]', v => { legendPos = v; updateChart(); });

const legendSeg = $('[data-legend-pos]');
function syncLegendSeg() { legendSeg.classList.toggle('is-disabled', !showLegend); }
on(legendCheck, 'change', () => { showLegend = legendCheck.checked; syncLegendSeg(); updateChart(); });
syncLegendSeg();

// 间距
on(gapRange, 'input', () => {
  gap = +gapRange.value;
  gapVal.textContent = gap;
  updateChart();
});

/* ========== 13. 导出 ========== */
setupExportPanel(chart, '漏斗图.png', chartSize);

/* ========== 14. 初始渲染 ========== */
updateChart();
