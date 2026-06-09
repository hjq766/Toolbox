import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

const SETS = {
  lower: 'abcdefghijklmnopqrstuvwxyz',
  upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
  digits: '0123456789',
  symbols: '!@#$%^&*()-_=+[]{};:,.<>/?'
};
const SIMILAR = /[0O1lI]/g;

const out = $('[data-output]');
const lenEl = $('[data-len]');
const lenDisp = $('[data-len-display]');
const strengthEl = $('[data-strength]');

function opts() {
  const r = {};
  $$('[data-opt]').forEach(el => r[el.dataset.opt] = el.checked);
  r.length = Number(lenEl.value);
  return r;
}

function buildPool(o) {
  let pool = '';
  if (o.lower) pool += SETS.lower;
  if (o.upper) pool += SETS.upper;
  if (o.digits) pool += SETS.digits;
  if (o.symbols) pool += SETS.symbols;
  if (o.noSimilar) pool = pool.replace(SIMILAR, '');
  return pool;
}

function secureInt(max) {
  // 无偏随机数，避免 modulo bias
  const buf = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / max) * max;
  let x;
  do {
    crypto.getRandomValues(buf);
    x = buf[0];
  } while (x >= limit);
  return x % max;
}

function generate(o = opts()) {
  const pool = buildPool(o);
  if (!pool) return '';
  if (o.unique && o.length > pool.length) {
    showToast('字符池不足以生成不重复密码', { type: 'warn' });
    return '';
  }
  const chars = [];
  const used = new Set();
  let safety = 0;
  while (chars.length < o.length) {
    if (safety++ > o.length * 50) break;
    const c = pool[secureInt(pool.length)];
    if (o.unique && used.has(c)) continue;
    chars.push(c); used.add(c);
  }
  // 保证每类选中至少一个
  const groups = ['lower','upper','digits','symbols'].filter(k => o[k]);
  for (const g of groups) {
    let set = SETS[g];
    if (o.noSimilar) set = set.replace(SIMILAR, '');
    if (!set) continue;
    if (!chars.some(c => set.includes(c))) {
      const idx = secureInt(chars.length);
      chars[idx] = set[secureInt(set.length)];
    }
  }
  return chars.join('');
}

function strength(pwd) {
  if (!pwd) return { label: '—', cls: '' };
  let pool = 0;
  if (/[a-z]/.test(pwd)) pool += 26;
  if (/[A-Z]/.test(pwd)) pool += 26;
  if (/\d/.test(pwd))    pool += 10;
  if (/[^\w]/.test(pwd)) pool += 30;
  const entropy = pwd.length * Math.log2(Math.max(pool, 1));
  if (entropy < 40) return { label: `弱 (${entropy.toFixed(0)} bit)`, cls: 'is-warn' };
  if (entropy < 72) return { label: `中 (${entropy.toFixed(0)} bit)`, cls: '' };
  return { label: `强 (${entropy.toFixed(0)} bit)`, cls: 'is-brand' };
}

function refresh() {
  const pwd = generate();
  out.textContent = pwd || '请至少勾选一种字符集';
  const s = strength(pwd);
  strengthEl.textContent = `强度：${s.label}`;
  strengthEl.className = 'badge' + (s.cls ? ' ' + s.cls : '');
}

on(lenEl, 'input', () => { lenDisp.textContent = lenEl.value; refresh(); });
$$('[data-opt]').forEach(el => on(el, 'change', refresh));
on($('[data-gen]'), 'click', refresh);
on($('[data-action="copy"]'), 'click', async () => {
  const ok = await copyText(out.textContent);
  showToast(ok ? '已复制密码' : '复制失败', { type: ok ? 'success' : 'error' });
});
on($('[data-batch]'), 'click', () => {
  const arr = Array.from({ length: 10 }, () => generate());
  $('[data-batch-out]').textContent = arr.join('\n');
});
on($('[data-batch-copy]'), 'click', async () => {
  const text = $('[data-batch-out]').textContent;
  if (!text) { showToast('请先批量生成', { type: 'warn' }); return; }
  const ok = await copyText(text);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

refresh();
