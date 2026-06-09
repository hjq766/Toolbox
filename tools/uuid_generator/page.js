import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

const countEl    = $('[data-count]');
const versionEl  = $('[data-version]');
const listEl     = $('[data-result-list]');
const countLabel = $('[data-result-count]');

let results = [];

/* ======== UUID 生成 ======== */
function generateUUIDv4() {
  if (crypto.randomUUID) return crypto.randomUUID();
  return '10000000-1000-4000-8000-100000000000'.replace(/[018]/g, c =>
    (+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
  );
}

function generateUUIDv1() {
  const now = Date.now();
  const ticks = (now + 12219292800000) * 10000;
  const timeLow = (ticks & 0xffffffff).toString(16).padStart(8, '0');
  const timeMid = ((ticks / 0x100000000) & 0xffff).toString(16).padStart(4, '0');
  const timeHi = (((ticks / 0x1000000000000) & 0x0fff) | 0x1000).toString(16).padStart(4, '0');
  const clockSeq = (crypto.getRandomValues(new Uint8Array(2))[0] << 8 | crypto.getRandomValues(new Uint8Array(2))[1]) & 0x3fff | 0x8000;
  const node = Array.from(crypto.getRandomValues(new Uint8Array(6)), b => b.toString(16).padStart(2, '0')).join('');
  return `${timeLow}-${timeMid}-${timeHi}-${clockSeq.toString(16).padStart(4, '0')}-${node}`;
}

function generate() {
  const count = Math.max(1, Math.min(100, parseInt(countEl.value, 10) || 5));
  const version = versionEl.value;
  const uppercase = $('[data-opt="uppercase"]').checked;
  const noDash = $('[data-opt="no-dash"]').checked;
  const braces = $('[data-opt="braces"]').checked;

  results = [];
  for (let i = 0; i < count; i++) {
    let uuid = version === 'v1' ? generateUUIDv1() : generateUUIDv4();
    if (uppercase) uuid = uuid.toUpperCase();
    if (noDash) uuid = uuid.replace(/-/g, '');
    if (braces) uuid = `{${uuid}}`;
    results.push(uuid);
  }
  renderList();
}

function renderList() {
  if (!results.length) {
    listEl.innerHTML = '<div class="u-muted" style="text-align:center;padding:var(--space-6);font-size:var(--text-sm)">点击"生成"获取 UUID</div>';
    countLabel.textContent = '';
    return;
  }
  countLabel.textContent = `共 ${results.length} 条`;
  listEl.innerHTML = results.map((uuid, i) =>
    `<div class="result-row u-mono" style="cursor:pointer" data-copy-val="${uuid}"><span class="u-muted" style="font-size:var(--text-xs);min-width:20px">${i + 1}</span><span class="u-break" style="flex:1">${uuid}</span></div>`
  ).join('');
}

/* ======== 快捷数量按钮 ======== */
$$('[data-set-count]').forEach(btn => on(btn, 'click', () => {
  countEl.value = btn.dataset.setCount;
  generate();
}));

/* ======== 事件 ======== */
on($('[data-action="generate"]'), 'click', generate);

on($('[data-action="copy"]'), 'click', async () => {
  if (!results.length) { showToast('请先生成 UUID', { type: 'warn' }); return; }
  const ok = await copyText(results.join('\n'));
  showToast(ok ? '已复制全部' : '复制失败', { type: ok ? 'success' : 'error' });
});

on($('[data-action="clear"]'), 'click', () => {
  results = [];
  renderList();
});

// 初始生成
generate();
