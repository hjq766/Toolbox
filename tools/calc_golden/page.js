/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

/* ========== 1. 常量 / 配置 ========== */
const RATIO_NAMES = {
  '1.618': '1:1.618 黄金比例', '0.618': '1:0.618 黄金分割',
  '2.618': '1:2.618 白银比例', '0.382': '1:0.382 白银分割',
  '1.414': '1:√2', '1.732': '1:√3', '2.414': '1:2.414 白金', '2': '2:1 双平方',
  '1.778': '16:9 宽屏', '1.333': '4:3 传统', '1.5': '3:2 全画幅', '1': '1:1 正方形',
};

/* ========== 2. 状态 ========== */
let currentRatio = 1.618;

/* ========== 3. DOM 引用 ========== */
const totalEl    = $('[data-total]');
const longEl     = $('[data-long]');
const shortEl    = $('[data-short]');
const previewBox = $('[data-preview]');
const barL       = $('[data-bar-l]');
const barR       = $('[data-bar-r]');
const ratioLabel = $('[data-ratio-label]');
const ratioBtns  = $$('[data-ratio]');

const stat = {
  value:    $('[data-stat="value"]'),
  pctLong:  $('[data-stat="pct-long"]'),
  pctShort: $('[data-stat="pct-short"]'),
  ratioLS:  $('[data-stat="ratio-ls"]'),
};

/* ========== 4. 工具函数 ========== */
function calc() {
  const total = parseInt(totalEl.value) || 0;
  if (total <= 0) {
    longEl.textContent = '—'; shortEl.textContent = '—';
    return;
  }

  const long  = Math.round(total * (currentRatio / (1 + currentRatio)));
  const short = total - long;

  /* 结果 */
  longEl.textContent  = long;
  shortEl.textContent = short;

  /* 预览矩形 */
  const pctL = ((long / total) * 100).toFixed(2);
  const pctS = (100 - parseFloat(pctL)).toFixed(2);
  const boxH = total / currentRatio;
  const maxW = 360, maxH = 300, minDim = 60;
  const sc = Math.min(maxW / total, maxH / boxH);
  const pw = Math.max(Math.round(total * sc), minDim);
  const ph = Math.max(Math.round(boxH * sc), minDim);
  previewBox.style.width = pw + 'px';
  previewBox.style.height = ph + 'px';
  barL.style.width = pctL + '%';
  barR.style.width = pctS + '%';
  barL.textContent = long + 'px';
  barR.textContent = short + 'px';


  /* 统计信息 */
  stat.value.textContent    = currentRatio.toFixed(3);
  stat.pctLong.textContent  = pctL + '%';
  stat.pctShort.textContent = pctS + '%';
  stat.ratioLS.textContent  = short > 0 ? (long / short).toFixed(3) : '—';

  /* 比例标签 */
  ratioLabel.textContent = '1 : ' + currentRatio;
}

/* ========== 5. 事件绑定 ========== */

/* --- 总长度输入 --- */
on(totalEl, 'input', calc);

/* --- 比例预设 --- */
ratioBtns.forEach(btn => on(btn, 'click', () => {
  currentRatio = parseFloat(btn.dataset.ratio);
  ratioBtns.forEach(b => b.classList.toggle('is-active', b === btn));
  calc();
}));

/* --- 复制 --- */
on($('[data-action="copy"]'), 'click', async () => {
  const total = totalEl.value;
  const name = RATIO_NAMES[String(currentRatio)] || ('1:' + currentRatio);
  const text = `${name}\n总长: ${total}px\n长段: ${longEl.textContent}px\n短段: ${shortEl.textContent}px`;
  const ok = await copyText(text);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

/* --- 重置 --- */
on($('[data-action="reset"]'), 'click', () => {
  currentRatio = 1.618;
  totalEl.value = 1920;
  ratioBtns.forEach(b => b.classList.toggle('is-active', b.dataset.ratio === '1.618'));
  calc();
  showToast('已重置');
});

/* ========== 初始化 ========== */
calc();
