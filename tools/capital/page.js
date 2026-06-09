import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on, debounce } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { mountBrowseTabs } from '../_shared/browse-tabs.js';

mountToolHeader();

/* globals capitalData */
const data = typeof capitalData !== 'undefined' ? capitalData : {};

const tabsEl = $('[data-tabs]');
const contentEl = $('[data-content]');
const searchEl = $('[data-search]');
const emptyEl = $('[data-empty]');
const statusEl = $('[data-status]');

const CATS = [
  { id: 'all', label: '全部地区' },
  { id: 'asia', label: '亚洲' },
  { id: 'europe', label: '欧洲' },
  { id: 'africa', label: '非洲' },
  { id: 'northAmerica', label: '北美洲' },
  { id: 'southAmerica', label: '南美洲' },
  { id: 'oceania', label: '大洋洲' },
];

let activeCat = 'all';

mountBrowseTabs(tabsEl, {
  items: CATS,
  getActive: () => activeCat,
  onSelect: id => {
    activeCat = id;
    render();
  },
});

function render(filterText) {
  const q = (filterText || '').toLowerCase().trim();
  let html = '', hasResults = false, total = 0;

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
    total += countries.length;

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
  contentEl.hidden = !hasResults;
  statusEl.textContent = q
    ? (hasResults ? `找到 ${total} 个国家` : '')
    : (hasResults ? `共 ${total} 个国家` : '');
}

on(contentEl, 'click', async e => {
  const card = e.target.closest('[data-card]');
  if (!card) return;
  const text = `${card.dataset.country || ''} · 首都：${card.dataset.capital || ''}`;
  const ok = await copyText(text);
  showToast(ok ? `已复制：${text}` : '复制失败', { type: ok ? 'success' : 'error' });
});

on(searchEl, 'input', debounce(() => render(searchEl.value), 200));

render();
