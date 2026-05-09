// 可复用的线性单位换算器（输入任一行，其它行自动联动）
// 用法：mountUnitConverter(container, { units, precision })
//   units: [{ key, name, factor }]  // 以 factor 作为到「基准单位」的比率
//   例如长度以米为基准：{ key:'m', name:'米', factor:1 }, { key:'cm', factor:0.01 }
// 若需要非线性换算（如温度），请传 converter 对象 { toBase, fromBase }
import { h, on } from '../utils/dom.js';
import { copyText } from '../utils/clipboard.js';
import { showToast } from './toast.js';

export function mountUnitConverter(mount, {
  units,
  precision = 6,
  converter = null,
  initial = null
} = {}) {
  mount.classList.add('unit-converter');
  mount.innerHTML = '';
  const grid = h('div', { class: 'grid grid-2' });
  const inputs = new Map();

  for (const u of units) {
    const input = h('input', {
      class: 'input u-mono', type: 'text', spellcheck: 'false', autocomplete: 'off',
      'data-unit': u.key, placeholder: u.hint || ''
    });
    const copyBtn = h('button', { class: 'btn is-sm', type: 'button', title: '复制' }, '复制');
    copyBtn.addEventListener('click', async () => {
      const ok = await copyText(input.value);
      showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
    });

    const field = h('div', { class: 'field' }, [
      h('label', { class: 'field-label' }, `${u.name}${u.symbol ? ` (${u.symbol})` : ''}`),
      h('div', { class: 'input-group' }, [
        h('span', { class: 'addon' }, u.symbol || u.key),
        input,
        copyBtn
      ])
    ]);
    grid.appendChild(field);
    inputs.set(u.key, input);

    on(input, 'input', () => update(u.key));
  }
  mount.appendChild(grid);

  function fmt(n) {
    if (!Number.isFinite(n)) return '';
    // 平衡精度和可读性：去尾 0
    const s = Number(n.toPrecision(precision)).toString();
    return s;
  }

  function update(sourceKey) {
    const source = inputs.get(sourceKey);
    const raw = source.value.trim();
    if (!raw) {
      for (const [k, el] of inputs) if (k !== sourceKey) el.value = '';
      return;
    }
    const val = Number(raw);
    if (!Number.isFinite(val)) return;

    let base;
    if (converter) {
      base = converter.toBase(val, sourceKey);
    } else {
      const u = units.find(x => x.key === sourceKey);
      base = val * u.factor;
    }

    for (const u of units) {
      if (u.key === sourceKey) continue;
      const out = converter
        ? converter.fromBase(base, u.key)
        : base / u.factor;
      inputs.get(u.key).value = fmt(out);
    }
  }

  if (initial) {
    const { key, value } = initial;
    const el = inputs.get(key);
    if (el) { el.value = String(value); update(key); }
  }

  return { update, inputs };
}
