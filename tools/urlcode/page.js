import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, $$, on } from '../../public/scripts/utils/dom.js';
import { copyText } from '../../public/scripts/utils/clipboard.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

const raw = $('[data-raw]');
const out = $('[data-encoded]');
const auto = $('[data-auto]');
let mode = 'component';

function encode(str) {
  return mode === 'full' ? encodeURI(str) : encodeURIComponent(str);
}
function decode(str) {
  try {
    return mode === 'full' ? decodeURI(str) : decodeURIComponent(str);
  } catch (e) {
    showToast('解码失败：输入包含非法编码', { type: 'error' });
    return '';
  }
}

on($('[data-mode-nav]'), 'click', (e) => {
  const b = e.target.closest('[data-mode]'); if (!b) return;
  $$('[data-mode-nav] .tab-btn').forEach(x => x.classList.remove('is-active'));
  b.classList.add('is-active');
  mode = b.dataset.mode;
  if (auto.checked && raw.value) out.value = encode(raw.value);
});

on(raw, 'input', () => { if (auto.checked) out.value = encode(raw.value); });
on(out, 'input', () => { if (auto.checked) raw.value = decode(out.value); });

on($('[data-encode]'), 'click', () => { out.value = encode(raw.value); });
on($('[data-decode]'), 'click', () => { raw.value = decode(out.value); });
on($('[data-swap]'), 'click', () => {
  const a = raw.value, b = out.value;
  raw.value = b; out.value = a;
});
on($('[data-clear]'), 'click', () => { raw.value = ''; out.value = ''; raw.focus(); });
on($('[data-copy-encoded]'), 'click', async () => {
  const ok = await copyText(out.value);
  showToast(ok ? '已复制编码结果' : '复制失败', { type: ok ? 'success' : 'error' });
});

// 示例
raw.value = 'https://example.com/搜索?q=你好&tag=前端';
out.value = encode(raw.value);
