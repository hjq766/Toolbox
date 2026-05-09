import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

const phoneEl   = $('[data-phone]');
const resultEl  = $('[data-result]');
const queryBtn  = $('[data-action="query"]');
let querying = false;

/* ---------- 只允许数字 ---------- */
on(phoneEl, 'input', () => { phoneEl.value = phoneEl.value.replace(/\D/g, ''); });

/* ---------- 验证 ---------- */
function isValid(p) { return /^1[3-9]\d{9}$/.test(p); }

/* ---------- 查询（JSONP → 聚合数据 API） ---------- */
function setLoading(v) {
  querying = v;
  queryBtn.disabled = v;
  queryBtn.textContent = v ? '查询中…' : '查询';
}

function query() {
  if (querying) return;
  const phone = phoneEl.value.trim();
  if (!phone)         { showToast('请输入手机号码', { type: 'warn' }); return; }
  if (!isValid(phone)) { showToast('请输入正确的 11 位手机号', { type: 'warn' }); return; }

  setLoading(true);
  const JUHE_KEY = atob('ZWQxMGViYWFhOGU5OGI4NWI0NjhjNjg4MDA1NTU0MDU=');
  const cb = 'jsonp_' + Math.random().toString(36).slice(2, 7);
  const script = document.createElement('script');

  const cleanup = () => { script.remove(); delete window[cb]; setLoading(false); };

  window[cb] = (data) => {
    if (data.error_code === 0) {
      const r = data.result;
      $('[data-r-number]').textContent  = phone;
      $('[data-r-segment]').textContent = phone.substring(0, 3);
      $('[data-r-province]').textContent = `${r.province} ${r.city}`;
      $('[data-r-carrier]').textContent  = r.company;
      resultEl.hidden = false;
    } else {
      showToast(data.reason || '查询失败', { type: 'error' });
    }
    cleanup();
  };

  script.onerror = () => { showToast('查询失败，请稍后重试', { type: 'error' }); cleanup(); };

  // 超时保护
  setTimeout(() => { if (window[cb]) { showToast('查询超时，请重试', { type: 'error' }); cleanup(); } }, 8000);

  script.src = `https://apis.juhe.cn/mobile/get?phone=${phone}&key=${JUHE_KEY}&callback=${cb}`;
  document.body.appendChild(script);
}

on($('[data-action="query"]'), 'click', query);
on(phoneEl, 'keydown', e => { if (e.key === 'Enter') query(); });
