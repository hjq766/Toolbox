import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on, debounce, escapeHtml } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

const srcEl   = $('[data-input="src"]');
const modEl   = $('[data-input="mod"]');
const diffEl  = $('[data-diff]');
const statEl  = $('[data-stat]');

let granularity = 'lines';

/* ---------- 差异渲染 ---------- */
const STYLE_ADD = 'background:color-mix(in srgb,var(--color-success) 22%,transparent);color:var(--color-success);border-radius:3px;padding:1px 2px';
const STYLE_DEL = 'background:color-mix(in srgb,var(--color-danger) 22%,transparent);color:var(--color-danger);border-radius:3px;padding:1px 2px;text-decoration:line-through';

function renderDiff() {
  if (!window.Diff) {
    diffEl.innerHTML = '<span class="u-muted">正在加载差异算法库…</span>';
    return;
  }
  const a = srcEl.value;
  const b = modEl.value;
  if (!a && !b) {
    diffEl.innerHTML = '<span class="u-muted">在两侧输入文本后，差异会自动显示在此处…</span>';
    statEl.textContent = '';
    return;
  }
  if (!a || !b) {
    diffEl.innerHTML = '<span class="u-muted">请在两侧都输入内容以进行对比</span>';
    statEl.textContent = '';
    return;
  }

  let parts;
  if (granularity === 'words')      parts = Diff.diffWords(a, b);
  else if (granularity === 'chars') parts = Diff.diffChars(a, b);
  else                              parts = Diff.diffLines(a, b);

  let added = 0, removed = 0;
  const html = parts.map(p => {
    const esc = escapeHtml(p.value);
    if (p.added)   { added   += p.count ?? p.value.length; return `<span style="${STYLE_ADD}">${esc}</span>`; }
    if (p.removed) { removed += p.count ?? p.value.length; return `<span style="${STYLE_DEL}">${esc}</span>`; }
    return esc;
  }).join('');

  diffEl.innerHTML = html || '<span class="u-muted">两段文本完全一致</span>';
  statEl.textContent = `+${added} / -${removed}`;
}

const renderDebounced = debounce(renderDiff, 250);

/* ---------- 统一 diff (unified format) ---------- */
function unifiedDiff() {
  if (!window.Diff) return '';
  return Diff.createTwoFilesPatch('a.txt', 'b.txt', srcEl.value, modEl.value, '', '');
}

/* ---------- 事件 ---------- */
on(srcEl, 'input', renderDebounced);
on(modEl, 'input', renderDebounced);

$$('[data-granularity]').forEach(btn => on(btn, 'click', () => {
  granularity = btn.dataset.granularity;
  $$('[data-granularity]').forEach(b => b.classList.toggle('is-active', b === btn));
  renderDiff();
}));

$$('[data-file]').forEach(input => on(input, 'change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const target = input.dataset.file === 'src' ? srcEl : modEl;
    target.value = reader.result;
    renderDiff();
  };
  reader.readAsText(file);
}));

on($('[data-action="copy"]'), 'click', async () => {
  const text = unifiedDiff();
  if (!text) { showToast('内容为空', { type: 'warn' }); return; }
  const ok = await copyText(text);
  showToast(ok ? '已复制 unified diff' : '复制失败', { type: ok ? 'success' : 'error' });
});

on($('[data-action="clear"]'), 'click', () => {
  srcEl.value = ''; modEl.value = '';
  $$('[data-file]').forEach(i => { i.value = ''; });
  renderDiff();
});

/* ---------- 等 Diff 库加载后首刷 ---------- */
function waitForDiff(attempt = 0) {
  if (window.Diff) return renderDiff();
  if (attempt > 60) return; // 最多等 6s
  setTimeout(() => waitForDiff(attempt + 1), 100);
}
waitForDiff();
