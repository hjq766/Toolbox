// ── 0. 导入 ──────────────────────────────────────────────────
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on, debounce } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';

mountToolHeader();

// ── 1. 常量 ─────────────────────────────────────────────────
const EC_MAP = { L: 1, M: 0, Q: 3, H: 2 };

// ── 2. 状态 ─────────────────────────────────────────────────
let currentType = 'text';
let dotStyle = 'square';
let ecLevel = 'H';
let logoImg = null;
let lastCanvas = null;

// ── 3. DOM ──────────────────────────────────────────────────
const output    = $('[data-qr-output]');
const contentEl = $('[data-content]');
const logoFile  = $('[data-logo-file]');

// ── 4. 内容组装 ─────────────────────────────────────────────
function getContent() {
  switch (currentType) {
    case 'text': return contentEl.value || '';
    case 'wifi': {
      const ssid = $('[data-wifi-ssid]').value;
      if (!ssid) return '';
      return `WIFI:T:${$('[data-wifi-enc]').value};S:${ssid};P:${$('[data-wifi-pwd]').value};H:false;;`;
    }
    case 'email': {
      const to = $('[data-email-to]').value;
      if (!to) return '';
      return `mailto:${to}?subject=${encodeURIComponent($('[data-email-sub]').value)}&body=${encodeURIComponent($('[data-email-body]').value)}`;
    }
    case 'contact': {
      const n = $('[data-ct-name]').value, p = $('[data-ct-phone]').value;
      if (!n && !p) return '';
      return `BEGIN:VCARD\nVERSION:3.0\nFN:${n}\nTEL:${p}\nEMAIL:${$('[data-ct-email]').value}\nORG:${$('[data-ct-org]').value}\nADR:;;${$('[data-ct-addr]').value};;;\nEND:VCARD`;
    }
    default: return '';
  }
}

// ── 5. QR 矩阵提取 ──────────────────────────────────────────
function getQRMatrix(text, ecLvl) {
  const qr = new QRCode(document.createElement('div'), {
    text, width: 1, height: 1,
    correctLevel: QRCode.CorrectLevel[ecLvl] ?? QRCode.CorrectLevel.H,
  });
  const cells = qr._oQRCode.modules;
  const count = cells.length;
  return { cells, count };
}

// ── 6. 码点绘制函数 ─────────────────────────────────────────
function drawDot(ctx, cx, cy, r, style) {
  switch (style) {
    case 'round':
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      break;
    case 'diamond':
      ctx.beginPath();
      ctx.moveTo(cx, cy - r);
      ctx.lineTo(cx + r, cy);
      ctx.lineTo(cx, cy + r);
      ctx.lineTo(cx - r, cy);
      ctx.closePath();
      ctx.fill();
      break;
    case 'star': {
      const spikes = 4, outer = r, inner = r * 0.45;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const rad = (Math.PI / 2) * -1 + (Math.PI / spikes) * i;
        const rr = i % 2 === 0 ? outer : inner;
        const x = cx + Math.cos(rad) * rr;
        const y = cy + Math.sin(rad) * rr;
        i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    default: // square
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
}

// ── 7. Canvas 渲染 ──────────────────────────────────────────
function renderQR(text) {
  const opt = k => $(`[data-opt="${k}"]`)?.value;
  const size    = parseInt(opt('size')) || 400;
  const margin  = parseInt(opt('margin')) || 2;
  const fg      = opt('fg') || '#000000';
  const bg      = opt('bg') || '#ffffff';
  const scale   = parseFloat(opt('dotScale')) || 0.85;
  const logoR   = parseInt(opt('logoRatio')) || 20;

  let matrix;
  try { matrix = getQRMatrix(text, ecLevel); }
  catch { showToast('内容过长，请减少文字或降低容错', { type: 'error' }); return; }

  const { cells, count } = matrix;
  const totalModules = count + margin * 2;
  const cellSize = size / totalModules;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  // 背景
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = fg;

  const r = cellSize * scale * 0.5;

  // 判断是否为定位图案区域（3 个角的 7×7 finder pattern）
  function isFinder(row, col) {
    return (row < 7 && col < 7) ||
           (row < 7 && col >= count - 7) ||
           (row >= count - 7 && col < 7);
  }

  // 绘制普通码点
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!cells[row][col]) continue;
      if (isFinder(row, col)) continue;
      const cx = (col + margin + 0.5) * cellSize;
      const cy = (row + margin + 0.5) * cellSize;
      drawDot(ctx, cx, cy, r, dotStyle);
    }
  }

  // 定位图案：始终用圆角方块绘制（更美观）
  function drawFinder(startRow, startCol) {
    const x = (startCol + margin) * cellSize;
    const y = (startRow + margin) * cellSize;
    const s = cellSize * 7;
    const rr = cellSize * 0.8;

    // 外层方框
    ctx.strokeStyle = fg;
    ctx.lineWidth = cellSize;
    ctx.beginPath();
    ctx.roundRect(x + cellSize * 0.5, y + cellSize * 0.5, s - cellSize, s - cellSize, rr);
    ctx.stroke();

    // 内层实心
    const inner = cellSize * 3;
    const ix = x + cellSize * 2;
    const iy = y + cellSize * 2;
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.roundRect(ix, iy, inner, inner, rr * 0.5);
    ctx.fill();
  }
  drawFinder(0, 0);
  drawFinder(0, count - 7);
  drawFinder(count - 7, 0);

  // Logo
  if (logoImg) {
    const logoSize = Math.floor(size * logoR / 100);
    const pad = Math.floor(logoSize * 0.12);
    const lx = (size - logoSize) / 2;
    const ly = (size - logoSize) / 2;
    // 白底 + 圆角
    ctx.fillStyle = bg;
    ctx.beginPath();
    ctx.roundRect(lx - pad, ly - pad, logoSize + pad * 2, logoSize + pad * 2, cellSize);
    ctx.fill();
    ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
  }

  lastCanvas = canvas;
  output.innerHTML = '';
  // 显示用缩略图，保留原始画质 canvas 用于下载
  const display = document.createElement('canvas');
  const dSize = Math.min(400, size);
  display.width = display.height = dSize;
  display.style.cssText = `width:${dSize}px;height:${dSize}px;max-width:100%`;
  display.getContext('2d').drawImage(canvas, 0, 0, dSize, dSize);
  output.appendChild(display);
}

// ── 8. SVG 生成 ─────────────────────────────────────────────
function generateSVG(text) {
  const opt = k => $(`[data-opt="${k}"]`)?.value;
  const margin = parseInt(opt('margin')) || 2;
  const fg = opt('fg') || '#000000';
  const bg = opt('bg') || '#ffffff';
  const scale = parseFloat(opt('dotScale')) || 0.85;

  let matrix;
  try { matrix = getQRMatrix(text, ecLevel); } catch { return null; }
  const { cells, count } = matrix;
  const total = count + margin * 2;
  const unit = 10;
  const size = total * unit;
  const r = unit * scale * 0.5;

  function isFinder(row, col) {
    return (row < 7 && col < 7) || (row < 7 && col >= count - 7) || (row >= count - 7 && col < 7);
  }

  let paths = '';
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!cells[row][col] || isFinder(row, col)) continue;
      const cx = (col + margin + 0.5) * unit;
      const cy = (row + margin + 0.5) * unit;
      if (dotStyle === 'round') {
        paths += `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fg}"/>`;
      } else if (dotStyle === 'diamond') {
        paths += `<polygon points="${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}" fill="${fg}"/>`;
      } else {
        paths += `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" fill="${fg}"/>`;
      }
    }
  }

  // Finder patterns
  function finderSVG(sr, sc) {
    const x = (sc + margin) * unit, y = (sr + margin) * unit;
    const s = unit * 7, rr = unit * 0.8, lw = unit;
    const inner = unit * 3, ix = x + unit * 2, iy = y + unit * 2;
    return `<rect x="${x + lw / 2}" y="${y + lw / 2}" width="${s - lw}" height="${s - lw}" rx="${rr}" fill="none" stroke="${fg}" stroke-width="${lw}"/>` +
           `<rect x="${ix}" y="${iy}" width="${inner}" height="${inner}" rx="${rr * 0.5}" fill="${fg}"/>`;
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
<rect width="${size}" height="${size}" fill="${bg}"/>
${finderSVG(0, 0)}${finderSVG(0, count - 7)}${finderSVG(count - 7, 0)}
${paths}
</svg>`;
}

// ── 9. 生成入口 ─────────────────────────────────────────────
function generate() {
  const text = getContent();
  if (!text) {
    output.innerHTML = '<span class="qr-placeholder">输入内容后自动生成</span>';
    lastCanvas = null;
    return;
  }
  renderQR(text);
}

const debouncedGenerate = debounce(generate, 200);

// ── 10. 事件 ────────────────────────────────────────────────

// Tab 切换
$$('[data-type]').forEach(btn => on(btn, 'click', () => {
  currentType = btn.dataset.type;
  $$('[data-type]').forEach(b => b.classList.toggle('is-active', b === btn));
  $$('[data-pane]').forEach(p => p.hidden = p.dataset.pane !== currentType);
  debouncedGenerate();
}));

// 所有内容输入
on(contentEl, 'input', debouncedGenerate);
$$('[data-wifi-ssid],[data-wifi-pwd],[data-wifi-enc],[data-email-to],[data-email-sub],[data-email-body],[data-ct-name],[data-ct-phone],[data-ct-email],[data-ct-org],[data-ct-addr]').forEach(el => {
  on(el, 'input', debouncedGenerate);
  on(el, 'change', debouncedGenerate);
});

// 样式选项
$$('[data-opt]').forEach(el => {
  on(el, 'input', () => {
    const rv = $(`[data-range-val="${el.dataset.opt}"]`);
    if (rv) rv.textContent = el.dataset.opt === 'logoRatio' ? el.value + '%' : el.value;
    debouncedGenerate();
  });
  on(el, 'change', debouncedGenerate);
});

// 码点形状
$('[data-dot-style]').addEventListener('click', e => {
  const btn = e.target.closest('[data-val]');
  if (!btn) return;
  dotStyle = btn.dataset.val;
  $$('[data-dot-style] .btn').forEach(b => b.classList.toggle('active', b === btn));
  generate();
});

// 容错等级
$('[data-ec]').addEventListener('click', e => {
  const btn = e.target.closest('[data-val]');
  if (!btn) return;
  ecLevel = btn.dataset.val;
  $$('[data-ec] .btn').forEach(b => b.classList.toggle('active', b === btn));
  generate();
});

// Logo
on($('[data-action="pick-logo"]'), 'click', () => logoFile.click());
on(logoFile, 'change', e => {
  const f = e.target.files[0]; if (!f) return;
  const img = new Image();
  img.onload = () => { logoImg = img; showToast('Logo 已加载'); generate(); };
  img.src = URL.createObjectURL(f);
});
on($('[data-action="remove-logo"]'), 'click', () => {
  logoImg = null; logoFile.value = '';
  showToast('Logo 已移除');
  generate();
});

// 下载 PNG
on($('[data-action="download-png"]'), 'click', () => {
  if (!lastCanvas) { showToast('请先生成二维码', { type: 'warn' }); return; }
  lastCanvas.toBlob(blob => {
    downloadBlob(blob, 'qrcode.png');
    showToast('PNG 已下载');
  });
});

// 下载 SVG
on($('[data-action="download-svg"]'), 'click', () => {
  const text = getContent();
  if (!text) { showToast('请先生成二维码', { type: 'warn' }); return; }
  const svg = generateSVG(text);
  if (!svg) { showToast('SVG 生成失败', { type: 'error' }); return; }
  downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), 'qrcode.svg');
  showToast('SVG 已下载');
});

// 重置
on($('[data-action="reset"]'), 'click', () => {
  contentEl.value = '';
  $$('[data-wifi-ssid],[data-wifi-pwd],[data-email-to],[data-email-sub],[data-email-body],[data-ct-name],[data-ct-phone],[data-ct-email],[data-ct-org],[data-ct-addr]').forEach(el => el.value = '');
  logoImg = null; logoFile.value = ''; lastCanvas = null;
  output.innerHTML = '<span class="qr-placeholder">输入内容后自动生成</span>';
});
