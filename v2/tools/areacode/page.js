import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

/* globals areaZip */
const list = typeof areaZip !== 'undefined' ? areaZip : [];

const searchEl    = $('[data-search]');
const breadcrumb  = $('[data-breadcrumb]');
const provinceEl  = $('[data-province-list]');
const contentEl   = $('[data-content]');

let pIdx = 0, cIdx = 0;

/* ---------- 加载保存状态 ---------- */
const saved = localStorage.getItem('zipcode_idx');
if (saved) { const [a, b] = saved.split('_'); pIdx = +a || 0; cIdx = +b || 0; }

/* ---------- 渲染 ---------- */
function renderAll() {
  renderProvinces();
  renderBreadcrumb();
  renderContent();
}

function renderProvinces() {
  provinceEl.innerHTML = list.map((p, i) =>
    `<div class="list-item ${i===pIdx?'is-active':''}" data-pidx="${i}">${p.name}</div>`
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

  // 城市
  if (p.child?.length) {
    html += `<div class="grid-chips u-mb-4">`;
    html += p.child.map((city, i) =>
      `<div class="chip ${i===cIdx?'is-active':''}" data-cidx="${i}">
        <span>${city.name}</span>
        ${city.zipcode ? `<span class="chip-sub">${city.zipcode}</span>` : ''}
      </div>`).join('');
    html += `</div>`;
  }

  // 区县
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

  // 绑定城市点击
  contentEl.querySelectorAll('[data-cidx]').forEach(el =>
    el.addEventListener('click', () => { cIdx = +el.dataset.cidx; save(); renderAll(); }));

  // 绑定区县点击复制
  contentEl.querySelectorAll('[data-zip]').forEach(el =>
    el.addEventListener('click', async () => {
      const zip = el.dataset.zip;
      if (!zip) return;
      const ok = await copyText(zip);
      showToast(ok ? `已复制 ${el.dataset.aname} 邮编：${zip}` : '复制失败', { type: ok ? 'success' : 'error' });
    }));
}

function save() { localStorage.setItem('zipcode_idx', `${pIdx}_${cIdx}`); }

/* ---------- 搜索 ---------- */
function search() {
  const q = searchEl.value.trim();
  if (!q) { showToast('请输入地区名称或邮编', { type: 'warn' }); return; }
  if (q.length < 2) { showToast('关键词至少 2 个字符', { type: 'warn' }); return; }

  for (let pi = 0; pi < list.length; pi++) {
    const prov = list[pi];
    if (prov.name?.includes(q)) { pIdx = pi; cIdx = 0; save(); renderAll(); return; }
    if (prov.child) {
      for (let ci = 0; ci < prov.child.length; ci++) {
        const city = prov.child[ci];
        if (city.name?.includes(q)) { pIdx = pi; cIdx = ci; save(); renderAll(); return; }
        if (city.child) {
          for (const area of city.child) {
            if (area.name?.includes(q) || area.zipcode === q) { pIdx = pi; cIdx = ci; save(); renderAll(); return; }
          }
        }
      }
    }
  }
  showToast('未找到匹配结果', { type: 'warn' });
}

on($('[data-action="search"]'), 'click', search);
on(searchEl, 'keydown', e => { if (e.key === 'Enter') search(); });

/* ---------- 初始化 ---------- */
renderAll();
