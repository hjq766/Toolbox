/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on, debounce } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';
import {
  hexToRgb, rgbToHex, rgbToHSL, hslToHex, rgbToHSB, rgbToCMYK, hexToHWB,
  relativeLuminance, contrastRatio, wcagLevel, buildFormats,
} from '../../public/scripts/utils/color.js';
import {
  generateShades, semanticColors, themeFromWheel,
  renderColorExamplesHTML, applyColorExampleVars, bindColorExampleInteractions,
} from '../_shared/color-examples.js';

mountToolHeader();

/* ========== 1. 常量 / 配置 ========== */
const PRESETS = [
  '#FF0000','#FF8000','#FFBF00','#00C853','#00BCD4',
  '#3B82F6','#6366F1','#8B5CF6','#EC4899','#000000',
];
const DEFAULT_HEX = '#3b82f6';
const HISTORY_KEY = 'ct_color_history';
const MAX_HISTORY = 12;

const NAMED_COLORS = {
  red:'#FF0000', crimson:'#DC143C', tomato:'#FF6347', coral:'#FF7F50',
  orangered:'#FF4500', darkorange:'#FF8C00', orange:'#FFA500',
  gold:'#FFD700', yellow:'#FFFF00', yellowgreen:'#9ACD32',
  limegreen:'#32CD32', lime:'#00FF00', green:'#008000', darkgreen:'#006400',
  forestgreen:'#228B22', seagreen:'#2E8B57', mediumseagreen:'#3CB371',
  springgreen:'#00FF7F', aquamarine:'#7FFFD4', turquoise:'#40E0D0',
  teal:'#008080', cyan:'#00FFFF', deepskyblue:'#00BFFF', dodgerblue:'#1E90FF',
  cornflowerblue:'#6495ED', steelblue:'#4682B4', royalblue:'#4169E1',
  blue:'#0000FF', mediumblue:'#0000CD', navy:'#000080',
  slateblue:'#6A5ACD', mediumpurple:'#9370DB', blueviolet:'#8A2BE2',
  indigo:'#4B0082', darkviolet:'#9400D3', purple:'#800080',
  orchid:'#DA70D6', violet:'#EE82EE', magenta:'#FF00FF',
  deeppink:'#FF1493', hotpink:'#FF69B4', pink:'#FFC0CB',
  salmon:'#FA8072', lightcoral:'#F08080', indianred:'#CD5C5C',
  firebrick:'#B22222', maroon:'#800000', brown:'#A52A2A',
  chocolate:'#D2691E', saddlebrown:'#8B4513', sienna:'#A0522D', peru:'#CD853F',
  tan:'#D2B48C', wheat:'#F5DEB3', moccasin:'#FFE4B5',
  bisque:'#FFE4C4', peachpuff:'#FFDAB9', antiquewhite:'#FAEBD7',
  linen:'#FAF0E6', beige:'#F5F5DC', ivory:'#FFFFF0', white:'#FFFFFF',
  cornsilk:'#FFF8DC', lightyellow:'#FFFFE0', lavender:'#E6E6FA',
  lightblue:'#ADD8E6', skyblue:'#87CEEB', lightgreen:'#90EE90',
  snow:'#FFFAFA', thistle:'#D8BFD8', plum:'#DDA0DD',
  ghostwhite:'#F8F8FF', aliceblue:'#F0F8FF', azure:'#F0FFFF',
  honeydew:'#F0FFF0', mintcream:'#F5FFFA',
  black:'#000000', dimgray:'#696969', gray:'#808080',
  silver:'#C0C0C0', lightgray:'#D3D3D3', gainsboro:'#DCDCDC',
  darkgray:'#A9A9A9', slategray:'#708090', cadetblue:'#5F9EA0',
  rosybrown:'#BC8F8F', darkkhaki:'#BDB76B', khaki:'#F0E68C',
  olive:'#808000', olivedrab:'#6B8E23', darkseagreen:'#8FBC8F',
  mediumturquoise:'#48D1CC', lightseagreen:'#20B2AA',
};

/* ========== 2. 状态 ========== */
let currentFmt = 'css';

/* ========== 3. DOM 引用 ========== */
const wheel      = $('[data-wheel]');
const colorInput = $('[data-color-input]');
const swatchEl   = $('[data-swatch]');
const presetsEl  = $('[data-presets]');
const fmtList    = $('[data-format-list]');
const shadesEl   = $('[data-shades]');
const schemesEl  = $('[data-schemes]');
const semanticEl = $('[data-semantic]');
const exportCode = $('[data-export-code]');
const fmtBtns    = $$('[data-fmt]');
const contrastWhite = $('[data-contrast="white"]');
const contrastBlack = $('[data-contrast="black"]');
const crWhite    = $('[data-cr="white"]');
const crBlack    = $('[data-cr="black"]');
const wcagWhite  = $('[data-wcag="white"]');
const wcagBlack  = $('[data-wcag="black"]');
const contrastDetail = $('[data-contrast-detail]');
const harmonyScore = $('[data-harmony-score]');
const harmonyTips  = $('[data-harmony-tips]');
const tabBtns    = $$('[data-tab]');
const panes      = $$('[data-pane]');
const examplesEl = $('[data-examples]');
const toolBody       = $('.tool-body');
const customBgPicker  = $('[data-custom-bg]');
const customBgText    = $('[data-custom-bg-text]');
const historyListEl   = $('[data-history-list]');
const historyPanelEl  = $('[data-history-panel]');

/* ========== 4. 颜色数学（已移至 public/scripts/utils/color.js） ========== */

function parseColor(input) {
  input = input.trim();
  if (/^[0-9a-f]{3,8}$/i.test(input)) input = '#' + input;
  let match;
  if (/^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(input)) {
    const rgb = hexToRgb(input);
    return buildFormats(rgbToHex(rgb), rgb);
  }
  match = input.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/i);
  if (match) { const rgb={r:+match[1],g:+match[2],b:+match[3]}; return buildFormats(rgbToHex(rgb),rgb); }
  match = input.match(/^hsl\s*\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%\s*\)$/i);
  if (match) { const hex=hslToHex(+match[1],+match[2],+match[3]); return buildFormats(hex,hexToRgb(hex)); }
  if (/^#([0-9a-f]{8})$/i.test(input)) { const rgb = hexToRgb(input.slice(0,7)); return buildFormats(rgbToHex(rgb),rgb); }
  match = input.match(/^rgb\s*\(\s*(\d+)\s+(\d+)\s+(\d+)\s*\)$/i);
  if (match) { const rgb={r:+match[1],g:+match[2],b:+match[3]}; return buildFormats(rgbToHex(rgb),rgb); }
  const namedHex = NAMED_COLORS[input.toLowerCase()];
  if (namedHex) return buildFormats(namedHex, hexToRgb(namedHex));
  return null;
}

/* buildFormats 已移至 color.js */

function colorSchemes(hex) {
  const { r, g, b } = hexToRgb(hex);
  const {h,s,l} = rgbToHSL(r, g, b);
  const c = (hue) => hslToHex((hue + 360) % 360, s, l).toUpperCase();
  return {
    '互补色': [hex.toUpperCase(), c(h+180)],
    '分裂互补': [hex.toUpperCase(), c(h+150), c(h+210)],
    '近似色': [c(h-20), c(h-10), hex.toUpperCase(), c(h+10), c(h+20)],
    '三等分': [hex.toUpperCase(), c(h+120), c(h+240)],
    '矩形配色': [hex.toUpperCase(), c(h+90), c(h+180), c(h+270)]
  };
}

function genVars(hex, type, shades, sem) {
  const rgb = hexToRgb(hex);
  if (type === 'tailwind') {
    let o = 'module.exports = {\n  theme: {\n    extend: {\n      colors: {\n        primary: {\n';
    o += `          DEFAULT: '${hex.toUpperCase()}',\n`;
    shades.forEach(s => { o += `          ${s.level}: '${s.hex}',\n`; });
    o += '        },\n';
    Object.entries(sem).forEach(([k,v]) => { o += `        ${k.toLowerCase()}: '${v.toUpperCase()}',\n`; });
    o += '      },\n    },\n  },\n};';
    return o;
  }
  const pre = type === 'css' ? '--' : type === 'scss' ? '$' : '@';
  let o = type === 'css' ? ':root {\n' : '';
  o += `  ${pre}primary: ${hex.toUpperCase()};\n`;
  o += `  ${pre}primary-rgb: ${rgb.r}, ${rgb.g}, ${rgb.b};\n`;
  shades.forEach(s => { o += `  ${pre}primary-${s.level}: ${s.hex};\n`; });
  Object.entries(sem).forEach(([k,v]) => { o += `  ${pre}${k.toLowerCase()}: ${v.toUpperCase()};\n`; });
  if (type === 'css') o += '}';
  return o;
}

/* WCAG 对比度（已移至 color.js：contrastRatio / wcagLevel） */

/* 和谐度评分 */
function harmonyAnalysis(hex) {
  const { r, g, b } = hexToRgb(hex);
  const {h, s, l} = rgbToHSL(r, g, b);
  const hueScore = Math.max(0, Math.min(100, 100 - Math.abs(50 - (h % 60)) * 1.5));
  const satScore = s >= 20 && s <= 80 ? 90 + (40 - Math.abs(50 - s)) * 0.25 : Math.max(40, 100 - Math.abs(50 - s) * 1.2);
  const lumScore = l >= 25 && l <= 75 ? 85 + (50 - Math.abs(50 - l)) * 0.3 : Math.max(30, 100 - Math.abs(50 - l) * 1.4);
  const total = Math.round(hueScore * 0.3 + satScore * 0.35 + lumScore * 0.35);
  const tips = [];
  if (s < 15) tips.push('饱和度偏低，颜色略显灰暗');
  if (s > 90) tips.push('饱和度过高，可能产生视觉疲劳');
  if (l < 20) tips.push('明度过低，建议用于小面积点缀');
  if (l > 85) tips.push('明度过高，建议搭配深色背景');
  if (tips.length === 0) tips.push('当前配色具有良好的视觉平衡');
  tips.push('建议在深色/浅色模式下分别测试对比度');
  return { total, hue: Math.round(hueScore), sat: Math.round(satScore), lum: Math.round(lumScore), tips };
}

/* ========== 颜色名称匹配 ========== */
function findNamedColor(hex) {
  const { r, g, b } = hexToRgb(hex);
  let bestName = null, bestDist = Infinity;
  for (const [name, nc] of Object.entries(NAMED_COLORS)) {
    const { r: nr, g: ng, b: nb } = hexToRgb(nc);
    const d = (r-nr)**2 + (g-ng)**2 + (b-nb)**2;
    if (d < bestDist) { bestDist = d; bestName = name; }
  }
  return { name: bestName, hex: NAMED_COLORS[bestName], dist: Math.round(Math.sqrt(bestDist)) };
}

/* ========== 颜色历史 ========== */
function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch { return []; }
}
function saveToHistory(hex) {
  const h = loadHistory().filter(c => c !== hex.toUpperCase());
  h.unshift(hex.toUpperCase());
  localStorage.setItem(HISTORY_KEY, JSON.stringify(h.slice(0, MAX_HISTORY)));
  renderHistory();
}
function renderHistory() {
  const h = loadHistory();
  historyPanelEl.hidden = h.length === 0;
  historyListEl.innerHTML = h.map(c =>
    `<div class="ct-preset" style="background:${c}" data-history-color="${c}" title="${c}"></div>`
  ).join('');
}

/* ========== URL 哈希同步 ========== */
function syncHash(hex) {
  history.replaceState(null, '', '#' + hex.slice(1).toLowerCase());
}
function readHash() {
  const h = location.hash.slice(1);
  return /^[0-9a-f]{6}$/i.test(h) ? '#' + h : null;
}

/* ========== 自定义背景对比度 ========== */
function renderCustomContrast(mainHex, bgHex) {
  const el = $('[data-custom-contrast-result]');
  if (!el) return;
  const cr = contrastRatio(mainHex, bgHex);
  const lv = wcagLevel(cr);
  const lvColor = lv === 'Fail' ? 'var(--color-danger)' : lv === 'AAA' ? 'var(--color-success)' : 'var(--color-warning)';
  el.innerHTML = `<div class="u-row u-gap-3" style="align-items:center;font-size:var(--text-sm)">
    <span style="background:${bgHex};color:${mainHex};padding:2px 10px;border-radius:var(--radius-sm);font-weight:600;border:1px solid var(--border-base)">示例文字</span>
    <span>${cr.toFixed(2)}:1 <strong style="color:${lvColor}">${lv}</strong></span>
  </div>`;
}

/* ========== 核心渲染 ========== */
function updateAll() {
  const hex = wheel.value;
  const fmt = parseColor(hex);
  if (!fmt) return;

  const { r, g, b } = hexToRgb(hex);
  const shades = generateShades(hex);
  const sem = semanticColors(hex);

  swatchEl.style.background = hex;
  saveToHistory(hex);
  syncHash(hex);

  const named = findNamedColor(hex);
  fmtList.innerHTML = Object.entries(fmt).map(([k,v]) =>
    `<div class="ct-fmt" data-copy="${v}"><span class="u-muted">${k}</span><span class="u-mono">${v}</span></div>`
  ).join('') + `<div class="ct-fmt" data-copy="${named.name}"><span class="u-muted">Named</span><span class="u-mono">${named.name}${named.dist > 0 ? `<span class="u-muted u-text-xs"> (≈${named.dist})</span>` : ''}</span></div>`;

  shadesEl.innerHTML = shades.map(s =>
    `<div title="${s.level}: ${s.hex} (点击应用，Ctrl+点击复制)" data-shade-hex="${s.hex}">
      <div class="ct-shade" style="background:${s.hex}"></div>
      <div class="ct-shade-label u-muted">${s.level}</div>
    </div>`
  ).join('');

  const schemes = colorSchemes(hex);
  schemesEl.innerHTML = Object.entries(schemes).map(([name, colors]) =>
    `<div class="ct-scheme-card">
      <div class="ct-scheme-strip">${colors.map(c =>
        `<span style="background:${c}" title="${c}" data-copy="${c}"></span>`
      ).join('')}</div>
      <div class="ct-scheme-info"><span class="u-strong">${name}</span><span class="u-muted">${colors.length} 色</span></div>
    </div>`
  ).join('');

  semanticEl.innerHTML = Object.entries(sem).map(([k,v]) =>
    `<div class="u-row u-gap-2" style="align-items:center;cursor:pointer" data-copy="${v.toUpperCase()}">
      <div class="ct-sem" style="background:${v};width:40px"></div>
      <span style="font-size:var(--text-sm)">${k}</span>
      <span class="u-muted u-mono" style="font-size:var(--text-xs);margin-left:auto">${v.toUpperCase()}</span>
    </div>`
  ).join('');

  exportCode.textContent = genVars(hex, currentFmt, shades, sem);

  /* WCAG 对比度 */
  const crW = contrastRatio(hex, '#FFFFFF'), crB = contrastRatio(hex, '#000000');
  contrastWhite.style.background = '#FFFFFF';
  contrastWhite.style.color = hex;
  contrastBlack.style.background = '#000000';
  contrastBlack.style.color = hex;
  crWhite.textContent = crW.toFixed(2) + ':1';
  crBlack.textContent = crB.toFixed(2) + ':1';
  wcagWhite.textContent = wcagLevel(crW);
  wcagBlack.textContent = wcagLevel(crB);
  contrastDetail.innerHTML = [
    { bg: '#FFFFFF', label: '白底' },
    { bg: '#F5F5F5', label: '浅灰底' },
    { bg: '#333333', label: '深灰底' },
    { bg: '#000000', label: '黑底' },
  ].map(({ bg, label }) => {
    const cr = contrastRatio(hex, bg);
    const lv = wcagLevel(cr);
    const lvColor = lv === 'Fail' ? 'var(--color-danger)' : lv === 'AAA' ? 'var(--color-success)' : 'var(--color-warning)';
    return `<div class="u-row u-between" style="font-size:var(--text-sm);padding:var(--space-1) 0">
      <span class="u-row u-gap-2"><span style="width:16px;height:16px;border-radius:var(--radius-sm);background:${bg};border:1px solid var(--border-subtle)"></span>${label}</span>
      <span>${cr.toFixed(2)}:1 <strong style="color:${lvColor}">${lv}</strong></span>
    </div>`;
  }).join('');

  /* 和谐度 */
  const ha = harmonyAnalysis(hex);
  harmonyScore.innerHTML = `${ha.total}<small>和谐度</small>`;
  $('[data-score="hue"]').textContent = ha.hue + '%';
  $('[data-score="sat"]').textContent = ha.sat + '%';
  $('[data-score="lum"]').textContent = ha.lum + '%';
  $('[data-bar="hue"]').style.width = ha.hue + '%';
  $('[data-bar="sat"]').style.width = ha.sat + '%';
  $('[data-bar="lum"]').style.width = ha.lum + '%';
  harmonyTips.innerHTML = ha.tips.map(t => `<div class="u-muted">• ${t}</div>`).join('');

  const theme = themeFromWheel(hex);
  applyColorExampleVars(toolBody, theme);
  renderExamples(theme);
  renderCustomContrast(hex, customBgPicker.value);
}

function renderExamples(theme) {
  examplesEl.innerHTML = renderColorExamplesHTML(theme, {}, { showTextLevels: false });
  bindColorExampleInteractions(examplesEl);
  if (window.refreshIcons) window.refreshIcons(examplesEl);
}

/* ========== 5. 事件绑定 ========== */

/* --- Tabs --- */
on($('[data-tabs]'), 'click', e => {
  const t = e.target.closest('[data-tab]');
  if (!t) return;
  tabBtns.forEach(b => b.classList.toggle('is-active', b === t));
  panes.forEach(p => p.hidden = p.dataset.pane !== t.dataset.tab);
});

/* --- 预设色 --- */
presetsEl.innerHTML = PRESETS.map(c =>
  `<div class="ct-preset" style="background:${c}" data-preset="${c}" title="${c}"></div>`
).join('');

on(presetsEl, 'click', e => {
  const el = e.target.closest('[data-preset]');
  if (!el) return;
  const hex = el.dataset.preset;
  wheel.value = hex; colorInput.value = hex;
  $$('[data-preset]').forEach(p => p.classList.toggle('active', p === el));
  updateAll();
});

/* --- 颜色选择器 --- */
on(wheel, 'input', () => { colorInput.value = wheel.value; updateAll(); });
on(colorInput, 'input', debounce(() => {
  const c = parseColor(colorInput.value);
  if (c) { wheel.value = c.HEX; updateAll(); }
}, 200));

/* --- 导出格式切换 --- */
fmtBtns.forEach(btn => on(btn, 'click', () => {
  currentFmt = btn.dataset.fmt;
  fmtBtns.forEach(b => b.classList.toggle('is-active', b === btn));
  const h = wheel.value;
  exportCode.textContent = genVars(h, currentFmt, generateShades(h), semanticColors(h));
}));

/* --- 复制导出代码 --- */
on($('[data-action="copy-export"]'), 'click', async () => {
  const ok = await copyText(exportCode.textContent);
  showToast(ok ? '代码已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

/* --- 复制 HEX --- */
on($('[data-action="copy-hex"]'), 'click', async () => {
  const hex = wheel.value.toUpperCase();
  const ok = await copyText(hex);
  showToast(ok ? `已复制 ${hex}` : '复制失败', { type: ok ? 'success' : 'error' });
});

/* --- 色阶点击选色 --- */
on(shadesEl, 'click', e => {
  const el = e.target.closest('[data-shade-hex]');
  if (!el) return;
  const hex = el.dataset.shadeHex;
  if (e.ctrlKey || e.metaKey) {
    copyText(hex).then(ok =>
      showToast(ok ? `已复制 ${hex}` : '复制失败', { type: ok ? 'success' : 'error' })
    );
    return;
  }
  wheel.value = hex; colorInput.value = hex;
  updateAll();
});

/* --- 颜色历史点击 --- */
on(historyListEl, 'click', e => {
  const el = e.target.closest('[data-history-color]');
  if (!el) return;
  const hex = el.dataset.historyColor;
  wheel.value = hex; colorInput.value = hex;
  $$('[data-preset]').forEach(p => p.classList.remove('active'));
  updateAll();
});

/* --- 自定义背景对比度 --- */
on(customBgPicker, 'input', () => {
  customBgText.value = customBgPicker.value.toUpperCase();
  renderCustomContrast(wheel.value, customBgPicker.value);
});
on(customBgText, 'input', debounce(() => {
  const c = parseColor(customBgText.value);
  if (c) { customBgPicker.value = c.HEX; renderCustomContrast(wheel.value, c.HEX); }
}, 200));

/* --- 导出下载 --- */
on($('[data-action="dl-export"]'), 'click', () => {
  const ext = currentFmt === 'tailwind' ? 'js' : currentFmt;
  const blob = new Blob([exportCode.textContent], { type: 'text/plain' });
  downloadBlob(blob, `colors.${ext}`);
  showToast(`已下载 colors.${ext}`, { type: 'success' });
});

/* --- 重置 --- */
on($('[data-action="reset"]'), 'click', () => {
  wheel.value = DEFAULT_HEX; colorInput.value = DEFAULT_HEX;
  currentFmt = 'css';
  fmtBtns.forEach(b => b.classList.toggle('is-active', b.dataset.fmt === 'css'));
  $$('[data-preset]').forEach(p => p.classList.remove('active'));
  updateAll();
  showToast('已重置');
});

/* ========== 初始化 ========== */
const initHex = readHash() || DEFAULT_HEX;
wheel.value = initHex;
colorInput.value = initHex;
updateAll();
renderHistory();
