import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { UNIT_TYPES } from './units-data.js';

mountToolHeader();

/* ======== DOM ======== */
const tabsEl   = $('[data-uc-tabs]');
const bodyEl   = $('[data-uc-body]');
const quickSel = $('[data-quick-unit]');
const precEl   = $('[data-precision]');
const precVal  = $('[data-precision-val]');

/* ======== 状态 ======== */
let current = null;   // 当前 UNIT_TYPE 对象
let inputs  = {};     // key → input element
let precision = 6;

/* ======== 格式化 ======== */
function fmt(n) {
  if (!Number.isFinite(n)) return '';
  return Number(n.toPrecision(precision)).toString();
}

/* ======== 换算核心 ======== */
function convert(srcKey) {
  const raw = inputs[srcKey].value.trim();
  if (!raw) {
    for (const k in inputs) if (k !== srcKey) inputs[k].value = '';
    return;
  }
  const val = Number(raw);
  if (!Number.isFinite(val)) return;

  if (current.nonLinear) {
    const base = current.toBase(val, srcKey);
    for (const k in inputs) {
      if (k === srcKey) continue;
      inputs[k].value = fmt(current.fromBase(base, k));
    }
  } else {
    const allUnits = current.groups.flatMap(g => g.units);
    const srcFactor = allUnits.find(u => u.key === srcKey).factor;
    const base = val * srcFactor;
    for (const k in inputs) {
      if (k === srcKey) continue;
      const f = allUnits.find(u => u.key === k).factor;
      inputs[k].value = fmt(base / f);
    }
  }
}

/* ======== 渲染 Tabs ======== */
function renderTabs() {
  tabsEl.innerHTML = '';
  UNIT_TYPES.forEach(ut => {
    const btn = document.createElement('button');
    btn.className = 'tab-btn' + (current && current.id === ut.id ? ' is-active' : '');
    btn.textContent = ut.name;
    btn.addEventListener('click', () => switchType(ut.id));
    tabsEl.appendChild(btn);
  });
}

/* ======== 渲染换算区 ======== */
function renderBody() {
  bodyEl.innerHTML = '';
  inputs = {};

  current.groups.forEach(group => {
    const panel = document.createElement('div');
    panel.className = 'panel';
    panel.innerHTML = `<h3 class="panel-title">${group.title}</h3>`;

    const grid = document.createElement('div');
    grid.className = 'grid grid-2 u-gap-3';

    group.units.forEach(u => {
      const field = document.createElement('div');
      field.className = 'field';
      field.innerHTML = `
        <label class="field-label">${u.name} (${u.addon})</label>
        <div class="input-group">
          <span class="addon">${u.addon}</span>
          <input class="input u-mono" type="text" data-unit="${u.key}" autocomplete="off">
        </div>`;
      grid.appendChild(field);

      const input = field.querySelector('input');
      inputs[u.key] = input;
      input.addEventListener('input', () => convert(u.key));
    });

    panel.appendChild(grid);
    bodyEl.appendChild(panel);
  });
}

/* ======== 渲染快速输入下拉 ======== */
function renderQuickSelect() {
  quickSel.innerHTML = '';
  const allUnits = current.groups.flatMap(g => g.units);
  current.quickUnits.forEach(key => {
    const u = allUnits.find(x => x.key === key);
    if (!u) return;
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = `${u.name} (${u.addon})`;
    quickSel.appendChild(opt);
  });
}

/* ======== 切换类型 ======== */
function switchType(typeId) {
  current = UNIT_TYPES.find(t => t.id === typeId);
  renderTabs();
  renderBody();
  renderQuickSelect();

  // 写入默认值并触发换算
  const def = current.default;
  if (inputs[def.key]) {
    inputs[def.key].value = def.val;
    convert(def.key);
  }

  // 保存选择到 URL hash
  history.replaceState(null, '', `#${typeId}`);
}

/* ======== 快速输入 ======== */
$$('[data-quick]').forEach(btn => on(btn, 'click', () => {
  const unit = quickSel.value;
  if (!inputs[unit]) return;
  inputs[unit].value = btn.dataset.quick;
  inputs[unit].focus();
  convert(unit);
}));

/* ======== 精度 ======== */
on(precEl, 'input', () => {
  precision = parseInt(precEl.value);
  precVal.textContent = precision + ' 位';
  const active = Object.keys(inputs).find(k => inputs[k].value.trim());
  if (active) convert(active);
});

/* ======== 复制全部 ======== */
on($('[data-action="copy-all"]'), 'click', async () => {
  const allUnits = current.groups.flatMap(g => g.units);
  const lines = [];
  for (const k in inputs) {
    const v = inputs[k].value.trim();
    if (v) {
      const u = allUnits.find(x => x.key === k);
      lines.push(`${u ? u.name : k}: ${v}`);
    }
  }
  if (!lines.length) { showToast('请先输入数值', { type: 'warn' }); return; }
  const ok = await copyText(lines.join('\n'));
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

/* ======== 重置 ======== */
on($('[data-action="reset"]'), 'click', () => {
  for (const k in inputs) inputs[k].value = '';
  showToast('已重置');
});

/* ======== 初始化 ======== */
const hash = location.hash.slice(1);
const initType = UNIT_TYPES.find(t => t.id === hash) ? hash : 'length';
switchType(initType);
