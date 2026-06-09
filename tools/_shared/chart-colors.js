import { on } from '../../public/scripts/utils/dom.js';
import { getPalette, getPaletteNames, PALETTES, interpolateColors } from './chart-core.js';

export function setupChartColors({
  editor,
  paletteGrid,
  customArea,
  colorModeEl,
  pickersRow,
  gradPreview,
  gradStartEl,
  gradEndEl,
  onChange,
}) {
  let palette = 'default';
  let useCustom = false;
  let colorMode = 'pick';
  let customColors = [];
  let gradStart = gradStartEl.value;
  let gradEnd = gradEndEl.value;

  function getColors() {
    return useCustom && customColors.length ? [...customColors] : getPalette(palette);
  }

  function syncColorPickers() {
    const data = editor.getData();
    const count = data.length - 1;
    const fallback = getPalette(palette);
    pickersRow.innerHTML = '';
    for (let i = 0; i < count; i++) {
      if (!customColors[i]) customColors[i] = fallback[i % fallback.length];
      const wrap = document.createElement('div');
      wrap.className = 'color-picker-item';
      const input = document.createElement('input');
      input.type = 'color';
      input.value = customColors[i];
      const label = document.createElement('span');
      label.textContent = data[i + 1]?.[0] || `${i + 1}`;
      input.addEventListener('input', () => {
        customColors[i] = input.value;
        onChange();
      });
      wrap.append(input, label);
      pickersRow.appendChild(wrap);
    }
    customColors = customColors.slice(0, count);
  }

  function applyGradient({ render = true } = {}) {
    customColors = interpolateColors(gradStart, gradEnd, editor.getData().length - 1);
    gradPreview.style.background = `linear-gradient(to right, ${gradStart}, ${gradEnd})`;
    if (render) onChange();
  }

  function syncForDataChange() {
    if (!useCustom) return;
    if (colorMode === 'pick') syncColorPickers();
    else applyGradient({ render: false });
  }

  getPaletteNames().forEach(name => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `palette-item${name === palette ? ' active' : ''}`;
    btn.dataset.pal = name;
    btn.innerHTML = PALETTES[name].slice(0, 5).map(c => `<span style="background:${c}"></span>`).join('');
    paletteGrid.appendChild(btn);
  });

  const customBtn = document.createElement('button');
  customBtn.type = 'button';
  customBtn.className = 'palette-item';
  customBtn.dataset.pal = '_custom';
  customBtn.innerHTML = '<span class="palette-custom-preview"></span>';
  customBtn.title = '自定义配色';
  paletteGrid.appendChild(customBtn);

  on(paletteGrid, 'click', e => {
    const btn = e.target.closest('[data-pal]');
    if (!btn) return;
    paletteGrid.querySelectorAll('.palette-item').forEach(item => item.classList.toggle('active', item === btn));
    useCustom = btn.dataset.pal === '_custom';
    customArea.hidden = !useCustom;
    if (useCustom) syncForDataChange();
    else palette = btn.dataset.pal;
    onChange();
  });

  on(colorModeEl, 'click', e => {
    const btn = e.target.closest('[data-val]');
    if (!btn) return;
    colorModeEl.querySelectorAll('.btn').forEach(item => item.classList.toggle('active', item === btn));
    colorMode = btn.dataset.val;
    customArea.querySelector('[data-mode-pick]').hidden = colorMode !== 'pick';
    customArea.querySelector('[data-mode-gradient]').hidden = colorMode !== 'gradient';
    syncForDataChange();
    onChange();
  });

  on(gradStartEl, 'input', () => { gradStart = gradStartEl.value; applyGradient(); });
  on(gradEndEl, 'input', () => { gradEnd = gradEndEl.value; applyGradient(); });
  applyGradient({ render: false });

  return { getColors, syncForDataChange };
}
