import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

/* ================= DOM ================= */
const wEl        = $('[data-w]');
const hEl        = $('[data-h]');
const lockEl     = $('[data-lock]');
const previewBox = $('[data-preview]');
const prevRatio  = $('[data-preview-ratio]');
const prevSize   = $('[data-preview-size]');
const ratioBtns  = $$('[data-ratio]');

const stat = {
  ratio:  $('[data-stat="ratio"]'),
  value:  $('[data-stat="value"]'),
  diag:   $('[data-stat="diag"]'),
  pixels: $('[data-stat="pixels"]'),
  orient: $('[data-stat="orient"]'),
};

/* ================= 状态 ================= */
let ratioW = 16, ratioH = 9;
let updating = false;

/* ================= 工具函数 ================= */
function gcd(a, b) { return b === 0 ? a : gcd(b, a % b); }

function formatPx(n) {
  return n >= 1e6 ? (n / 1e6).toFixed(2) + 'M' : n >= 1e3 ? (n / 1e3).toFixed(1) + 'K' : String(n);
}

/* ================= 核心更新 ================= */
function update() {
  const w = parseInt(wEl.value) || 0;
  const h = parseInt(hEl.value) || 0;
  if (w <= 0 || h <= 0) return;

  const d = gcd(w, h);
  const sr = `${w / d}:${h / d}`;
  const diag = Math.sqrt(w * w + h * h);
  const total = w * h;
  const orient = w > h ? '横向' : w < h ? '纵向' : '正方形';

  stat.ratio.textContent  = sr;
  stat.value.textContent  = (w / h).toFixed(3);
  stat.diag.textContent   = Math.round(diag) + ' px';
  stat.pixels.textContent = formatPx(total);
  stat.orient.textContent = orient;

  prevRatio.textContent = sr;
  prevSize.textContent  = `${w} × ${h}`;

  /* 预览框：按比例填满容器（最大 360×320，最小 60） */
  const maxW = 360, maxH = 320, minDim = 60;
  const scale = Math.min(maxW / w, maxH / h);
  const pw = Math.max(Math.round(w * scale), minDim);
  const ph = Math.max(Math.round(h * scale), minDim);
  previewBox.style.width  = pw + 'px';
  previewBox.style.height = ph + 'px';
}

/* ================= 尺寸输入 ================= */
function onWidth() {
  if (updating) return;
  updating = true;
  const w = parseInt(wEl.value);
  if (w > 0 && lockEl.checked) hEl.value = Math.round(w * (ratioH / ratioW));
  update();
  updating = false;
}

function onHeight() {
  if (updating) return;
  updating = true;
  const h = parseInt(hEl.value);
  if (h > 0 && lockEl.checked) wEl.value = Math.round(h * (ratioW / ratioH));
  update();
  updating = false;
}

on(wEl, 'input', onWidth);
on(hEl, 'input', onHeight);

/* 解锁时也刷新比例基准 */
on(lockEl, 'change', () => {
  if (lockEl.checked) {
    const w = parseInt(wEl.value) || 1;
    const h = parseInt(hEl.value) || 1;
    const d = gcd(w, h);
    ratioW = w / d;
    ratioH = h / d;
  }
});

/* ================= 比例预设 ================= */
ratioBtns.forEach(btn => on(btn, 'click', () => {
  const parts = btn.dataset.ratio.split(':').map(Number);
  ratioW = parts[0]; ratioH = parts[1];

  ratioBtns.forEach(b => b.classList.toggle('active', b === btn));
  lockEl.checked = true;

  const preset = btn.dataset.preset ? JSON.parse(btn.dataset.preset) : null;
  if (preset) {
    wEl.value = preset.w;
    hEl.value = preset.h;
  } else {
    wEl.value = 1920;
    hEl.value = Math.round(1920 * (ratioH / ratioW));
  }
  update();
}));

/* ================= 操作按钮 ================= */
on($('[data-action="swap"]'), 'click', () => {
  const tmp = wEl.value;
  wEl.value = hEl.value;
  hEl.value = tmp;
  /* 同步比例基准 */
  const t = ratioW; ratioW = ratioH; ratioH = t;
  update();
  showToast('已交换');
});

on($('[data-action="copy"]'), 'click', async () => {
  const w = wEl.value, h = hEl.value;
  const text = `${stat.ratio.textContent}（${w} × ${h}）`;
  const ok = await copyText(text);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

on($('[data-action="reset"]'), 'click', () => {
  ratioW = 16; ratioH = 9;
  wEl.value = 1920; hEl.value = 1080;
  lockEl.checked = true;
  ratioBtns.forEach(b => b.classList.toggle('active', b.dataset.ratio === '16:9'));
  update();
  showToast('已重置');
});

/* ================= 初始化 ================= */
update();
