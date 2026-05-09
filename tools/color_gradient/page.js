/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { gradients, categoryNames } from './gradients.js';

mountToolHeader();

/* ========== 1. 常量 / 配置 ========== */
const LIGHT_CATS = new Set(['light']);

/* ========== 2. 状态 ========== */
let activeCat = 'all';

/* ========== 3. DOM 引用 ========== */
const gridEl  = $('[data-grid]');
const tabsEl  = $('[data-cat-tabs]');
const countEl = $('[data-count]');

/* ========== 4. 工具函数 ========== */

/** 从数据动态生成 tabs（复用全局 .tab 组件） */
function buildTabs() {
  const cats = ['all', ...gradients.map(g => Object.keys(g)[0])];
  tabsEl.innerHTML = cats.map(c =>
    `<button class="tab-btn${c === 'all' ? ' is-active' : ''}" data-cat="${c}">${categoryNames[c] || c}</button>`
  ).join('');
}

/** Fisher-Yates 洗牌 */
function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** 渲染卡片 */
function render(cat) {
  activeCat = cat;
  let items;
  if (cat === 'all') {
    items = shuffle(gradients.flatMap(g => {
      const c = Object.keys(g)[0];
      return g[c].map(i => [...i, c]);
    }));
  } else {
    const group = gradients.find(g => g[cat]);
    if (!group) return;
    items = group[cat].map(i => [...i, cat]);
  }

  countEl.textContent = `共 ${items.length} 个渐变`;

  gridEl.innerHTML = items.map(([name, code, c]) => {
    const light = LIGHT_CATS.has(c);
    return `<div class="cg-card" style="background:${code}" data-grad="${code}">
      <div class="cg-name" style="color:${light ? 'var(--fg-strong)' : '#fff'};text-shadow:${light ? 'none' : '0 1px 3px rgba(0,0,0,.3)'}">${name}</div>
      <div class="cg-code">${code}</div>
    </div>`;
  }).join('');
}

/* ========== 5. 事件绑定 ========== */

/* Tab 切换 */
on(tabsEl, 'click', e => {
  const t = e.target.closest('[data-cat]');
  if (!t || t.dataset.cat === activeCat) return;
  tabsEl.querySelectorAll('.tab-btn').forEach(x => x.classList.remove('is-active'));
  t.classList.add('is-active');
  render(t.dataset.cat);
});

/* 点击卡片复制 */
on(gridEl, 'click', e => {
  const card = e.target.closest('[data-grad]');
  if (!card) return;
  copyText(card.dataset.grad);
  showToast('CSS 渐变代码已复制');
});

/* 初始化 */
buildTabs();
render('all');
