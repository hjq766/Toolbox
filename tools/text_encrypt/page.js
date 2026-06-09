import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

const keyEl       = $('[data-key]');
const inputEl     = $('[data-input]');
const outputEl    = $('[data-output]');
const inputLabel  = $('[data-input-label]');
const outputLabel = $('[data-output-label]');

let mode = 'encrypt';

/* ======== 模式切换 ======== */
$$('[data-mode]').forEach(btn => on(btn, 'click', () => {
  mode = btn.dataset.mode;
  $$('[data-mode]').forEach(b => b.classList.toggle('is-active', b === btn));
  const isEnc = mode === 'encrypt';
  inputLabel.textContent = isEnc ? '明文' : '密文';
  outputLabel.textContent = isEnc ? '密文' : '明文';
  inputEl.placeholder = isEnc ? '输入要加密的文本' : '输入要解密的密文';
  outputEl.placeholder = isEnc ? '加密结果' : '解密结果';
  autoRun();
}));

/* ======== 随机密钥 ======== */
on($('[data-action="random-key"]'), 'click', () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const arr = crypto.getRandomValues(new Uint8Array(16));
  keyEl.value = Array.from(arr, b => chars[b % chars.length]).join('');
  autoRun();
});

/* ======== 加解密（仅 AES） ======== */
function run() {
  if (typeof CryptoJS === 'undefined') {
    showToast('CryptoJS 尚未加载，请稍候重试', { type: 'warn' });
    return;
  }

  const text = inputEl.value.trim();
  const key = keyEl.value;
  if (!text || !key) { outputEl.value = ''; return; }

  try {
    if (mode === 'encrypt') {
      outputEl.value = CryptoJS.AES.encrypt(text, key).toString();
    } else {
      const decrypted = CryptoJS.AES.decrypt(text, key);
      const result = decrypted.toString(CryptoJS.enc.Utf8);
      outputEl.value = result || '';
      if (!result && text) showToast('解密失败：密钥错误或密文无效', { type: 'error' });
    }
  } catch {
    outputEl.value = '';
  }
}

/* ======== 实时加解密 ======== */
let _timer = null;
function autoRun() {
  clearTimeout(_timer);
  _timer = setTimeout(run, 300);
}
on(inputEl, 'input', autoRun);
on(keyEl, 'input', autoRun);

/* ======== 复制 ======== */
on($('[data-action="copy"]'), 'click', async () => {
  if (!outputEl.value) { showToast('结果为空', { type: 'warn' }); return; }
  const ok = await copyText(outputEl.value);
  showToast(ok ? '已复制' : '复制失败', { type: ok ? 'success' : 'error' });
});

/* ======== 清空 ======== */
on($('[data-action="clear"]'), 'click', () => {
  inputEl.value = '';
  outputEl.value = '';
});
