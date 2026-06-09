import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on, debounce } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { downloadText } from '../../public/scripts/utils/download.js';
import { createEditor } from '../_shared/code-editor.js';

mountToolHeader();

/* ============ 1. 常量 / 配置 ============ */

const LS_KEY = 'md_editor_content';

const EXAMPLE = `# Markdown 编辑器 示例

## 基本语法

这是一个 **完整** 的 Markdown 编辑器，支持 *GFM* 扩展语法。

### 文本样式

- **粗体文本**
- *斜体文本*
- ~~删除线~~
- \`行内代码\`
- [链接示例](https://example.com)

### 代码块

\`\`\`javascript
function hello(name) {
  console.log(\`Hello, \${name}!\`);
}
hello('World');
\`\`\`

### 引用

> 这是一段引用文字。

### 列表

1. 有序列表项 1
2. 有序列表项 2

- 无序列表项 A
  - 嵌套列表项

### 任务列表

- [x] 已完成的任务
- [ ] 待完成的任务

### 表格

| 功能 | 快捷键 | 说明 |
|------|--------|------|
| 粗体 | Ctrl+B | 加粗选中文本 |
| 斜体 | Ctrl+I | 倾斜选中文本 |

---

![示例图片](https://via.placeholder.com/400x200/6366f1/ffffff?text=Markdown+Editor)
`;

const EXPORT_CSS = `body{max-width:760px;margin:20px auto;padding:0 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.7;color:#2d3748;font-size:14px}
h1{font-size:1.8em;padding-bottom:.3em;border-bottom:1px solid #eee}
h2{font-size:1.4em;padding-bottom:.25em;border-bottom:1px solid #eee}
code{background:#f4f5f7;padding:2px 6px;border-radius:4px;font-size:.9em}
pre{background:#f4f5f7;padding:12px 16px;border-radius:8px;overflow-x:auto}
pre code{background:none;padding:0}
blockquote{border-left:4px solid #6366f1;padding:.4em 1em;background:#f9f9fb;color:#666}
table{width:100%;border-collapse:collapse}
th,td{border:1px solid #ddd;padding:8px 12px}
th{background:#f9f9fb}
img{max-width:100%}`;

/* ============ 2. 状态 ============ */

let currentHTML = '';
let safeHTML = '';
let lastContent = '';
const tableAlign = { v: 'left' };

/* ============ 3. DOM 引用 ============ */

const sourceEl = $('[data-source]');
const previewEl = $('[data-preview]');
const fileEl = $('[data-file]');
const splitEl = $('[data-split]');
const statWords = $('[data-stat-words]');
const statCursor = $('[data-stat-cursor]');

/* ============ 4. 工具函数 ============ */

/* globals marked, DOMPurify */
marked.setOptions({ breaks: true, gfm: true });

function getContent() {
  const cm = sourceEl._cm;
  return cm ? cm.getValue() : sourceEl.value;
}

function renderPreview() {
  const content = getContent();
  if (content === lastContent) return;
  lastContent = content;
  try {
    currentHTML = content.trim() ? marked.parse(content) : '';
  } catch (e) {
    currentHTML = `<p style="color:var(--color-danger)">${e.message}</p>`;
  }
  safeHTML = typeof DOMPurify !== 'undefined' ? DOMPurify.sanitize(currentHTML) : '';
  previewEl.innerHTML = safeHTML;
  updateWordCount(content);
}

function updateWordCount(content) {
  const count = content.replace(/\s+/g, ' ').trim().length;
  statWords.textContent = `字数：${count}`;
}

function updateCursor() {
  const cm = sourceEl._cm;
  if (!cm) return;
  const pos = cm.getCursor();
  statCursor.textContent = `行：${pos.line + 1}，列：${pos.ch + 1}`;
}

function saveLocal() {
  try { localStorage.setItem(LS_KEY, getContent()); } catch {}
}
const scheduleSave = debounce(saveLocal, 800);

function loadLocal() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved) return saved;
  } catch {}
  return null;
}

function setContent(content) {
  const cm = sourceEl._cm;
  if (cm) cm.setValue(content);
  else sourceEl.value = content;
  lastContent = null; // 强制下次 renderPreview 重新渲染
}

function readFile(file) {
  if (!file) return;
  const r = new FileReader();
  r.onload = e => {
    setContent(e.target.result);
    renderPreview();
    scheduleSave();
    showToast('文件已加载');
  };
  r.readAsText(file);
}

/* --- 编辑器插入 --- */

function insertAround(before, after = before) {
  const cm = sourceEl._cm;
  if (!cm) return;
  const sel = cm.getSelection();
  if (sel) {
    cm.replaceSelection(before + sel + after);
  } else {
    const c = cm.getCursor();
    cm.replaceRange(before + after, c);
    cm.setCursor({ line: c.line, ch: c.ch + before.length });
  }
  cm.focus();
}

function insertLinePrefix(prefix) {
  const cm = sourceEl._cm;
  if (!cm) return;
  const c = cm.getCursor();
  const line = cm.getLine(c.line);
  if (line.trim()) {
    cm.replaceRange(prefix + line, { line: c.line, ch: 0 }, { line: c.line, ch: line.length });
  } else {
    cm.replaceRange(prefix, c);
  }
  cm.focus();
}

function insertBlock(text) {
  const cm = sourceEl._cm;
  if (!cm) return;
  const c = cm.getCursor();
  const line = cm.getLine(c.line);
  const prefix = line.trim() ? '\n\n' : (c.ch > 0 ? '\n' : '');
  cm.replaceRange(prefix + text + '\n', { line: c.line, ch: line.length });
  cm.focus();
}

function insertText(text) {
  const cm = sourceEl._cm;
  if (!cm) return;
  cm.replaceSelection(text);
  cm.focus();
}

function cycleHeading() {
  const cm = sourceEl._cm;
  if (!cm) return;
  const c = cm.getCursor();
  const line = cm.getLine(c.line);
  const m = line.match(/^(#{1,6})\s/);
  let lv = m ? m[1].length : 0;
  lv = lv >= 6 ? 0 : lv + 1;
  const stripped = line.replace(/^#+\s*/, '');
  const newLine = lv === 0 ? stripped : '#'.repeat(lv) + ' ' + stripped;
  cm.replaceRange(newLine, { line: c.line, ch: 0 }, { line: c.line, ch: line.length });
  cm.focus();
}

function buildTable(rows, cols, align) {
  const a = align === 'center' ? ':---:' : align === 'right' ? '---:' : ':---';
  let md = '| ' + Array(cols).fill('表头').join(' | ') + ' |\n';
  md += '|' + Array(cols).fill(a).join('|') + '|\n';
  for (let i = 0; i < rows; i++) md += '| ' + Array(cols).fill('内容').join(' | ') + ' |\n';
  return md;
}

function buildHTMLDoc() {
  return `<!DOCTYPE html>
<html lang="zh-CN">
<head><meta charset="UTF-8"><title>Markdown Export</title><style>${EXPORT_CSS}</style></head>
  <body>${safeHTML}</body>
</html>`;
}

/* globals html2pdf */
async function loadHtml2pdf() {
  if (typeof html2pdf !== 'undefined') return;
  await new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js';
    s.onload = resolve;
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

async function exportPDF() {
  if (!safeHTML) return showToast('内容为空', { type: 'warn' });
  try {
    showToast('正在生成 PDF…');
    await loadHtml2pdf();
  } catch {
    return showToast('PDF 库加载失败，请检查网络', { type: 'error' });
  }
  const el = document.createElement('div');
  const style = document.createElement('style');
  style.textContent = EXPORT_CSS;
  el.appendChild(style);
  const body = document.createElement('div');
  body.style.cssText = 'max-width:760px;margin:0 auto;padding:20px;font-family:sans-serif;line-height:1.7;font-size:14px';
  body.innerHTML = safeHTML;
  el.appendChild(body);
  document.body.appendChild(el);
  try {
    await html2pdf().from(el).save('document.pdf');
    showToast('PDF 导出成功');
  } catch (e) {
    showToast('PDF 导出失败', { type: 'error' });
  } finally {
    el.remove();
  }
}

/* --- 弹窗 --- */

function openModal(id) {
  const el = $(`[data-modal-id="${id}"]`);
  if (!el) return;
  el.hidden = false;
  requestAnimationFrame(() => el.classList.add('is-open'));
  const firstInput = el.querySelector('input, select, textarea');
  if (firstInput) firstInput.focus();
}

function closeModal(el) {
  el.classList.remove('is-open');
  setTimeout(() => { el.hidden = true; }, 200);
}

/* ============ 5. 事件绑定 ============ */

/* --- 实时预览 + 自动保存 --- */
on(sourceEl, 'input', debounce(() => { renderPreview(); scheduleSave(); }, 200));

/* --- 文件上传 --- */
on(fileEl, 'change', e => { readFile(e.target.files[0]); fileEl.value = ''; });

/* --- 拖拽文件 --- */
on(sourceEl, 'dragover', e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; });
on(sourceEl, 'drop', e => {
  const f = e.dataTransfer.files[0];
  if (!f) return;
  e.preventDefault();
  if (f.type.startsWith('image/')) {
    const r = new FileReader();
    r.onload = ev => { insertText(`![${f.name}](${ev.target.result})`); renderPreview(); };
    r.readAsDataURL(f);
  } else {
    readFile(f);
  }
});

/* --- 工具栏插入 --- */
on(document, 'click', e => {
  const btn = e.target.closest('[data-insert]');
  if (!btn) return;
  switch (btn.dataset.insert) {
    case 'bold':    insertAround('**'); break;
    case 'italic':  insertAround('*'); break;
    case 'strike':  insertAround('~~'); break;
    case 'code':    insertAround('`'); break;
    case 'heading': cycleHeading(); break;
    case 'quote':   insertLinePrefix('> '); break;
    case 'hr':      insertBlock('---'); break;
    case 'ul':      insertLinePrefix('- '); break;
    case 'ol':      insertLinePrefix('1. '); break;
    case 'task':    insertLinePrefix('- [ ] '); break;
  }
  lastContent = '';
  renderPreview();
});

/* --- 弹窗打开 --- */
on(document, 'click', e => {
  const btn = e.target.closest('[data-modal]');
  if (btn) openModal(btn.dataset.modal);
});

/* --- 弹窗关闭 --- */
on(document, 'click', e => {
  const closeBtn = e.target.closest('[data-modal-close]');
  if (closeBtn) return closeModal(closeBtn.closest('.modal-backdrop'));
  if (e.target.classList.contains('modal-backdrop')) closeModal(e.target);
});

/* --- 表格对齐切换 --- */
on($('[data-tbl-align]'), 'click', e => {
  const b = e.target.closest('[data-val]');
  if (!b) return;
  tableAlign.v = b.dataset.val;
  $$('[data-tbl-align] [data-val]').forEach(x => x.classList.toggle('is-active', x === b));
});

/* --- 弹窗确认 --- */
on(document, 'click', e => {
  const ok = e.target.closest('[data-modal-ok]');
  if (!ok) return;
  const modal = ok.closest('.modal-backdrop');

  switch (ok.dataset.modalOk) {
    case 'link': {
      const text = $('[data-link-text]').value.trim();
      const url = $('[data-link-url]').value.trim();
      if (!url) return showToast('请填写链接地址', { type: 'warn' });
      insertText(`[${text || url}](${url})`);
      $('[data-link-text]').value = ''; $('[data-link-url]').value = '';
      break;
    }
    case 'image': {
      const alt = $('[data-img-alt]').value.trim() || '图片';
      const url = $('[data-img-url]').value.trim();
      if (!url) return showToast('请填写图片地址', { type: 'warn' });
      insertText(`![${alt}](${url})`);
      $('[data-img-alt]').value = ''; $('[data-img-url]').value = '';
      break;
    }
    case 'table': {
      let rows = Math.max(1, Math.min(20, parseInt($('[data-tbl-rows]').value) || 3));
      const cols = Math.max(1, Math.min(20, parseInt($('[data-tbl-cols]').value) || 3));
      const hasHeader = $('[data-tbl-header]').checked;
      if (hasHeader) rows = Math.max(0, rows - 1);
      insertBlock(buildTable(rows, cols, tableAlign.v));
      break;
    }
    case 'codeblock': {
      const lang = $('[data-cb-lang]').value;
      const code = $('[data-cb-code]').value;
      insertBlock('```' + lang + '\n' + code + '\n```');
      $('[data-cb-code]').value = '';
      break;
    }
  }
  closeModal(modal);
  lastContent = '';
  renderPreview();
  scheduleSave();
});

/* --- 视图切换 --- */
on(document, 'click', e => {
  const b = e.target.closest('[data-view]');
  if (!b) return;
  const v = b.dataset.view;
  $$('[data-view]').forEach(x => x.classList.toggle('is-active', x === b));
  const editorPane = splitEl.children[0];
  const previewPane = splitEl.children[1];
  editorPane.style.display = v === 'preview' ? 'none' : 'flex';
  previewPane.style.display = v === 'edit' ? 'none' : 'flex';
  const cm = sourceEl._cm;
  if (cm && v !== 'preview') setTimeout(() => cm.refresh(), 50);
});

/* --- 动作按钮 --- */
on(document, 'click', e => {
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const cm = sourceEl._cm;

  switch (btn.dataset.action) {
    case 'undo': cm && cm.undo(); break;
    case 'redo': cm && cm.redo(); break;
    case 'copy-md': {
      const mdContent = getContent();
      if (!mdContent.trim()) return showToast('内容为空', { type: 'warn' });
      copyText(mdContent).then(ok => showToast(ok ? '已复制 Markdown' : '复制失败', { type: ok ? 'success' : 'error' }));
      break;
    }
    case 'copy-html': {
      if (!safeHTML) return showToast('内容为空', { type: 'warn' });
      copyText(safeHTML).then(ok => showToast(ok ? '已复制 HTML' : '复制失败', { type: ok ? 'success' : 'error' }));
      break;
    }
    case 'dl-md': {
      const mdExport = getContent();
      if (!mdExport.trim()) return showToast('内容为空', { type: 'warn' });
      downloadText(mdExport, 'document.md', 'text/markdown;charset=utf-8');
      showToast('已下载 .md');
      break;
    }
    case 'dl-html': {
      if (!safeHTML) return showToast('内容为空', { type: 'warn' });
      downloadText(buildHTMLDoc(), 'document.html', 'text/html;charset=utf-8');
      showToast('已下载 .html');
      break;
    }
    case 'dl-pdf': {
      exportPDF();
      break;
    }
    case 'fullscreen': {
      const wrap = splitEl.closest('.panel');
      const isFs = wrap.classList.toggle('is-fullscreen');
      const ico = btn.querySelector('i, svg');
      if (ico) { const ni = document.createElement('i'); ni.dataset.lucide = isFs ? 'minimize' : 'maximize'; ico.replaceWith(ni); if (window.refreshIcons) window.refreshIcons(btn); }
      const cm = sourceEl._cm;
      if (cm) setTimeout(() => cm.refresh(), 50);
      break;
    }
    case 'load-example': {
      setContent(EXAMPLE);
      renderPreview();
      saveLocal();
      showToast('示例已加载');
      break;
    }
    case 'clear': {
      if (!confirm('确定清空编辑器内容吗？此操作不可撤销。')) return;
      setContent('');
      currentHTML = '';
      safeHTML = '';
      renderPreview();
      saveLocal();
      showToast('已清空');
      break;
    }
  }
});

/* --- 键盘快捷键 --- */
on(document, 'keydown', e => {
  if (!(e.ctrlKey || e.metaKey)) return;
  const cm = sourceEl._cm;
  const focused = cm ? cm.hasFocus() : document.activeElement === sourceEl;
  if (!focused) return;
  const k = e.key.toLowerCase();
  if (k === 'b')      { e.preventDefault(); insertAround('**'); renderPreview(); }
  else if (k === 'i') { e.preventDefault(); insertAround('*'); renderPreview(); }
  else if (k === 'd') { e.preventDefault(); insertAround('~~'); renderPreview(); }
  else if (k === 'k') { e.preventDefault(); insertAround('`'); renderPreview(); }
  else if (k === 'l') { e.preventDefault(); openModal('link'); }
  else if (k === 'h') { e.preventDefault(); cycleHeading(); renderPreview(); }
  else if (k === 'q') { e.preventDefault(); insertLinePrefix('> '); renderPreview(); }
});

/* ============ 初始化 ============ */

/* 初始内容在 createEditor 完成后写入，避免 CM 未就绪时 setValue 失败 */
const _initContent = loadLocal() || EXAMPLE;
renderPreview();

createEditor(sourceEl, { mode: 'markdown' }).then(cm => {
  cm.setValue(_initContent);
  lastContent = '';
  renderPreview();
  cm.on('cursorActivity', updateCursor);
  updateCursor();
});
