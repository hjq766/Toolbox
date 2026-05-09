import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadText } from '../../public/scripts/utils/download.js';
import { createEditor, MODES } from '../_shared/code-editor.js';

mountToolHeader();

/* globals js_beautify, css_beautify, html_beautify */

/* ================= DOM ================= */
const editorEl  = $('[data-editor]');
const fileEl    = $('[data-file]');
const langBtns  = $$('[data-lang]');
const styleBtns = $$('[data-style]');
const statSize  = $('[data-stat="size"]');
const statLines = $('[data-stat="lines"]');
const statLang  = $('[data-stat="lang"]');

/* ================= 状态 ================= */
let lang  = 'auto';
let style = 'default';
let cmInstance = null;

const LANG_NAMES = { javascript: 'JavaScript', css: 'CSS', html: 'HTML', python: 'Python', sql: 'SQL' };
const EXT_MAP = { js:'javascript', ts:'javascript', jsx:'javascript', tsx:'javascript', css:'css', html:'html', htm:'html', py:'python', sql:'sql', php:'javascript', java:'javascript', cpp:'javascript', c:'javascript', rb:'javascript' };

/* ================= 语言检测 ================= */
function detectLang(code) {
  if (!code) return 'javascript';
  if (/<!DOCTYPE|<html|<div|<span/i.test(code)) return 'html';
  if (/@media|{\s*[\w-]+\s*:/.test(code) && !/function|const|let|var/.test(code)) return 'css';
  if (/\b(def |class |import |from .+ import|elif )/m.test(code)) return 'python';
  if (/\b(SELECT|INSERT|UPDATE|DELETE|CREATE TABLE)\b/i.test(code)) return 'sql';
  return 'javascript';
}

function effectiveLang() {
  return lang === 'auto' ? detectLang(editorEl.value) : lang;
}

/* ================= 统计面板 ================= */
function updateStats() {
  const code = editorEl.value;
  const b = new Blob([code]).size;
  statSize.textContent = b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
  statLines.textContent = (code ? code.split('\n').length : 0) + ' 行';
  statLang.textContent = LANG_NAMES[effectiveLang()] || '-';
}
on(editorEl, 'input', updateStats);

/* ================= 语言选择 ================= */
function setLang(v) {
  lang = v;
  langBtns.forEach(b => b.classList.toggle('is-active', b.dataset.lang === v));
  if (cmInstance) cmInstance.setOption('mode', MODES[effectiveLang()] || 'javascript');
  updateStats();
}
langBtns.forEach(b => on(b, 'click', () => setLang(b.dataset.lang)));

/* ================= 风格选择 ================= */
styleBtns.forEach(t => on(t, 'click', () => {
  style = t.dataset.style;
  styleBtns.forEach(x => x.classList.toggle('is-active', x === t));
}));

/* ================= 文件导入 ================= */
on(fileEl, 'change', e => loadFile(e.target.files[0]));
on(editorEl, 'dragover', e => e.preventDefault());
on(editorEl, 'drop', e => { e.preventDefault(); loadFile(e.dataTransfer.files[0]); });

function loadFile(f) {
  if (!f) return;
  const ext = f.name.split('.').pop().toLowerCase();
  const r = new FileReader();
  r.onload = e => {
    editorEl.value = e.target.result;
    setLang(EXT_MAP[ext] || 'auto');
    showToast('导入成功');
  };
  r.readAsText(f);
}

/* ================= 格式化 ================= */
function formatCode() {
  const code = editorEl.value;
  if (!code) { showToast('请输入代码', { type: 'warn' }); return; }
  const l = effectiveLang();
  const compact = style === 'compact';
  const base = {
    indent_size: compact ? 2 : 4, indent_char: ' ',
    max_preserve_newlines: compact ? 1 : 2, preserve_newlines: !compact,
    end_with_newline: !compact, wrap_line_length: compact ? 120 : 0
  };
  try {
    let result;
    if (l === 'html')           result = html_beautify(code, { ...base, indent_inner_html: true, wrap_attributes: compact ? 'force-aligned' : 'auto' });
    else if (l === 'css')       result = css_beautify(code, { ...base, newline_between_rules: !compact });
    else if (l === 'javascript') result = js_beautify(code, { ...base, space_after_anon_function: !compact, break_chained_methods: !compact });
    else if (l === 'python')    result = formatPython(code, compact);
    else                        result = code;
    editorEl.value = result; updateStats(); showToast('格式化成功');
  } catch (e) { showToast('格式化失败：' + e.message, { type: 'error' }); }
}

function formatPython(code, compact) {
  const sz = compact ? 2 : 4;
  const lines = code.split('\n');
  const out = []; let indent = 0;
  for (const raw of lines) {
    const t = raw.trim();
    if (!t && compact) continue;
    if (/^(elif |else:|except |finally:)/.test(t)) indent = Math.max(0, indent - sz);
    out.push(' '.repeat(indent) + t);
    if (t.endsWith(':')) indent += sz;
  }
  return out.join('\n');
}

/* ================= 压缩 ================= */
function compressCode() {
  const code = editorEl.value;
  if (!code) { showToast('请输入代码', { type: 'warn' }); return; }
  const l = effectiveLang();
  let result;
  if (l === 'css') result = code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s*([{}:;,])\s*/g, '$1').replace(/;\}/g, '}').replace(/\s+/g, ' ').trim();
  else if (l === 'html') result = code.replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').replace(/\s+/g, ' ').trim();
  else result = code.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1').replace(/\s+/g, ' ').trim();
  editorEl.value = result; updateStats(); showToast('压缩成功');
}

/* ================= 移除注释 ================= */
function removeComments() {
  const code = editorEl.value;
  if (!code) { showToast('请输入代码', { type: 'warn' }); return; }
  const l = effectiveLang();
  let result;
  if (l === 'html') result = code.replace(/<!--[\s\S]*?-->/g, '').replace(/^\s*\n/gm, '');
  else if (l === 'python') result = code.replace(/#.*$/gm, '').replace(/'''[\s\S]*?'''|"""[\s\S]*?"""/g, '').replace(/^\s*\n/gm, '');
  else result = code.replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1').replace(/^\s*\n/gm, '');
  editorEl.value = result; updateStats(); showToast('注释已移除');
}

/* ================= 按钮绑定 ================= */
on($('[data-action="format"]'), 'click', formatCode);
on($('[data-action="compress"]'), 'click', compressCode);
on($('[data-action="remove-comments"]'), 'click', removeComments);

on($('[data-action="copy"]'), 'click', async () => {
  if (!editorEl.value) { showToast('编辑器为空', { type: 'warn' }); return; }
  const ok = await copyText(editorEl.value);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

on($('[data-action="download"]'), 'click', () => {
  if (!editorEl.value) { showToast('编辑器为空', { type: 'warn' }); return; }
  const extOut = { javascript: '.js', css: '.css', html: '.html', python: '.py', sql: '.sql' };
  const ext = extOut[effectiveLang()] || '.txt';
  downloadText(editorEl.value, `code${ext}`, 'text/plain');
  showToast('导出成功');
});

on($('[data-action="clear"]'), 'click', () => {
  editorEl.value = '';
  setLang('auto');
});

/* ================= 代码编辑器 ================= */
createEditor(editorEl, { mode: 'javascript' }).then(cm => { cmInstance = cm; });

/* ================= 初始化 ================= */
updateStats();
