import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { downloadText } from '../../public/scripts/utils/download.js';

mountToolHeader();

/* ========== 1. 常量 ========== */
const EXAMPLE_SQL = `SELECT
    u.id,
    u.name,
    u.email,
    COUNT(o.id) AS order_count,
    SUM(o.amount) AS total_amount
FROM users u
LEFT JOIN orders o ON o.user_id = u.id
WHERE u.status = 'active'
    AND u.created_at >= '2024-01-01'
GROUP BY u.id, u.name, u.email
HAVING COUNT(o.id) > 0
ORDER BY total_amount DESC
LIMIT 20;
`;

// 子句关键字列表（每条独占一行）
const CLAUSE_KW = [
  'SELECT', 'DISTINCT', 'FROM', 'WHERE', 'ORDER BY', 'GROUP BY',
  'HAVING', 'LIMIT', 'OFFSET', 'FETCH', 'FOR UPDATE', 'FOR SHARE',
  'LEFT OUTER JOIN', 'RIGHT OUTER JOIN', 'FULL OUTER JOIN',
  'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'CROSS JOIN', 'NATURAL JOIN', 'JOIN',
  'ON', 'UNION ALL', 'UNION', 'INTERSECT ALL', 'INTERSECT', 'EXCEPT ALL', 'EXCEPT',
  'INSERT INTO', 'INSERT', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'DELETE',
  'CREATE TABLE', 'CREATE INDEX', 'CREATE VIEW', 'CREATE',
  'ALTER TABLE', 'ALTER', 'DROP TABLE', 'DROP INDEX', 'DROP VIEW', 'DROP',
  'TRUNCATE', 'WITH',
];

// 每个子句下面的 AND/OR 需额外缩进
const INDENT_KW = ['AND', 'OR'];

/* ========== 2. 状态 ========== */
let dialect = 'standard';

/* ========== 3. DOM 引用 ========== */
const editorEl    = $('[data-editor]');
const sizeEl      = $('[data-size]');
const fileEl      = $('[data-file]');
const uppercaseCb = $('[data-uppercase]');
const dialectBtns = $$('[data-dialect]');

/* ========== 4. 工具函数 ========== */

function updateSize() {
  const b = new Blob([editorEl.value]).size;
  sizeEl.textContent = b < 1024 ? b + ' B' : b < 1048576 ? (b / 1024).toFixed(1) + ' KB' : (b / 1048576).toFixed(2) + ' MB';
}

function setDialect(d) {
  dialect = d;
  dialectBtns.forEach(b => b.classList.toggle('is-active', b.dataset.dialect === d));
}

function loadFile(f) {
  if (!f) return;
  const r = new FileReader();
  r.onload = e => { editorEl.value = e.target.result; updateSize(); showToast('文件导入成功'); };
  r.readAsText(f);
}

/**
 * 核心 SQL 格式化
 * 策略：提取字符串字面量和注释占位，按子句断行缩进，最后还原
 */
function formatSQL(sql) {
  const upcase = uppercaseCb.checked;
  const literals = [];

  // 1. 提取字符串（单引号和反引号）和块注释，用占位符保护
  let s = sql
    .replace(/('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, m => {
      literals.push(m);
      return `\x00STR${literals.length - 1}\x00`;
    })
    .replace(/(\/\*[\s\S]*?\*\/)/g, m => {
      literals.push(m);
      return `\x00STR${literals.length - 1}\x00`;
    });

  // 2. 单行注释处理：保留但隔离
  s = s.replace(/(--[^\n]*)/g, m => {
    literals.push(m);
    return `\x00STR${literals.length - 1}\x00`;
  });

  // 3. 折叠多余空白
  s = s.replace(/\s+/g, ' ').trim();

  // 4. 可选大写关键字（仅处理非占位符区域）
  if (upcase) {
    s = s.replace(/\b([A-Za-z_][A-Za-z0-9_]*(?:\s+[A-Za-z_][A-Za-z0-9_]*)?)\b/g, m => m.toUpperCase());
  }

  // 5. 在子句关键字前插入换行（按长度降序匹配避免前缀冲突）
  const sortedClauses = [...CLAUSE_KW].sort((a, b) => b.length - a.length);
  for (const kw of sortedClauses) {
    const re = new RegExp(`(?<![\\x00]) (${kw.split(' ').map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('\\s+')})(?=\\s)`, 'gi');
    s = s.replace(re, (_, m) => '\n' + (upcase ? m.toUpperCase() : m));
  }

  // 6. AND / OR 在行首时额外缩进（WHERE / HAVING / ON 子句的条件）
  s = s.replace(/\n(AND|OR) /gi, (_, kw) => '\n    ' + (upcase ? kw.toUpperCase() : kw) + ' ');

  // 7. CASE / WHEN / THEN / ELSE / END 缩进
  s = s
    .replace(/ (CASE)\b/gi, (_, kw) => '\n' + (upcase ? kw.toUpperCase() : kw))
    .replace(/ (WHEN|THEN|ELSE)\b/gi, (_, kw) => '\n    ' + (upcase ? kw.toUpperCase() : kw))
    .replace(/ (END)\b/gi, (_, kw) => '\n' + (upcase ? kw.toUpperCase() : kw));

  // 8. SELECT 字段列表：每个逗号后换行并缩进
  s = s.replace(/^(SELECT|DISTINCT)\b([\s\S]*?)(?=\nFROM|\nINTO|\nWHERE|$)/m, (match, kw, fields) => {
    const formatted = fields.replace(/,(?!\s*\n)/g, ',\n   ');
    return kw + formatted;
  });

  // 9. 分号后换行（多语句）
  s = s.replace(/;\s*/g, ';\n\n');

  // 10. 还原占位符
  s = s.replace(/\x00STR(\d+)\x00/g, (_, i) => literals[+i]);

  return s.trim();
}

function compressSQL(sql) {
  const literals = [];
  let s = sql
    .replace(/('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g, m => { literals.push(m); return `\x00STR${literals.length - 1}\x00`; })
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/--[^\n]*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
  return s.replace(/\x00STR(\d+)\x00/g, (_, i) => literals[+i]);
}

function removeComments(sql) {
  return sql
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/--[^\n]*/g, '')
    .replace(/^\s*\n/gm, '')
    .trim();
}

/* ========== 5. 事件绑定 ========== */

dialectBtns.forEach(b => on(b, 'click', () => setDialect(b.dataset.dialect)));
on(fileEl, 'change', e => loadFile(e.target.files[0]));
on(editorEl, 'dragover', e => e.preventDefault());
on(editorEl, 'drop', e => { e.preventDefault(); loadFile(e.dataTransfer.files[0]); });
on(editorEl, 'input', updateSize);

on($('[data-action="format"]'), 'click', () => {
  const text = editorEl.value.trim();
  if (!text) { showToast('请输入 SQL', { type: 'warn' }); return; }
  try {
    editorEl.value = formatSQL(text);
    updateSize();
    showToast('格式化成功');
  } catch (e) {
    showToast('格式化失败：' + e.message, { type: 'error' });
  }
});

on($('[data-action="compress"]'), 'click', () => {
  const text = editorEl.value.trim();
  if (!text) { showToast('请输入 SQL', { type: 'warn' }); return; }
  editorEl.value = compressSQL(text);
  updateSize();
  showToast('压缩成功');
});

on($('[data-action="remove-comments"]'), 'click', () => {
  const text = editorEl.value.trim();
  if (!text) { showToast('请输入 SQL', { type: 'warn' }); return; }
  editorEl.value = removeComments(text);
  updateSize();
  showToast('注释已移除');
});

on($('[data-action="copy"]'), 'click', async () => {
  if (!editorEl.value) { showToast('编辑器为空', { type: 'warn' }); return; }
  const ok = await copyText(editorEl.value);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

on($('[data-action="download"]'), 'click', () => {
  if (!editorEl.value) { showToast('编辑器为空', { type: 'warn' }); return; }
  downloadText(editorEl.value, 'query.sql', 'text/plain');
  showToast('导出成功');
});

on($('[data-action="clear"]'), 'click', () => {
  editorEl.value = '';
  updateSize();
});

// 初始示例
editorEl.value = EXAMPLE_SQL;
updateSize();
