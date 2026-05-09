import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

const src       = $('[data-input="src"]');
const out       = $('[data-output]');
const charCount = $('[data-char-count]');
const modeLabel = $('[data-mode-label]');

const LABELS = {
  uppercase: '全大写', lowercase: '全小写',
  capitalize: '单词首字母大写', sentenceCase: '句首字母大写',
  lineFirstUpper: '行首字母大写',
  camelCase: 'camelCase', pascalCase: 'PascalCase',
  snakeCase: 'snake_case', kebabCase: 'kebab-case', constantCase: 'CONSTANT_CASE',
  spaceToUnderscore: '空格→下划线', underscoreToSpace: '下划线→空格',
  underscoreToDash: '下划线→中横线', dashToUnderscore: '中横线→下划线',
  spaceToDash: '空格→中横线', dashToSpace: '中横线→空格'
};

/* ---------- 转换实现 ---------- */
function words(s) {
  return s
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .replace(/[_\-]+/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean);
}

const OPS = {
  uppercase:        s => s.toUpperCase(),
  lowercase:        s => s.toLowerCase(),
  capitalize:       s => s.replace(/\b\w/g, c => c.toUpperCase()),
  sentenceCase:     s => s.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, c => c.toUpperCase()),
  lineFirstUpper:   s => s.split('\n').map(l => l ? l[0].toUpperCase() + l.slice(1) : l).join('\n'),
  camelCase:        s => words(s).map((w, i) => i === 0 ? w.toLowerCase() : w[0].toUpperCase() + w.slice(1).toLowerCase()).join(''),
  pascalCase:       s => words(s).map(w => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(''),
  snakeCase:        s => words(s).map(w => w.toLowerCase()).join('_'),
  kebabCase:        s => words(s).map(w => w.toLowerCase()).join('-'),
  constantCase:     s => words(s).map(w => w.toUpperCase()).join('_'),
  spaceToUnderscore: s => s.replace(/\s+/g, '_'),
  underscoreToSpace: s => s.replace(/_+/g, ' '),
  underscoreToDash:  s => s.replace(/_+/g, '-'),
  dashToUnderscore:  s => s.replace(/-+/g, '_'),
  spaceToDash:       s => s.replace(/\s+/g, '-'),
  dashToSpace:       s => s.replace(/-+/g, ' ')
};

let lastOp = '';

function updateCount() {
  charCount.textContent = `${src.value.length} 字符`;
}

function apply(op) {
  if (!src.value) { showToast('请先输入文本', { type: 'warn' }); return; }
  const fn = OPS[op]; if (!fn) return;
  out.value = fn(src.value);
  lastOp = op;
  modeLabel.textContent = LABELS[op] || '';
  // 标记活跃按钮
  $$('[data-op]').forEach(b => b.classList.toggle('is-primary', b.dataset.op === op));
}

/* ---------- Tab 切换 ---------- */
$$('[data-tab]').forEach(btn => on(btn, 'click', () => {
  const name = btn.dataset.tab;
  $$('[data-tab]').forEach(b => b.classList.toggle('is-active', b === btn));
  $$('[data-tab-pane]').forEach(p => { p.hidden = p.dataset.tabPane !== name; });
}));

/* ---------- 操作绑定 ---------- */
$$('[data-op]').forEach(btn => on(btn, 'click', () => apply(btn.dataset.op)));

on(src, 'input', () => {
  updateCount();
  if (lastOp) apply(lastOp);   // 实时以上次转换模式重算
});

// 拖拽文本文件
['dragover', 'dragleave'].forEach(ev => on(src, ev, e => {
  e.preventDefault();
  src.style.borderColor = ev === 'dragover' ? 'var(--color-brand)' : '';
}));
on(src, 'drop', e => {
  e.preventDefault();
  src.style.borderColor = '';
  const file = e.dataTransfer.files[0];
  if (!file) return;
  if (!/^text\/|\.(txt|md|json|csv|log)$/i.test(file.type || file.name)) {
    showToast('请拖入文本文件', { type: 'warn' }); return;
  }
  const reader = new FileReader();
  reader.onload = () => { src.value = reader.result; updateCount(); if (lastOp) apply(lastOp); };
  reader.readAsText(file);
});

/* ---------- 动作按钮 ---------- */
on($('[data-action="copy"]'), 'click', async () => {
  if (!out.value) { showToast('结果为空', { type: 'warn' }); return; }
  const ok = await copyText(out.value);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});
on($('[data-action="clear"]'), 'click', () => {
  src.value = ''; out.value = ''; lastOp = ''; modeLabel.textContent = '';
  $$('[data-op]').forEach(b => b.classList.remove('is-primary'));
  updateCount();
});

/* ---------- 快捷键 ---------- */
on(document, 'keydown', (e) => {
  if (!(e.ctrlKey || e.metaKey)) return;
  const k = e.key.toLowerCase();
  if (k === 'u') { e.preventDefault(); apply('uppercase'); }
  else if (k === 'l') { e.preventDefault(); apply('lowercase'); }
});

updateCount();
