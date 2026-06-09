import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on, debounce } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadText } from '../../public/scripts/utils/download.js';
import { createEditor } from '../_shared/code-editor.js';

mountToolHeader();

const inputEl  = $('[data-input]');
const outputEl = $('[data-output]');
const useCreate = $('[data-opt="createElement"]');
const minify    = $('[data-opt="minify"]');

/* ---------- 转义 ---------- */
function esc(str) {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
            .replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t');
}

/* ---------- createElement 模式 ---------- */
function toCreateElement(html, mini) {
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const lines = [];
  let seq = 0;
  lines.push('function createHTML() {');

  function walk(node, parentVar) {
    if (node.nodeType === 3) {
      const t = node.textContent.replace(/\s+/g, ' ').trim();
      if (t) lines.push(`  ${parentVar}.appendChild(document.createTextNode("${esc(t)}"));`);
      return;
    }
    if (node.nodeType !== 1) return;
    const v = `el${++seq}`;
    lines.push(`  const ${v} = document.createElement("${node.tagName.toLowerCase()}");`);
    for (const a of node.attributes) {
      if (a.name === 'class') lines.push(`  ${v}.className = "${a.value}";`);
      else if (a.name === 'style') lines.push(`  ${v}.style.cssText = "${esc(a.value)}";`);
      else lines.push(`  ${v}.setAttribute("${a.name}", "${esc(a.value)}");`);
    }
    for (const c of node.childNodes) {
      if (c.nodeType === 3 && !c.textContent.trim()) continue;
      walk(c, v);
    }
    lines.push(`  ${parentVar}.appendChild(${v});`);
  }

  for (const c of doc.body.childNodes) walk(c, 'document.body');
  lines.push('}');
  return mini ? lines.join('') : lines.join('\n');
}

/* ---------- innerHTML 模式 ---------- */
function toInnerHTML(html, mini) {
  const s = html.trim().replace(/`/g, '\\`').replace(/\${/g, '\\${');
  if (mini) return `document.getElementById("app").innerHTML=\`${s}\`;`;
  return `const html = \`
${s}
\`;

document.getElementById("app").innerHTML = html;`;
}

/* ---------- 实时转换 ---------- */
function convert() {
  const src = inputEl.value.trim();
  if (!src) { outputEl.value = ''; return; }
  try {
    outputEl.value = useCreate.checked ? toCreateElement(src, minify.checked) : toInnerHTML(src, minify.checked);
  } catch { outputEl.value = ''; }
}

const debouncedConvert = debounce(convert, 300);
on(inputEl, 'input', debouncedConvert);
on(useCreate, 'change', convert);
on(minify, 'change', convert);

on($('[data-action="copy"]'), 'click', async () => {
  if (!outputEl.value) { showToast('结果为空', { type: 'warn' }); return; }
  const ok = await copyText(outputEl.value);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

on($('[data-action="download"]'), 'click', () => {
  if (!outputEl.value) { showToast('结果为空', { type: 'warn' }); return; }
  downloadText(outputEl.value, 'converted.js', 'text/javascript');
  showToast('导出成功');
});

on($('[data-action="clear"]'), 'click', () => { inputEl.value = ''; outputEl.value = ''; });

/* ---------- 代码编辑器 ---------- */
createEditor(inputEl,  { mode: 'htmlmixed' });
createEditor(outputEl, { mode: 'javascript' });
