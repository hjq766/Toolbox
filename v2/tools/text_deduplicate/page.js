import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

const input = $('[data-input]');
const output = $('[data-output]');
const countEl = $('[data-count]');

function opts() {
  const r = {};
  $$('[data-opt]').forEach(el => r[el.dataset.opt] = el.checked);
  return r;
}

function run() {
  const o = opts();
  const lines = input.value.split(/\r?\n/);
  const keyFn = (s) => {
    let k = o.trim ? s.trim() : s;
    if (o.ignoreCase) k = k.toLowerCase();
    return k;
  };

  const seen = new Map(); // key -> { count, first, value }
  const order = [];
  for (const line of lines) {
    const k = keyFn(line);
    if (o.dropEmpty && k === '') continue;
    if (seen.has(k)) {
      seen.get(k).count++;
    } else {
      seen.set(k, { count: 1, value: line });
      order.push(k);
    }
  }

  let keys = o.keepOrder ? order : [...seen.keys()];
  if (o.sort) keys = [...keys].sort();
  if (o.onlyDup) keys = keys.filter(k => seen.get(k).count > 1);

  const result = keys.map(k => seen.get(k).value);
  output.value = result.join('\n');
  const removed = lines.length - result.length;
  countEl.textContent = `共 ${result.length} 条 · 去掉 ${removed >= 0 ? removed : 0} 条`;
}

on($('[data-run]'), 'click', run);
on(input, 'input', run);
$$('[data-opt]').forEach(el => on(el, 'change', run));

on($('[data-copy]'), 'click', async () => {
  const ok = await copyText(output.value);
  showToast(ok ? '已复制结果' : '复制失败', { type: ok ? 'success' : 'error' });
});
on($('[data-clear]'), 'click', () => { input.value = ''; output.value = ''; countEl.textContent = ''; input.focus(); });

input.value = [
  'apple', 'banana', 'Apple', 'orange', 'banana', '',
  'grape', 'APPLE  ', 'orange'
].join('\n');
run();
