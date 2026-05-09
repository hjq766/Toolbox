/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { downloadBlob } from '../../public/scripts/utils/download.js';

mountToolHeader();

/* ========== 1. 常量 / 配置 ========== */
// TODO: 添加业务常量

/* ========== 2. 状态 ========== */
// TODO: 添加业务状态

/* ========== 3. DOM 引用 ========== */
const previewEl  = $('[data-preview]');
const resultPanel = $('[data-result-panel]');
const outEl      = $('[data-output]');
const generateBtn = $('[data-action="generate"]');
const copyBtn    = $('[data-action="copy"]');
const downloadBtn = $('[data-action="download"]');

// 参数控件
const lengthRange = $('[data-param="length"]');
const lengthVal   = $('[data-val="length"]');

/* ========== 4. 工具函数 ========== */

function generate() {
  // TODO: 替换为实际生成逻辑
  const length = Number(lengthRange.value);
  const result = 'A'.repeat(length); // 占位

  // 更新预览
  previewEl.textContent = result;

  // 更新输出区（如需）
  outEl.value = result;
  resultPanel.hidden = false;
}

/* ========== 5. 事件绑定 ========== */

on(generateBtn, 'click', generate);

// range 实时更新
on(lengthRange, 'input', () => {
  lengthVal.textContent = lengthRange.value;
  generate(); // 实时刷新（可选：改为手动点击）
});

// checkbox 变化时重新生成（可选）
$$('[data-param^="opt-"]').forEach(cb => {
  on(cb, 'change', generate);
});

on(copyBtn, 'click', () => {
  const text = outEl.value.trim();
  if (!text) {
    showToast('没有可复制的内容', { type: 'warn' });
    return;
  }
  copyText(text);
  showToast('已复制', { type: 'success' });
});

on(downloadBtn, 'click', () => {
  const text = outEl.value.trim();
  if (!text) return;
  // TODO: 调整文件名和类型
  const blob = new Blob([text], { type: 'text/plain' });
  downloadBlob(blob, 'generated.txt');
  showToast('下载成功', { type: 'success' });
});

// 初始化
generate();
