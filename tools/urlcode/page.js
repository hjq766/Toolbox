import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

const rawEl = $('[data-raw]');
const outEl = $('[data-encoded]');
let mode = 'component';
let _dir = '';  // 'encode' | 'decode' — 防止循环

function enc(str) { return mode === 'full' ? encodeURI(str) : encodeURIComponent(str); }
function dec(str) {
  try { return mode === 'full' ? decodeURI(str) : decodeURIComponent(str); }
  catch { return ''; }
}

/* ======== 模式切换 ======== */
$$('[data-mode]').forEach(btn => on(btn, 'click', () => {
  mode = btn.dataset.mode;
  $$('[data-mode]').forEach(b => b.classList.toggle('is-active', b === btn));
  if (rawEl.value) outEl.value = enc(rawEl.value);
}));

/* ======== 双向实时 ======== */
on(rawEl, 'input', () => {
  if (_dir === 'decode') return;
  _dir = 'encode';
  outEl.value = rawEl.value ? enc(rawEl.value) : '';
  _dir = '';
});

on(outEl, 'input', () => {
  if (_dir === 'encode') return;
  _dir = 'decode';
  rawEl.value = outEl.value ? dec(outEl.value) : '';
  _dir = '';
});

/* ======== 复制 ======== */
on($('[data-action="copy"]'), 'click', async () => {
  if (!outEl.value) { showToast('结果为空', { type: 'warn' }); return; }
  const ok = await copyText(outEl.value);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

/* ======== 清空 ======== */
on($('[data-action="clear"]'), 'click', () => { rawEl.value = ''; outEl.value = ''; });

/* ======== 示例 ======== */
rawEl.value = 'https://example.com/搜索?q=你好&tag=前端';
outEl.value = enc(rawEl.value);
