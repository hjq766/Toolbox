import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

/* ========== state ========== */
let currentUrl = '';

/* ========== DOM ========== */
const idInput     = $('[data-wechat-id]');
const placeholder = $('[data-placeholder]');
const loadingEl   = $('[data-loading]');
const errorEl     = $('[data-error]');
const errorMsg    = $('[data-error-msg]');
const resultEl    = $('[data-result]');
const qrImg       = $('[data-qr-img]');
const exportPanel = $('[data-export]');

/* ========== helpers ========== */
function showState(state) {
  placeholder.hidden = state !== 'idle';
  loadingEl.hidden   = state !== 'loading';
  errorEl.hidden     = state !== 'error';
  resultEl.hidden    = state !== 'result';
}

/* ========== generate ========== */
on($('[data-action="generate"]'), 'click', generate);
on(idInput, 'keydown', e => { if (e.key === 'Enter') generate(); });

async function generate() {
  const id = idInput.value.trim();
  if (!id) { showToast('请输入公众号 ID'); idInput.focus(); return; }
  if (!/^[a-zA-Z0-9_-]+$/.test(id)) { showToast('ID 格式不正确'); return; }

  showState('loading');
  exportPanel.hidden = true;
  currentUrl = `https://open.weixin.qq.com/qr/code?username=${encodeURIComponent(id)}`;

  try {
    await new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        if (img.width < 50 || img.height < 50) { reject(new Error('图片异常')); return; }
        qrImg.src = img.src;
        resolve();
      };
      img.onerror = () => reject(new Error('加载失败'));
      img.src = currentUrl + '&_t=' + Date.now();
    });

    showState('result');
    exportPanel.hidden = false;
    showToast('二维码加载成功');
  } catch (err) {
    showState('error');
    errorMsg.textContent = '无法加载二维码，请检查公众号 ID 是否正确';
    currentUrl = '';
  }
}

/* ========== download ========== */
on($('[data-action="download"]'), 'click', () => {
  if (!currentUrl) return showToast('请先生成二维码');
  const id = idInput.value.trim();
  const a = document.createElement('a');
  a.href = currentUrl;
  a.download = `wechat_qrcode_${id}.jpg`;
  a.click();
  showToast('开始下载');
});

/* ========== clear ========== */
on($('[data-action="clear"]'), 'click', () => {
  idInput.value = '';
  currentUrl = '';
  showState('idle');
  exportPanel.hidden = true;
  idInput.focus();
});
