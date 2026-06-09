import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on, debounce } from '../../public/scripts/utils/dom.js';
import { hexToRgb, relativeLuminance } from '../../public/scripts/utils/color.js';
import { gradients, categoryNames } from './gradients.js';
import { mountBrowseTabs } from '../_shared/browse-tabs.js';

const DRAW_SIZE = 32;
const TOTAL = gradients.flatMap(g => Object.values(g)[0]).length;

/** 从渐变 CSS 提取色值，按平均亮度判断是否为浅色底 */
function gradientIsLight(css) {
  const matches = [...css.matchAll(/#([0-9a-fA-F]{3,8})\b/gi)];
  if (!matches.length) return false;
  let sum = 0;
  for (const m of matches) {
    let h = m[1];
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const { r, g, b } = hexToRgb('#' + h.slice(0, 6));
    sum += relativeLuminance(r, g, b);
  }
  return sum / matches.length > 0.58;
}

/** 分层随机抽样：每类至少 2 张，避免抽卡结果扎堆同一风格 */
function pickRandomDraw(pool, size = DRAW_SIZE) {
  const byCat = {};
  for (const item of pool) (byCat[item.category] ||= []).push(item);

  const picked = [];
  const pickedSet = new Set();
  const cats = Object.keys(byCat).sort(() => Math.random() - 0.5);
  const perCat = Math.max(2, Math.floor(size / cats.length));

  for (const cat of cats) {
    const arr = [...byCat[cat]].sort(() => Math.random() - 0.5);
    for (const item of arr.slice(0, perCat)) {
      if (!pickedSet.has(item.name)) {
        picked.push(item);
        pickedSet.add(item.name);
      }
    }
  }

  const rest = pool.filter(item => !pickedSet.has(item.name));
  while (picked.length < size && rest.length) {
    const i = Math.floor(Math.random() * rest.length);
    const [item] = rest.splice(i, 1);
    picked.push(item);
    pickedSet.add(item.name);
  }

  return picked.sort(() => Math.random() - 0.5).slice(0, size);
}

mountToolHeader();

const flatGradients = gradients.flatMap(group => {
  const category = Object.keys(group)[0];
  return group[category].map(([name, code]) => ({ name, code, category }));
});

const state = { category: 'all', query: '', drawPool: pickRandomDraw(flatGradients) };
const gridEl = $('[data-grid]');
const tabsEl = $('[data-tabs]');
const countEl = $('[data-count]');
const searchEl = $('[data-search]');
const reshuffleBtn = $('[data-action="reshuffle"]');

function isDrawMode() {
  return state.category === 'all' && !state.query.trim();
}

mountBrowseTabs(tabsEl, {
  items: () => [
    { id: 'all', label: categoryNames.all },
    ...gradients.map(group => {
      const id = Object.keys(group)[0];
      return { id, label: categoryNames[id] };
    }),
  ],
  getActive: () => state.category,
  onSelect: id => {
    state.category = id;
    render();
  },
});

function getVisibleGradients() {
  const query = state.query.trim().toLowerCase();
  if (query) {
    return flatGradients.filter(item =>
      item.name.toLowerCase().includes(query)
      || categoryNames[item.category].includes(query)
      || item.code.toLowerCase().includes(query)
    );
  }
  if (state.category === 'all') return state.drawPool;
  return flatGradients.filter(item => item.category === state.category);
}

function updateMeta(count) {
  if (state.query.trim()) {
    countEl.textContent = `找到 ${count} 个 · 库内共 ${TOTAL}`;
    reshuffleBtn.hidden = true;
    return;
  }
  if (state.category === 'all') {
    countEl.textContent = `本次 ${count} 个 · 库内共 ${TOTAL}`;
    reshuffleBtn.hidden = false;
    return;
  }
  countEl.textContent = `共 ${count} 个渐变`;
  reshuffleBtn.hidden = true;
}

function render() {
  const items = getVisibleGradients();
  updateMeta(items.length);

  if (!items.length) {
    gridEl.innerHTML = '<div class="empty"><div class="empty-title">未找到匹配的渐变</div><div class="empty-desc">试试其他名称、分类或色值</div></div>';
    return;
  }

  gridEl.innerHTML = items.map(({ name, code, category }) => {
    const light = gradientIsLight(code);
    return `
    <button class="cg-card${light ? ' is-light' : ''}" type="button" style="background:${code}" data-copy="${code}" aria-label="复制渐变：${name}">
      <span class="cg-card-shade"></span>
      <span class="cg-meta">
        <span>
          <strong class="cg-name">${name}</strong>
          <span class="cg-category">${categoryNames[category]}</span>
        </span>
        <i data-lucide="copy" aria-hidden="true"></i>
      </span>
      <span class="cg-code">${code}</span>
    </button>
  `;
  }).join('');
  window.refreshIcons?.(gridEl);
}

on(searchEl, 'input', debounce(() => {
  state.query = searchEl.value;
  render();
}, 200));

on(reshuffleBtn, 'click', () => {
  state.drawPool = pickRandomDraw(flatGradients);
  render();
});

render();
