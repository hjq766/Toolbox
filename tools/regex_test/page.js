import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { escapeHtml } from '../../public/scripts/utils/dom.js';

mountToolHeader();

const patternEl  = $('[data-input="pattern"]');
const flagsEl    = $('[data-input="flags"]');
const textEl     = $('[data-input="text"]');
const matchInfo  = $('[data-match-info]');
const matchesEl  = $('[data-matches]');
const errorEl    = $('[data-error]');
const presetsEl  = $('[data-presets]');

/* ======== 常用正则 ======== */
const PRESETS = [
  { name: '邮箱', pattern: '[\\w.+-]+@[\\w-]+\\.[\\w.]+', flags: 'gi' },
  { name: '手机号（大陆）', pattern: '1[3-9]\\d{9}', flags: 'g' },
  { name: '网址 URL', pattern: 'https?://[\\w\\-._~:/?#\\[\\]@!$&\'()*+,;=%]+', flags: 'gi' },
  { name: 'IPv4 地址', pattern: '(?:(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)\\.){3}(?:25[0-5]|2[0-4]\\d|1\\d{2}|[1-9]?\\d)', flags: 'g' },
  { name: '身份证号', pattern: '[1-9]\\d{5}(?:19|20)\\d{2}(?:0[1-9]|1[0-2])(?:0[1-9]|[12]\\d|3[01])\\d{3}[\\dXx]', flags: 'g' },
  { name: '日期 (YYYY-MM-DD)', pattern: '\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])', flags: 'g' },
  { name: '时间 (HH:MM:SS)', pattern: '(?:[01]\\d|2[0-3]):[0-5]\\d:[0-5]\\d', flags: 'g' },
  { name: 'HTML 标签', pattern: '<[^>]+>', flags: 'g' },
  { name: '十六进制颜色', pattern: '#(?:[\\da-fA-F]{3}){1,2}\\b', flags: 'g' },
  { name: '中文字符', pattern: '[\\u4e00-\\u9fa5]+', flags: 'g' },
  { name: '整数', pattern: '-?\\d+', flags: 'g' },
  { name: '浮点数', pattern: '-?\\d+\\.\\d+', flags: 'g' },
];

function renderPresets() {
  presetsEl.innerHTML = PRESETS.map((p, i) =>
    `<div class="preset-card" data-preset="${i}"><div class="pc-name">${escapeHtml(p.name)}</div><div class="pc-regex">/${escapeHtml(p.pattern)}/${p.flags}</div></div>`
  ).join('');
}
renderPresets();

on(presetsEl, 'click', (e) => {
  const card = e.target.closest('[data-preset]');
  if (!card) return;
  const p = PRESETS[parseInt(card.dataset.preset, 10)];
  patternEl.value = p.pattern;
  flagsEl.value = p.flags;
  syncFlagCheckboxes();
  runMatch();
});

/* ======== Flags 同步 ======== */
function syncFlagCheckboxes() {
  const flags = flagsEl.value;
  $$('[data-flag]').forEach(cb => {
    cb.checked = flags.includes(cb.dataset.flag);
  });
}

function syncFlagsFromCheckboxes() {
  let f = '';
  $$('[data-flag]').forEach(cb => { if (cb.checked) f += cb.dataset.flag; });
  flagsEl.value = f;
}

$$('[data-flag]').forEach(cb => on(cb, 'change', () => {
  syncFlagsFromCheckboxes();
  runMatch();
}));

on(flagsEl, 'input', () => {
  syncFlagCheckboxes();
  runMatch();
});

/* ======== 匹配逻辑 ======== */
function runMatch() {
  const pattern = patternEl.value;
  const flags = flagsEl.value;
  const text = textEl.value;

  errorEl.hidden = true;
  matchesEl.innerHTML = '';
  matchInfo.textContent = '0 个匹配';

  if (!pattern) return;

  let regex;
  try {
    regex = new RegExp(pattern, flags);
  } catch (e) {
    errorEl.textContent = e.message;
    errorEl.hidden = false;
    return;
  }

  if (!text) return;

  const matches = [];
  let m;
  // 防止无限循环（空匹配）
  const maxIter = 10000;
  let iter = 0;

  if (flags.includes('g')) {
    while ((m = regex.exec(text)) !== null && iter++ < maxIter) {
      matches.push({ index: m.index, value: m[0], groups: m.slice(1) });
      if (m[0].length === 0) regex.lastIndex++;
    }
  } else {
    m = regex.exec(text);
    if (m) matches.push({ index: m.index, value: m[0], groups: m.slice(1) });
  }

  matchInfo.textContent = `${matches.length} 个匹配`;

  // 高亮文本
  if (matches.length) {
    let html = '';
    let last = 0;
    for (const mt of matches) {
      html += escapeHtml(text.slice(last, mt.index));
      html += `<span class="hl-match">${escapeHtml(mt.value)}</span>`;
      last = mt.index + mt.value.length;
    }
    html += escapeHtml(text.slice(last));

    // 匹配详情列表
    const listHtml = matches.map((mt, i) => {
      let groupHtml = '';
      if (mt.groups.length) {
        groupHtml = mt.groups.map((g, gi) =>
          `<span class="match-group">$${gi + 1}: ${escapeHtml(g ?? 'undefined')}</span>`
        ).join('');
      }
      return `<div class="match-item"><span class="match-idx">${i + 1}</span><span class="match-val">${escapeHtml(mt.value)}${groupHtml}</span><span class="u-muted" style="font-size:var(--text-xs)">索引 ${mt.index}</span></div>`;
    }).join('');
    matchesEl.innerHTML = listHtml;
  }
}

on(patternEl, 'input', runMatch);
on(textEl, 'input', runMatch);

on($('[data-action="clear"]'), 'click', () => {
  patternEl.value = '';
  textEl.value = '';
  matchesEl.innerHTML = '';
  matchInfo.textContent = '0 个匹配';
  errorEl.hidden = true;
});
