/* ============================================================
   CSS 渐变生成器 — page.js
   ============================================================ */

// ── 0. 导入 ──────────────────────────────────────────────────
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on }       from '../../public/scripts/utils/dom.js';
import { copyText }         from '../../public/scripts/utils/clipboard.js';
import { showToast }        from '../../public/scripts/components/toast.js';
import { gradients, categoryNames } from '../color_gradient/gradients.js';

// ── 1. 常量 / 配置 ──────────────────────────────────────────
const DEFAULT_STOPS = [
  { color: '#ff0000', position: 0 },
  { color: '#0000ff', position: 100 },
];

const ANGLE_MAP = {
  0: 'to top', 45: 'to top right', 90: 'to right', 135: 'to bottom right',
  180: 'to bottom', 225: 'to bottom left', 270: 'to left', 315: 'to top left',
};

// ── 2. 状态 ──────────────────────────────────────────────────
const state = {
  type: 'linear',
  angle: 90,
  shape: 'circle',
  radialSize: 100,
  posX: 50,
  posY: 50,
  repeating: false,
  repeatCount: 4,
  stops: DEFAULT_STOPS.map(s => ({ ...s })),
  activeIdx: -1,           // 当前选中色标索引
  isDragging: false,
};

// ── 3. DOM 引用 ──────────────────────────────────────────────
const dom = {
  preview:       $('[data-preview]'),
  bar:           $('[data-bar]'),
  stopsWrap:     $('[data-stops]'),
  cssOut:        $('[data-css-out]'),
  // sidebar
  typeTabs:      $$('[data-type]'),
  repeatCb:      $('[data-repeat]'),
  linearPanel:   $('[data-linear-settings]'),
  radialPanel:   $('[data-radial-settings]'),
  repeatPanel:   $('[data-repeat-settings]'),
  dirBtns:       $$('[data-dir]'),
  angleInput:    $('[data-angle]'),
  angleVal:      $('[data-angle-val]'),
  shapeTabs:     $$('[data-shape]'),
  radialSize:    $('[data-radial-size]'),
  radialSizeVal: $('[data-radial-size-val]'),
  posX:          $('[data-pos-x]'),
  posXVal:       $('[data-pos-x-val]'),
  posY:          $('[data-pos-y]'),
  posYVal:       $('[data-pos-y-val]'),
  repeatCount:   $('[data-repeat-count]'),
  repeatVal:     $('[data-repeat-val]'),
  // stop editor
  editorPanel:   $('[data-stop-editor]'),
  stopColor:     $('[data-stop-color]'),
  stopHex:       $('[data-stop-hex]'),
  stopAlpha:     $('[data-stop-alpha]'),
  stopAlphaVal:  $('[data-stop-alpha-val]'),
  stopPos:       $('[data-stop-pos]'),
  stopPosVal:    $('[data-stop-pos-val]'),
  // presets
  presetTabs:    $('[data-preset-tabs]'),
  presetGrid:    $('[data-preset-grid]'),
};

// ── 4. 工具函数 ──────────────────────────────────────────────

/* ---------- 渐变 CSS 生成 ---------- */
function buildGradientCSS() {
  const { type, angle, shape, radialSize, posX, posY, repeating, repeatCount, stops } = state;
  const stopsStr = stops.map(s => `${s.color} ${s.position}%`).join(', ');

  if (type === 'linear') {
    if (repeating) {
      const adj = stops.map(s => `${s.color} ${(s.position / repeatCount).toFixed(1)}%`).join(', ');
      return `repeating-linear-gradient(${angle}deg, ${adj})`;
    }
    return `linear-gradient(${angle}deg, ${stopsStr})`;
  }

  if (type === 'radial') {
    const pos = `at ${posX}% ${posY}%`;
    if (repeating) {
      if (shape === 'circle') {
        const pw = dom.preview.offsetWidth, ph = dom.preview.offsetHeight;
        const px = (radialSize / 100) * (Math.min(pw, ph) / repeatCount);
        return `repeating-radial-gradient(circle ${px}px ${pos}, ${stopsStr})`;
      }
      const sz = (radialSize / repeatCount).toFixed(1);
      return `repeating-radial-gradient(ellipse ${sz}% ${sz}% ${pos}, ${stopsStr})`;
    }
    if (shape === 'circle') {
      const pw = dom.preview.offsetWidth, ph = dom.preview.offsetHeight;
      const px = (radialSize / 100) * Math.min(pw, ph);
      return `radial-gradient(circle ${px}px ${pos}, ${stopsStr})`;
    }
    return `radial-gradient(ellipse ${radialSize}% ${radialSize}% ${pos}, ${stopsStr})`;
  }

  // conic
  if (repeating) {
    const adj = stops.map(s => {
      const deg = (s.position * 360 / 100 / repeatCount).toFixed(1);
      return `${s.color} ${deg}deg`;
    }).join(', ');
    return `repeating-conic-gradient(from ${angle}deg at center, ${adj})`;
  }
  return `conic-gradient(from ${angle}deg at center, ${stopsStr})`;
}

/* ---------- 渲染 ---------- */
function render() {
  const css = buildGradientCSS();
  dom.preview.style.backgroundImage = css;
  dom.bar.style.backgroundImage = css;
  dom.cssOut.textContent = `background-image: ${css};`;
  renderStops();
  updateSVGButtonState();
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

/* ---------- 色标拖拽 ---------- */
function initStopDrag(stopEl, idx, evt) {
  const barRect = dom.bar.getBoundingClientRect();
  const startX = evt.clientX;
  const startPos = state.stops[idx].position;
  let moved = false;
  const dragRef = state.stops[idx];

  const onMove = (e) => {
    moved = true;
    state.isDragging = true;
    const dx = e.clientX - startX;
    let newPos = startPos + (dx / barRect.width) * 100;
    newPos = Math.max(0, Math.min(100, Math.round(newPos)));
    const overlap = state.stops.some((s, j) => j !== idx && Math.abs(s.position - newPos) < 2);
    if (overlap) return;
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
      syncStopEditor();
    }
    setTimeout(() => { state.isDragging = false; }, 0);
  };

  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

/* ---------- 色标编辑器 ---------- */
function selectStop(idx) {
  state.activeIdx = idx;
  renderStops();
  syncStopEditor();
}

function syncStopEditor() {
  const idx = state.activeIdx;
  if (idx < 0 || idx >= state.stops.length) {
    dom.editorPanel.hidden = true;
    return;
  }
  dom.editorPanel.hidden = false;
  const stop = state.stops[idx];
  const parsed = parseColor(stop.color);
  dom.stopColor.value = parsed.hex;
  dom.stopHex.value = parsed.hex;
  setRange(dom.stopAlpha, Math.round(parsed.alpha * 100));
  dom.stopAlphaVal.textContent = Math.round(parsed.alpha * 100) + '%';
  setRange(dom.stopPos, stop.position);
  dom.stopPosVal.textContent = stop.position + '%';
}

function parseColor(c) {
  if (c.startsWith('rgba')) {
    const m = c.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (m) {
      const hex = '#' + [m[1], m[2], m[3]].map(v => (+v).toString(16).padStart(2, '0')).join('');
      return { hex, alpha: +m[4] };
    }
  }
  if (c.startsWith('rgb')) {
    const m = c.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (m) {
      const hex = '#' + [m[1], m[2], m[3]].map(v => (+v).toString(16).padStart(2, '0')).join('');
      return { hex, alpha: 1 };
    }
  }
  return { hex: c.length === 7 ? c : c.padEnd(7, '0'), alpha: 1 };
}

function buildColorFromEditor() {
  const hex = dom.stopColor.value;
  const alpha = dom.stopAlpha.value / 100;
  if (alpha >= 1) return hex;
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/* ---------- range 赋值（同步轨道填充色） ---------- */
function setRange(el, v) {
  el.value = v;
  const min = parseFloat(el.min) || 0;
  const max = parseFloat(el.max) || 100;
  el.style.setProperty('--range-pct', ((v - min) / (max - min) * 100) + '%');
}

/* ---------- UI ↔ 状态同步 ---------- */
function syncUIToState() {
  // type tabs
  dom.typeTabs.forEach(b => b.classList.toggle('is-active', b.dataset.type === state.type));
  // panels
  dom.linearPanel.hidden  = state.type === 'radial';
  dom.radialPanel.hidden  = state.type !== 'radial';
  dom.repeatPanel.hidden  = !state.repeating;
  // repeat checkbox
  dom.repeatCb.checked = state.repeating;
  // direction
  dom.dirBtns.forEach(b => b.classList.toggle('is-active', +b.dataset.dir === state.angle));
  setRange(dom.angleInput, state.angle);
  dom.angleVal.textContent = state.angle + '°';
  // shape
  dom.shapeTabs.forEach(b => b.classList.toggle('is-active', b.dataset.shape === state.shape));
  // radial sliders
  setRange(dom.radialSize, state.radialSize);
  dom.radialSizeVal.textContent = state.radialSize + '%';
  setRange(dom.posX, state.posX);
  dom.posXVal.textContent = state.posX + '%';
  setRange(dom.posY, state.posY);
  dom.posYVal.textContent = state.posY + '%';
  // repeat
  setRange(dom.repeatCount, state.repeatCount);
  dom.repeatVal.textContent = state.repeatCount;
}

/* ---------- CSS 解析 ---------- */
function parseCSSGradient(cssText) {
  if (!cssText) return null;
  cssText = cssText.trim()
    .replace(/^background(?:-image)?:\s*/, '')
    .replace(/;$/, '')
    .replace(/\s+/g, ' ');

  const m = cssText.match(/^(repeating-)?(linear|radial|conic)-gradient\((.*)\)$/);
  if (!m) return null;

  const result = {
    type: m[2],
    repeating: !!m[1],
    angle: 90, shape: 'circle', size: 100, posX: 50, posY: 50, stops: [],
  };
  let content = m[3].trim();

  if (result.type === 'linear') {
    const dirMatch = content.match(/^to\s+(top|bottom|left|right)(?:\s+(left|right))?/);
    if (dirMatch) {
      const d = dirMatch[0];
      const map = { 'to right': 90, 'to left': 270, 'to bottom': 180, 'to top': 0,
        'to bottom right': 135, 'to bottom left': 225, 'to top right': 45, 'to top left': 315 };
      result.angle = map[d] ?? 90;
      content = content.slice(dirMatch[0].length).replace(/^,\s*/, '');
    } else {
      const aMatch = content.match(/^(-?[\d.]+)deg/);
      if (aMatch) {
        result.angle = ((parseFloat(aMatch[1]) % 360) + 360) % 360;
        content = content.slice(aMatch[0].length).replace(/^,\s*/, '');
      }
    }
  } else if (result.type === 'radial') {
    const rm = content.match(/^(?:(circle|ellipse))?\s*(?:([\d.]+)(?:px|%))?\s*(?:at\s+([\d.]+%)\s+([\d.]+%))?,?\s*(.+)$/);
    if (rm) {
      if (rm[1]) result.shape = rm[1];
      if (rm[2]) result.size = parseFloat(rm[2]);
      if (rm[3]) result.posX = parseFloat(rm[3]);
      if (rm[4]) result.posY = parseFloat(rm[4]);
      content = rm[5] || content;
    }
  } else if (result.type === 'conic') {
    const cm = content.match(/^from\s+([\d.]+)deg(?:\s+at\s+\S+)?,?\s*(.+)$/);
    if (cm) {
      result.angle = parseFloat(cm[1]);
      content = cm[2];
    }
  }

  result.stops = parseColorStops(content);
  return result;
}

function parseColorStops(text) {
  if (!text) return [];
  return text.split(/\s*,\s*/).filter(Boolean).map((chunk, i, arr) => {
    const m = chunk.match(/^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-zA-Z]+)(?:\s+(-?[\d.]+)(?:%|deg)?)?/);
    if (!m) return null;
    const position = m[2] !== undefined
      ? parseFloat(m[2])
      : (i === 0 ? 0 : i === arr.length - 1 ? 100 : Math.round((i / (arr.length - 1)) * 100));
    return { color: m[1], position };
  }).filter(Boolean);
}

function applyParsedGradient(g) {
  state.type = g.type;
  state.repeating = g.repeating;
  state.angle = g.angle;
  state.shape = g.shape;
  state.radialSize = g.size;
  state.posX = g.posX;
  state.posY = g.posY;
  state.stops = g.stops.length >= 2 ? g.stops : DEFAULT_STOPS.map(s => ({ ...s }));
  state.activeIdx = -1;
  syncUIToState();
  render();
}

/* ---------- SVG 生成 ---------- */
function generateSVG() {
  const { type, angle, shape, radialSize, posX, posY, stops, repeating } = state;
  if (type === 'conic' || repeating) return null;

  const id = 'g-' + Math.random().toString(36).slice(2, 9);
  let stopsXML = '';
  stops.forEach(s => {
    const p = parseColor(s.color);
    const a = p.alpha;
    stopsXML += `    <stop offset="${(s.position / 100).toFixed(3)}" stop-color="${p.hex}" stop-opacity="${a}"/>\n`;
  });

  let gradEl;
  if (type === 'linear') {
    const rad = (angle - 90) * Math.PI / 180;
    const cos = Math.cos(rad), sin = Math.sin(rad);
    const x1 = (0.5 - cos * 0.5).toFixed(3), y1 = (0.5 - sin * 0.5).toFixed(3);
    const x2 = (0.5 + cos * 0.5).toFixed(3), y2 = (0.5 + sin * 0.5).toFixed(3);
    gradEl = `  <linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">\n${stopsXML}  </linearGradient>`;
  } else {
    const cx = (posX / 100).toFixed(3), cy = (posY / 100).toFixed(3);
    const r = (radialSize / 100).toFixed(3);
    const extra = shape === 'ellipse' ? ' gradientTransform="scale(1,0.6)"' : '';
    gradEl = `  <radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${extra}>\n${stopsXML}  </radialGradient>`;
  }

  return `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">\n  <defs>\n${gradEl}\n  </defs>\n  <rect width="400" height="400" fill="url(#${id})"/>\n</svg>`;
}

function updateSVGButtonState() {
  const btn = $('[data-action="copy-svg"]');
  if (!btn) return;
  const disabled = state.type === 'conic' || state.repeating;
  btn.disabled = disabled;
  btn.title = disabled
    ? (state.type === 'conic' ? 'SVG 不支持锥形渐变' : 'SVG 不支持重复渐变')
    : '复制 SVG 渐变代码';
}

/* ---------- 精选渐变 ---------- */
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
    card.className = 'cg-preset-card';
    card.style.background = css;
    card.dataset.gradient = css;

    const label = document.createElement('div');
    label.className = 'cg-preset-name';
    label.textContent = name;
    card.appendChild(label);

    dom.presetGrid.appendChild(card);
  });
}

/* ---------- 重置 ---------- */
function resetAll() {
  state.type = 'linear';
  state.angle = 90;
  state.shape = 'circle';
  state.radialSize = 100;
  state.posX = 50;
  state.posY = 50;
  state.repeating = false;
  state.repeatCount = 4;
  state.stops = DEFAULT_STOPS.map(s => ({ ...s }));
  state.activeIdx = -1;
  syncUIToState();
  render();
  dom.editorPanel.hidden = true;
  showToast('已重置');
}

// ── 5. 事件绑定 + 初始化 ────────────────────────────────────
mountToolHeader();

/* --- 渐变类型 --- */
dom.typeTabs.forEach(btn => on(btn, 'click', () => {
  state.type = btn.dataset.type;
  syncUIToState();
  render();
}));

/* --- 重复 --- */
on(dom.repeatCb, 'change', () => {
  state.repeating = dom.repeatCb.checked;
  syncUIToState();
  render();
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

/* --- 形状 --- */
dom.shapeTabs.forEach(btn => on(btn, 'click', () => {
  state.shape = btn.dataset.shape;
  dom.shapeTabs.forEach(b => b.classList.toggle('is-active', b === btn));
  render();
}));

/* --- 径向滑块 --- */
on(dom.radialSize, 'input', () => {
  state.radialSize = +dom.radialSize.value;
  dom.radialSizeVal.textContent = state.radialSize + '%';
  render();
});
on(dom.posX, 'input', () => {
  state.posX = +dom.posX.value;
  dom.posXVal.textContent = state.posX + '%';
  render();
});
on(dom.posY, 'input', () => {
  state.posY = +dom.posY.value;
  dom.posYVal.textContent = state.posY + '%';
  render();
});

/* --- 重复次数 --- */
on(dom.repeatCount, 'input', () => {
  state.repeatCount = +dom.repeatCount.value;
  dom.repeatVal.textContent = state.repeatCount;
  render();
});

/* --- 色标：点击渐变条添加 --- */
on(dom.bar, 'click', (e) => {
  if (state.isDragging) return;
  if (e.target !== dom.bar) return;
  const rect = dom.bar.getBoundingClientRect();
  const pos = Math.round(((e.clientX - rect.left) / rect.width) * 100);
  if (state.stops.some(s => Math.abs(s.position - pos) < 2)) return;
  const idx = state.stops.findIndex(s => s.position > pos);
  const newStop = { color: '#ffffff', position: pos };
  if (idx === -1) state.stops.push(newStop);
  else state.stops.splice(idx, 0, newStop);
  state.activeIdx = state.stops.indexOf(newStop);
  render();
  syncStopEditor();
});

/* --- 色标：点击选中 + 拖拽 + 右键删除 --- */
on(dom.stopsWrap, 'mousedown', (e) => {
  const el = e.target.closest('[data-idx]');
  if (!el) return;
  e.preventDefault();
  const idx = +el.dataset.idx;
  selectStop(idx);
  initStopDrag(el, idx, e);
});

on(dom.stopsWrap, 'contextmenu', (e) => {
  const el = e.target.closest('[data-idx]');
  if (!el) return;
  e.preventDefault();
  const idx = +el.dataset.idx;
  if (state.stops.length <= 2) { showToast('至少保留 2 个色标', { type: 'warn' }); return; }
  state.stops.splice(idx, 1);
  state.activeIdx = -1;
  dom.editorPanel.hidden = true;
  render();
  showToast('已删除色标');
});

/* --- 色标编辑器 --- */
on(dom.stopColor, 'input', () => {
  if (state.activeIdx < 0) return;
  dom.stopHex.value = dom.stopColor.value;
  state.stops[state.activeIdx].color = buildColorFromEditor();
  render();
});
on(dom.stopHex, 'change', () => {
  if (state.activeIdx < 0) return;
  let v = dom.stopHex.value.trim();
  if (!v.startsWith('#')) v = '#' + v;
  dom.stopColor.value = v.slice(0, 7);
  state.stops[state.activeIdx].color = buildColorFromEditor();
  render();
});
on(dom.stopAlpha, 'input', () => {
  if (state.activeIdx < 0) return;
  dom.stopAlphaVal.textContent = dom.stopAlpha.value + '%';
  state.stops[state.activeIdx].color = buildColorFromEditor();
  render();
});
on(dom.stopPos, 'input', () => {
  if (state.activeIdx < 0) return;
  const pos = +dom.stopPos.value;
  dom.stopPosVal.textContent = pos + '%';
  state.stops[state.activeIdx].position = pos;
  render();
});

/* --- 操作按钮 --- */
on($('[data-action="copy-css"]'), 'click', async () => {
  const text = dom.cssOut.textContent;
  if (!text) return;
  await copyText(text);
  showToast('CSS 已复制');
});

on($('[data-action="copy-svg"]'), 'click', async () => {
  const svg = generateSVG();
  if (!svg) {
    showToast(state.type === 'conic' ? 'SVG 不支持锥形渐变' : 'SVG 不支持重复渐变', { type: 'warn' });
    return;
  }
  await copyText(svg);
  showToast('SVG 已复制');
});

on($('[data-action="paste-css"]'), 'click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    const g = parseCSSGradient(text);
    if (!g) { showToast('无效的渐变 CSS', { type: 'warn' }); return; }
    applyParsedGradient(g);
    showToast('已应用粘贴的渐变');
  } catch { showToast('无法读取剪贴板', { type: 'warn' }); }
});

on($('[data-action="reset"]'), 'click', resetAll);

/* --- CSS 输出区：直接粘贴 --- */
on(dom.cssOut, 'paste', (e) => {
  e.preventDefault();
  const text = e.clipboardData.getData('text');
  const g = parseCSSGradient(text);
  if (!g) { showToast('无效的渐变 CSS', { type: 'warn' }); return; }
  applyParsedGradient(g);
  showToast('已应用粘贴的渐变');
});

/* --- 精选渐变 --- */
buildPresetTabs();
const firstCat = Object.keys(gradients[0])[0];
loadPresetCategory(firstCat);

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
  applyParsedGradient(g);
  showToast('已应用预设渐变');
});

/* --- 初始渲染 --- */
syncUIToState();
render();
