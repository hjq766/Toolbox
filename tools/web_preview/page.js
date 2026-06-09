import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

const urlInput    = $('[data-url]');
const previewBtn  = $('[data-preview]');
const qrcodeBtn   = $('[data-qrcode]');
const stage       = $('[data-stage]');
const frame       = $('[data-frame]', stage);
const deviceBtns  = $$('.tab-btn[data-device]');
const qrArea      = $('[data-qr-area]');
const qrcodeEl    = $('#qrcode');

let qrcode = null;
let qrVisible = false;

function isValidUrl(url) {
  try {
    const u = new URL(url);
    return u.protocol === 'http:' || u.protocol === 'https:';
  } catch { return false; }
}

function normalizeUrl(raw) {
  const s = (raw || '').trim();
  if (!s) return '';
  if (/^https?:\/\//i.test(s)) return s;
  return `https://${s}`;
}

function initQRCode() {
  if (!window.QRCode) return false;
  qrcodeEl.innerHTML = '';
  qrcode = new window.QRCode(qrcodeEl, {
    width: 160, height: 160,
    colorDark: '#000000', colorLight: '#ffffff',
    correctLevel: window.QRCode.CorrectLevel.H
  });
  return true;
}

function toggleQRCode() {
  const url = normalizeUrl(urlInput.value);
  if (!qrVisible) {
    if (!isValidUrl(url)) { showToast('请输入有效网址（含 http/https）', { type: 'warn' }); return; }
    if (!qrcode && !initQRCode()) { showToast('二维码组件尚未加载，请稍候', { type: 'error' }); return; }
    qrcode.clear(); qrcode.makeCode(url);
    qrArea.hidden = false;
    qrVisible = true;
  } else {
    qrArea.hidden = true;
    qrVisible = false;
  }
}

function showPreview() {
  const url = normalizeUrl(urlInput.value);
  if (!isValidUrl(url)) { showToast('请输入有效网址（含 http/https）', { type: 'warn' }); return; }
  urlInput.value = url;
  frame.src = url;
  stage.classList.add('has-url');
  if (qrVisible && qrcode) { qrcode.clear(); qrcode.makeCode(url); }
}

function switchDevice(device) {
  stage.dataset.device = device;
  deviceBtns.forEach(b => b.classList.toggle('is-active', b.dataset.device === device));
  const sizes = { laptop: [1440, 900], tablet: [834, 1194], mobile: [390, 844] };
  if (device === 'desktop' || !sizes[device]) {
    frame.style.transform = '';
    return;
  }
  const [w, h] = sizes[device];
  const cw = stage.clientWidth;
  const ch = stage.clientHeight;
  const scale = Math.min(cw / w, ch / h, 0.9);
  frame.style.transform = `scale(${scale})`;
}

on(previewBtn, 'click', showPreview);
on(qrcodeBtn, 'click', toggleQRCode);
on(urlInput, 'keydown', (e) => { if (e.key === 'Enter') { e.preventDefault(); showPreview(); } });
deviceBtns.forEach(b => on(b, 'click', () => switchDevice(b.dataset.device)));
on(window, 'resize', () => {
  const current = deviceBtns.find(b => b.classList.contains('is-active'))?.dataset.device || 'desktop';
  switchDevice(current);
});

on(document, 'click', (e) => {
  if (!qrVisible) return;
  if (qrArea.contains(e.target) || qrcodeBtn.contains(e.target)) return;
  toggleQRCode();
});

switchDevice('desktop');
