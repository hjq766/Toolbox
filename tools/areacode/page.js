import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on, debounce } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

/* globals areaZip */
const list = typeof areaZip !== 'undefined' ? areaZip : [];

const searchEl   = $('[data-search]');
const statusEl   = $('[data-status]');
const breadcrumb = $('[data-breadcrumb]');
const provinceEl = $('[data-province-list]');
const contentEl  = $('[data-content]');

let pIdx = 0, cIdx = 0;

const saved = localStorage.getItem('zipcode_idx');
if (saved) { const [a, b] = saved.split('_'); pIdx = +a || 0; cIdx = +b || 0; }

function renderAll() {
  renderProvinces();
  renderBreadcrumb();
  renderContent();
}

function renderProvinces() {
  provinceEl.innerHTML = list.map((p, i) =>
    `<div class="list-item ${i === pIdx ? 'is-active' : ''}" data-pidx="${i}">${p.name}</div>`
  ).join('');
  provinceEl.querySelectorAll('[data-pidx]').forEach(el =>
    el.addEventListener('click', () => { pIdx = +el.dataset.pidx; cIdx = 0; save(); renderAll(); }));
}

function renderBreadcrumb() {
  const p = list[pIdx];
  const c = p?.child?.[cIdx];
  breadcrumb.innerHTML = `
    <span style="cursor:pointer;color:var(--color-brand)" data-reset>全部省份</span>
    <span style="color:var(--fg-muted)">/</span>
    <span>${p?.name || ''}</span>
    ${c ? `<span style="color:var(--fg-muted)">/</span><span>${c.name}</span>` : ''}`;
  breadcrumb.querySelector('[data-reset]')?.addEventListener('click', () => { pIdx = 0; cIdx = 0; save(); renderAll(); });
}

function renderContent() {
  const p = list[pIdx];
  if (!p) { contentEl.innerHTML = ''; return; }
  let html = '';

  if (p.child?.length) {
    html += `<div class="grid-chips u-mb-4">`;
    html += p.child.map((city, i) =>
      `<div class="chip ${i === cIdx ? 'is-active' : ''}" data-cidx="${i}">
        <span>${city.name}</span>
        ${city.zipcode ? `<span class="chip-sub">${city.zipcode}</span>` : ''}
      </div>`).join('');
    html += `</div>`;
  }

  const city = p.child?.[cIdx];
  if (city?.child?.length) {
    html += `<h4 class="u-muted" style="margin:0 0 var(--space-3);font-size:var(--text-sm)">${city.name} 下辖区县</h4>`;
    html += `<div class="grid-chips">`;
    html += city.child.map(a =>
      `<div class="chip" data-zip="${a.zipcode || ''}" data-aname="${a.name}">
        <span>${a.name}</span>
        <span class="chip-sub">${a.zipcode || ''}</span>
      </div>`).join('');
    html += `</div>`;
  }

  contentEl.innerHTML = html;

  contentEl.querySelectorAll('[data-cidx]').forEach(el =>
    el.addEventListener('click', () => { cIdx = +el.dataset.cidx; save(); renderAll(); }));

  contentEl.querySelectorAll('[data-zip]').forEach(el =>
    el.addEventListener('click', async () => {
      const zip = el.dataset.zip;
      if (!zip) return;
      const ok = await copyText(zip);
      showToast(ok ? `已复制 ${el.dataset.aname} 邮编：${zip}` : '复制失败', { type: ok ? 'success' : 'error' });
    }));
}

function save() { localStorage.setItem('zipcode_idx', `${pIdx}_${cIdx}`); }

function trySearch() {
  const q = searchEl.value.trim();
  if (!q || q.length < 2) {
    statusEl.textContent = '';
    return;
  }

  for (let pi = 0; pi < list.length; pi++) {
    const prov = list[pi];
    if (prov.name?.includes(q)) { pIdx = pi; cIdx = 0; save(); renderAll(); statusEl.textContent = ''; return; }
    if (prov.child) {
      for (let ci = 0; ci < prov.child.length; ci++) {
        const city = prov.child[ci];
        if (city.name?.includes(q)) { pIdx = pi; cIdx = ci; save(); renderAll(); statusEl.textContent = ''; return; }
        if (city.child) {
          for (const area of city.child) {
            if (area.name?.includes(q) || area.zipcode === q) {
              pIdx = pi; cIdx = ci; save(); renderAll(); statusEl.textContent = '';
              return;
            }
          }
        }
      }
    }
  }
  statusEl.textContent = '未找到匹配';
}

on(searchEl, 'input', debounce(trySearch, 300));

renderAll();
