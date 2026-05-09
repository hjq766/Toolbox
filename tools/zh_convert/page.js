import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

/* globals OpenCC */
const converters = {
  zh_cn:   OpenCC.Converter({ from: 'tw', to: 'cn' }),
  zh_hant: OpenCC.Converter({ from: 'cn', to: 'tw' }),
  zh_hk:   OpenCC.Converter({ from: 'cn', to: 'hk' }),
  zh_tw:   OpenCC.Converter({ from: 'cn', to: 'twp' })
};

const modeNames = { zh_cn: '大陆简体', zh_hant: '繁体中文', zh_hk: '港澳繁體', zh_tw: '台灣正體' };

const inputEl  = $('[data-input]');
const outputEl = $('[data-output]');
const countEl  = $('[data-count]');

let lastMode = 'zh_cn';

on(inputEl, 'input', () => {
  countEl.textContent = `${inputEl.value.length} 字`;
  convert(lastMode);
});

/* ---------- 转换按钮 ---------- */
$$('[data-mode]').forEach(btn => on(btn, 'click', () => {
  const mode = btn.dataset.mode;
  $$('[data-mode]').forEach(b => b.classList.toggle('is-active', b === btn));
  convert(mode);
}));

function convert(mode) {
  const text = inputEl.value;
  if (!text) { outputEl.value = ''; return; }
  try {
    const fn = converters[mode];
    if (!fn) throw new Error('不支持的转换类型');
    outputEl.value = fn(text);
    lastMode = mode;
  } catch (e) {
    showToast('转换失败：' + e.message, { type: 'error' });
  }
}

on($('[data-action="copy"]'), 'click', async () => {
  if (!outputEl.value) { showToast('结果为空', { type: 'warn' }); return; }
  const ok = await copyText(outputEl.value);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

on($('[data-action="clear"]'), 'click', () => {
  inputEl.value = ''; outputEl.value = ''; countEl.textContent = '0 字'; lastMode = '';
  $$('[data-mode]').forEach((b, i) => b.classList.toggle('is-active', i === 0));
});
