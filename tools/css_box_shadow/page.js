import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';

mountToolHeader();

/* ============ 1. 常量 ============ */

const PRESETS = [
  { label: '柔和', layers: [{ x: 0, y: 2, blur: 8,  spread: 0,  color: '#000000', opacity: 12, inset: false }] },
  { label: '卡片', layers: [{ x: 0, y: 4, blur: 16, spread: -2, color: '#000000', opacity: 15, inset: false }] },
  { label: '浮起', layers: [{ x: 0, y: 8, blur: 24, spread: -4, color: '#000000', opacity: 20, inset: false }] },
  { label: '立体', layers: [
    { x: 0, y: 2, blur: 4,  spread: 0,  color: '#000000', opacity: 10, inset: false },
    { x: 0, y: 8, blur: 20, spread: -4, color: '#000000', opacity: 18, inset: false },
  ]},
  { label: '内凹', layers: [{ x: 0, y: 2, blur: 6,  spread: -2, color: '#000000', opacity: 20, inset: true }] },
  { label: '霓虹', layers: [
    { x: 0, y: 0, blur: 16, spread: 2,  color: '#6366f1', opacity: 60, inset: false },
    { x: 0, y: 0, blur: 32, spread: 4,  color: '#6366f1', opacity: 30, inset: false },
  ]},
];

const BG_MAP = {
  surface: 'var(--bg-page)',
  brand:   'var(--color-brand-soft)',
  dark:    'var(--fg-strong)',
};

/* ============ 2. 状态 ============ */

let layers = [{ x: 4, y: 4, blur: 8, spread: 0, color: '#000000', opacity: 20, inset: false }];
let activeIdx = 0;

/* ============ 3. DOM 引用 ============ */

const preview    = $('[data-preview]');
const cssOut     = $('[data-css-output]');
const layerList  = $('[data-layer-list]');
const presetsEl  = $('[data-presets]');
const bgOpts     = $('[data-bg-opts]');

/* ============ 4. 工具函数 ============ */

function hexWithOpacity(hex, opacity) {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${(opacity / 100).toFixed(2)})`;
}

function layerToCSS(l) {
  const color = hexWithOpacity(l.color, l.opacity);
  return `${l.inset ? 'inset ' : ''}${l.x}px ${l.y}px ${l.blur}px ${l.spread}px ${color}`;
}

function buildCSS() {
  return layers.map(layerToCSS).join(',\n       ');
}

function syncControls() {
  const l = layers[activeIdx];
  if (!l) return;
  const setInput = (key, val) => {
    const el = $(`[data-input="${key}"]`);
    if (el) el.type === 'checkbox' ? (el.checked = val) : (el.value = val);
  };
  setInput('x',       l.x);
  setInput('y',       l.y);
  setInput('blur',    l.blur);
  setInput('spread',  l.spread);
  setInput('opacity', l.opacity);
  setInput('color',   l.color);
  setInput('inset',   l.inset);
  $('[data-val="x"]').textContent       = `${l.x}px`;
  $('[data-val="y"]').textContent       = `${l.y}px`;
  $('[data-val="blur"]').textContent    = `${l.blur}px`;
  $('[data-val="spread"]').textContent  = `${l.spread}px`;
  $('[data-val="opacity"]').textContent = `${l.opacity}%`;
}

function renderLayerList() {
  layerList.innerHTML = '';
  layers.forEach((l, i) => {
    const item = document.createElement('div');
    item.className = `shadow-layer-item${i === activeIdx ? ' is-active' : ''}`;
    item.dataset.layerIdx = i;

    const swatch = document.createElement('span');
    swatch.className = 'layer-swatch';
    swatch.style.background = hexWithOpacity(l.color, l.opacity);

    const label = document.createElement('span');
    label.className = 'layer-label';
    label.textContent = layerToCSS(l);

    const del = document.createElement('button');
    del.className = 'layer-del';
    del.type = 'button';
    del.dataset.deleteIdx = i;
    del.innerHTML = '<i data-lucide="x" class="icon-16"></i>';
    del.title = '删除此层';

    item.appendChild(swatch);
    item.appendChild(label);
    item.appendChild(del);
    layerList.appendChild(item);
  });
  window.refreshIcons?.(layerList);
}

function render() {
  const css = buildCSS();
  preview.style.boxShadow = css;
  cssOut.value = `box-shadow: ${css};`;
  renderLayerList();
}

/* ============ 5. 事件绑定 ============ */

// 滑块 / 颜色 / inset 变化
on(document, 'input', e => {
  const el = e.target.closest('[data-input]');
  if (!el) return;
  const l = layers[activeIdx];
  if (!l) return;
  const key = el.dataset.input;
  $$('[data-preset]', presetsEl).forEach(button => button.classList.remove('is-active'));
  if (el.type === 'checkbox') {
    l[key] = el.checked;
  } else if (el.type === 'color') {
    l[key] = el.value;
  } else {
    l[key] = Number(el.value);
  }
  const valEl = $(`[data-val="${key}"]`);
  if (valEl) valEl.textContent = key === 'opacity' ? `${l[key]}%` : `${l[key]}px`;
  render();
});

// 层列表点击（选中 / 删除）
on(layerList, 'click', e => {
  const del = e.target.closest('[data-delete-idx]');
  if (del) {
    const idx = Number(del.dataset.deleteIdx);
    if (layers.length === 1) { showToast('至少保留一层阴影', { type: 'warn' }); return; }
    layers.splice(idx, 1);
    if (idx < activeIdx) activeIdx--;
    activeIdx = Math.min(activeIdx, layers.length - 1);
    syncControls();
    render();
    return;
  }
  const item = e.target.closest('[data-layer-idx]');
  if (item) {
    activeIdx = Number(item.dataset.layerIdx);
    syncControls();
    renderLayerList();
  }
});

// 添加层
on($('[data-action="add-layer"]'), 'click', () => {
  layers.push({ x: 0, y: 4, blur: 12, spread: 0, color: '#000000', opacity: 15, inset: false });
  activeIdx = layers.length - 1;
  syncControls();
  render();
});

// 预设
on(presetsEl, 'click', e => {
  const btn = e.target.closest('[data-preset]');
  if (!btn) return;
  const p = PRESETS.find(x => x.label === btn.dataset.preset);
  if (!p) return;
  layers = p.layers.map(l => ({ ...l }));
  activeIdx = 0;
  $$('[data-preset]', presetsEl).forEach(b => b.classList.toggle('is-active', b === btn));
  syncControls();
  render();
});

// 预览背景
on(bgOpts, 'click', e => {
  const btn = e.target.closest('[data-bg]');
  if (!btn) return;
  $$('[data-bg]', bgOpts).forEach(b => b.classList.toggle('is-active', b === btn));
  $('[data-preview]').closest('.shadow-stage').style.background = BG_MAP[btn.dataset.bg];
});

// 复制
on($('[data-action="copy"]'), 'click', async () => {
  const ok = await copyText(cssOut.value);
  showToast(ok ? '已复制 CSS' : '复制失败', { type: ok ? 'success' : 'error' });
});

// 渲染预设按钮
PRESETS.forEach(p => {
  const btn = document.createElement('button');
  btn.className = 'btn is-sm';
  btn.type = 'button';
  btn.textContent = p.label;
  btn.dataset.preset = p.label;
  presetsEl.appendChild(btn);
});

/* ============ 初始化 ============ */
syncControls();
render();
