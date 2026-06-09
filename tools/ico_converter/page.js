import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { initUploadZone } from '../_shared/upload-zone.js';

mountToolHeader();

// ── DOM ─────────────────────────────────────────────────────
const dropEl       = $('[data-drop]');
const fileEl       = $('[data-file]');
const fileNameEl   = $('[data-file-name]');
const fileSizeEl   = $('[data-file-size]');
const layersPanel  = $('[data-layers-panel]');
const layerGrid    = $('[data-layer-grid]');
const qualityPanel = $('[data-quality-panel]');
const qualityInput = $('[data-quality]');
const qualityVal   = $('[data-quality-val]');
const exportBtn    = $('[data-action="export"]');
const downloadBtn  = $('[data-action="download-zip"]');
const progEl       = $('[data-progress]');
const barEl        = $('[data-bar]');
const progText     = $('[data-prog-text]');
const layerModal   = $('[data-layer-modal]');
const modalCv      = $('[data-modal-cv]');
const modalInfo    = $('[data-modal-info]');

// ── State ───────────────────────────────────────────────────
let layers = [];          // { width, height, bpp, canvas }
let selectedSet = new Set();
let outputFmt = 'png';
let quality = 92;
let scale = 1;
let zipBlob = null;

// ── Upload ──────────────────────────────────────────────────
initUploadZone({ dropEl, fileEl, onFiles: files => loadFile(files[0]), accept: '*', onDelete: clearLayers });

function clearLayers() {
  layers = [];
  selectedSet.clear();
  zipBlob = null;
  layerGrid.innerHTML = '';
  layersPanel.hidden = true;
  downloadBtn.disabled = true;
  exportBtn.disabled = true;
  dropEl.style.display = '';
}

// ── File Loading ────────────────────────────────────────────
async function loadFile(file) {
  const name = file.name.toLowerCase();
  if (!name.endsWith('.ico') && !name.endsWith('.icns')) {
    showToast('请上传 ICO 或 ICNS 格式的文件'); return;
  }
  const buf = await file.arrayBuffer();

  try {
    layers = name.endsWith('.icns')
      ? await parseICNS(new DataView(buf))
      : await parseICO(new DataView(buf));
  } catch (e) {
    showToast('无法解析该文件：' + e.message); return;
  }

  if (!layers.length) { showToast('未找到有效图层'); return; }

  layers.sort((a, b) => b.width - a.width || b.height - a.height);

  dropEl.style.display = 'none';
  fileNameEl.textContent = file.name;
  fileSizeEl.textContent = formatBytes(file.size);
  layersPanel.hidden = false;

  selectedSet = new Set(layers.map((_, i) => i));
  renderLayers();
  updateExportBtn();
}

// ── ICO Parser ──────────────────────────────────────────────
async function parseICO(dv) {
  if (dv.getUint16(0, true) !== 0) throw new Error('非有效 ICO 文件');
  const type = dv.getUint16(2, true);
  if (type !== 1 && type !== 2) throw new Error('非有效 ICO 文件');
  const count = dv.getUint16(4, true);
  const results = [];

  for (let i = 0; i < count; i++) {
    const off = 6 + i * 16;
    let w = dv.getUint8(off); let h = dv.getUint8(off + 1);
    if (w === 0) w = 256; if (h === 0) h = 256;
    const bpp = dv.getUint16(off + 6, true);
    const size = dv.getUint32(off + 8, true);
    const dataOff = dv.getUint32(off + 12, true);
    const sig = dv.getUint32(dataOff, false);
    const imgBuf = new Uint8Array(dv.buffer, dataOff, size);

    if (sig === 0x89504E47) {
      const canvas = await imageFromBlob(imgBuf, 'image/png');
      results.push({ width: w, height: h, bpp: bpp || 32, canvas, type: 'PNG' });
    } else {
      const canvas = decodeBmpEntry(dv, dataOff, w, h, bpp);
      if (canvas) results.push({ width: w, height: h, bpp: bpp || 32, canvas, type: 'BMP' });
    }
  }
  return results;
}

async function imageFromBlob(uint8, mime) {
  const cv = document.createElement('canvas');
  const url = URL.createObjectURL(new Blob([uint8], { type: mime }));
  await new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      cv.width = img.naturalWidth; cv.height = img.naturalHeight;
      cv.getContext('2d').drawImage(img, 0, 0);
      URL.revokeObjectURL(url); resolve();
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(); };
    img.src = url;
  });
  return cv;
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
          const rgb = palette[idx] || [0, 0, 0, 255];
          pixels[dstIdx] = rgb[0]; pixels[dstIdx + 1] = rgb[1]; pixels[dstIdx + 2] = rgb[2]; pixels[dstIdx + 3] = rgb[3];
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
          const rgb = palette[nibble] || [0, 0, 0, 255];
          pixels[dstIdx] = rgb[0]; pixels[dstIdx + 1] = rgb[1]; pixels[dstIdx + 2] = rgb[2]; pixels[dstIdx + 3] = rgb[3];
        }
      }
    } else {
      return null;
    }

    ctx.putImageData(imgData, 0, 0);
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

async function parseICNS(dv) {
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

    if (type !== 'TOC ' && type !== 'info' && type !== 'icnV' && dataSize > 0) {
      const sig = dataSize >= 4 ? dv.getUint32(dataStart, false) : 0;
      const isPNG = sig === 0x89504E47;
      const isJP2 = sig === 0x0000000C || (sig >>> 8) === 0x000000;

      if (isPNG || isJP2) {
        const imgBuf = new Uint8Array(dv.buffer, dataStart, dataSize);
        const canvas = await imageFromBlob(imgBuf, isPNG ? 'image/png' : 'image/jp2');
        const sz = ICNS_TYPES[type] || canvas.width;
        results.push({
          width: sz || canvas.width, height: sz || canvas.height,
          bpp: 32, canvas, type: isPNG ? 'PNG' : 'JP2', icnsType: type
        });
      }
    }
    pos += chunkSize;
  }
  return results;
}

// ── Layer Rendering ─────────────────────────────────────────
function renderLayers() {
  layerGrid.innerHTML = '';
  layers.forEach((layer, i) => {
    const card = document.createElement('div');
    card.className = 'layer-card' + (selectedSet.has(i) ? ' selected' : '');

    const previewSize = Math.min(80, Math.max(32, layer.width));
    const displayW = Math.min(previewSize, layer.width);
    const displayH = Math.min(previewSize, layer.height);
    const pvCanvas = document.createElement('canvas');
    pvCanvas.width = displayW; pvCanvas.height = displayH;
    pvCanvas.style.width = displayW + 'px'; pvCanvas.style.height = displayH + 'px';
    pvCanvas.getContext('2d').drawImage(layer.canvas, 0, 0, displayW, displayH);

    card.innerHTML = `
      <div class="check"></div>
      <div class="lc-preview checker"></div>
      <div class="lc-info">
        <div class="lc-size">${layer.width}×${layer.height} <span class="lc-meta">${layer.bpp}bit · ${layer.type || 'BMP'}</span></div>
      </div>`;
    card.querySelector('.lc-preview').appendChild(pvCanvas);

    card.addEventListener('click', () => {
      if (selectedSet.has(i)) selectedSet.delete(i);
      else selectedSet.add(i);
      card.classList.toggle('selected', selectedSet.has(i));
      updateExportBtn();
    });

    pvCanvas.addEventListener('click', e => {
      e.stopPropagation();
      const dispSz = Math.min(Math.max(layer.width, 128), 512);
      modalCv.width = modalCv.height = dispSz;
      modalCv.style.cssText = `width:${dispSz}px;height:${dispSz}px`;
      modalCv.getContext('2d').drawImage(layer.canvas, 0, 0, dispSz, dispSz);
      modalInfo.textContent = `${layer.width}×${layer.height} · ${layer.bpp}bit · ${layer.type || 'BMP'}`;
      layerModal.hidden = false;
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
$('[data-fmt-opts]').addEventListener('click', e => {
  const btn = e.target.closest('[data-fmt]'); if (!btn) return;
  outputFmt = btn.dataset.fmt;
  $('[data-fmt-opts]').querySelectorAll('[data-fmt]').forEach(b => b.classList.toggle('active', b === btn));
  qualityPanel.hidden = outputFmt === 'png';
});

// ── Quality ─────────────────────────────────────────────────
on(qualityInput, 'input', () => {
  quality = +qualityInput.value;
  qualityVal.textContent = quality + '%';
});

// ── Scale ───────────────────────────────────────────────────
$('[data-scale-row]').addEventListener('click', e => {
  const btn = e.target.closest('[data-scale]'); if (!btn) return;
  scale = +btn.dataset.scale;
  $('[data-scale-row]').querySelectorAll('[data-scale]').forEach(b => b.classList.toggle('active', b === btn));
});

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
    exportBtn.disabled = true;
    progEl.hidden = false; barEl.style.width = '0%';
    const zip = new JSZip();

    for (let idx = 0; idx < selected.length; idx++) {
      const layer = selected[idx];
      const outCanvas = applyScale(layer.canvas, scale);
      const blob = await canvasToBlob(outCanvas, mime, q);
      const suffix = scale > 1 ? `@${scale}x` : '';
      zip.file(`icon_${layer.width}x${layer.height}${suffix}${ext}`, blob);
      barEl.style.width = Math.round((idx + 1) / selected.length * 100) + '%';
      progText.textContent = `${idx + 1} / ${selected.length}`;
    }

    zipBlob = await zip.generateAsync({ type: 'blob' });
    downloadBlob(zipBlob, 'icons.zip');
    downloadBtn.disabled = false;
    showToast(`已导出 ${selected.length} 个图层`);
    exportBtn.disabled = false;
    progEl.hidden = true;
    updateExportBtn();
  }
});

on(downloadBtn, 'click', () => {
  if (zipBlob) downloadBlob(zipBlob, 'icons.zip');
});

// ── Modal ─────────────────────────────────────────────────────
$('[data-modal-close]').addEventListener('click', () => { layerModal.hidden = true; });
layerModal.addEventListener('click', e => { if (e.target === layerModal) layerModal.hidden = true; });

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
