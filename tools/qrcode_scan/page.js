import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { initUploadZone } from '../_shared/upload-zone.js';

mountToolHeader();

// ── DOM ─────────────────────────────────────────────────────
const dropEl    = $('[data-drop]');
const fileEl    = $('[data-file]');
const previewEl = $('[data-preview]');
const imgEl     = $('[data-img]');
const noResult  = $('[data-no-result]');
const resultEl  = $('[data-result]');
const typeEl    = $('[data-result-type]');
const timeEl    = $('[data-result-time]');
const bodyEl    = $('[data-result-body]');
const rawText   = $('[data-raw-text]');
const openUrlBtn = $('[data-action="open-url"]');

// ── 上传 ────────────────────────────────────────────────────
initUploadZone({ dropEl, fileEl, onFiles: files => loadImage(files[0]), accept: 'image', onDelete: resetToUpload });

function loadImage(file) {
  const reader = new FileReader();
  reader.onload = ev => {
    imgEl.src = ev.target.result;
    dropEl.style.display = 'none';
    previewEl.hidden = false;
    scanImage(file);
  };
  reader.readAsDataURL(file);
}

// ── 多通道识别引擎 ──────────────────────────────────────────
// jsQR 对低对比度/模糊/彩色底图识别率低，
// 通过多种预处理 pass 大幅提升成功率

function imageToCanvas(img) {
  const c = document.createElement('canvas');
  c.width = img.naturalWidth || img.width;
  c.height = img.naturalHeight || img.height;
  c.getContext('2d').drawImage(img, 0, 0);
  return c;
}

function getImageData(canvas) {
  return canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
}

// 灰度化
function grayscale(src) {
  const d = new Uint8ClampedArray(src.data);
  for (let i = 0; i < d.length; i += 4) {
    const g = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
    d[i] = d[i + 1] = d[i + 2] = g;
  }
  return new ImageData(d, src.width, src.height);
}

// 对比度增强
function contrast(src, factor) {
  const d = new Uint8ClampedArray(src.data);
  const f = (259 * (factor + 255)) / (255 * (259 - factor));
  for (let i = 0; i < d.length; i += 4) {
    d[i]     = Math.max(0, Math.min(255, f * (d[i] - 128) + 128));
    d[i + 1] = Math.max(0, Math.min(255, f * (d[i + 1] - 128) + 128));
    d[i + 2] = Math.max(0, Math.min(255, f * (d[i + 2] - 128) + 128));
  }
  return new ImageData(d, src.width, src.height);
}

// 二值化
function binarize(src, threshold) {
  const d = new Uint8ClampedArray(src.data);
  for (let i = 0; i < d.length; i += 4) {
    const g = d[i] * 0.299 + d[i + 1] * 0.587 + d[i + 2] * 0.114;
    const v = g > threshold ? 255 : 0;
    d[i] = d[i + 1] = d[i + 2] = v;
  }
  return new ImageData(d, src.width, src.height);
}

// 反色
function invert(src) {
  const d = new Uint8ClampedArray(src.data);
  for (let i = 0; i < d.length; i += 4) {
    d[i] = 255 - d[i]; d[i + 1] = 255 - d[i + 1]; d[i + 2] = 255 - d[i + 2];
  }
  return new ImageData(d, src.width, src.height);
}

// 缩放（过大图片缩小可提升识别率和速度）
function scaleDown(canvas, maxDim) {
  if (canvas.width <= maxDim && canvas.height <= maxDim) return canvas;
  const ratio = Math.min(maxDim / canvas.width, maxDim / canvas.height);
  const c = document.createElement('canvas');
  c.width = Math.round(canvas.width * ratio);
  c.height = Math.round(canvas.height * ratio);
  c.getContext('2d').drawImage(canvas, 0, 0, c.width, c.height);
  return c;
}

function tryDecode(imageData) {
  return jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });
}

function multiPassScan(canvas) {
  // pass 0: 原始图
  const raw = getImageData(canvas);
  let code = tryDecode(raw);
  if (code) return code;

  // pass 1: 缩放后原始
  const scaled = scaleDown(canvas, 800);
  if (scaled !== canvas) {
    code = tryDecode(getImageData(scaled));
    if (code) return code;
  }

  const gray = grayscale(getImageData(scaled));

  // pass 2: 灰度
  code = tryDecode(gray);
  if (code) return code;

  // pass 3: 高对比度灰度
  code = tryDecode(contrast(gray, 128));
  if (code) return code;

  // pass 4-7: 多阈值二值化
  for (const t of [100, 128, 160, 80]) {
    code = tryDecode(binarize(gray, t));
    if (code) return code;
  }

  // pass 8: 反色
  code = tryDecode(invert(gray));
  if (code) return code;

  // pass 9: 超高对比度
  code = tryDecode(contrast(gray, 200));
  if (code) return code;

  return null;
}

// ── 图片扫描 ────────────────────────────────────────────────
function scanImage(file) {
  const img = new Image();
  img.onload = () => {
    const canvas = imageToCanvas(img);
    const code = multiPassScan(canvas);
    if (code) {
      displayResult(code.data);
    } else {
      showToast('未能识别到二维码，请确认图片中包含清晰的二维码', { type: 'warn' });
      noResult.hidden = false;
      resultEl.hidden = true;
    }
    URL.revokeObjectURL(img.src);
  };
  img.src = URL.createObjectURL(file);
}

// ── 结果解析与展示 ──────────────────────────────────────────
function displayResult(text) {
  noResult.hidden = true;
  resultEl.hidden = false;
  rawText.value = text;
  timeEl.textContent = new Date().toLocaleTimeString();

  const parsed = parseQR(text);
  const typeNames = { weixin: '微信', wifi: 'WiFi', email: '邮件', url: '链接', vcard: '名片', text: '文本' };
  typeEl.textContent = typeNames[parsed.type] || '文本';
  bodyEl.innerHTML = formatResult(parsed);

  // URL 类型显示"打开链接"按钮
  const isUrl = parsed.type === 'url' || parsed.type === 'weixin';
  openUrlBtn.hidden = !isUrl;
  if (isUrl) openUrlBtn.onclick = () => window.open(parsed.data.url, '_blank', 'noopener');
}

function parseQR(text) {
  if (text.startsWith('wxp://') || text.startsWith('weixin://'))
    return { type: 'weixin', data: { url: text } };
  if (text.startsWith('WIFI:')) {
    const d = {};
    text.replace('WIFI:', '').split(';').forEach(p => {
      const idx = p.indexOf(':');
      if (idx > 0) d[p.slice(0, idx)] = p.slice(idx + 1);
    });
    return { type: 'wifi', data: d };
  }
  if (text.startsWith('mailto:')) {
    const [email, params] = text.replace('mailto:', '').split('?');
    const d = { email };
    if (params) new URLSearchParams(params).forEach((v, k) => { d[k] = decodeURIComponent(v); });
    return { type: 'email', data: d };
  }
  if (/^https?:\/\//i.test(text)) return { type: 'url', data: { url: text } };
  if (text.startsWith('BEGIN:VCARD')) return { type: 'vcard', data: parseVCard(text) };
  return { type: 'text', data: { text } };
}

function parseVCard(text) {
  const d = {};
  text.split(/\r?\n/).forEach(line => {
    if (line.startsWith('FN:')) d.name = line.slice(3);
    if (line.startsWith('TEL')) d.phone = line.split(':').pop();
    if (line.startsWith('EMAIL')) d.email = line.split(':').pop();
    if (line.startsWith('ORG:')) d.org = line.slice(4);
    if (line.startsWith('ADR')) d.addr = line.split(':').pop().replace(/;/g, ' ').trim();
  });
  return d;
}

function esc(s) { const d = document.createElement('div'); d.textContent = s; return d.innerHTML; }

function formatResult(parsed) {
  const row = (label, value) => `<div class="rr"><span class="rr-label">${label}</span><span class="rr-val">${value}</span></div>`;

  switch (parsed.type) {
    case 'weixin':
      return row('链接', esc(parsed.data.url));
    case 'wifi':
      return row('网络名', esc(parsed.data.S || '-')) + row('加密', esc(parsed.data.T || 'WPA')) + row('密码', `<code>${esc(parsed.data.P || '-')}</code>`);
    case 'email': {
      let h = row('收件人', `<a href="mailto:${esc(parsed.data.email)}">${esc(parsed.data.email)}</a>`);
      if (parsed.data.subject) h += row('主题', esc(parsed.data.subject));
      if (parsed.data.body) h += row('正文', esc(parsed.data.body));
      return h;
    }
    case 'url':
      return row('网址', `<a href="${esc(parsed.data.url)}" target="_blank" rel="noopener">${esc(parsed.data.url)}</a>`);
    case 'vcard': {
      const d = parsed.data;
      let h = '';
      if (d.name)  h += row('姓名', esc(d.name));
      if (d.phone) h += row('电话', esc(d.phone));
      if (d.email) h += row('邮箱', esc(d.email));
      if (d.org)   h += row('公司', esc(d.org));
      if (d.addr)  h += row('地址', esc(d.addr));
      return h || row('名片', '(无详细信息)');
    }
    default:
      return row('内容', esc(parsed.data.text));
  }
}

// ── 事件 ────────────────────────────────────────────────────

// 复制
on($('[data-action="copy"]'), 'click', () => {
  if (!rawText.value) return;
  copyText(rawText.value);
  showToast('已复制');
});

function resetToUpload() {
  previewEl.hidden = true;
  dropEl.style.display = '';
  noResult.hidden = false;
  resultEl.hidden = true;
  imgEl.src = '';
  rawText.value = '';
}

