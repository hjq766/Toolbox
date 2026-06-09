import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

const DIRECTIONS = {
  up: { label: '向上', opposite: 'down' },
  right: { label: '向右', opposite: 'left' },
  down: { label: '向下', opposite: 'up' },
  left: { label: '向左', opposite: 'right' },
  'top-left': { label: '左上', opposite: 'bottom-right' },
  'top-right': { label: '右上', opposite: 'bottom-left' },
  'bottom-right': { label: '右下', opposite: 'top-left' },
  'bottom-left': { label: '左下', opposite: 'top-right' },
};

const MODE_HINTS = {
  border: '经典零宽高写法，最适合 tooltip、小箭头和气泡指示器。',
  clip: '现代有尺寸写法，适合更大的装饰形状、响应式组件和背景块。',
};

const EXAMPLE_TIPS = {
  shape: '复制独立 `.triangle` 即可放入页面。',
  tooltip: '适合放进 tooltip、popover 或气泡组件，常用 ::after 承载三角。',
  corner: '适合卡片角标、状态标记和装饰性切角。',
};

const state = {
  mode: 'border',
  direction: 'up',
  width: 96,
  height: 72,
  radius: 0,
  color: 'var(--color-brand)',
  example: 'shape',
};

const dom = {
  preview: $('[data-preview]'),
  tooltip: $('[data-tooltip]'),
  modeBadge: $('[data-mode-badge]'),
  modeHint: $('[data-mode-hint]'),
  cssOutput: $('[data-css-output]'),
  htmlOutput: $('[data-html-output]'),
  widthStat: $('[data-width-stat]'),
  heightStat: $('[data-height-stat]'),
  roundField: $('[data-round-field]'),
  exampleTip: $('[data-example-tip]'),
};

function setRangeFill(input) {
  const min = Number(input.min || 0);
  const max = Number(input.max || 100);
  const val = Number(input.value || 0);
  input.style.setProperty('--range-pct', `${((val - min) / (max - min)) * 100}%`);
}

function px(value) {
  return `${Math.round(value)}px`;
}

function half(value) {
  return Math.round(value / 2);
}

function trianglePolygon(direction) {
  const map = {
    up: '50% 0%, 100% 100%, 0% 100%',
    right: '100% 50%, 0% 0%, 0% 100%',
    down: '0% 0%, 100% 0%, 50% 100%',
    left: '0% 50%, 100% 0%, 100% 100%',
    'top-left': '0% 0%, 100% 0%, 0% 100%',
    'top-right': '0% 0%, 100% 0%, 100% 100%',
    'bottom-right': '100% 0%, 100% 100%, 0% 100%',
    'bottom-left': '0% 0%, 100% 100%, 0% 100%',
  };
  return map[direction] || map.up;
}

function borderDeclarations(selector = '.triangle') {
  const { direction, width, height, color } = state;
  const w = Math.round(width);
  const h = Math.round(height);
  const hw = half(width);
  const hh = half(height);
  const lines = [
    `${selector} {`,
    '  width: 0;',
    '  height: 0;',
  ];

  const add = (prop, value) => lines.push(`  ${prop}: ${value};`);
  if (direction === 'up') {
    add('border-left', `${px(hw)} solid transparent`);
    add('border-right', `${px(hw)} solid transparent`);
    add('border-bottom', `${px(h)} solid ${color}`);
  } else if (direction === 'down') {
    add('border-left', `${px(hw)} solid transparent`);
    add('border-right', `${px(hw)} solid transparent`);
    add('border-top', `${px(h)} solid ${color}`);
  } else if (direction === 'left') {
    add('border-top', `${px(hh)} solid transparent`);
    add('border-bottom', `${px(hh)} solid transparent`);
    add('border-right', `${px(w)} solid ${color}`);
  } else if (direction === 'right') {
    add('border-top', `${px(hh)} solid transparent`);
    add('border-bottom', `${px(hh)} solid transparent`);
    add('border-left', `${px(w)} solid ${color}`);
  } else if (direction === 'top-left') {
    add('border-top', `${px(h)} solid ${color}`);
    add('border-right', `${px(w)} solid transparent`);
  } else if (direction === 'top-right') {
    add('border-top', `${px(h)} solid ${color}`);
    add('border-left', `${px(w)} solid transparent`);
  } else if (direction === 'bottom-right') {
    add('border-bottom', `${px(h)} solid ${color}`);
    add('border-left', `${px(w)} solid transparent`);
  } else if (direction === 'bottom-left') {
    add('border-bottom', `${px(h)} solid ${color}`);
    add('border-right', `${px(w)} solid transparent`);
  }
  lines.push('}');
  return lines.join('\n');
}

function clipDeclarations(selector = '.triangle') {
  const { direction, width, height, color, radius } = state;
  const lines = [
    `${selector} {`,
    `  width: ${px(width)};`,
    `  height: ${px(height)};`,
    `  background: ${color};`,
    `  clip-path: polygon(${trianglePolygon(direction)});`,
  ];
  if (radius > 0) {
    lines.push(`  border-radius: ${px(radius)};`);
    lines.push('  overflow: hidden;');
  }
  lines.push('}');
  return lines.join('\n');
}

function tooltipCss() {
  if (state.mode === 'border') {
    return `.tooltip::after {\n  content: "";\n  position: absolute;\n  left: 50%;\n  bottom: -${px(state.height)};\n  transform: translateX(-50%);\n${borderDeclarations('').split('\n').slice(3, -1).map(line => `  ${line.trim()}`).join('\n')}\n}`;
  }
  return `.tooltip::after {\n  content: "";\n  position: absolute;\n  left: 50%;\n  bottom: -${px(state.height)};\n  transform: translateX(-50%);\n${clipDeclarations('').split('\n').slice(1, -1).map(line => `  ${line.trim()}`).join('\n')}\n}`;
}

function cssCode() {
  if (state.example === 'tooltip') return tooltipCss();
  if (state.mode === 'border') return borderDeclarations();
  return clipDeclarations();
}

function htmlCode() {
  if (state.example === 'tooltip') return '<div class="tooltip">Tooltip content</div>';
  if (state.example === 'corner') return '<div class="card">\n  <i class="triangle" aria-hidden="true"></i>\n</div>';
  return '<i class="triangle" aria-hidden="true"></i>';
}

function borderStyleObject() {
  const { direction, width, height, color } = state;
  const w = Math.round(width);
  const h = Math.round(height);
  const hw = half(width);
  const hh = half(height);
  const style = {
    width: '0',
    height: '0',
    background: 'transparent',
    clipPath: 'none',
    border: '0 solid transparent',
  };
  if (direction === 'up') {
    style.borderLeft = `${px(hw)} solid transparent`;
    style.borderRight = `${px(hw)} solid transparent`;
    style.borderBottom = `${px(h)} solid ${color}`;
  } else if (direction === 'down') {
    style.borderLeft = `${px(hw)} solid transparent`;
    style.borderRight = `${px(hw)} solid transparent`;
    style.borderTop = `${px(h)} solid ${color}`;
  } else if (direction === 'left') {
    style.borderTop = `${px(hh)} solid transparent`;
    style.borderBottom = `${px(hh)} solid transparent`;
    style.borderRight = `${px(w)} solid ${color}`;
  } else if (direction === 'right') {
    style.borderTop = `${px(hh)} solid transparent`;
    style.borderBottom = `${px(hh)} solid transparent`;
    style.borderLeft = `${px(w)} solid ${color}`;
  } else if (direction === 'top-left') {
    style.borderTop = `${px(h)} solid ${color}`;
    style.borderRight = `${px(w)} solid transparent`;
  } else if (direction === 'top-right') {
    style.borderTop = `${px(h)} solid ${color}`;
    style.borderLeft = `${px(w)} solid transparent`;
  } else if (direction === 'bottom-right') {
    style.borderBottom = `${px(h)} solid ${color}`;
    style.borderLeft = `${px(w)} solid transparent`;
  } else if (direction === 'bottom-left') {
    style.borderBottom = `${px(h)} solid ${color}`;
    style.borderRight = `${px(w)} solid transparent`;
  }
  return style;
}

function clipStyleObject() {
  return {
    width: px(state.width),
    height: px(state.height),
    border: '0',
    background: state.color,
    clipPath: `polygon(${trianglePolygon(state.direction)})`,
    borderRadius: state.radius ? px(state.radius) : '0',
  };
}

function renderPreview() {
  const triangle = document.createElement('i');
  Object.assign(triangle.style, state.mode === 'border' ? borderStyleObject() : clipStyleObject());
  dom.preview.innerHTML = '';
  dom.preview.appendChild(triangle);
  dom.tooltip.classList.toggle('is-visible', state.example === 'tooltip');
  $$('[data-dir]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.dir === state.direction));
  $$('[data-mode]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.mode === state.mode));
  $$('[data-example]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.example === state.example));
  dom.modeBadge.textContent = state.mode;
  dom.modeHint.textContent = MODE_HINTS[state.mode];
  dom.exampleTip.textContent = EXAMPLE_TIPS[state.example];
  dom.roundField.hidden = state.mode !== 'clip';
}

function render() {
  $('[data-val="width"]').textContent = px(state.width);
  $('[data-val="height"]').textContent = px(state.height);
  $('[data-val="radius"]').textContent = px(state.radius);
  dom.widthStat.textContent = px(state.width);
  dom.heightStat.textContent = px(state.height);
  dom.cssOutput.value = cssCode();
  dom.htmlOutput.value = htmlCode();
  $$('input[type="range"]').forEach(setRangeFill);
  renderPreview();
}

function bindEvents() {
  $$('[data-mode]').forEach(btn => on(btn, 'click', () => {
    state.mode = btn.dataset.mode;
    render();
  }));
  $$('[data-dir]').forEach(btn => on(btn, 'click', () => {
    state.direction = btn.dataset.dir;
    render();
  }));
  $$('[data-example]').forEach(btn => on(btn, 'click', () => {
    state.example = btn.dataset.example;
    render();
  }));

  on($('[data-action="flip"]'), 'click', () => {
    state.direction = DIRECTIONS[state.direction].opposite;
    render();
  });

  $$('[data-input]').forEach(input => on(input, 'input', () => {
    const key = input.dataset.input;
    state[key] = input.type === 'range' ? Number(input.value) : input.value.trim() || 'currentColor';
    render();
  }));

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
