import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on, debounce } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { createEditor } from '../_shared/code-editor.js';

mountToolHeader();

const htmlInput  = $('[data-editor="html"]');
const cssInput   = $('[data-editor="css"]');
const jsInput    = $('[data-editor="js"]');
const stage      = $('[data-stage]');
const frame      = $('[data-frame]', stage);
const deviceBtns = $$('[data-device]');
const exportBtns = $$('[data-export]');

const DEFAULT_HTML = `<div class="hero">
  <h1>Hello, world!</h1>
  <p>开始编辑左侧代码，预览会实时更新。</p>
  <button id="btn">点我</button>
</div>`;
const DEFAULT_CSS = `body {
  font-family: system-ui, sans-serif;
  padding: 40px;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: #fff; min-height: 100vh; margin: 0; box-sizing: border-box;
}
.hero { max-width: 480px; }
h1 { font-size: 2rem; margin: 0 0 8px; }
p { opacity: .9; margin: 0 0 20px; }
button {
  padding: 10px 20px; border: 0; border-radius: 8px;
  background: #fff; color: #333; font-weight: 600; cursor: pointer;
}`;
const DEFAULT_JS = `document.getElementById('btn').addEventListener('click', () => {
  alert('Hello from JavaScript!');
});`;

function buildHTML() {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>${cssInput.value}</style>
</head>
<body>
${htmlInput.value}
<script>
try {
${jsInput.value}
} catch (e) { console.error(e); }
<\/script>
</body>
</html>`;
}

function updatePreview() {
  const doc = frame.contentDocument || frame.contentWindow.document;
  doc.open(); doc.write(buildHTML()); doc.close();
}

function exportHTML() {
  const blob = new Blob([buildHTML()], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'preview.html'; a.click();
  URL.revokeObjectURL(url);
  showToast('HTML 已导出', { type: 'success' });
}

async function captureCanvas() {
  if (!window.html2canvas) { showToast('html2canvas 尚未加载', { type: 'warn' }); return null; }
  const doc = frame.contentDocument || frame.contentWindow.document;
  return window.html2canvas(doc.documentElement, {
    useCORS: true, allowTaint: true, backgroundColor: '#ffffff', logging: false
  });
}

async function exportImage() {
  showToast('正在生成图片…');
  const canvas = await captureCanvas(); if (!canvas) return;
  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = 'preview.png'; a.click();
  showToast('图片已导出', { type: 'success' });
}

async function exportPDF() {
  if (!window.jspdf) { showToast('jsPDF 尚未加载', { type: 'warn' }); return; }
  showToast('正在生成 PDF…');
  const canvas = await captureCanvas(); if (!canvas) return;
  const { jsPDF } = window.jspdf;
  const pdf = new jsPDF({
    orientation: canvas.width > canvas.height ? 'l' : 'p',
    unit: 'px', format: [canvas.width, canvas.height]
  });
  pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
  pdf.save('preview.pdf');
  showToast('PDF 已导出', { type: 'success' });
}

function switchDevice(device) {
  stage.dataset.device = device;
  deviceBtns.forEach(b => b.classList.toggle('is-active', b.dataset.device === device));
  const sizes = { laptop: [1440, 900], tablet: [834, 1194], mobile: [390, 844] };
  if (device === 'desktop' || !sizes[device]) {
    frame.style.transform = '';
    return;
  }
  const [w, h] = sizes[device];
  const cw = stage.clientWidth;
  const ch = stage.clientHeight;
  const scale = Math.min(cw / w, ch / h, 0.9);
  frame.style.transform = `scale(${scale})`;
}

const debouncedUpdate = debounce(updatePreview, 350);
[htmlInput, cssInput, jsInput].forEach(el => on(el, 'input', debouncedUpdate));

deviceBtns.forEach(b => on(b, 'click', () => switchDevice(b.dataset.device)));
on(window, 'resize', debounce(() => {
  const current = deviceBtns.find(b => b.classList.contains('is-active'))?.dataset.device || 'desktop';
  switchDevice(current);
}, 150));

exportBtns.forEach(b => on(b, 'click', () => ({ html: exportHTML, image: exportImage, pdf: exportPDF }[b.dataset.export]?.())));

if (!htmlInput.value) htmlInput.value = DEFAULT_HTML;
if (!cssInput.value)  cssInput.value  = DEFAULT_CSS;
if (!jsInput.value)   jsInput.value   = DEFAULT_JS;

on(frame, 'load', updatePreview);
updatePreview();
switchDevice('desktop');

/* ---------- 代码编辑器 ---------- */
createEditor(htmlInput, { mode: 'htmlmixed' });
createEditor(cssInput,  { mode: 'css' });
createEditor(jsInput,   { mode: 'javascript' });
