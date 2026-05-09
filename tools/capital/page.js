import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on, debounce } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

/* globals capitalData */
const data      = typeof capitalData !== 'undefined' ? capitalData : {};
const tabsEl    = $('[data-tabs]');
const contentEl = $('[data-content]');
const searchEl  = $('[data-search]');
const emptyEl   = $('[data-empty]');

const CATS = [
  { id: 'all', title: '全部地区' },
  { id: 'asia', title: '亚洲' },
  { id: 'europe', title: '欧洲' },
  { id: 'africa', title: '非洲' },
  { id: 'northAmerica', title: '北美洲' },
  { id: 'southAmerica', title: '南美洲' },
  { id: 'oceania', title: '大洋洲' }
];
let activeCat = 'all';

/* ---------- tabs ---------- */
function renderTabs() {
  tabsEl.innerHTML = CATS.map(c =>
    `<button class="tab-btn ${c.id === activeCat ? 'is-active' : ''}" type="button" data-cat="${c.id}">${c.title}</button>`
  ).join('');
}

on(tabsEl, 'click', e => {
  const btn = e.target.closest('[data-cat]');
  if (!btn) return;
  activeCat = btn.dataset.cat;
  renderTabs();
  render();
});

/* ---------- render ---------- */
function render(filterText) {
  const q = (filterText || '').toLowerCase().trim();
  let html = '', hasResults = false;

  Object.entries(data).forEach(([key, continent]) => {
    if (activeCat !== 'all' && key !== activeCat) return;

    const countries = q
      ? continent.countries.filter(c =>
          c.country.toLowerCase().includes(q) || c.countryEn.toLowerCase().includes(q) ||
          c.capital.toLowerCase().includes(q) || c.capitalEn.toLowerCase().includes(q) ||
          c.details.toLowerCase().includes(q))
      : continent.countries;

    if (!countries.length) return;
    hasResults = true;

    html += `<div class="u-mb-6">`;
    html += `<h3 class="panel-title">${continent.name} <span class="u-muted" style="font-weight:400">${continent.nameEn}</span></h3>`;
    html += `<div class="grid grid-auto-sm">`;
    html += countries.map(c => `
      <div class="card capital-card" data-card data-country="${c.country}" data-capital="${c.capital}">
        <div class="card-body">
          <div class="u-row u-gap-2 u-mb-2">
            <span class="fi fi-${c.flag}" style="font-size:1.4em"></span>
            <div>
              <div style="font-weight:600;font-size:var(--text-sm)">${c.country} <span class="u-muted">${c.countryEn}</span></div>
              <div style="font-size:var(--text-sm);color:var(--color-brand)">${c.capital} <span class="u-muted">${c.capitalEn}</span></div>
            </div>
          </div>
          <div class="u-muted" style="font-size:var(--text-xs)">${c.details}</div>
        </div>
      </div>`).join('');
    html += `</div></div>`;
  });

  contentEl.innerHTML = html;
  emptyEl.hidden = hasResults;
}

/* ---------- click to copy ---------- */
on(contentEl, 'click', async e => {
  const card = e.target.closest('[data-card]');
  if (!card) return;
  const country = card.dataset.country || '';
  const capital = card.dataset.capital || '';
  const text = `${country} · 首都：${capital}`;
  const ok = await copyText(text);
  showToast(ok ? `已复制：${text}` : '复制失败', { type: ok ? 'success' : 'error' });
});

/* ---------- search ---------- */
on(searchEl, 'input', debounce(() => render(searchEl.value), 200));

/* ---------- init ---------- */
renderTabs();
render();
