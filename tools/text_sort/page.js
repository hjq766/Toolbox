import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

const inputEl   = $('[data-input]');
const outputEl  = $('[data-output]');
const modeEl    = $('[data-sort-mode]');
const countIn   = $('[data-count-in]');
const countOut  = $('[data-count-out]');

function opt(name) { return $(`[data-opt="${name}"]`).checked; }

function sortText() {
  let lines = inputEl.value.split('\n');

  if (opt('trim')) lines = lines.map(l => l.trim());
  if (opt('empty')) lines = lines.filter(l => l.length > 0);
  if (opt('dedup')) {
    const seen = new Set();
    lines = lines.filter(l => {
      const key = opt('case') ? l.toLowerCase() : l;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  const mode = modeEl.value;
  const ignoreCase = opt('case');

  switch (mode) {
    case 'alpha':
      lines.sort((a, b) => {
        const aa = ignoreCase ? a.toLowerCase() : a;
        const bb = ignoreCase ? b.toLowerCase() : b;
        return aa.localeCompare(bb, 'zh-CN');
      });
      break;
    case 'alpha-desc':
      lines.sort((a, b) => {
        const aa = ignoreCase ? a.toLowerCase() : a;
        const bb = ignoreCase ? b.toLowerCase() : b;
        return bb.localeCompare(aa, 'zh-CN');
      });
      break;
    case 'num': {
      const numOf = s => { const m = s.match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : Infinity; };
      lines.sort((a, b) => numOf(a) - numOf(b));
      break;
    }
    case 'num-desc': {
      const numOf = s => { const m = s.match(/-?\d+(\.\d+)?/); return m ? parseFloat(m[0]) : -Infinity; };
      lines.sort((a, b) => numOf(b) - numOf(a));
      break;
    }
    case 'length':
      lines.sort((a, b) => a.length - b.length);
      break;
    case 'length-desc':
      lines.sort((a, b) => b.length - a.length);
      break;
    case 'random':
      for (let i = lines.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [lines[i], lines[j]] = [lines[j], lines[i]];
      }
      break;
    case 'reverse':
      lines.reverse();
      break;
  }

  outputEl.value = lines.join('\n');
  countOut.textContent = lines.length + ' 行';
}

/* ======== 实时排序 ======== */
function update() {
  const n = inputEl.value ? inputEl.value.split('\n').length : 0;
  countIn.textContent = n + ' 行';
  if (inputEl.value.trim()) sortText(); else { outputEl.value = ''; countOut.textContent = '0 行'; }
}

on(inputEl, 'input', update);
on(modeEl, 'change', update);
$$('[data-opt]').forEach(el => on(el, 'change', update));

/* ======== 示例 ======== */
const SAMPLE = '香蕉\n苹果\n葡萄\n橘子\n芒果\n草莓\n西瓜\n苹果\n香蕉\n樱桃';
on($('[data-action="sample"]'), 'click', () => {
  inputEl.value = SAMPLE;
  update();
});

/* ======== 复制 ======== */
on($('[data-action="copy"]'), 'click', async () => {
  if (!outputEl.value) { showToast('结果为空', { type: 'warn' }); return; }
  const ok = await copyText(outputEl.value);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

/* ======== 清空 ======== */
on($('[data-action="clear"]'), 'click', () => {
  inputEl.value = '';
  outputEl.value = '';
  countIn.textContent = '0 行';
  countOut.textContent = '0 行';
});
