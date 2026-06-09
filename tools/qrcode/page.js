import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on, debounce } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';

mountToolHeader();

/* globals QRCode */

const DEFAULTS = {
  type: 'text',
  dotStyle: 'square',
  ecLevel: 'H',
  size: '400',
  margin: '2',
  fg: '#000000',
  bg: '#ffffff',
  dotScale: '0.85',
  logoRatio: '20',
  wifiEnc: 'WPA',
};

let currentType = DEFAULTS.type;
let dotStyle = DEFAULTS.dotStyle;
let ecLevel = DEFAULTS.ecLevel;
let logoImg = null;
let logoDataUrl = null;
let lastCanvas = null;
let matrixCache = { key: '', data: null };

const output = $('[data-qr-output]');
const metaEl = $('[data-qr-meta]');
const contentEl = $('[data-content]');
const logoFile = $('[data-logo-file]');

const CONTENT_FIELDS = '[data-wifi-ssid],[data-wifi-pwd],[data-wifi-enc],[data-wifi-hidden],[data-email-to],[data-email-sub],[data-email-body],[data-ct-name],[data-ct-phone],[data-ct-email],[data-ct-org],[data-ct-addr]';
const MAX_LOGO_BYTES = 10 * 1024 * 1024;

function clampNumber(value, min, max, fallback) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.min(max, Math.max(min, n)) : fallback;
}

function escapeWifi(val) {
  return String(val ?? '').replace(/([\\;,:"])/g, '\\$1');
}

function escapeVCard(val) {
  return String(val ?? '').replace(/[\\;,]/g, '\\$1').replace(/\n/g, '\\n');
}

function getContent() {
  switch (currentType) {
    case 'text':
      return contentEl.value || '';
    case 'wifi': {
      const ssid = $('[data-wifi-ssid]').value.trim();
      if (!ssid) return '';
      const enc = $('[data-wifi-enc]').value;
      const pwd = enc === 'nopass' ? '' : $('[data-wifi-pwd]').value;
      const hidden = $('[data-wifi-hidden]').checked ? 'true' : 'false';
      return `WIFI:T:${enc};S:${escapeWifi(ssid)};P:${escapeWifi(pwd)};H:${hidden};;`;
    }
    case 'email': {
      const to = $('[data-email-to]').value.trim();
      if (!to) return '';
      return `mailto:${to}?subject=${encodeURIComponent($('[data-email-sub]').value)}&body=${encodeURIComponent($('[data-email-body]').value)}`;
    }
    case 'contact': {
      const name = $('[data-ct-name]').value.trim();
      const phone = $('[data-ct-phone]').value.trim();
      if (!name && !phone) return '';
      return [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `FN:${escapeVCard(name)}`,
        `TEL:${escapeVCard(phone)}`,
        `EMAIL:${escapeVCard($('[data-ct-email]').value)}`,
        `ORG:${escapeVCard($('[data-ct-org]').value)}`,
        `ADR:;;${escapeVCard($('[data-ct-addr]').value)};;;`,
        'END:VCARD',
      ].join('\n');
    }
    default:
      return '';
  }
}

function getOpts() {
  const read = k => $(`[data-opt="${k}"]`)?.value;
  return {
    size: Math.round(clampNumber(read('size'), 100, 2048, 400)),
    margin: Math.round(clampNumber(read('margin'), 0, 10, 2)),
    fg: read('fg') || '#000000',
    bg: read('bg') || '#ffffff',
    dotScale: clampNumber(read('dotScale'), 0.3, 1, 0.85),
    logoRatio: Math.round(clampNumber(read('logoRatio'), 10, 30, 20)),
  };
}

function isFinder(row, col, count) {
  return (row < 7 && col < 7)
    || (row < 7 && col >= count - 7)
    || (row >= count - 7 && col < 7);
}

function getQRMatrix(text, ecLvl) {
  const key = `${ecLvl}\0${text}`;
  if (matrixCache.key === key) return matrixCache.data;

  const qr = new QRCode(document.createElement('div'), {
    text,
    width: 1,
    height: 1,
    correctLevel: QRCode.CorrectLevel[ecLvl] ?? QRCode.CorrectLevel.H,
  });
  const data = { cells: qr._oQRCode.modules, count: qr._oQRCode.modules.length };
  matrixCache = { key, data };
  return data;
}

function starPoints(cx, cy, r) {
  const spikes = 4;
  const outer = r;
  const inner = r * 0.45;
  const pts = [];
  for (let i = 0; i < spikes * 2; i++) {
    const rad = (Math.PI / 2) * -1 + (Math.PI / spikes) * i;
    const rr = i % 2 === 0 ? outer : inner;
    pts.push(`${cx + Math.cos(rad) * rr},${cy + Math.sin(rad) * rr}`);
  }
  return pts.join(' ');
}

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
      const spikes = 4;
      const outer = r;
      const inner = r * 0.45;
      ctx.beginPath();
      for (let i = 0; i < spikes * 2; i++) {
        const rad = (Math.PI / 2) * -1 + (Math.PI / spikes) * i;
        const rr = i % 2 === 0 ? outer : inner;
        const x = cx + Math.cos(rad) * rr;
        const y = cy + Math.sin(rad) * rr;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fill();
      break;
    }
    default:
      ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
  }
}

function dotSVG(cx, cy, r, style, fg) {
  switch (style) {
    case 'round':
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fg}"/>`;
    case 'diamond':
      return `<polygon points="${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}" fill="${fg}"/>`;
    case 'star':
      return `<polygon points="${starPoints(cx, cy, r)}" fill="${fg}"/>`;
    default:
      return `<rect x="${cx - r}" y="${cy - r}" width="${r * 2}" height="${r * 2}" fill="${fg}"/>`;
  }
}

function drawFinder(ctx, startRow, startCol, count, margin, cellSize, fg) {
  const x = (startCol + margin) * cellSize;
  const y = (startRow + margin) * cellSize;
  const s = cellSize * 7;
  const rr = cellSize * 0.8;

  ctx.strokeStyle = fg;
  ctx.lineWidth = cellSize;
  ctx.beginPath();
  ctx.roundRect(x + cellSize * 0.5, y + cellSize * 0.5, s - cellSize, s - cellSize, rr);
  ctx.stroke();

  const inner = cellSize * 3;
  ctx.fillStyle = fg;
  ctx.beginPath();
  ctx.roundRect(x + cellSize * 2, y + cellSize * 2, inner, inner, rr * 0.5);
  ctx.fill();
}

function finderSVG(sr, sc, count, margin, unit, fg) {
  const x = (sc + margin) * unit;
  const y = (sr + margin) * unit;
  const s = unit * 7;
  const rr = unit * 0.8;
  const lw = unit;
  const inner = unit * 3;
  const ix = x + unit * 2;
  const iy = y + unit * 2;
  return `<rect x="${x + lw / 2}" y="${y + lw / 2}" width="${s - lw}" height="${s - lw}" rx="${rr}" fill="none" stroke="${fg}" stroke-width="${lw}"/>`
    + `<rect x="${ix}" y="${iy}" width="${inner}" height="${inner}" rx="${rr * 0.5}" fill="${fg}"/>`;
}

function drawLogoOnCanvas(ctx, size, cellSize, bg, logoRatio) {
  if (!logoImg) return;
  const logoSize = Math.floor(size * logoRatio / 100);
  const pad = Math.floor(logoSize * 0.12);
  const lx = (size - logoSize) / 2;
  const ly = (size - logoSize) / 2;
  ctx.fillStyle = bg;
  ctx.beginPath();
  ctx.roundRect(lx - pad, ly - pad, logoSize + pad * 2, logoSize + pad * 2, cellSize);
  ctx.fill();
  ctx.drawImage(logoImg, lx, ly, logoSize, logoSize);
}

function logoSVG(svgSize, unit, bg, logoRatio) {
  if (!logoDataUrl) return '';
  const logoSize = Math.floor(svgSize * logoRatio / 100);
  const pad = Math.floor(logoSize * 0.12);
  const lx = (svgSize - logoSize) / 2;
  const ly = (svgSize - logoSize) / 2;
  const rr = unit;
  return `<rect x="${lx - pad}" y="${ly - pad}" width="${logoSize + pad * 2}" height="${logoSize + pad * 2}" rx="${rr}" fill="${bg}"/>`
    + `<image href="${logoDataUrl}" x="${lx}" y="${ly}" width="${logoSize}" height="${logoSize}" preserveAspectRatio="xMidYMid meet"/>`;
}

function renderQR(text) {
  const { size, margin, fg, bg, dotScale, logoRatio } = getOpts();

  let matrix;
  try {
    matrix = getQRMatrix(text, ecLevel);
  } catch {
    showToast('内容过长，请减少文字或降低容错', { type: 'error' });
    return;
  }

  const { cells, count } = matrix;
  const totalModules = count + margin * 2;
  const cellSize = size / totalModules;
  const r = cellSize * dotScale * 0.5;

  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = size;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = fg;

  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!cells[row][col] || isFinder(row, col, count)) continue;
      drawDot(ctx, (col + margin + 0.5) * cellSize, (row + margin + 0.5) * cellSize, r, dotStyle);
    }
  }

  drawFinder(ctx, 0, 0, count, margin, cellSize, fg);
  drawFinder(ctx, 0, count - 7, count, margin, cellSize, fg);
  drawFinder(ctx, count - 7, 0, count, margin, cellSize, fg);
  drawLogoOnCanvas(ctx, size, cellSize, bg, logoRatio);

  lastCanvas = canvas;
  output.innerHTML = '';
  const display = document.createElement('canvas');
  const dSize = Math.min(400, size);
  display.width = display.height = dSize;
  display.style.cssText = `width:${dSize}px;height:${dSize}px;max-width:100%`;
  display.getContext('2d').drawImage(canvas, 0, 0, dSize, dSize);
  output.appendChild(display);

  if (metaEl) {
    metaEl.textContent = `${count}×${count} 模块 · ${size}px · 容错 ${ecLevel}`;
    metaEl.hidden = false;
  }
}

function generateSVG(text) {
  const { margin, fg, bg, dotScale, logoRatio } = getOpts();

  let matrix;
  try {
    matrix = getQRMatrix(text, ecLevel);
  } catch {
    return null;
  }

  const { cells, count } = matrix;
  const total = count + margin * 2;
  const unit = 10;
  const svgSize = total * unit;
  const r = unit * dotScale * 0.5;

  let paths = '';
  for (let row = 0; row < count; row++) {
    for (let col = 0; col < count; col++) {
      if (!cells[row][col] || isFinder(row, col, count)) continue;
      const cx = (col + margin + 0.5) * unit;
      const cy = (row + margin + 0.5) * unit;
      paths += dotSVG(cx, cy, r, dotStyle, fg);
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgSize} ${svgSize}" width="${svgSize}" height="${svgSize}">
<rect width="${svgSize}" height="${svgSize}" fill="${bg}"/>
${finderSVG(0, 0, count, margin, unit, fg)}${finderSVG(0, count - 7, count, margin, unit, fg)}${finderSVG(count - 7, 0, count, margin, unit, fg)}
${paths}
${logoSVG(svgSize, unit, bg, logoRatio)}
</svg>`;
}

function generate() {
  const text = getContent();
  if (!text) {
    output.innerHTML = '<span class="qr-placeholder">输入内容后自动生成</span>';
    lastCanvas = null;
    if (metaEl) metaEl.hidden = true;
    return;
  }
  renderQR(text);
}

const debouncedGenerate = debounce(generate, 200);

function setChipActive(container, activeBtn) {
  $$(`${container} .chip`).forEach(btn => btn.classList.toggle('is-active', btn === activeBtn));
}

function applyDefaults() {
  currentType = DEFAULTS.type;
  dotStyle = DEFAULTS.dotStyle;
  ecLevel = DEFAULTS.ecLevel;

  contentEl.value = '';
  $$(CONTENT_FIELDS).forEach(el => {
    if (el.type === 'checkbox') el.checked = false;
    else el.value = '';
  });
  $('[data-wifi-enc]').value = DEFAULTS.wifiEnc;

  $$('[data-opt]').forEach(el => {
    const key = el.dataset.opt;
    if (DEFAULTS[key] != null) el.value = DEFAULTS[key];
    const rv = $(`[data-range-val="${key}"]`);
    if (rv) rv.textContent = key === 'logoRatio' ? `${DEFAULTS[key]}%` : DEFAULTS[key];
  });

  $$('[data-type]').forEach(btn => btn.classList.toggle('is-active', btn.dataset.type === DEFAULTS.type));
  $$('[data-pane]').forEach(p => { p.hidden = p.dataset.pane !== DEFAULTS.type; });

  setChipActive('[data-dot-style]', $(`[data-dot-style] [data-val="${DEFAULTS.dotStyle}"]`));
  setChipActive('[data-ec]', $(`[data-ec] [data-val="${DEFAULTS.ecLevel}"]`));

  clearLogo();
  lastCanvas = null;
}

function clearLogo() {
  logoImg = null;
  logoDataUrl = null;
  logoFile.value = '';
}

$$('[data-type]').forEach(btn => on(btn, 'click', () => {
  currentType = btn.dataset.type;
  $$('[data-type]').forEach(b => b.classList.toggle('is-active', b === btn));
  $$('[data-pane]').forEach(p => { p.hidden = p.dataset.pane !== currentType; });
  debouncedGenerate();
}));

on(contentEl, 'input', debouncedGenerate);
$$(CONTENT_FIELDS).forEach(el => {
  on(el, 'input', debouncedGenerate);
  on(el, 'change', debouncedGenerate);
});

$$('[data-opt]').forEach(el => {
  on(el, 'input', () => {
    const rv = $(`[data-range-val="${el.dataset.opt}"]`);
    if (rv) rv.textContent = el.dataset.opt === 'logoRatio' ? `${el.value}%` : el.value;
    debouncedGenerate();
  });
  on(el, 'change', debouncedGenerate);
});

$('[data-dot-style]').addEventListener('click', e => {
  const btn = e.target.closest('[data-val]');
  if (!btn) return;
  dotStyle = btn.dataset.val;
  setChipActive('[data-dot-style]', btn);
  generate();
});

$('[data-ec]').addEventListener('click', e => {
  const btn = e.target.closest('[data-val]');
  if (!btn) return;
  ecLevel = btn.dataset.val;
  setChipActive('[data-ec]', btn);
  generate();
});

on($('[data-action="pick-logo"]'), 'click', () => logoFile.click());
on(logoFile, 'change', e => {
  const f = e.target.files[0];
  if (!f) return;
  if (!f.type.startsWith('image/') || f.size > MAX_LOGO_BYTES) {
    clearLogo();
    showToast('请选择不超过 10 MB 的图片', { type: 'error' });
    return;
  }
  clearLogo();
  const reader = new FileReader();
  reader.onload = () => {
    const dataUrl = reader.result;
    const img = new Image();
    img.onload = () => {
      logoImg = img;
      logoDataUrl = dataUrl;
      showToast('Logo 已加载');
      generate();
    };
    img.onerror = () => {
      clearLogo();
      showToast('图片加载失败', { type: 'error' });
    };
    img.src = dataUrl;
  };
  reader.onerror = () => showToast('图片读取失败', { type: 'error' });
  reader.readAsDataURL(f);
});

on($('[data-action="remove-logo"]'), 'click', () => {
  clearLogo();
  showToast('Logo 已移除');
  generate();
});

on($('[data-action="download-png"]'), 'click', () => {
  if (!lastCanvas) {
    showToast('请先生成二维码', { type: 'warn' });
    return;
  }
  lastCanvas.toBlob(blob => {
    if (!blob) {
      showToast('PNG 导出失败', { type: 'error' });
      return;
    }
    downloadBlob(blob, 'qrcode.png');
    showToast('PNG 已下载');
  });
});

on($('[data-action="download-svg"]'), 'click', () => {
  const text = getContent();
  if (!text) {
    showToast('请先生成二维码', { type: 'warn' });
    return;
  }
  const svg = generateSVG(text);
  if (!svg) {
    showToast('SVG 生成失败', { type: 'error' });
    return;
  }
  downloadBlob(new Blob([svg], { type: 'image/svg+xml' }), 'qrcode.svg');
  showToast('SVG 已下载');
});

on($('[data-action="copy-png"]'), 'click', async () => {
  if (!lastCanvas) {
    showToast('请先生成二维码', { type: 'warn' });
    return;
  }
  try {
    if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined') {
      throw new Error('当前浏览器不支持复制图片');
    }
    const blob = await new Promise((resolve, reject) => {
      lastCanvas.toBlob(b => (b ? resolve(b) : reject(new Error('导出失败'))), 'image/png');
    });
    await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
    showToast('已复制到剪贴板');
  } catch (err) {
    showToast(err.message || '复制失败', { type: 'error' });
  }
});

on($('[data-action="reset"]'), 'click', () => {
  applyDefaults();
  output.innerHTML = '<span class="qr-placeholder">输入内容后自动生成</span>';
  if (metaEl) metaEl.hidden = true;
});

if (!contentEl.value) {
  try { contentEl.value = window.location.href; } catch { /* ignore */ }
}
generate();
