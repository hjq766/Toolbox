/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';

mountToolHeader();

/* ========== 1. 常量 / 配置 ========== */
// TODO: 添加工具专属常量

/* ========== 2. 状态 ========== */
// 无额外状态

/* ========== 3. DOM 引用 ========== */
const srcEl     = $('[data-input="src"]');
const outEl     = $('[data-output]');
const charsStat = $('[data-stat="chars"]');
const wordsStat = $('[data-stat="words"]');
const linesStat = $('[data-stat="lines"]');
const runBtn    = $('[data-action="run"]');
const copyBtn   = $('[data-action="copy"]');
const clearBtn  = $('[data-action="clear"]');

/* ========== 4. 工具函数 ========== */

function updateStats(text) {
  charsStat.textContent = text.length;
  wordsStat.textContent = text.trim() ? text.trim().split(/\s+/).length : 0;
  linesStat.textContent = text ? text.split('\n').length : 0;
}

function process() {
  const src = srcEl.value;
  if (!src.trim()) {
    outEl.value = '';
    return;
  }

  // TODO: 替换为实际处理逻辑
  const result = src;
  outEl.value = result;
}

/* ========== 5. 事件绑定 ========== */

on(srcEl, 'input', () => updateStats(srcEl.value));
on(runBtn, 'click', process);

on(copyBtn, 'click', () => {
  const text = outEl.value.trim();
  if (!text) {
    showToast('没有可复制的内容', { type: 'warn' });
    return;
  }
  copyText(text);
  showToast('已复制', { type: 'success' });
});

on(clearBtn, 'click', () => {
  srcEl.value = '';
  outEl.value = '';
  updateStats('');
  showToast('已清空');
});
