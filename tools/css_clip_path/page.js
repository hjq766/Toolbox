import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

const PRESETS = [
  { id: 'hexagon', name: '六边形', points: [[25, 5], [75, 5], [100, 50], [75, 95], [25, 95], [0, 50]] },
  { id: 'diamond', name: '菱形', points: [[50, 0], [100, 50], [50, 100], [0, 50]] },
  { id: 'bevel', name: '斜切', points: [[12, 0], [100, 0], [88, 100], [0, 100]] },
  { id: 'notch', name: '缺口', points: [[0, 0], [100, 0], [100, 100], [58, 100], [50, 84], [42, 100], [0, 100]] },
  { id: 'arrow', name: '箭头', points: [[0, 18], [70, 18], [70, 0], [100, 50], [70, 100], [70, 82], [0, 82]] },
  { id: 'ticket', name: '票券', points: [[0, 0], [100, 0], [100, 35], [92, 50], [100, 65], [100, 100], [0, 100], [0, 65], [8, 50], [0, 35]] },
  { id: 'chevron', name: '折角', points: [[18, 0], [100, 0], [82, 50], [100, 100], [18, 100], [0, 50]] },
  { id: 'frame', name: '尖角', points: [[12, 0], [88, 0], [100, 12], [100, 88], [88, 100], [12, 100], [0, 88], [0, 12]] },
  { id: 'ribbon', name: '飘带', points: [[0, 0], [100, 0], [88, 50], [100, 100], [0, 100], [12, 50]] },
];

const LABELS = {
  polygon: '多边形',
  circle: '圆形',
  ellipse: '椭圆',
  inset: '内缩',
};

// 后续增强方向：
// 1. 解析粘贴的 clip-path CSS，并还原到 polygon/circle/ellipse/inset 编辑状态。
// 2. 增加 SVG path() 模式，先支持预设曲线路径与代码复制，再考虑控制柄编辑。
const state = {
  type: 'polygon',
  presetId: 'hexagon',
  selectedPoint: 0,
  points: clonePoints(PRESETS[0].points),
  circle: { radius: 42, x: 50, y: 50 },
  ellipse: { rx: 48, ry: 34, x: 50, y: 50 },
  inset: { top: 8, right: 8, bottom: 8, left: 8, radius: 24 },
  demoStyle: 'gradient',
  previewSize: 72,
  dropShadow: true,
};

const dom = {
  canvas: $('[data-canvas]'),
  demoWrap: $('[data-demo-wrap]'),
  demo: $('[data-demo]'),
  lines: $('[data-lines]'),
  handles: $('[data-handles]'),
  presetGrid: $('[data-preset-grid]'),
  pointList: $('[data-point-list]'),
  cssOutput: $('[data-css-output]'),
  htmlOutput: $('[data-html-output]'),
  typeBadge: $('[data-type-badge]'),
  pointCount: $('[data-point-count]'),
  shapeLabel: $('[data-shape-label]'),
  demoStyle: $('[data-demo-style]'),
  previewSize: $('[data-preview-size]'),
  dropShadow: $('[data-drop-shadow]'),
};

function clonePoints(points) {
  return points.map(([x, y]) => ({ x, y }));
}

function clamp(n, min = 0, max = 100) {
  return Math.max(min, Math.min(max, n));
}

function fmt(n) {
  return Number(n.toFixed(1)).toString();
}

function polygonValue(points = state.points) {
  return `polygon(${points.map(p => `${fmt(p.x)}% ${fmt(p.y)}%`).join(', ')})`;
}

function clipValue() {
  if (state.type === 'circle') {
    const c = state.circle;
    return `circle(${c.radius}% at ${c.x}% ${c.y}%)`;
  }
  if (state.type === 'ellipse') {
    const e = state.ellipse;
    return `ellipse(${e.rx}% ${e.ry}% at ${e.x}% ${e.y}%)`;
  }
  if (state.type === 'inset') {
    const i = state.inset;
    return `inset(${i.top}% ${i.right}% ${i.bottom}% ${i.left}% round ${i.radius}px)`;
  }
  return polygonValue();
}

function cssCode() {
  const clip = clipValue();
  const shadow = state.dropShadow
    ? `.clip-wrap {\n  filter: drop-shadow(0 18px 24px var(--clip-shadow, color-mix(in srgb, currentColor 22%, transparent)));\n}\n\n`
    : '';
  return `${shadow}.clip-shape {\n  clip-path: ${clip};\n}`;
}

function htmlCode() {
  if (state.dropShadow) {
    return `<div class="clip-wrap">\n  <div class="clip-shape">Content</div>\n</div>`;
  }
  return `<div class="clip-shape">Content</div>`;
}

function setRangeFill(input) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const val = Number(input.value || 0);
  const pct = ((val - min) / (max - min)) * 100;
  input.style.setProperty('--range-pct', `${pct}%`);
}

function syncInputs() {
  $$('input[type="range"]').forEach(input => setRangeFill(input));
  Object.entries(state.circle).forEach(([key, val]) => {
    const input = $(`[data-circle="${key}"]`);
    const out = $(`[data-val="circle-${key}"]`);
    if (input) input.value = val;
    if (out) out.textContent = `${val}%`;
  });
  Object.entries(state.ellipse).forEach(([key, val]) => {
    const input = $(`[data-ellipse="${key}"]`);
    const out = $(`[data-val="ellipse-${key}"]`);
    if (input) input.value = val;
    if (out) out.textContent = `${val}%`;
  });
  Object.entries(state.inset).forEach(([key, val]) => {
    const input = $(`[data-inset="${key}"]`);
    const out = $(`[data-val="inset-${key}"]`);
    if (input) input.value = val;
    if (out) out.textContent = key === 'radius' ? `${val}px` : `${val}%`;
  });
  dom.previewSize.value = state.previewSize;
  $('[data-val="preview-size"]').textContent = `${state.previewSize}%`;
  setRangeFill(dom.previewSize);
}

function renderPresets() {
  dom.presetGrid.innerHTML = PRESETS.map(preset => `
    <button class="cp-preset ${preset.id === state.presetId ? 'is-active' : ''}" type="button" data-preset="${preset.id}">
      <span class="cp-preset-shape" style="--preset-path:${polygonValue(clonePoints(preset.points))}"></span>
      <span>${preset.name}</span>
    </button>
  `).join('');
}

function renderHandles() {
  dom.handles.innerHTML = '';
  dom.lines.innerHTML = '';
  if (state.type !== 'polygon') return;

  const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
  polygon.setAttribute('points', state.points.map(p => `${p.x},${p.y}`).join(' '));
  dom.lines.appendChild(polygon);

  state.points.forEach((point, idx) => {
    const handle = document.createElement('button');
    handle.type = 'button';
    handle.className = 'cp-handle' + (idx === state.selectedPoint ? ' is-active' : '');
    handle.style.left = `${point.x}%`;
    handle.style.top = `${point.y}%`;
    handle.dataset.point = String(idx);
    handle.setAttribute('aria-label', `控制点 ${idx + 1}`);
    dom.handles.appendChild(handle);
  });
}

function renderPointList() {
  dom.pointList.innerHTML = state.points.map((point, idx) => `
    <div class="cp-point ${idx === state.selectedPoint ? 'is-active' : ''}" data-point-row="${idx}">
      <span class="cp-point-index">${idx + 1}</span>
      <label class="input-group"><input class="input is-center" type="number" min="0" max="100" step="1" value="${fmt(point.x)}" data-point-x="${idx}"><span class="addon">X</span></label>
      <label class="input-group"><input class="input is-center" type="number" min="0" max="100" step="1" value="${fmt(point.y)}" data-point-y="${idx}"><span class="addon">Y</span></label>
    </div>
  `).join('');
}

function render() {
  const clip = clipValue();
  dom.demo.style.setProperty('--cp-path', clip);
  dom.demoWrap.style.setProperty('--cp-size', `${state.previewSize}%`);
  dom.handles.style.setProperty('--cp-size', `${state.previewSize}%`);
  dom.lines.style.setProperty('--cp-size', `${state.previewSize}%`);
  dom.demoWrap.classList.toggle('no-shadow', !state.dropShadow);
  dom.demo.className = `cp-demo is-${state.demoStyle}`;
  dom.typeBadge.textContent = state.type;
  dom.pointCount.textContent = state.type === 'polygon' ? String(state.points.length) : '-';
  dom.shapeLabel.textContent = LABELS[state.type];
  dom.cssOutput.value = cssCode();
  dom.htmlOutput.value = htmlCode();
  $$('[data-type]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.type === state.type));
  $$('[data-panel]').forEach(panel => { panel.hidden = panel.dataset.panel !== state.type; });
  renderPresets();
  renderHandles();
  renderPointList();
  syncInputs();
}

function applyPreset(id) {
  const preset = PRESETS.find(item => item.id === id);
  if (!preset) return;
  state.type = 'polygon';
  state.presetId = id;
  state.points = clonePoints(preset.points);
  state.selectedPoint = 0;
  render();
}

function addPoint() {
  if (state.type !== 'polygon') state.type = 'polygon';
  const idx = state.selectedPoint;
  const a = state.points[idx] || state.points[0];
  const b = state.points[(idx + 1) % state.points.length] || a;
  const next = { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  state.points.splice(idx + 1, 0, next);
  state.selectedPoint = idx + 1;
  state.presetId = '';
  render();
}

function deletePoint() {
  if (state.points.length <= 3) {
    showToast('至少保留 3 个点', { type: 'warn' });
    return;
  }
  state.points.splice(state.selectedPoint, 1);
  state.selectedPoint = Math.max(0, Math.min(state.selectedPoint, state.points.length - 1));
  state.presetId = '';
  render();
}

function centerPoints() {
  const xs = state.points.map(p => p.x);
  const ys = state.points.map(p => p.y);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const dx = 50 - (minX + maxX) / 2;
  const dy = 50 - (minY + maxY) / 2;
  state.points = state.points.map(p => ({ x: clamp(p.x + dx), y: clamp(p.y + dy) }));
  state.presetId = '';
  render();
}

function pointFromEvent(evt) {
  const rect = dom.handles.getBoundingClientRect();
  return {
    x: clamp(((evt.clientX - rect.left) / rect.width) * 100),
    y: clamp(((evt.clientY - rect.top) / rect.height) * 100),
  };
}

function startDrag(idx, evt) {
  evt.preventDefault();
  state.selectedPoint = idx;
  state.presetId = '';
  render();
  const move = (e) => {
    state.points[idx] = pointFromEvent(e);
    render();
  };
  const up = () => {
    document.removeEventListener('pointermove', move);
    document.removeEventListener('pointerup', up);
  };
  document.addEventListener('pointermove', move);
  document.addEventListener('pointerup', up);
}

function bindEvents() {
  on(dom.presetGrid, 'click', (evt) => {
    const btn = evt.target.closest('[data-preset]');
    if (btn) applyPreset(btn.dataset.preset);
  });

  $$('[data-type]').forEach(btn => on(btn, 'click', () => {
    state.type = btn.dataset.type;
    render();
  }));

  on(dom.handles, 'pointerdown', (evt) => {
    const handle = evt.target.closest('[data-point]');
    if (handle) startDrag(Number(handle.dataset.point), evt);
  });

  on(dom.pointList, 'change', (evt) => {
    const xInput = evt.target.closest('[data-point-x]');
    const yInput = evt.target.closest('[data-point-y]');
    if (!xInput && !yInput) return;
    const idx = Number((xInput || yInput).dataset.pointX ?? (xInput || yInput).dataset.pointY);
    state.selectedPoint = idx;
    if (xInput) state.points[idx].x = clamp(Number(xInput.value) || 0);
    if (yInput) state.points[idx].y = clamp(Number(yInput.value) || 0);
    state.presetId = '';
    render();
  });

  on(dom.pointList, 'click', (evt) => {
    const row = evt.target.closest('[data-point-row]');
    if (!row) return;
    state.selectedPoint = Number(row.dataset.pointRow);
    render();
  });

  on($('[data-action="add-point"]'), 'click', addPoint);
  on($('[data-action="delete-point"]'), 'click', deletePoint);
  on($('[data-action="center-points"]'), 'click', centerPoints);
  on($('[data-action="reset-polygon"]'), 'click', () => applyPreset(state.presetId || 'hexagon'));

  $$('[data-circle]').forEach(input => on(input, 'input', () => {
    state.circle[input.dataset.circle] = Number(input.value);
    render();
  }));
  $$('[data-ellipse]').forEach(input => on(input, 'input', () => {
    state.ellipse[input.dataset.ellipse] = Number(input.value);
    render();
  }));
  $$('[data-inset]').forEach(input => on(input, 'input', () => {
    state.inset[input.dataset.inset] = Number(input.value);
    render();
  }));

  on(dom.demoStyle, 'change', () => {
    state.demoStyle = dom.demoStyle.value;
    render();
  });
  on(dom.previewSize, 'input', () => {
    state.previewSize = Number(dom.previewSize.value);
    render();
  });
  on(dom.dropShadow, 'change', () => {
    state.dropShadow = dom.dropShadow.checked;
    render();
  });

  on($('[data-action="copy-css"]'), 'click', async () => {
    const ok = await copyText(dom.cssOutput.value);
    showToast(ok ? 'CSS 已复制' : '复制失败', { type: ok ? 'success' : 'error' });
  });
  on($('[data-action="copy-html"]'), 'click', async () => {
    const ok = await copyText(dom.htmlOutput.value);
    showToast(ok ? 'HTML 已复制' : '复制失败', { type: ok ? 'success' : 'error' });
  });
}

bindEvents();
render();
