import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';
import { escapeHtml } from '../../public/scripts/utils/dom.js';

mountToolHeader();

const jwtInput    = $('[data-input="jwt"]');
const errorEl     = $('[data-error]');
const resultEl    = $('[data-result]');
const headerOut   = $('[data-out="header"]');
const payloadOut  = $('[data-out="payload"]');
const sigOut      = $('[data-out="sig"]');
const expPanel    = $('[data-exp-panel]');
const expStatus   = $('[data-exp-status]');
const expDetail   = $('[data-exp-detail]');
const expBar      = $('[data-exp-bar]');
const claimsPanel = $('[data-claims-panel]');
const claimsEl    = $('[data-claims]');

/* ======== Base64URL 解码 ======== */
function base64UrlDecode(str) {
  let s = str.replace(/-/g, '+').replace(/_/g, '/');
  while (s.length % 4) s += '=';
  try {
    return JSON.parse(decodeURIComponent(
      atob(s).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')
    ));
  } catch {
    return null;
  }
}

/* ======== 标准声明字段 ======== */
const CLAIM_NAMES = {
  iss: '签发者 (Issuer)',
  sub: '主题 (Subject)',
  aud: '受众 (Audience)',
  exp: '过期时间 (Expiration)',
  nbf: '生效时间 (Not Before)',
  iat: '签发时间 (Issued At)',
  jti: 'JWT ID',
};

function formatTs(ts) {
  const d = new Date(ts * 1000);
  return d.toLocaleString('zh-CN', {
    year: 'numeric', month: '2-digit', day: '2-digit',
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
  });
}

/* ======== 解析 ======== */
function decode() {
  const raw = jwtInput.value.trim();
  errorEl.hidden = true;
  resultEl.hidden = true;
  expPanel.hidden = true;
  claimsPanel.hidden = true;

  if (!raw) return;

  const parts = raw.split('.');
  if (parts.length !== 3) {
    errorEl.textContent = 'JWT 格式不正确：应包含 3 个由 "." 分隔的部分';
    errorEl.hidden = false;
    return;
  }

  const header = base64UrlDecode(parts[0]);
  const payload = base64UrlDecode(parts[1]);

  if (!header) {
    errorEl.textContent = 'Header 解码失败，请检查 Token 格式';
    errorEl.hidden = false;
    return;
  }
  if (!payload) {
    errorEl.textContent = 'Payload 解码失败，请检查 Token 格式';
    errorEl.hidden = false;
    return;
  }

  headerOut.textContent = JSON.stringify(header, null, 2);
  payloadOut.textContent = JSON.stringify(payload, null, 2);
  sigOut.textContent = parts[2];
  resultEl.hidden = false;

  // 过期时间可视化
  if (payload.exp) {
    expPanel.hidden = false;
    const now = Math.floor(Date.now() / 1000);
    const isExpired = now > payload.exp;
    expStatus.innerHTML = isExpired
      ? '<span class="exp-expired"><i data-lucide="x-circle" style="width:14px;height:14px;vertical-align:-2px"></i> 已过期</span>'
      : '<span class="exp-ok"><i data-lucide="check-circle" style="width:14px;height:14px;vertical-align:-2px"></i> 有效</span>';

    const expTime = formatTs(payload.exp);
    if (payload.iat) {
      const iatTime = formatTs(payload.iat);
      const total = payload.exp - payload.iat;
      const elapsed = now - payload.iat;
      const pct = Math.max(0, Math.min(100, (elapsed / total) * 100));
      expDetail.textContent = `签发: ${iatTime}　过期: ${expTime}`;
      expBar.style.width = pct + '%';
      expBar.style.background = isExpired ? 'var(--color-danger)' : 'var(--color-brand)';
    } else {
      expDetail.textContent = `过期时间: ${expTime}`;
      expBar.style.width = isExpired ? '100%' : '50%';
      expBar.style.background = isExpired ? 'var(--color-danger)' : 'var(--color-brand)';
    }
    if (window.refreshIcons) window.refreshIcons(expPanel);
  }

  // 标准声明字段
  const claimRows = Object.entries(payload)
    .filter(([k]) => CLAIM_NAMES[k])
    .map(([k, v]) => {
      let display = v;
      if ((k === 'exp' || k === 'iat' || k === 'nbf') && typeof v === 'number') {
        display = `${v}（${formatTs(v)}）`;
      }
      return `<div class="result-row"><span class="u-muted">${CLAIM_NAMES[k]}</span><span class="u-mono">${escapeHtml(String(display))}</span></div>`;
    });

  if (claimRows.length) {
    claimsPanel.hidden = false;
    claimsEl.innerHTML = claimRows.join('');
  }

  if (window.refreshIcons) window.refreshIcons(resultEl);
}

/* ======== 示例 JWT ======== */
function generateSampleJWT() {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const payload = {
    sub: '1234567890',
    name: 'Demo User',
    iss: 'jqnav.top',
    iat: now,
    exp: now + 3600,
    admin: true
  };
  const encode = (obj) => btoa(JSON.stringify(obj))
    .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  return encode(header) + '.' + encode(payload) + '.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
}

/* ======== 事件 ======== */
on($('[data-action="paste"]'), 'click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    jwtInput.value = text;
    decode();
  } catch {
    showToast('无法读取剪贴板', { type: 'error' });
  }
});
on($('[data-action="clear"]'), 'click', () => {
  jwtInput.value = '';
  resultEl.hidden = true;
  errorEl.hidden = true;
});
on($('[data-action="sample"]'), 'click', () => {
  jwtInput.value = generateSampleJWT();
  decode();
});
on($('[data-action="copy-header"]'), 'click', async () => {
  const ok = await copyText(headerOut.textContent);
  showToast(ok ? '已复制 Header' : '复制失败', { type: ok ? 'success' : 'error' });
});
on($('[data-action="copy-payload"]'), 'click', async () => {
  const ok = await copyText(payloadOut.textContent);
  showToast(ok ? '已复制 Payload' : '复制失败', { type: ok ? 'success' : 'error' });
});

// 输入时自动解析
on(jwtInput, 'input', decode);

// 默认加载示例
jwtInput.value = generateSampleJWT();
decode();
