/* ============================================================
   CSS 文字渐变生成器 — page.js
   ============================================================ */

import { mountToolHeader }  from '../../public/scripts/core/tool-page.js';
import { $, $$, on }        from '../../public/scripts/utils/dom.js';
import { copyText }          from '../../public/scripts/utils/clipboard.js';
import { showToast }         from '../../public/scripts/components/toast.js';
import { gradients, categoryNames } from '../color_gradient/gradients.js';
import {
  DEFAULT_STOPS, buildGradientCSS, parseGradientColor, parseCSSGradient,
} from '../_shared/gradient-core.js';
import { parseCssColor } from '../../public/scripts/utils/color.js';

mountToolHeader();

// ── 1. 状态 ──────────────────────────────────────────────────
const state = {
  angle:      90,
  stops:      DEFAULT_STOPS.map(s => ({ ...s })),
  activeIdx:  -1,
  isDragging: false,
  text:       '渐变文字效果',
  fontSize:   72,
  fontWeight: 700,
  letterSpacing: 0,
  bg:         'var(--bg-surface)',
};

const BG_PRESETS = {
  white: 'var(--bg-surface)',
  black: 'var(--bg-inverse)',
  light: 'var(--bg-surface-2)',
};
const RGB_FUNCTION = 'rgb';

// ── 2. DOM 引用 ──────────────────────────────────────────────
const dom = {
  previewWrap:    $('[data-preview-wrap]'),
  previewText:    $('[data-preview-text]'),
  bar:            $('[data-bar]'),
  stopsWrap:      $('[data-stops]'),
  cssOut:         $('[data-css-out]'),
  // text settings
  textInput:      $('[data-text-input]'),
  fontSize:       $('[data-font-size]'),
  fontSizeVal:    $('[data-font-size-val]'),
  fontWeight:     $('[data-font-weight]'),
  fontWeightVal:  $('[data-font-weight-val]'),
  letterSpacing:  $('[data-letter-spacing]'),
  letterSpacingVal: $('[data-letter-spacing-val]'),
  // direction
  dirBtns:        $$('[data-dir]'),
  angleInput:     $('[data-angle]'),
  angleVal:       $('[data-angle-val]'),
  // background
  bgOpts:         $$('[data-bg]'),
  bgCustom:       $('[data-bg-custom]'),
  bgHex:          $('[data-bg-hex]'),
  // stop list
  stopList:       $('[data-stop-list]'),
  stopDetail:     $('[data-stop-detail]'),
  stopCount:      $('[data-stop-count]'),
  // presets
  presetTabs:     $('[data-preset-tabs]'),
  presetGrid:     $('[data-preset-grid]'),
};

// ── 3. 渐变 CSS 生成 ─────────────────────────────────────────
function getGradientValue() {
  return buildGradientCSS({ type: 'linear', angle: state.angle, stops: state.stops });
}

function buildTextGradientCSS() {
  const grad = getGradientValue();
  return `.gradient-text {
  background-image: ${grad};
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}`;
}

// ── 4. 渲染 ──────────────────────────────────────────────────
function render() {
  const grad = getGradientValue();
  dom.previewText.style.backgroundImage = grad;
  dom.bar.style.backgroundImage = grad;
  dom.cssOut.textContent = buildTextGradientCSS();
  renderStops();
}

function renderText() {
  dom.previewText.textContent = state.text || '渐变文字效果';
  dom.previewText.style.fontSize    = state.fontSize + 'px';
  dom.previewText.style.fontWeight  = state.fontWeight;
  dom.previewText.style.letterSpacing = state.letterSpacing + 'px';
}

function renderBg() {
  dom.previewWrap.style.background = state.bg;
  syncBgInputs();
}

function syncBgInputs() {
  const hex = normalizeHex(state.bg) || parseCssColor(getComputedStyle(dom.previewWrap).backgroundColor);
  if (!hex) return;
  dom.bgCustom.value = hex;
  dom.bgHex.value = hex;
}

function renderStops() {
  dom.stopsWrap.innerHTML = '';
  state.stops.forEach((stop, i) => {
    const el = document.createElement('div');
    el.className = 'cg-stop' + (i === state.activeIdx ? ' is-active' : '');
    el.style.left = `${stop.position}%`;
    el.style.backgroundColor = stop.color;
    el.dataset.idx = String(i);
    dom.stopsWrap.appendChild(el);
  });
}

// ── 5. 色标列表 ──────────────────────────────────────────────
function selectStop(idx) {
  state.activeIdx = idx;
  renderStops();
  updateStopListActive();
}

function buildColor(hex, alpha) {
  if (alpha >= 1) return hex;
  const r = parseInt(hex.slice(1,3), 16);
  const g = parseInt(hex.slice(3,5), 16);
  const b = parseInt(hex.slice(5,7), 16);
  return `${RGB_FUNCTION}(${r} ${g} ${b} / ${alpha})`;
}

function normalizeHex(value) {
  let v = value.trim();
  if (!v.startsWith('#')) v = '#' + v;
  return /^#[0-9a-fA-F]{6}$/.test(v) ? v : null;
}

function renderStopList() {
  dom.stopList.innerHTML = '';
  dom.stopCount.textContent = `${state.stops.length} 个`;
  state.stops.forEach((stop, idx) => {
    const parsed = parseGradientColor(stop.color);

    const row = document.createElement('div');
    row.className = 'chip cg-stop-card' + (idx === state.activeIdx ? ' is-active' : '');
    row.dataset.idx = String(idx);

    const color = document.createElement('input');
    color.type = 'color';
    color.value = parsed.hex;
    color.dataset.stopColor = '';

    const hex = document.createElement('input');
    hex.className = 'input cg-stop-hex';
    hex.value = parsed.hex;
    hex.dataset.stopHex = '';

    const pos = document.createElement('input');
    pos.className = 'input cg-stop-pos';
    pos.type = 'number';
    pos.min = '0';
    pos.max = '100';
    pos.value = stop.position;
    pos.dataset.stopPosText = '';
    pos.title = '位置百分比';

    const remove = document.createElement('button');
    remove.className = 'btn is-sm is-ghost';
    remove.type = 'button';
    remove.dataset.stopRemove = '';
    remove.title = '删除色标';
    remove.innerHTML = '<i data-lucide="trash-2"></i>';

    row.append(color, hex, pos, remove);
    dom.stopList.appendChild(row);
  });
  renderStopDetail();
  if (window.lucide) window.lucide.createIcons();
}

function updateStopListActive() {
  $$('[data-idx]', dom.stopList).forEach(row => {
    row.classList.toggle('is-active', +row.dataset.idx === state.activeIdx);
  });
  renderStopDetail();
}

function updateStopColorFromRow(row) {
  const idx = +row.dataset.idx;
  const hexInput = $('[data-stop-hex]', row);
  const colorInput = $('[data-stop-color]', row);
  const parsed = parseGradientColor(state.stops[idx].color);
  const hex = normalizeHex(hexInput.value);
  if (!hex) return;
  colorInput.value = hex;
  hexInput.value = hex;
  state.stops[idx].color = buildColor(hex, parsed.alpha);
}

function syncStopRow(idx) {
  const row = $(`[data-idx="${idx}"]`, dom.stopList);
  if (!row) return;
  const stop = state.stops[idx];
  const parsed = parseGradientColor(stop.color);
  const color = $('[data-stop-color]', row);
  const hex = $('[data-stop-hex]', row);
  const pos = $('[data-stop-pos-text]', row);
  color.value = parsed.hex;
  hex.value = parsed.hex;
  pos.value = stop.position;
}

function renderStopDetail() {
  if (state.activeIdx < 0 || state.activeIdx >= state.stops.length) {
    dom.stopDetail.hidden = true;
    dom.stopDetail.innerHTML = '';
    return;
  }

  const stop = state.stops[state.activeIdx];
  const parsed = parseGradientColor(stop.color);
  dom.stopDetail.hidden = false;
  dom.stopDetail.innerHTML = `
    <div class="field">
      <label class="field-label">透明</label>
      <div class="u-row u-gap-2">
        <input class="u-grow" type="range" data-stop-alpha min="0" max="100" value="${Math.round(parsed.alpha * 100)}">
        <span class="chip-sub" data-stop-alpha-val>${Math.round(parsed.alpha * 100)}%</span>
      </div>
    </div>
    <div class="field">
      <label class="field-label">位置</label>
      <div class="u-row u-gap-2">
        <input class="u-grow" type="range" data-stop-pos min="0" max="100" value="${stop.position}">
        <span class="chip-sub" data-stop-pos-val>${stop.position}%</span>
      </div>
    </div>
  `;

  setRange($('[data-stop-alpha]', dom.stopDetail), Math.round(parsed.alpha * 100));
  setRange($('[data-stop-pos]', dom.stopDetail), stop.position);
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

// ── 6. 色标拖拽 ──────────────────────────────────────────────
function initStopDrag(el, idx, evt) {
  const barRect = dom.bar.getBoundingClientRect();
  const startX  = evt.clientX;
  const startPos = state.stops[idx].position;
  let moved = false;
  const dragRef = state.stops[idx];

  const onMove = (e) => {
    moved = true;
    state.isDragging = true;
    const dx = e.clientX - startX;
    let newPos = startPos + (dx / barRect.width) * 100;
    newPos = Math.max(0, Math.min(100, Math.round(newPos)));
    if (state.stops.some((s, j) => j !== idx && Math.abs(s.position - newPos) < 2)) return;
    dragRef.position = newPos;
    render();
  };

  const onUp = () => {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    if (moved) {
      state.stops.sort((a, b) => a.position - b.position);
      state.activeIdx = state.stops.indexOf(dragRef);
      render();
      renderStopList();
    }
    setTimeout(() => { state.isDragging = false; }, 0);
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

// ── 7. Range 赋值 ─────────────────────────────────────────────
function setRange(el, v) {
  el.value = v;
  const min = parseFloat(el.min) || 0;
  const max = parseFloat(el.max) || 100;
  el.style.setProperty('--range-pct', ((v - min) / (max - min) * 100) + '%');
}

// ── 8. 精选预设 ──────────────────────────────────────────────
function buildPresetTabs() {
  dom.presetTabs.innerHTML = '';
  gradients.forEach((group, gi) => {
    Object.keys(group).forEach(key => {
      const btn = document.createElement('button');
      btn.className = 'tab-btn' + (gi === 0 ? ' is-active' : '');
      btn.dataset.presetCat = key;
      btn.textContent = categoryNames[key] || key;
      dom.presetTabs.appendChild(btn);
    });
  });
}

function loadPresetCategory(catKey) {
  dom.presetGrid.innerHTML = '';
  const group = gradients.find(g => g[catKey]);
  if (!group) return;
  group[catKey].forEach(([name, css]) => {
    const card = document.createElement('div');
    card.className = 'card cg-preset-card';
    card.style.background = css;
    card.dataset.gradient = css;
    const label = document.createElement('div');
    label.className = 'cg-preset-name';
    label.textContent = name;
    card.appendChild(label);
    dom.presetGrid.appendChild(card);
  });
}

// ── 9. 重置 ──────────────────────────────────────────────────
function resetAll() {
  state.angle = 90;
  state.stops = DEFAULT_STOPS.map(s => ({ ...s }));
  state.activeIdx = -1;
  dom.dirBtns.forEach(b => b.classList.toggle('is-active', +b.dataset.dir === 90));
  setRange(dom.angleInput, 90);
  dom.angleVal.textContent = '90°';
  render();
  renderStopList();
  showToast('已重置');
}

// ── 10. 事件绑定 ─────────────────────────────────────────────

/* --- 文字内容 --- */
on(dom.textInput, 'input', () => {
  state.text = dom.textInput.value;
  renderText();
});

/* --- 字号 --- */
on(dom.fontSize, 'input', () => {
  state.fontSize = +dom.fontSize.value;
  dom.fontSizeVal.textContent = state.fontSize + 'px';
  setRange(dom.fontSize, state.fontSize);
  renderText();
});

/* --- 字重 --- */
on(dom.fontWeight, 'input', () => {
  state.fontWeight = +dom.fontWeight.value;
  dom.fontWeightVal.textContent = state.fontWeight;
  setRange(dom.fontWeight, state.fontWeight);
  renderText();
});

/* --- 字间距 --- */
on(dom.letterSpacing, 'input', () => {
  state.letterSpacing = +dom.letterSpacing.value;
  dom.letterSpacingVal.textContent = state.letterSpacing + 'px';
  setRange(dom.letterSpacing, state.letterSpacing);
  renderText();
});

/* --- 方向按钮 --- */
dom.dirBtns.forEach(btn => on(btn, 'click', () => {
  state.angle = +btn.dataset.dir;
  dom.dirBtns.forEach(b => b.classList.toggle('is-active', b === btn));
  setRange(dom.angleInput, state.angle);
  dom.angleVal.textContent = state.angle + '°';
  render();
}));

/* --- 角度滑块 --- */
on(dom.angleInput, 'input', () => {
  state.angle = +dom.angleInput.value;
  dom.angleVal.textContent = state.angle + '°';
  dom.dirBtns.forEach(b => b.classList.toggle('is-active', +b.dataset.dir === state.angle));
  render();
});

/* --- 背景色预设 --- */
on($('[data-bg-opts]'), 'click', e => {
  const btn = e.target.closest('[data-bg]');
  if (!btn) return;
  state.bg = BG_PRESETS[btn.dataset.bg] || BG_PRESETS.white;
  dom.bgOpts.forEach(b => b.classList.toggle('is-active', b === btn));
  renderBg();
});

on(dom.bgCustom, 'input', () => {
  state.bg = dom.bgCustom.value;
  dom.bgOpts.forEach(b => b.classList.remove('is-active'));
  renderBg();
});

on(dom.bgHex, 'input', () => {
  const hex = normalizeHex(dom.bgHex.value);
  if (!hex) return;
  state.bg = hex;
  dom.bgOpts.forEach(b => b.classList.remove('is-active'));
  renderBg();
});

on(dom.bgHex, 'change', () => {
  const hex = normalizeHex(dom.bgHex.value);
  if (!hex) {
    syncBgInputs();
    showToast('请输入 6 位 HEX 颜色', { type: 'warn' });
  }
});

/* --- 色标：点击添加 --- */
on(dom.bar, 'click', (e) => {
  if (state.isDragging || e.target !== dom.bar) return;
  const rect = dom.bar.getBoundingClientRect();
  const pos = Math.round(((e.clientX - rect.left) / rect.width) * 100);
  if (state.stops.some(s => Math.abs(s.position - pos) < 2)) return;
  const idx = state.stops.findIndex(s => s.position > pos);
  const nearest = [...state.stops].sort((a, b) => Math.abs(a.position - pos) - Math.abs(b.position - pos))[0];
  const newStop = { color: nearest?.color || DEFAULT_STOPS[0].color, position: pos };
  if (idx === -1) state.stops.push(newStop);
  else state.stops.splice(idx, 0, newStop);
  state.activeIdx = state.stops.indexOf(newStop);
  render();
  renderStopList();
});

/* --- 色标：选中 + 拖拽 --- */
on(dom.stopsWrap, 'mousedown', (e) => {
  const el = e.target.closest('[data-idx]');
  if (!el) return;
  e.preventDefault();
  const idx = +el.dataset.idx;
  selectStop(idx);
  initStopDrag(el, idx, e);
});

/* --- 色标：右键删除 --- */
on(dom.stopsWrap, 'contextmenu', (e) => {
  const el = e.target.closest('[data-idx]');
  if (!el) return;
  e.preventDefault();
  if (state.stops.length <= 2) { showToast('至少保留 2 个色标', { type: 'warn' }); return; }
  state.stops.splice(+el.dataset.idx, 1);
  state.activeIdx = -1;
  render();
  renderStopList();
  showToast('已删除色标');
});

/* --- 色标列表：直接编辑全部色标 --- */
on(dom.stopList, 'click', (e) => {
  const row = e.target.closest('[data-idx]');
  if (!row) return;
  const idx = +row.dataset.idx;
  if (e.target.closest('[data-stop-remove]')) {
    if (state.stops.length <= 2) { showToast('至少保留 2 个色标', { type: 'warn' }); return; }
    state.stops.splice(idx, 1);
    state.activeIdx = -1;
    render();
    renderStopList();
    showToast('已删除色标');
    return;
  }
  selectStop(idx);
});

on(dom.stopList, 'input', (e) => {
  const row = e.target.closest('[data-idx]');
  if (!row) return;
  const idx = +row.dataset.idx;
  state.activeIdx = idx;

  if (e.target.matches('[data-stop-color]')) {
    $('[data-stop-hex]', row).value = e.target.value;
    updateStopColorFromRow(row);
  } else if (e.target.matches('[data-stop-hex]')) {
    updateStopColorFromRow(row);
  } else if (e.target.matches('[data-stop-pos-text]')) {
    state.stops[idx].position = clampPercent(e.target.value);
    e.target.value = state.stops[idx].position;
  }

  render();
  updateStopListActive();
});

on(dom.stopList, 'change', (e) => {
  const row = e.target.closest('[data-idx]');
  if (!row) return;
  const idx = +row.dataset.idx;
  if (e.target.matches('[data-stop-hex]') && !normalizeHex(e.target.value)) {
    syncStopRow(idx);
    showToast('请输入 6 位 HEX 颜色', { type: 'warn' });
    return;
  }
  if (e.target.matches('[data-stop-pos-text]')) {
    const activeStop = state.stops[idx];
    state.stops.sort((a, b) => a.position - b.position);
    state.activeIdx = state.stops.indexOf(activeStop);
    render();
    renderStopList();
  }
});

on(dom.stopDetail, 'input', (e) => {
  const idx = state.activeIdx;
  if (idx < 0) return;
  const stop = state.stops[idx];
  const parsed = parseGradientColor(stop.color);

  if (e.target.matches('[data-stop-alpha]')) {
    const alpha = +e.target.value / 100;
    stop.color = buildColor(parsed.hex, alpha);
    $('[data-stop-alpha-val]', dom.stopDetail).textContent = `${e.target.value}%`;
    setRange(e.target, e.target.value);
    syncStopRow(idx);
  } else if (e.target.matches('[data-stop-pos]')) {
    stop.position = +e.target.value;
    $('[data-stop-pos-val]', dom.stopDetail).textContent = `${e.target.value}%`;
    setRange(e.target, e.target.value);
    syncStopRow(idx);
  }

  render();
});

on(dom.stopDetail, 'change', (e) => {
  if (!e.target.matches('[data-stop-pos]') || state.activeIdx < 0) return;
  const activeStop = state.stops[state.activeIdx];
  state.stops.sort((a, b) => a.position - b.position);
  state.activeIdx = state.stops.indexOf(activeStop);
  render();
  renderStopList();
});

/* --- 操作按钮 --- */
on($('[data-action="copy-css"]'), 'click', async () => {
  await copyText(buildTextGradientCSS());
  showToast('CSS 已复制');
});

on($('[data-action="copy-gradient"]'), 'click', async () => {
  await copyText(getGradientValue());
  showToast('渐变值已复制');
});

on($('[data-action="reset"]'), 'click', resetAll);

/* --- 精选预设 --- */
buildPresetTabs();
loadPresetCategory(Object.keys(gradients[0])[0]);

on(dom.presetTabs, 'click', (e) => {
  const btn = e.target.closest('[data-preset-cat]');
  if (!btn) return;
  $$('[data-preset-cat]', dom.presetTabs).forEach(b => b.classList.toggle('is-active', b === btn));
  loadPresetCategory(btn.dataset.presetCat);
});

on(dom.presetGrid, 'click', (e) => {
  const card = e.target.closest('[data-gradient]');
  if (!card) return;
  const g = parseCSSGradient(card.dataset.gradient);
  if (!g) return;
  $$('.cg-preset-card', dom.presetGrid).forEach(c => c.classList.remove('is-active'));
  card.classList.add('is-active');
  state.angle = g.angle ?? 90;
  state.stops = g.stops.length >= 2 ? g.stops : DEFAULT_STOPS.map(s => ({ ...s }));
  state.activeIdx = -1;
  dom.dirBtns.forEach(b => b.classList.toggle('is-active', +b.dataset.dir === state.angle));
  setRange(dom.angleInput, state.angle);
  dom.angleVal.textContent = state.angle + '°';
  render();
  renderStopList();
  showToast('已应用预设渐变');
});

// ── 11. 初始渲染 ──────────────────────────────────────────────
setRange(dom.fontSize,      state.fontSize);
setRange(dom.fontWeight,    state.fontWeight);
setRange(dom.letterSpacing, state.letterSpacing);
setRange(dom.angleInput,    state.angle);
renderText();
renderBg();
render();
renderStopList();
