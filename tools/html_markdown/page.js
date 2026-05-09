/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on, debounce } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadText } from '../../public/scripts/utils/download.js';
import { createEditor } from '../_shared/code-editor.js';

mountToolHeader();

/* ========== 1. 常量 / 配置 ========== */
/* globals TurndownService, marked, DOMPurify */
const turndown = new TurndownService({ headingStyle: 'atx', codeBlockStyle: 'fenced' });
marked.setOptions({ breaks: true, gfm: true });

/* ========== 2. 状态 ========== */
let currentMD = '';

/* ========== 3. DOM 引用 ========== */
const srcEl     = $('[data-input="src"]');
const outEl     = $('[data-output]');
const previewEl = $('[data-pane="preview"]');

/* ========== 4. 工具函数 ========== */
function convert() {
  const html = srcEl.value.trim();
  if (!html) { outEl.value = ''; previewEl.innerHTML = ''; currentMD = ''; return; }
  try {
    currentMD = turndown.turndown(html);
    outEl.value = currentMD;
    const rendered = marked.parse(currentMD);
    previewEl.innerHTML = typeof DOMPurify !== 'undefined'
      ? DOMPurify.sanitize(rendered) : rendered;
  } catch (e) {
    showToast('转换失败：' + e.message, { type: 'error' });
  }
}

/* ========== 5. 事件绑定 ========== */

/* --- 实时转换 --- */
on(srcEl, 'input', debounce(convert, 150));

/* --- 视图切换（代码 / 预览） --- */
$$('[data-view]').forEach(btn => on(btn, 'click', () => {
  const v = btn.dataset.view;
  $$('[data-view]').forEach(b => b.classList.toggle('is-active', b === btn));
  $$('[data-pane]').forEach(p => { p.hidden = p.dataset.pane !== v; });
}));

/* --- 复制 --- */
on($('[data-action="copy"]'), 'click', async () => {
  if (!outEl.value) return showToast('结果为空', { type: 'warn' });
  const ok = await copyText(outEl.value);
  showToast(ok ? '已复制 Markdown' : '复制失败', { type: ok ? 'success' : 'error' });
});

/* --- 导出 --- */
on($('[data-action="download"]'), 'click', () => {
  if (!outEl.value) return showToast('结果为空', { type: 'warn' });
  downloadText(outEl.value, 'converted.md', 'text/markdown;charset=utf-8');
  showToast('已导出');
});

/* --- 清空 --- */
on($('[data-action="clear"]'), 'click', () => {
  srcEl.value = ''; outEl.value = ''; previewEl.innerHTML = ''; currentMD = '';
});

/* ========== 初始化 ========== */
createEditor(srcEl, { mode: 'htmlmixed' });
createEditor(outEl, { mode: 'markdown', readOnly: true });
