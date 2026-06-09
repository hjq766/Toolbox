import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';

mountToolHeader();

/* ===== 预设 ===== */
const PRESETS = [
  { label: '方形',  mode: 'uniform', unit: 'px', values: { all: 0   } },
  { label: '圆角',  mode: 'uniform', unit: 'px', values: { all: 16  } },
  { label: '胶囊',  mode: 'uniform', unit: 'px', values: { all: 200 } },
  { label: '圆形',  mode: 'uniform', unit: '%',  values: { all: 50  } },
  { label: '椭圆',  mode: 'ellipse', unit: '%',  values: { h: 50, v: 30 } },
  { label: '扇形',  mode: 'corners', unit: '%',  values: { tl: 100, tr: 0,  br: 0,  bl: 0  } },
  { label: '对角',  mode: 'corners', unit: '%',  values: { tl: 50,  tr: 0,  br: 50, bl: 0  } },
  { label: '叶子',  mode: 'corners', unit: '%',  values: { tl: 0,   tr: 50, br: 0,  bl: 50 } },
];

const COLORS = {
  brand:    'var(--color-brand)',
  gradient: 'linear-gradient(135deg, var(--color-brand), var(--demo-purple))',
  success:  'var(--color-success)',
  warm:     'var(--color-warning)',
};

const MODE_NAMES = { uniform: '统一', corners: '四角', ellipse: '椭圆' };

/* ===== 状态 ===== */
const state = {
  mode: 'uniform', unit: 'px',
  all: 16,
  tl: 16, tr: 16, br: 16, bl: 16,
  h: 50,  v: 25,
};

/* ===== DOM ===== */
const preview   = $('[data-preview]');
const cssOut    = $('[data-css-output]');
const htmlOut   = $('[data-html-output]');
const modeTabs  = $('[data-mode-tabs]');
const unitOpts  = $('[data-unit-opts]');
const presetsEl = $('[data-presets]');
const colorOpts = $('[data-color-opts]');
const modeBadge = $('[data-mode-badge]');

/* ===== 渲染预设按钮 ===== */
PRESETS.forEach(p => {
  const btn = document.createElement('button');
  btn.className = 'btn is-sm';
  btn.type = 'button';
  btn.textContent = p.label;
  btn.dataset.preset = p.label;
  presetsEl.appendChild(btn);
});

/* ===== 工具函数 ===== */
const getMax = () => state.unit === 'px' ? 200 : 100;

function updateRangeMax() {
  const max = getMax();
  $$('[data-input]').forEach(el => {
    el.max = max;
    if (+el.value > max) el.value = max;
  });
}

function buildValue() {
  const u = state.unit;
  const { mode, all, tl, tr, br, bl, h, v } = state;
  if (mode === 'uniform') return `${all}${u}`;
  if (mode === 'ellipse') return `${h}${u} / ${v}${u}`;
  if (tl === tr && tr === br && br === bl) return `${tl}${u}`;
  if (tl === br && tr === bl) return `${tl}${u} ${tr}${u}`;
  return `${tl}${u} ${tr}${u} ${br}${u} ${bl}${u}`;
}

function syncSliders() {
  ['all', 'tl', 'tr', 'br', 'bl', 'h', 'v'].forEach(k => {
    const el = $(`[data-input="${k}"]`);
    if (el) el.value = state[k];
  });
}

function render() {
  const value = buildValue();
  preview.style.borderRadius = value;
  modeBadge.textContent = MODE_NAMES[state.mode];
  cssOut.value  = `.element {\n  border-radius: ${value};\n}`;
  htmlOut.value = `<div style="border-radius: ${value}; width: 180px; height: 180px;"></div>`;
  ['all', 'tl', 'tr', 'br', 'bl', 'h', 'v'].forEach(k => {
    const el = $(`[data-val="${k}"]`);
    if (el) el.textContent = state[k] + state.unit;
  });
}

/* ===== 模式切换 ===== */
on(modeTabs, 'click', e => {
  const btn = e.target.closest('[data-mode]');
  if (!btn) return;
  state.mode = btn.dataset.mode;
  $$('[data-mode]', modeTabs).forEach(b => b.classList.toggle('is-active', b === btn));
  $$('[data-panel]').forEach(p => { p.hidden = p.dataset.panel !== state.mode; });
  render();
});

/* ===== 单位切换 ===== */
on(unitOpts, 'click', e => {
  const btn = e.target.closest('[data-unit]');
  if (!btn) return;
  const prev = state.unit;
  state.unit = btn.dataset.unit;
  $$('[data-unit]', unitOpts).forEach(b => b.classList.toggle('is-active', b === btn));

  const ratio = state.unit === '%' ? 0.5 : 2;
  const cap   = getMax();
  ['all', 'tl', 'tr', 'br', 'bl', 'h', 'v'].forEach(k => {
    state[k] = Math.min(cap, Math.round(state[k] * ratio));
  });

  updateRangeMax();
  syncSliders();
  render();
});

/* ===== 滑块输入 ===== */
on(document, 'input', e => {
  const inp = e.target.closest('[data-input]');
  if (!inp) return;
  const k = inp.dataset.input;
  if (k in state) state[k] = +inp.value;
  render();
});

/* ===== 预设点击 ===== */
on(presetsEl, 'click', e => {
  const btn = e.target.closest('[data-preset]');
  if (!btn) return;
  const p = PRESETS.find(x => x.label === btn.dataset.preset);
  if (!p) return;

  state.mode = p.mode;
  state.unit = p.unit;
  Object.assign(state, p.values);

  $$('[data-mode]', modeTabs).forEach(b => b.classList.toggle('is-active', b.dataset.mode === state.mode));
  $$('[data-panel]').forEach(p2 => { p2.hidden = p2.dataset.panel !== state.mode; });
  $$('[data-unit]', unitOpts).forEach(b => b.classList.toggle('is-active', b.dataset.unit === state.unit));
  $$('[data-preset]', presetsEl).forEach(b => b.classList.toggle('is-active', b === btn));

  updateRangeMax();
  syncSliders();
  render();
});

/* ===== 颜色切换 ===== */
on(colorOpts, 'click', e => {
  const btn = e.target.closest('[data-color]');
  if (!btn) return;
  $$('[data-color]', colorOpts).forEach(b => b.classList.toggle('is-active', b === btn));
  preview.style.background = COLORS[btn.dataset.color];
});

/* ===== 复制 ===== */
on($('[data-action="copy"]'), 'click', async () => {
  const ok = await copyText(cssOut.value);
  showToast(ok ? '已复制 CSS' : '复制失败', { type: ok ? 'success' : 'error' });
});

/* ===== 初始化 ===== */
updateRangeMax();
syncSliders();
render();
preview.style.background = COLORS.brand;
