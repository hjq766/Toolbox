import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on, debounce } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { mountBrowseTabs } from '../_shared/browse-tabs.js';

mountToolHeader();

const CN = {
  'Smileys & Emotion': '表情与情绪',
  'People & Body': '人物与身体',
  'Animals & Nature': '动物与自然',
  'Food & Drink': '食物与饮品',
  'Travel & Places': '旅行与地点',
  Activities: '活动',
  Objects: '物品',
  Symbols: '符号标识',
  Flags: '旗帜',
};

const groups = typeof emojiData !== 'undefined' ? emojiData : [];
const tabsEl = $('[data-tabs]');
const contentEl = $('[data-content]');
const searchEl = $('[data-search]');
const statusEl = $('[data-status]');

let activeKey = 'all';

mountBrowseTabs(tabsEl, {
  items: () => [
    { id: 'all', label: '全部表情' },
    ...groups.map((g, i) => ({ id: String(i), label: CN[g.name] || g.name })),
  ],
  getActive: () => (activeKey === 'all' ? 'all' : String(activeKey)),
  onSelect: id => {
    activeKey = id === 'all' ? 'all' : Number(id);
    searchEl.value = '';
    statusEl.textContent = '';
    renderContent();
  },
});

function renderGroup(g) {
  const title = CN[g.name] || g.name;
  let html = `<div data-section class="u-mb-6">`;
  html += `<h3 style="font-size:var(--text-md);font-weight:700;margin:0 0 var(--space-3)">${title}</h3>`;
  html += `<div data-sub class="grid-chips">`;
  html += g.emojis.map(([sym, name]) =>
    `<div class="chip emoji-chip" data-sym data-name="${name}">${sym}</div>`
  ).join('');
  html += `</div></div>`;
  return html;
}

function renderContent() {
  const list = activeKey === 'all' ? groups : [groups[activeKey]].filter(Boolean);
  contentEl.innerHTML = list.map(renderGroup).join('');
}

on(contentEl, 'click', async e => {
  const el = e.target.closest('[data-sym]');
  if (!el) return;
  const ok = await copyText(el.textContent);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

function applySearch(q) {
  q = (q || '').toLowerCase().trim();
  let total = 0;
  contentEl.querySelectorAll('[data-section]').forEach(sec => {
    let vis = false;
    sec.querySelectorAll('[data-sym]').forEach(el => {
      const name = el.dataset.name || '';
      const match = !q || el.textContent.includes(q) || name.includes(q);
      el.style.display = match ? '' : 'none';
      if (match) { vis = true; total++; }
    });
    sec.style.display = vis ? '' : 'none';
  });
  statusEl.textContent = q ? (total ? `找到 ${total} 个匹配` : '未找到匹配') : '';
}

on(searchEl, 'input', debounce(() => applySearch(searchEl.value), 200));

renderContent();
