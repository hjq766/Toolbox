/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on, debounce } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { createEditor } from '../_shared/code-editor.js';

mountToolHeader();

/* ========== 1. 常量 / 配置 ========== */
// TODO: 配置输入/输出 CodeMirror 模式
const INPUT_MODE  = 'javascript';   // 'javascript' | 'xml' | 'css' | 'htmlmixed' | 'markdown'
const OUTPUT_MODE = 'javascript';

/* ========== 2. 状态 ========== */
// 无额外状态

/* ========== 3. DOM 引用 ========== */
const srcEl   = $('[data-input="src"]');
const outEl   = $('[data-output]');
const runBtn  = $('[data-action="run"]');
const copyBtn = $('[data-action="copy"]');
const clearBtn = $('[data-action="clear"]');

/* ========== 4. 工具函数 ========== */

function process() {
  const src = srcEl.value.trim();
  if (!src) {
    outEl.value = '';
    return;
  }

  // TODO: 替换为实际处理逻辑
  // 示例：CDN 库 guard + 处理
  // if (!window.js_beautify) {
  //   showToast('js-beautify 尚未加载，请稍后重试', { type: 'warn' });
  //   return;
  // }

  try {
    // TODO: 替换处理函数
    const result = src; // 默认原样输出
    outEl.value = result;
  } catch (e) {
    showToast(`处理失败：${e.message}`, { type: 'error' });
  }
}

/* ========== 5. 事件绑定 ========== */

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
  showToast('已清空');
});

// 挂载 CodeMirror 编辑器
(async () => {
  await createEditor(srcEl, { mode: INPUT_MODE });
  await createEditor(outEl, { mode: OUTPUT_MODE, readOnly: true });

  // 输入变化时自动处理（可选，取消注释即启用）
  // on(srcEl, 'input', debounce(process, 300));
})();
