import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on, debounce } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

/* globals symbolData */
const data      = typeof symbolData !== 'undefined' ? symbolData : {};
const tabsEl    = $('[data-tabs]');
const contentEl = $('[data-content]');
const searchEl  = $('[data-search]');
const statusEl  = $('[data-status]');

const keys = Object.keys(data);
let activeKey = 'all';

/* ---------- tabs ---------- */
function renderTabs() {
  const tabs = [{ id: 'all', title: '全部符号' }, ...keys.map(k => ({ id: k, title: data[k].title }))];
  tabsEl.innerHTML = tabs.map(t =>
    `<button class="tab-btn ${t.id === activeKey ? 'is-active' : ''}" type="button" data-cat="${t.id}">${t.title}</button>`
  ).join('');
}

on(tabsEl, 'click', e => {
  const btn = e.target.closest('[data-cat]');
  if (!btn) return;
  activeKey = btn.dataset.cat;
  searchEl.value = '';
  statusEl.textContent = '';
  renderTabs();
  renderContent();
});

/* ---------- render ---------- */
function renderContent() {
  const entries = activeKey === 'all' ? Object.entries(data) : [[activeKey, data[activeKey]]].filter(([,v]) => v);
  contentEl.innerHTML = entries.map(([, cat]) => {
    let html = `<div data-section class="u-mb-6">`;
    html += `<h3 style="font-size:var(--text-md);font-weight:700;margin:0 0 var(--space-3)">${cat.title}</h3>`;
    Object.entries(cat.categories).forEach(([, sub]) => {
      html += `<div data-sub class="u-mb-4">`;
      html += `<h4 class="u-muted" style="font-size:var(--text-sm);margin:0 0 var(--space-2)">${sub.title}</h4>`;
      html += `<div class="grid-chips">`;
      html += sub.symbols.map(s =>
        `<div class="chip sym-chip" data-sym>${s}</div>`
      ).join('');
      html += `</div></div>`;
    });
    html += `</div>`;
    return html;
  }).join('');
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
  contentEl.querySelectorAll('[data-sub]').forEach(sub => {
    let vis = false;
    sub.querySelectorAll('[data-sym]').forEach(el => {
      const match = !q || el.textContent.toLowerCase().includes(q);
      el.style.display = match ? '' : 'none';
      if (match) { vis = true; total++; }
    });
    sub.style.display = vis ? '' : 'none';
  });
  contentEl.querySelectorAll('[data-section]').forEach(sec => {
    sec.style.display = sec.querySelector('[data-sub]:not([style*="display: none"])') ? '' : 'none';
  });
  statusEl.textContent = q ? (total ? `找到 ${total} 个匹配` : '未找到匹配') : '';
}

on(searchEl, 'input', debounce(() => applySearch(searchEl.value), 200));

/* ---------- init ---------- */
renderTabs();
renderContent();
