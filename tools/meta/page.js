import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { createEditor } from '../_shared/code-editor.js';

mountToolHeader();

/* ================= DOM ================= */
const fields = $$('[data-field]');
const result = $('[data-result]');

/* ================= 常量 ================= */
const VIEWPORT_MAP = {
  responsive: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
  mobile:     'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no',
  none:       ''
};

/* ================= 生成逻辑 ================= */
function escapeAttr(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c]));
}

function generate() {
  const v = {};
  fields.forEach(el => { v[el.dataset.field] = (el.value || '').trim(); });

  const lines = ['<meta charset="utf-8">'];
  if (v.title)       lines.push(`<title>${escapeAttr(v.title)}</title>`);
  if (v.language)    lines.push(`<meta http-equiv="content-language" content="${escapeAttr(v.language)}">`);
  if (v.description) lines.push(`<meta name="description" content="${escapeAttr(v.description)}">`);
  if (v.keywords)    lines.push(`<meta name="keywords" content="${escapeAttr(v.keywords)}">`);
  if (v.author)      lines.push(`<meta name="author" content="${escapeAttr(v.author)}">`);
  if (v.copyright)   lines.push(`<meta name="copyright" content="${escapeAttr(v.copyright)}">`);
  if (v.robots)      lines.push(`<meta name="robots" content="${escapeAttr(v.robots)}">`);

  const vp = VIEWPORT_MAP[v.viewport] ?? '';
  if (vp) {
    lines.push(`<meta name="viewport" content="${vp}">`);
    if (v.viewport === 'responsive') {
      lines.push('<meta name="applicable-device" content="pc,mobile">');
    }
  }
  result.value = lines.join('\n');
}

/* ================= 操作 ================= */
on($('[data-action="copy"]'), 'click', async () => {
  if (!result.value) { showToast('请先填写字段', { type: 'warn' }); return; }
  const ok = await copyText(result.value);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

on($('[data-action="reset"]'), 'click', () => {
  fields.forEach(el => {
    if (el.tagName === 'SELECT') el.selectedIndex = 0;
    else if (el.dataset.field === 'language') el.value = 'zh-CN';
    else el.value = '';
  });
  result.value = '';
  showToast('已重置');
});

/* ================= 实时生成 ================= */
fields.forEach(el => {
  on(el, 'input', generate);
  on(el, 'change', generate);
});
generate();

/* ================= 代码编辑器 ================= */
createEditor(result, { mode: 'htmlmixed' });
