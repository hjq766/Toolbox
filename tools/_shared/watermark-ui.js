/**
 * 水印控件共享交互模块 — watermark_images / watermark_pdf 共用
 *
 * 职责：绑定侧栏所有水印控件的事件（类型切换、文字设置、图片上传、
 *       模式切换、位置网格、铺满参数、导出格式），统一收集 opts。
 *
 * 用法：
 *   import { initWatermarkUI } from '../_shared/watermark-ui.js';
 *   const wmUI = initWatermarkUI({ onChanged: () => refreshPreview() });
 *   // wmUI.getOpts(canvasW, canvasH)  → 获取当前水印参数
 *   // wmUI.clear()                    → 重置水印设置
 *   // wmUI.type / wmUI.mode           → 当前状态
 */

import { $, $$, on, delegate, debounce } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';

export function initWatermarkUI({ onChanged = () => {} } = {}) {
  /* -------- 状态 -------- */
  let watermarkType = 'text';
  let watermarkMode = 'single';
  let selectedPosition = 'middle-center';
  let watermarkImage = null;
  let exportFormat = 'png';

  const notify = debounce(onChanged, 80);

  /* -------- 选项行通用切换 -------- */
  function bindOptRow(selector, dataAttr, onChange) {
    const container = $(selector);
    if (!container) return;
    delegate(container, 'click', `[${dataAttr}]`, (e, btn) => {
      $$('.btn', container).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      onChange(btn.getAttribute(dataAttr));
    });
  }

  /* -------- 水印类型 -------- */
  bindOptRow('[data-type-opts]', 'data-wm-type', val => {
    watermarkType = val;
    const textPanel = $('[data-text-settings]');
    const imgPanel = $('[data-image-settings]');
    if (textPanel) textPanel.hidden = val !== 'text';
    if (imgPanel) imgPanel.hidden = val !== 'image';
    notify();
  });

  /* -------- 文字设置 -------- */
  on($('[data-wm-text]'), 'input', notify);
  on($('[data-wm-fontsize]'), 'input', e => {
    const el = $('[data-fontsize-val]');
    if (el) el.textContent = e.target.value + 'px';
    notify();
  });
  on($('[data-wm-color]'), 'input', notify);
  on($('[data-wm-opacity]'), 'input', e => {
    const el = $('[data-opacity-val]');
    if (el) el.textContent = e.target.value + '%';
    notify();
  });

  /* -------- 图片水印上传 -------- */
  const wmUploadEl = $('[data-wm-upload]');
  const wmFileEl = $('[data-wm-file]');
  if (wmUploadEl && wmFileEl) {
    on(wmUploadEl, 'click', () => wmFileEl.click());
    on(wmFileEl, 'change', e => {
      const file = e.target.files[0];
      if (!file || !file.type.startsWith('image/')) { showToast('请选择有效的图片', { type: 'warn' }); return; }
      const reader = new FileReader();
      reader.onload = ev => {
        const img = new Image();
        img.onload = () => {
          watermarkImage = img;
          const prev = $('[data-wm-preview]');
          if (prev) { prev.src = ev.target.result; prev.hidden = false; }
          const hint = $('[data-wm-upload-hint]');
          if (hint) hint.hidden = true;
          notify();
        };
        img.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    });
  }
  on($('[data-wm-size]'), 'input', e => {
    const el = $('[data-size-val]');
    if (el) el.textContent = e.target.value + '%';
    notify();
  });
  on($('[data-wm-img-opacity]'), 'input', e => {
    const el = $('[data-img-opacity-val]');
    if (el) el.textContent = e.target.value + '%';
    notify();
  });

  /* -------- 水印模式 -------- */
  bindOptRow('[data-mode-opts]', 'data-wm-mode', val => {
    watermarkMode = val;
    const posPanel = $('[data-pos-panel]');
    const tilePanel = $('[data-tile-panel]');
    if (posPanel) posPanel.hidden = val !== 'single';
    if (tilePanel) tilePanel.hidden = val !== 'tile';
    notify();
  });

  /* -------- 位置网格 -------- */
  const posGrid = $('[data-pos-grid]');
  if (posGrid) {
    delegate(posGrid, 'click', '[data-pos]', (e, btn) => {
      $$('.pos-cell', posGrid).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedPosition = btn.dataset.pos;
      notify();
    });
  }

  /* -------- 铺满设置：角度预设 -------- */
  const angleContainer = $('[data-tile-panel]');
  if (angleContainer) {
    delegate(angleContainer, 'click', '[data-angle]', (e, btn) => {
      $$('[data-angle]', angleContainer).forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const v = +btn.dataset.angle;
      const rotSlider = $('[data-tile-rotation]');
      if (rotSlider) rotSlider.value = v;
      const rotVal = $('[data-rotation-val]');
      if (rotVal) rotVal.textContent = v > 180 ? `${v - 360}°` : `${v}°`;
      notify();
    });
  }
  on($('[data-tile-rotation]'), 'input', e => {
    const v = +e.target.value;
    const rotVal = $('[data-rotation-val]');
    if (rotVal) rotVal.textContent = v > 180 ? `${v - 360}°` : `${v}°`;
    if (angleContainer) {
      $$('[data-angle]', angleContainer).forEach(b =>
        b.classList.toggle('active', +b.dataset.angle === v));
    }
    notify();
  });
  on($('[data-tile-sx]'), 'input', e => {
    const el = $('[data-sx-val]');
    if (el) el.textContent = e.target.value + '%';
    notify();
  });
  on($('[data-tile-sy]'), 'input', e => {
    const el = $('[data-sy-val]');
    if (el) el.textContent = e.target.value + '%';
    notify();
  });

  /* -------- 导出格式（仅 images 有） -------- */
  bindOptRow('[data-format-opts]', 'data-fmt', val => { exportFormat = val; });

  /* -------- 公共 API -------- */
  return {
    get type()     { return watermarkType; },
    get mode()     { return watermarkMode; },
    get position() { return selectedPosition; },
    get format()   { return exportFormat; },
    get image()    { return watermarkImage; },

    getOpts(canvasW, canvasH) {
      return {
        text:          ($('[data-wm-text]')?.value) || '',
        fontSize:      +($('[data-wm-fontsize]')?.value || 24),
        fontColor:     ($('[data-wm-color]')?.value) || '#000000',
        opacity:       watermarkType === 'image'
                         ? +($('[data-wm-img-opacity]')?.value || 50)
                         : +($('[data-wm-opacity]')?.value || 50),
        watermarkImage,
        watermarkSize: +($('[data-wm-size]')?.value || 30),
        mode:          watermarkMode,
        position:      selectedPosition,
        tileRotation:  +($('[data-tile-rotation]')?.value || 315),
        tileSpacingX:  +($('[data-tile-sx]')?.value || 150),
        tileSpacingY:  +($('[data-tile-sy]')?.value || 150),
        canvasW,
        canvasH,
      };
    },

    clear() {
      const txtEl = $('[data-wm-text]');
      if (txtEl) txtEl.value = '';
      watermarkImage = null;
      const prev = $('[data-wm-preview]');
      if (prev) prev.hidden = true;
      const hint = $('[data-wm-upload-hint]');
      if (hint) hint.hidden = false;
      if (wmFileEl) wmFileEl.value = '';
    },
  };
}
