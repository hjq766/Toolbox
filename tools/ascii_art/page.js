import { mountToolHeader } from '../../public/scripts/core/tool-page.js';

mountToolHeader();

const $ = s => document.querySelector(s);
const on = (el, ev, fn) => el?.addEventListener(ev, fn);

/* ========== 字符集 ========== */
const CHARSETS = [
  ' .:-=+*#%@',                    // 稀疏
  ' .,:;i1tfLCG08@',               // 标准
  ' .\'`^",:;Il!i><~+_-?][}{1)(|/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$', // 细密
];
const DENSITY_LABELS = ['稀疏', '标准', '细密'];

/* ========== DOM 引用 ========== */
const output = $('[data-output]');
const fileInput = $('[data-file]');
const dropZone = $('[data-drop]');
const colsRange = $('[data-opt="cols"]');
const colsVal = $('[data-val-cols]');
const densityRange = $('[data-opt="density"]');
const densityVal = $('[data-val-density]');
const invertCheck = $('[data-opt="invert"]');
const colorCheck = $('[data-opt="color"]');
const textInput = $('[data-text-input]');
const fontSelect = $('[data-font]');
const copyBtn = $('[data-copy]');
const downloadBtn = $('[data-download]');
const tabs = $('[data-tabs]');

/* ========== 状态 ========== */
let currentMode = 'image';
let imgEl = null;
let currentAscii = '';

/* ========== Tab 切换 ========== */
on(tabs, 'click', e => {
  const btn = e.target.closest('[data-tab]');
  if (!btn) return;
  currentMode = btn.dataset.tab;
  tabs.querySelectorAll('button').forEach(b => b.classList.toggle('is-active', b === btn));
  document.querySelectorAll('.mode-panel').forEach(p => p.classList.toggle('is-active', p.dataset.mode === currentMode));
  if (currentMode === 'text') renderText();
});

/* ========== 图片模式 ========== */
function loadImage(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => { imgEl = img; renderImage(); };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function renderImage() {
  if (!imgEl) return;
  const cols = +colsRange.value;
  const density = +densityRange.value;
  const invert = invertCheck.checked;
  const useColor = colorCheck.checked;
  const charset = CHARSETS[density];

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  // 计算行列
  const aspect = imgEl.height / imgEl.width;
  const rows = Math.round(cols * aspect * 0.45); // 字符高宽比约 2:1
  canvas.width = cols;
  canvas.height = rows;
  ctx.drawImage(imgEl, 0, 0, cols, rows);

  const imageData = ctx.getImageData(0, 0, cols, rows);
  const pixels = imageData.data;
  let lines = [];

  for (let y = 0; y < rows; y++) {
    let line = '';
    let colorLine = '';
    for (let x = 0; x < cols; x++) {
      const i = (y * cols + x) * 4;
      const r = pixels[i], g = pixels[i + 1], b = pixels[i + 2];
      let gray = 0.299 * r + 0.587 * g + 0.114 * b;
      if (invert) gray = 255 - gray;
      const charIdx = Math.floor((gray / 255) * (charset.length - 1));
      const ch = charset[charIdx] || ' ';
      line += ch;
      if (useColor) {
        colorLine += `<span style="color:rgb(${r},${g},${b})">${ch === ' ' ? '&nbsp;' : escHtml(ch)}</span>`;
      }
    }
    lines.push(useColor ? colorLine : line);
  }

  currentAscii = useColor ? '' : lines.join('\n');
  if (useColor) {
    output.innerHTML = `<pre>${lines.join('\n')}</pre>`;
    // 存纯文本用于复制
    currentAscii = lines.map(l => l.replace(/<[^>]+>/g, '').replace(/&nbsp;/g, ' ')).join('\n');
  } else {
    output.innerHTML = `<pre>${escHtml(currentAscii)}</pre>`;
  }
  output.style.setProperty('--ascii-font-size', Math.max(3, Math.min(12, Math.round(600 / cols))) + 'px');
}

function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// 文件上传
on(fileInput, 'change', () => { if (fileInput.files[0]) loadImage(fileInput.files[0]); });

// 拖拽
on(dropZone, 'dragover', e => { e.preventDefault(); dropZone.style.borderColor = 'var(--color-brand)'; });
on(dropZone, 'dragleave', () => { dropZone.style.borderColor = ''; });
on(dropZone, 'drop', e => {
  e.preventDefault();
  dropZone.style.borderColor = '';
  const file = e.dataTransfer.files[0];
  if (file && file.type.startsWith('image/')) loadImage(file);
});

// 控件变化
on(colsRange, 'input', () => { colsVal.textContent = colsRange.value; renderImage(); });
on(densityRange, 'input', () => { densityVal.textContent = DENSITY_LABELS[densityRange.value]; renderImage(); });
on(invertCheck, 'change', () => renderImage());
on(colorCheck, 'change', () => renderImage());

/* ========== 文字模式（Figlet） ========== */

let figlet = null;
const FONT_CDN = 'https://cdn.jsdelivr.net/npm/figlet/fonts';

// 动态加载 figlet ESM 模块
async function getFiglet() {
  if (figlet) return figlet;
  const mod = await import('https://cdn.jsdelivr.net/npm/figlet/+esm');
  figlet = mod.default || mod;
  figlet.defaults({ fontPath: FONT_CDN });
  return figlet;
}

let renderTimer = null;
function debouncedRender() {
  clearTimeout(renderTimer);
  renderTimer = setTimeout(renderText, 200);
}

async function renderText() {
  const text = textInput.value || 'Hello';
  const font = fontSelect.value;

  output.innerHTML = `<pre style="color:var(--fg-muted)">加载中…</pre>`;

  try {
    const fig = await getFiglet();
    // ESM 版本的 text() 支持 Promise
    const result = await fig.text(text, { font });
    currentAscii = result;
    output.innerHTML = `<pre>${escHtml(currentAscii)}</pre>`;
    output.style.setProperty('--ascii-font-size', '14px');
  } catch (e) {
    console.error('figlet error:', e);
    output.innerHTML = `<pre style="color:var(--fg-muted)">渲染失败: ${escHtml(String(e.message || e))}</pre>`;
  }
}

on(textInput, 'input', () => { if (currentMode === 'text') renderText(); });
on(fontSelect, 'change', () => { if (currentMode === 'text') renderText(); });

/* ========== 复制 & 下载 ========== */
on(copyBtn, 'click', async () => {
  if (!currentAscii) return;
  const { copyText } = await import('../../public/scripts/utils/clipboard.js');
  const { showToast } = await import('../../public/scripts/components/toast.js');
  const ok = await copyText(currentAscii);
  showToast(ok ? '已复制到剪贴板' : '复制失败', { type: ok ? 'success' : 'error' });
});

on(downloadBtn, 'click', () => {
  if (!currentAscii) return;
  const blob = new Blob([currentAscii], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'ascii-art.txt';
  a.click();
  URL.revokeObjectURL(url);
});

/* ========== 初始渲染 ========== */
renderText();
