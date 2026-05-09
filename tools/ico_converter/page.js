import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { initUploadZone } from '../_shared/upload-zone.js';

mountToolHeader();

// ── DOM ─────────────────────────────────────────────────────
const dropEl       = $('[data-drop]');
const fileEl       = $('[data-file]');
const infoPanel    = $('[data-info-panel]');
const fileNameEl   = $('[data-file-name]');
const fileSizeEl   = $('[data-file-size]');
const layersPanel  = $('[data-layers-panel]');
const layerGrid    = $('[data-layer-grid]');
const fmtGrid      = $('[data-fmt-grid]');
const qualityPanel = $('[data-quality-panel]');
const qualityInput = $('[data-quality]');
const qualityVal   = $('[data-quality-val]');
const scaleRow     = $('[data-scale-row]');
const exportBtn    = $('[data-action="export"]');
const downloadBtn  = $('[data-action="download-zip"]');

// ── State ───────────────────────────────────────────────────
let layers = [];          // { width, height, bpp, canvas }
let selectedSet = new Set();
let outputFmt = 'png';
let quality = 92;
let scale = 1;
let zipBlob = null;

// ── Upload ──────────────────────────────────────────────────
initUploadZone({ dropEl, fileEl, onFiles: files => loadFile(files[0]), accept: '*' });

on($('[data-action="re-upload"]'), 'click', () => {
  layers = [];
  selectedSet.clear();
  zipBlob = null;
  layerGrid.innerHTML = '';
  infoPanel.hidden = true;
  layersPanel.hidden = true;
  downloadBtn.hidden = true;
  exportBtn.disabled = true;
  dropEl.style.display = '';
});

// ── File Loading ────────────────────────────────────────────
async function loadFile(file) {
  const name = file.name.toLowerCase();
  const buf = await file.arrayBuffer();

  try {
    if (name.endsWith('.icns')) {
      layers = parseICNS(new DataView(buf));
    } else {
      layers = parseICO(new DataView(buf));
    }
  } catch (e) {
    showToast('无法解析该文件：' + e.message, { type: 'error' });
    return;
  }

  if (!layers.length) {
    showToast('未找到有效图层', { type: 'warn' });
    return;
  }

  // 按尺寸从大到小排序
  layers.sort((a, b) => b.width - a.width || b.height - a.height);

  dropEl.style.display = 'none';
  infoPanel.hidden = false;
  fileNameEl.textContent = file.name;
  fileSizeEl.textContent = formatBytes(file.size);
  layersPanel.hidden = false;

  selectedSet = new Set(layers.map((_, i) => i));
  renderLayers();
  updateExportBtn();
}

// ── ICO Parser ──────────────────────────────────────────────
function parseICO(dv) {
  if (dv.getUint16(0, true) !== 0) throw new Error('非有效 ICO 文件');
  const type = dv.getUint16(2, true);
  if (type !== 1 && type !== 2) throw new Error('非有效 ICO 文件');
  const count = dv.getUint16(4, true);
  const results = [];

  for (let i = 0; i < count; i++) {
    const off = 6 + i * 16;
    let w = dv.getUint8(off);
    let h = dv.getUint8(off + 1);
    if (w === 0) w = 256;
    if (h === 0) h = 256;
    const bpp = dv.getUint16(off + 6, true);
    const size = dv.getUint32(off + 8, true);
    const dataOff = dv.getUint32(off + 12, true);

    // 检查是否为嵌入的 PNG
    const sig = dv.getUint32(dataOff, false);
    const imgBuf = new Uint8Array(dv.buffer, dataOff, size);

    if (sig === 0x89504E47) {
      // PNG 数据
      const canvas = await_imageFromBlob(imgBuf, 'image/png');
      results.push({ width: w, height: h, bpp: bpp || 32, canvas, type: 'PNG' });
    } else {
      // BMP 数据（无文件头）
      const canvas = decodeBmpEntry(dv, dataOff, w, h, bpp);
      if (canvas) results.push({ width: w, height: h, bpp: bpp || 32, canvas, type: 'BMP' });
    }
  }
  return results;
}

function await_imageFromBlob(uint8, mime) {
  // 同步创建 placeholder，异步填充
  const c = document.createElement('canvas');
  const blob = new Blob([uint8], { type: mime });
  const url = URL.createObjectURL(blob);
  const img = new Image();
  const p = new Promise(resolve => {
    img.onload = () => {
      c.width = img.naturalWidth;
      c.height = img.naturalHeight;
      c.getContext('2d').drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve();
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve();
    };
    img.src = url;
  });
  c._ready = p;
  return c;
}

function decodeBmpEntry(dv, offset, w, h, bpp) {
  // DIB header (BITMAPINFOHEADER) 嵌入在 ICO entry 中
  // ICO BMP 的高度字段是实际高度的 2 倍（含 AND mask）
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');

  try {
    const headerSize = dv.getUint32(offset, true);
    const actualBpp = dv.getUint16(offset + 14, true) || bpp || 32;
    const imgData = ctx.createImageData(w, h);
    const pixels = imgData.data;
    const pixelOffset = offset + headerSize;

    if (actualBpp === 32) {
      // BGRA
      for (let y = h - 1; y >= 0; y--) {
        for (let x = 0; x < w; x++) {
          const srcIdx = pixelOffset + ((h - 1 - y) * w + x) * 4;
          const dstIdx = (y * w + x) * 4;
          pixels[dstIdx]     = dv.getUint8(srcIdx + 2); // R
          pixels[dstIdx + 1] = dv.getUint8(srcIdx + 1); // G
          pixels[dstIdx + 2] = dv.getUint8(srcIdx);     // B
          pixels[dstIdx + 3] = dv.getUint8(srcIdx + 3); // A
        }
      }
    } else if (actualBpp === 24) {
      const rowBytes = Math.ceil(w * 3 / 4) * 4;
      for (let y = h - 1; y >= 0; y--) {
        for (let x = 0; x < w; x++) {
          const srcIdx = pixelOffset + (h - 1 - y) * rowBytes + x * 3;
          const dstIdx = (y * w + x) * 4;
          pixels[dstIdx]     = dv.getUint8(srcIdx + 2);
          pixels[dstIdx + 1] = dv.getUint8(srcIdx + 1);
          pixels[dstIdx + 2] = dv.getUint8(srcIdx);
          pixels[dstIdx + 3] = 255;
        }
      }
    } else if (actualBpp === 8) {
      // 256 色调色板
      const paletteSize = 256;
      const palette = [];
      for (let i = 0; i < paletteSize; i++) {
        const po = offset + headerSize + i * 4;
        palette.push([dv.getUint8(po + 2), dv.getUint8(po + 1), dv.getUint8(po), 255]);
      }
      const dataStart = pixelOffset + paletteSize * 4;
      const rowBytes = Math.ceil(w / 4) * 4;
      for (let y = h - 1; y >= 0; y--) {
        for (let x = 0; x < w; x++) {
          const idx = dv.getUint8(dataStart + (h - 1 - y) * rowBytes + x);
          const dstIdx = (y * w + x) * 4;
          const c = palette[idx] || [0, 0, 0, 255];
          pixels[dstIdx] = c[0]; pixels[dstIdx + 1] = c[1]; pixels[dstIdx + 2] = c[2]; pixels[dstIdx + 3] = c[3];
        }
      }
    } else if (actualBpp === 4) {
      const paletteSize = 16;
      const palette = [];
      for (let i = 0; i < paletteSize; i++) {
        const po = offset + headerSize + i * 4;
        palette.push([dv.getUint8(po + 2), dv.getUint8(po + 1), dv.getUint8(po), 255]);
      }
      const dataStart = pixelOffset + paletteSize * 4;
      const rowBytes = Math.ceil(w * 4 / 32) * 4;
      for (let y = h - 1; y >= 0; y--) {
        for (let x = 0; x < w; x++) {
          const byteIdx = dataStart + (h - 1 - y) * rowBytes + Math.floor(x / 2);
          const nibble = (x % 2 === 0) ? (dv.getUint8(byteIdx) >> 4) : (dv.getUint8(byteIdx) & 0x0F);
          const dstIdx = (y * w + x) * 4;
          const c = palette[nibble] || [0, 0, 0, 255];
          pixels[dstIdx] = c[0]; pixels[dstIdx + 1] = c[1]; pixels[dstIdx + 2] = c[2]; pixels[dstIdx + 3] = c[3];
        }
      }
    } else {
      return null;
    }

    ctx.putImageData(imgData, 0, 0);
    c._ready = Promise.resolve();
    return c;
  } catch {
    return null;
  }
}

// ── ICNS Parser ─────────────────────────────────────────────
const ICNS_TYPES = {
  'icp4': 16,  'icp5': 32,  'icp6': 64,
  'ic07': 128, 'ic08': 256, 'ic09': 512, 'ic10': 1024,
  'ic11': 32,  'ic12': 64,  'ic13': 256, 'ic14': 512,
  'ic04': 16,  'ic05': 32,
  'is32': 16,  'il32': 32,  'ih32': 48,  'it32': 128,
  'IS32': 16,  'IL32': 32,  'IH32': 48,  'IT32': 128,
};

function parseICNS(dv) {
  const magic = String.fromCharCode(dv.getUint8(0), dv.getUint8(1), dv.getUint8(2), dv.getUint8(3));
  if (magic !== 'icns') throw new Error('非有效 ICNS 文件');
  const totalSize = dv.getUint32(4, false);
  const results = [];
  let pos = 8;

  while (pos < totalSize && pos < dv.byteLength - 8) {
    const type = String.fromCharCode(dv.getUint8(pos), dv.getUint8(pos + 1), dv.getUint8(pos + 2), dv.getUint8(pos + 3));
    const chunkSize = dv.getUint32(pos + 4, false);
    if (chunkSize < 8) break;

    const dataStart = pos + 8;
    const dataSize = chunkSize - 8;

    // 跳过 TOC / info 等元数据
    if (type !== 'TOC ' && type !== 'info' && type !== 'icnV' && dataSize > 0) {
      // 检查是否为 PNG 或 JPEG 2000
      const sig = dataSize >= 4 ? dv.getUint32(dataStart, false) : 0;
      const isPNG = sig === 0x89504E47;
      const isJP2 = sig === 0x0000000C || (sig >>> 8) === 0x000000;

      if (isPNG || isJP2) {
        const imgBuf = new Uint8Array(dv.buffer, dataStart, dataSize);
        const mime = isPNG ? 'image/png' : 'image/jp2';
        const expectedSize = ICNS_TYPES[type] || 0;
        const canvas = await_imageFromBlob(imgBuf, mime);
        results.push({
          width: expectedSize || 0,
          height: expectedSize || 0,
          bpp: 32,
          canvas,
          type: isPNG ? 'PNG' : 'JP2',
          icnsType: type,
          _needSizeFromCanvas: !expectedSize
        });
      }
    }

    pos += chunkSize;
  }

  return results;
}

// ── Layer Rendering ─────────────────────────────────────────
async function renderLayers() {
  // 等待所有图层加载完成
  await Promise.all(layers.map(l => l.canvas._ready));

  // 修正从 canvas 获取真实尺寸
  layers.forEach(l => {
    if (l._needSizeFromCanvas || !l.width) {
      l.width = l.canvas.width;
      l.height = l.canvas.height;
    }
  });

  layerGrid.innerHTML = '';

  layers.forEach((layer, i) => {
    const card = document.createElement('div');
    card.className = 'layer-card' + (selectedSet.has(i) ? ' selected' : '');

    // 预览 canvas
    const previewSize = Math.min(80, Math.max(32, layer.width));
    const displayW = Math.min(previewSize, layer.width);
    const displayH = Math.min(previewSize, layer.height);

    const pvCanvas = document.createElement('canvas');
    pvCanvas.width = displayW;
    pvCanvas.height = displayH;
    pvCanvas.style.width = displayW + 'px';
    pvCanvas.style.height = displayH + 'px';
    pvCanvas.getContext('2d').drawImage(layer.canvas, 0, 0, displayW, displayH);

    card.innerHTML = `
      <div class="check"></div>
      <div class="lc-preview checker"></div>
      <div class="lc-info">
        <div class="lc-size">${layer.width} × ${layer.height}</div>
        <div class="lc-meta">${layer.bpp}bit · ${layer.type || 'BMP'}</div>
      </div>`;

    card.querySelector('.lc-preview').appendChild(pvCanvas);

    card.addEventListener('click', () => {
      if (selectedSet.has(i)) selectedSet.delete(i);
      else selectedSet.add(i);
      card.classList.toggle('selected', selectedSet.has(i));
      updateExportBtn();
    });

    layerGrid.appendChild(card);
  });
}

function updateExportBtn() {
  exportBtn.disabled = selectedSet.size === 0;
  exportBtn.textContent = selectedSet.size
    ? `导出选中图层（${selectedSet.size}）`
    : '导出选中图层';
}

// ── Select All / None ───────────────────────────────────────
on($('[data-action="select-all"]'), 'click', () => {
  selectedSet = new Set(layers.map((_, i) => i));
  $$('.layer-card', layerGrid).forEach(c => c.classList.add('selected'));
  updateExportBtn();
});

on($('[data-action="select-none"]'), 'click', () => {
  selectedSet.clear();
  $$('.layer-card', layerGrid).forEach(c => c.classList.remove('selected'));
  updateExportBtn();
});

// ── Format Switch ───────────────────────────────────────────
$$('[data-fmt]', fmtGrid).forEach(btn => on(btn, 'click', () => {
  outputFmt = btn.dataset.fmt;
  $$('[data-fmt]', fmtGrid).forEach(b => b.classList.toggle('active', b === btn));
  qualityPanel.hidden = outputFmt === 'png';
}));

// ── Quality ─────────────────────────────────────────────────
on(qualityInput, 'input', () => {
  quality = +qualityInput.value;
  qualityVal.textContent = quality + '%';
});

// ── Scale ───────────────────────────────────────────────────
$$('[data-scale]', scaleRow).forEach(btn => on(btn, 'click', () => {
  scale = +btn.dataset.scale;
  $$('[data-scale]', scaleRow).forEach(b => b.classList.toggle('active', b === btn));
}));

// ── Export ───────────────────────────────────────────────────
on(exportBtn, 'click', async () => {
  if (!selectedSet.size) return;

  const selected = layers.filter((_, i) => selectedSet.has(i));
  const mime = outputFmt === 'jpg' ? 'image/jpeg' : outputFmt === 'webp' ? 'image/webp' : 'image/png';
  const ext = outputFmt === 'jpg' ? '.jpg' : outputFmt === 'webp' ? '.webp' : '.png';
  const q = outputFmt === 'png' ? undefined : quality / 100;

  if (selected.length === 1) {
    // 单个直接下载
    const layer = selected[0];
    const outCanvas = applyScale(layer.canvas, scale);
    const blob = await canvasToBlob(outCanvas, mime, q);
    const suffix = scale > 1 ? `@${scale}x` : '';
    downloadBlob(blob, `icon_${layer.width}x${layer.height}${suffix}${ext}`);
    showToast('导出成功');
  } else {
    // 多个打包 ZIP
    exportBtn.disabled = true;
    exportBtn.textContent = '正在打包…';
    const zip = new JSZip();

    for (const layer of selected) {
      const outCanvas = applyScale(layer.canvas, scale);
      const blob = await canvasToBlob(outCanvas, mime, q);
      const suffix = scale > 1 ? `@${scale}x` : '';
      zip.file(`icon_${layer.width}x${layer.height}${suffix}${ext}`, blob);
    }

    zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, 'icons.zip');
    downloadBtn.hidden = false;
    showToast(`已导出 ${selected.length} 个图层`);
    updateExportBtn();
  }
});

on(downloadBtn, 'click', () => {
  if (zipBlob) downloadBlob(zipBlob, 'icons.zip');
});

// ── Helpers ─────────────────────────────────────────────────
function applyScale(canvas, s) {
  if (s === 1) return canvas;
  const c = document.createElement('canvas');
  c.width = canvas.width * s;
  c.height = canvas.height * s;
  const ctx = c.getContext('2d');
  ctx.imageSmoothingEnabled = false;
  ctx.drawImage(canvas, 0, 0, c.width, c.height);
  return c;
}

function canvasToBlob(canvas, mime, quality) {
  return new Promise(resolve => canvas.toBlob(resolve, mime, quality));
}

function downloadBlob(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 5000);
}

function formatBytes(b) {
  if (b < 1024) return b + ' B';
  if (b < 1048576) return (b / 1024).toFixed(1) + ' KB';
  return (b / 1048576).toFixed(2) + ' MB';
}
