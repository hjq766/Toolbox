import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on, debounce } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { mountBrowseTabs } from '../_shared/browse-tabs.js';

mountToolHeader();

/* globals symbolData */
const data = typeof symbolData !== 'undefined' ? symbolData : {};
const keys = Object.keys(data);

const tabsEl = $('[data-tabs]');
const contentEl = $('[data-content]');
const searchEl = $('[data-search]');
const statusEl = $('[data-status]');

let activeKey = keys[0] || '';

mountBrowseTabs(tabsEl, {
  items: () => keys.map(k => ({ id: k, label: data[k].title })),
  getActive: () => activeKey,
  onSelect: id => {
    activeKey = id;
    renderContent();
  },
});

function renderContent() {
  const cat = data[activeKey];
  if (!cat) { contentEl.innerHTML = ''; return; }

  contentEl.innerHTML = cat.sections.map(sec => `
    <div class="u-mb-6" data-section>
      <h3 style="font-size:var(--text-sm);color:var(--fg-muted);margin:0 0 var(--space-3)">${sec.title}</h3>
      <div style="overflow-x:auto">
        <table class="data-table">
          <thead><tr>
            <th>符号</th><th>描述</th><th>实体名称</th><th>实体编号</th>
          </tr></thead>
          <tbody>${sec.symbols.map(s => `
            <tr data-row style="cursor:pointer">
              <td style="font-size:var(--text-lg)">${s.symbol}</td>
              <td>${s.desc}</td>
              <td class="u-mono">${s.entity}</td>
              <td class="u-mono">${s.code}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
    </div>`).join('');

  applySearch(searchEl.value);
}

on(contentEl, 'click', async e => {
  const row = e.target.closest('[data-row]');
  if (!row) return;
  const symbol = row.querySelector('td').textContent;
  const ok = await copyText(symbol);
  showToast(ok ? '符号已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

function applySearch(q) {
  q = (q || '').toLowerCase();
  let total = 0;
  contentEl.querySelectorAll('[data-section]').forEach(sec => {
    let vis = false;
    sec.querySelectorAll('[data-row]').forEach(row => {
      const match = !q || row.textContent.toLowerCase().includes(q);
      row.style.display = match ? '' : 'none';
      if (match) { vis = true; total++; }
    });
    sec.style.display = vis ? '' : 'none';
  });
  statusEl.textContent = q ? (total ? `找到 ${total} 个匹配` : '未找到匹配') : '';
}

on(searchEl, 'input', debounce(() => applySearch(searchEl.value), 200));

renderContent();
