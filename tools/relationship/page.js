/* ========== 0. 导入 ========== */
import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on, escapeHtml } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';

mountToolHeader();

/* ========== 1. 常量 ========== */
const KIN = [
  { label: '爸爸', icon: 'user' },
  { label: '妈妈', icon: 'user' },
  { label: '老公', icon: 'heart' },
  { label: '老婆', icon: 'heart' },
  { label: '哥哥', icon: 'user-plus' },
  { label: '弟弟', icon: 'user-plus' },
  { label: '姐姐', icon: 'user-plus' },
  { label: '妹妹', icon: 'user-plus' },
  { label: '儿子', icon: 'baby' },
  { label: '女儿', icon: 'baby' },
];

const MODE_HINT = {
  forward: '点击下方亲属关系，逐步构建「我的 XX 的 XX …」',
  reverse: '构建对方与你的关系链，查询对方该如何称呼你',
  chain: '输入一个称谓，查看其对应的家庭关系链',
  pair: '输入两个人的称谓，查询两人之间的合称关系',
};

const calc = window.relationship;

/* ========== 2. 状态 ========== */
let mode = 'forward';
let chain = [];
let sex = 1;
let lastResults = [];

/* ========== 3. DOM 引用 ========== */
const modesEl       = $('[data-modes]');
const builderPanel  = $('[data-panel="builder"]');
const titlePanel    = $('[data-panel="title"]');
const pairPanel     = $('[data-panel="pair"]');
const chainDisplay  = $('[data-chain-display]');
const builderHint   = $('[data-builder-hint]');
const kinGrid       = $('[data-kin-grid]');
const sexPanel      = $('[data-sex-panel]');
const sexToggle     = $('[data-sex-toggle]');
const titleInput    = $('[data-title-input]');
const pairA         = $('[data-pair-a]');
const pairB         = $('[data-pair-b]');
const resultEl      = $('[data-result]');
const resultList    = $('[data-result-list]');
const resultHint    = $('[data-result-hint]');
const undoBtn       = $('[data-action="undo"]');

/* ========== 4. 工具函数 ========== */
function chainText() {
  return chain.join('的');
}

function renderChain() {
  if (!chain.length) {
    chainDisplay.innerHTML = '<span class="rel-chain__me">我</span>';
    undoBtn.disabled = true;
    return;
  }
  undoBtn.disabled = false;
  const parts = chain.map((k, i) =>
    `${i ? '<span class="rel-chain__sep">的</span>' : ''}<span class="rel-chain__part">${k}</span>`
  ).join('');
  chainDisplay.innerHTML = `<span class="rel-chain__me">我</span><span class="rel-chain__sep">的</span>${parts}`;
}

function renderResults(items, hint = '') {
  lastResults = items;
  if (!items.length) {
    resultList.innerHTML = '<span class="rel-results__empty">未找到匹配称谓，请检查输入或尝试其他说法</span>';
    resultHint.textContent = hint;
    resultEl.hidden = false;
    return;
  }
  resultList.innerHTML = items.map(t =>
    `<span class="rel-results__tag">${escapeHtml(t)}</span>`
  ).join('');
  resultHint.textContent = hint;
  resultEl.hidden = false;
}

function queryForward() {
  const text = chainText();
  if (!text) {
    resultEl.hidden = true;
    return;
  }
  const items = calc({ text, reverse: false });
  renderResults(items, `「我的 ${text}」→ 我应该称呼 TA 为`);
}

function queryReverse() {
  const text = chainText();
  if (!text) {
    resultEl.hidden = true;
    return;
  }
  const items = calc({ text, reverse: true, sex });
  renderResults(items, `「我的 ${text}」→ TA 应该称呼我为（${sex ? '男' : '女'}）`);
}

function queryChain() {
  const text = titleInput.value.trim();
  if (!text) {
    resultEl.hidden = true;
    return;
  }
  const items = calc({ text, type: 'chain' });
  renderResults(items, `「${text}」代表的家庭关系`);
}

function queryPair() {
  const a = pairA.value.trim();
  const b = pairB.value.trim();
  if (!a || !b) {
    resultEl.hidden = true;
    return;
  }
  const items = calc({ text: a, target: b, type: 'pair' });
  renderResults(items, `「${a}」与「${b}」之间的合称`);
}

function runQuery() {
  if (!calc) {
    showToast('称谓库加载失败，请刷新页面重试', { type: 'error' });
    return;
  }
  switch (mode) {
    case 'forward':  queryForward(); break;
    case 'reverse':  queryReverse(); break;
    case 'chain':    queryChain(); break;
    case 'pair':     queryPair(); break;
  }
}

function setMode(next) {
  mode = next;
  modesEl.querySelectorAll('[data-mode]').forEach(btn =>
    btn.classList.toggle('is-active', btn.dataset.mode === mode)
  );

  builderPanel.hidden = mode !== 'forward' && mode !== 'reverse';
  titlePanel.hidden = mode !== 'chain';
  pairPanel.hidden = mode !== 'pair';
  sexPanel.hidden = mode !== 'reverse';

  builderHint.textContent = MODE_HINT[mode] || '';
  runQuery();
}

function addKin(label) {
  chain.push(label);
  renderChain();
  runQuery();
}

function undoKin() {
  if (!chain.length) return;
  chain.pop();
  renderChain();
  runQuery();
}

function clearChain() {
  chain = [];
  renderChain();
  runQuery();
}

/* ========== 5. 事件绑定 ========== */
kinGrid.innerHTML = KIN.map(k =>
  `<button class="chip" type="button" data-kin="${k.label}">
    <i data-lucide="${k.icon}" class="icon-16 u-muted"></i>${k.label}
  </button>`
).join('');

on(kinGrid, 'click', e => {
  const btn = e.target.closest('[data-kin]');
  if (!btn) return;
  addKin(btn.dataset.kin);
});

on(modesEl, 'click', e => {
  const btn = e.target.closest('[data-mode]');
  if (!btn) return;
  setMode(btn.dataset.mode);
});

on(sexToggle, 'click', e => {
  const btn = e.target.closest('[data-sex]');
  if (!btn) return;
  sex = +btn.dataset.sex;
  sexToggle.querySelectorAll('[data-sex]').forEach(b =>
    b.classList.toggle('is-active', +b.dataset.sex === sex)
  );
  runQuery();
});

on($('[data-action="undo"]'), 'click', undoKin);
on($('[data-action="clear"]'), 'click', clearChain);

on(titleInput, 'input', runQuery);
on(pairA, 'input', runQuery);
on(pairB, 'input', runQuery);

on($('[data-action="copy"]'), 'click', () => {
  if (!lastResults.length) {
    showToast('暂无结果可复制', { type: 'warn' });
    return;
  }
  copyText(lastResults.join('、')).then(ok =>
    showToast(ok ? '已复制结果' : '复制失败', { type: ok ? 'success' : 'error' })
  );
});

/* ========== 6. 初始化 ========== */
if (!calc) {
  showToast('称谓库加载失败，请刷新页面重试', { type: 'error' });
} else {
  setMode('forward');
}
