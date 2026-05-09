import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on, debounce } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

/* globals emojiData */
const CN = {
  'Smileys & Emotion': '表情与情绪',
  'People & Body': '人物与身体',
  'Animals & Nature': '动物与自然',
  'Food & Drink': '食物与饮品',
  'Travel & Places': '旅行与地点',
  'Activities': '活动',
  'Objects': '物品',
  'Symbols': '符号标识',
  'Flags': '旗帜',
};

const groups    = typeof emojiData !== 'undefined' ? emojiData : [];
const tabsEl    = $('[data-tabs]');
const contentEl = $('[data-content]');
const searchEl  = $('[data-search]');
const statusEl  = $('[data-status]');

let activeIdx = -1; // -1 = 全部

/* ---------- tabs ---------- */
function renderTabs() {
  const tabs = [{ idx: -1, title: '全部表情' }, ...groups.map((g, i) => ({ idx: i, title: CN[g.name] || g.name }))];
  tabsEl.innerHTML = tabs.map(t =>
    `<button class="tab-btn ${t.idx === activeIdx ? 'is-active' : ''}" type="button" data-idx="${t.idx}">${t.title}</button>`
  ).join('');
}

on(tabsEl, 'click', e => {
  const btn = e.target.closest('[data-idx]');
  if (!btn) return;
  activeIdx = +btn.dataset.idx;
  searchEl.value = '';
  statusEl.textContent = '';
  renderTabs();
  renderContent();
});

/* ---------- render ---------- */
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
  const list = activeIdx === -1 ? groups : [groups[activeIdx]].filter(Boolean);
  contentEl.innerHTML = list.map(renderGroup).join('');
}

/* ---------- click to copy ---------- */
on(contentEl, 'click', async e => {
  const el = e.target.closest('[data-sym]');
  if (!el) return;
  const ok = await copyText(el.textContent);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

/* ---------- search ---------- */
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

/* ---------- init ---------- */
renderTabs();
renderContent();
