import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

/* globals OpenCC */
// 先归一化为简体，再从简体转到目标变体，确保任意输入都能正确转换
const toSimplified = OpenCC.Converter({ from: 't', to: 'cn' });
const converters = {
  zh_cn:   toSimplified,
  zh_hant: OpenCC.Converter({ from: 'cn', to: 't' }),
  zh_hk:   OpenCC.Converter({ from: 'cn', to: 'hk' }),
  zh_tw:   OpenCC.Converter({ from: 'cn', to: 'twp' }),
};

function toTarget(text, mode) {
  if (mode === 'zh_cn') return toSimplified(text);
  return converters[mode](toSimplified(text));
}

const inputEl  = $('[data-input]');
const outputEl = $('[data-output]');
const countEl  = $('[data-count]');

let currentMode = 'zh_cn';

/* ---------- 实时转换 ---------- */
on(inputEl, 'input', () => convert());

/* ---------- 模式切换 ---------- */
$$('[data-mode]').forEach(btn => on(btn, 'click', () => {
  currentMode = btn.dataset.mode;
  $$('[data-mode]').forEach(b => b.classList.toggle('is-active', b === btn));
  convert();
}));

function convert() {
  const text = inputEl.value;
  if (!text) { outputEl.value = ''; countEl.textContent = '0 字'; return; }
  try {
    outputEl.value = toTarget(text, currentMode);
    countEl.textContent = `${outputEl.value.length} 字`;
  } catch (e) {
    showToast('转换失败：' + e.message, { type: 'error' });
  }
}

/* ---------- 示例 ---------- */
const SAMPLE = '天地玄黄，宇宙洪荒。日月盈昃，辰宿列张。寒来暑往，秋收冬藏。闰余成岁，律吕调阳。云腾致雨，露结为霜。金生丽水，玉出昆冈。';
on($('[data-action="sample"]'), 'click', () => {
  inputEl.value = SAMPLE;
  convert();
});

/* ---------- 清空 ---------- */
on($('[data-action="clear"]'), 'click', () => {
  inputEl.value = '';
  outputEl.value = '';
  countEl.textContent = '0 字';
  currentMode = 'zh_cn';
  $$('[data-mode]').forEach((b, i) => b.classList.toggle('is-active', i === 0));
});

/* ---------- 复制 ---------- */
on($('[data-action="copy"]'), 'click', async () => {
  if (!outputEl.value) { showToast('结果为空', { type: 'warn' }); return; }
  const ok = await copyText(outputEl.value);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});
