/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { createChart, exportPNG, exportSVG, getPalette, getPaletteNames, PALETTES, interpolateColors, setupChartSize, setupExportPanel } from '../_shared/chart-core.js';
import { createDataEditor } from '../_shared/chart-data.js';

mountToolHeader();

/* ========== 1. 常量 ========== */
const DEFAULT_DATA = [
  ['类别', '值'],
  ['电子产品', 500],
  ['服装', 380],
  ['食品饮料', 300],
  ['家居家具', 220],
  ['美妆个护', 180],
  ['运动户外', 150],
  ['图书文具', 120],
  ['其他', 90],
];

/* ========== 2. 状态 ========== */
let palette     = 'default';
let useCustom   = false;
let colorMode   = 'pick';
let customColors = [];
let gradStart   = '#165DFF';
let gradEnd     = '#00B42A';
let labelMode   = 'name';
let borderWidth = 1;
let borderRadius = 2;
/* ========== 3. DOM 引用 ========== */
const chartDom    = $('#chart');
const bwRange     = $('[data-opt="borderWidth"]');
const bwVal       = $('[data-val-borderWidth]');
const brRange     = $('[data-opt="radius"]');
const brVal       = $('[data-val-radius]');
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
function getLuminance(color) {
  let r, g, b;
  if (color.startsWith('#')) {
    const h = color.length === 4
      ? color.replace(/[^#]/g, c => c + c).slice(1)
      : color.slice(1);
    r = parseInt(h.slice(0, 2), 16) / 255;
    g = parseInt(h.slice(2, 4), 16) / 255;
    b = parseInt(h.slice(4, 6), 16) / 255;
  } else {
    const m = color.match(/\d+/g);
    if (!m) return 0;
    [r, g, b] = m.slice(0, 3).map(v => +v / 255);
  }
  const f = c => c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

function labelColor(color) {
  return getLuminance(color) > 0.35 ? '#333' : '#fff';
}

function buildOption(data) {
  const colors = getColors();
  const treeData = data.slice(1).map((row, i) => {
    const color = colors[i % colors.length];
    const txtColor = labelColor(color);
    return {
      name: String(row[0]),
      value: Number(row[1]) || 0,
      itemStyle: { color },
      label: {
        color: txtColor,
        textShadowColor: txtColor === '#fff' ? 'rgba(0,0,0,.3)' : 'transparent',
        textShadowBlur: txtColor === '#fff' ? 2 : 0,
      },
    };
  });

  const showLabel = labelMode !== 'none';
  let formatter;
  if (labelMode === 'value') formatter = '{b}\n{c}';
  else formatter = '{b}';

  return {
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c}',
    },
    series: [{
      type: 'treemap',
      data: treeData,
      width: '94%',
      height: '90%',
      left: '3%',
      top: '5%',
      roam: false,
      nodeClick: false,
      breadcrumb: { show: false },
      label: {
        show: showLabel,
        formatter,
        fontSize: 13,
      },
      itemStyle: {
        borderColor: '#fff',
        borderWidth,
        borderRadius,
        gapWidth: 1,
      },
      emphasis: {
        label: { fontSize: 15 },
        itemStyle: {
          shadowBlur: 10,
          shadowColor: 'rgba(0,0,0,.15)',
        },
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

// 标签模式
function bindSeg(selector, cb) {
  on($(selector), 'click', e => {
    const btn = e.target.closest('[data-val]');
    if (!btn) return;
    $(selector).querySelectorAll('button').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    cb(btn.dataset.val);
  });
}

bindSeg('[data-label-mode]', v => { labelMode = v; updateChart(); });

// 边框宽度
on(bwRange, 'input', () => {
  borderWidth = +bwRange.value;
  bwVal.textContent = borderWidth;
  updateChart();
});

// 圆角
on(brRange, 'input', () => {
  borderRadius = +brRange.value;
  brVal.textContent = borderRadius;
  updateChart();
});

/* ========== 13. 导出 ========== */
setupExportPanel(chart, '矩形树图.png', chartSize);

/* ========== 14. 初始渲染 ========== */
updateChart();
