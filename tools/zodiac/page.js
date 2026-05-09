import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on } from '../../public/scripts/utils/dom.js';
import { showToast } from '../../public/scripts/components/toast.js';

mountToolHeader();

const NAMES = ['鼠','牛','虎','兔','龙','蛇','马','羊','猴','鸡','狗','猪'];
const ICONS = ['🐀','🐂','🐅','🐇','🐉','🐍','🐎','🐑','🐒','🐓','🐕','🐖'];

const zodiacData = {
  鼠: { wuxing:'水', personality:'聪明机智，善于社交，适应能力强，但有时过于圆滑世故。', compatibility:{ best:['龙','猴'], good:['牛','龙'], bad:['马','兔'] }},
  牛: { wuxing:'土', personality:'性格稳重，为人诚实可靠，做事认真负责，但有时固执保守。', compatibility:{ best:['鼠','蛇'], good:['鸡','猴'], bad:['羊','马'] }},
  虎: { wuxing:'木', personality:'性格勇敢，充满正义感，领导能力强，但易冲动。', compatibility:{ best:['马','狗'], good:['猪','兔'], bad:['蛇','猴'] }},
  兔: { wuxing:'木', personality:'温柔善良，优雅有礼，富有艺术气质，但略显优柔寡断。', compatibility:{ best:['狗','猪'], good:['羊','猴'], bad:['鼠','龙'] }},
  龙: { wuxing:'土', personality:'充满魅力，意志坚强，追求完美，但有时过于理想化。', compatibility:{ best:['鼠','猴'], good:['蛇','鸡'], bad:['狗','兔'] }},
  蛇: { wuxing:'火', personality:'智慧敏锐，优雅神秘，直觉强，但有时过于敏感。', compatibility:{ best:['牛','鸡'], good:['龙','猴'], bad:['虎','猪'] }},
  马: { wuxing:'火', personality:'活泼开朗，追求自由，充满活力，但易浮躁。', compatibility:{ best:['虎','羊'], good:['狗','兔'], bad:['鼠','牛'] }},
  羊: { wuxing:'土', personality:'温和善良，富有同情心，具有艺术天赋，但偏感性。', compatibility:{ best:['马','兔'], good:['猪','马'], bad:['牛','狗'] }},
  猴: { wuxing:'金', personality:'聪明灵活，创意十足，应变能力强，但易浮躁。', compatibility:{ best:['龙','鼠'], good:['蛇','兔'], bad:['虎','猪'] }},
  鸡: { wuxing:'金', personality:'勤奋务实，注重细节，表达能力强，但易过于完美主义。', compatibility:{ best:['蛇','牛'], good:['龙','虎'], bad:['兔','狗'] }},
  狗: { wuxing:'土', personality:'忠诚可靠，正直善良，富有正义感，但易过于保守。', compatibility:{ best:['虎','兔'], good:['马','猪'], bad:['龙','羊'] }},
  猪: { wuxing:'水', personality:'诚实善良，为人厚道，性格温和，但易过于天真。', compatibility:{ best:['兔','羊'], good:['虎','狗'], bad:['蛇','猴'] }}
};

const wheelEl    = $('[data-wheel]');
const resultEl   = $('[data-result]');
const yearEl     = $('[data-year]');
const ageEl      = $('[data-age]');
const qYearEl    = $('[data-query-year]');
const qAgeEl     = $('[data-query-age]');

/* ---------- wheel ---------- */
wheelEl.innerHTML = NAMES.map((n, i) =>
  `<div class="chip" data-zodiac="${n}" style="flex-direction:column;padding:8px 14px;gap:2px;text-align:center">
    <span style="font-size:24px;line-height:1">${ICONS[i]}</span><span style="font-size:var(--text-xs)">${n}</span>
  </div>`
).join('');

on(wheelEl, 'click', e => {
  const el = e.target.closest('[data-zodiac]');
  if (!el) return;
  const z = el.dataset.zodiac;
  const year = new Date().getFullYear();
  const idx = NAMES.indexOf(z);
  let y = year;
  while ((y - 1900) % 12 !== idx) y--;
  yearEl.value = y;
  doQuery(y);
});

/* ---------- tabs ---------- */
on($('[data-query-tabs]'), 'click', e => {
  const btn = e.target.closest('[data-tab]');
  if (!btn) return;
  $('[data-query-tabs]').querySelectorAll('.tab-btn').forEach(b => b.classList.remove('is-active'));
  btn.classList.add('is-active');
  const isYear = btn.dataset.tab === 'year';
  qYearEl.hidden = !isYear;
  qAgeEl.hidden = isYear;
});

/* ---------- query ---------- */
function doQuery(year) {
  if (!year || year < 1900 || year > 2100) {
    showToast('请输入 1900–2100 之间的年份', { type: 'warn' });
    return;
  }
  const idx = (year - 1900) % 12;
  const z = NAMES[idx];
  const d = zodiacData[z];

  $('[data-r-title]').textContent = `${year}年 · 属${z} ${ICONS[idx]}`;
  $('[data-r-wuxing]').textContent = d.wuxing;
  $('[data-r-personality]').textContent = d.personality;
  $('[data-r-best]').textContent = d.compatibility.best.join('、');
  $('[data-r-good]').textContent = d.compatibility.good.join('、');
  $('[data-r-bad]').textContent = d.compatibility.bad.join('、');
  resultEl.hidden = false;

  wheelEl.querySelectorAll('[data-zodiac]').forEach(el =>
    el.classList.toggle('is-active', el.dataset.zodiac === z));
}

on($('[data-action="query-year"]'), 'click', () => doQuery(+yearEl.value));
on(yearEl, 'keydown', e => { if (e.key === 'Enter') doQuery(+yearEl.value); });

on($('[data-action="query-age"]'), 'click', () => {
  const age = +ageEl.value;
  if (!age || age < 0 || age > 200) { showToast('请输入 0–200 之间的年龄', { type: 'warn' }); return; }
  const y = new Date().getFullYear() - age;
  yearEl.value = y;
  doQuery(y);
});
on(ageEl, 'keydown', e => {
  if (e.key === 'Enter') $('[data-action="query-age"]').click();
});

/* ---------- init ---------- */
const currentYear = new Date().getFullYear();
yearEl.value = currentYear;
doQuery(currentYear);
