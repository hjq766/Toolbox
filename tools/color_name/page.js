import { mountToolHeader } from '../../public/scripts/core/tool-page.js';
import { $, on, debounce } from '../../public/scripts/utils/dom.js';
import { hexToOklab, hexToRgb, oklabDistance } from '../../public/scripts/utils/color.js';
import { CSS_COLORS, CN_COLORS } from './colors-data.js';
import { mountBrowseTabs } from '../_shared/browse-tabs.js';

mountToolHeader();

const DEFAULT_HEX = '#6366F1';
const TOP_N = 5;
const PER_PAGE = 48;

const HUE_TABS = [
  { id: 'all',     label: '全部' },
  { id: 'red',     label: '红' },
  { id: 'orange',  label: '橙' },
  { id: 'yellow',  label: '黄' },
  { id: 'green',   label: '绿' },
  { id: 'cyan',    label: '青' },
  { id: 'blue',    label: '蓝' },
  { id: 'purple',  label: '紫' },
  { id: 'neutral', label: '素' },
];

const hexInput = $('[data-input="hex"]');
const pickerInput = $('[data-input="picker"]');
const inputGroup = $('[data-input-group]');
const inputError = $('[data-input-error]');
const preview = $('[data-color-preview]');
const resultsEl = $('[data-results]');
const cssListEl = $('[data-css-list]');
const cnListEl = $('[data-cn-list]');
const browseGrid = $('[data-browse-grid]');
const setTabsEl = $('[data-tabs="set"]');
const hueTabsEl = $('[data-tabs="hue"]');
const browseSearch = $('[data-browse-search]');
const browseStatus = $('[data-browse-status]');
const browsePager = $('[data-browse-pager]');

const browseState = { set: 'cn', hue: 'all', query: '', page: 1 };

const setTabs = mountBrowseTabs(setTabsEl, {
  items: [
    { id: 'cn', label: '传统色' },
    { id: 'css', label: 'CSS 色' },
  ],
  getActive: () => browseState.set,
  onSelect: id => {
    browseState.set = id;
    resetBrowseView({ resetSearch: true, resetHue: true });
  },
});

const hueTabs = mountBrowseTabs(hueTabsEl, {
  items: HUE_TABS,
  getActive: () => browseState.hue,
  onSelect: id => {
    browseState.hue = id;
    browseState.page = 1;
    renderBrowse();
  },
});

function isValidHex(hex) {
  return /^#?([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(hex.trim());
}

function normalizeHex(hex) {
  const value = hex.trim().replace('#', '');
  const expanded = value.length === 3 ? value.split('').map(char => char + char).join('') : value;
  return `#${expanded.toUpperCase()}`;
}

function getHueGroup(hex) {
  const { r, g, b } = hexToRgb(hex);
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;

  if (delta < 0.1 || max < 0.15 || min > 0.88) return 'neutral';

  let hue;
  if (max === rn) hue = ((gn - bn) / delta) % 6;
  else if (max === gn) hue = (bn - rn) / delta + 2;
  else hue = (rn - gn) / delta + 4;
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;

  if (hue < 15 || hue >= 345) return 'red';
  if (hue < 45) return 'orange';
  if (hue < 70) return 'yellow';
  if (hue < 160) return 'green';
  if (hue < 200) return 'cyan';
  if (hue < 260) return 'blue';
  return 'purple';
}

function createBrowseDataset(rows) {
  return rows.map(([name, hex]) => ({
    name,
    hex: hex.toUpperCase(),
    hue: getHueGroup(hex),
    oklab: hexToOklab(hex),
  }));
}

function createMatchDataset(items) {
  const byHex = new Map();
  items.forEach((item) => {
    const existing = byHex.get(item.hex);
    if (existing) existing.names.push(item.name);
    else byHex.set(item.hex, { ...item, names: [item.name] });
  });
  return [...byHex.values()];
}

const DATASETS = {
  cn: createBrowseDataset(CN_COLORS),
  css: createBrowseDataset(CSS_COLORS),
};
const MATCH_DATASETS = {
  cn: createMatchDataset(DATASETS.cn),
  css: createMatchDataset(DATASETS.css),
};

function findNearest(inputHex, dataset, count) {
  const input = hexToOklab(inputHex);
  return dataset
    .map(item => ({ ...item, dist: oklabDistance(input, item.oklab) * 100 }))
    .sort((a, b) => a.dist - b.dist)
    .slice(0, count);
}

function getFilteredBrowseList() {
  const query = browseState.query.trim().toLowerCase();
  return DATASETS[browseState.set].filter(({ name, hex, hue }) => {
    if (browseState.hue !== 'all' && hue !== browseState.hue) return false;
    return !query || name.toLowerCase().includes(query) || hex.toLowerCase().includes(query);
  });
}

function setInputValidity(valid, showError = false) {
  inputGroup.classList.toggle('is-error', !valid);
  inputError.hidden = !showError;
  if (valid) hexInput.removeAttribute('aria-invalid');
  else hexInput.setAttribute('aria-invalid', 'true');
}

function renderColorItem(match, rank) {
  const name = match.names.join(' / ');
  const item = document.createElement('button');
  item.type = 'button';
  item.className = `cn-match${rank === 0 ? ' is-best' : ''}`;
  item.dataset.copy = match.hex;
  item.title = `复制 ${name} ${match.hex}`;
  item.setAttribute('aria-label', item.title);

  const swatch = document.createElement('span');
  swatch.className = 'cn-match-swatch';
  swatch.style.background = match.hex;

  const info = document.createElement('span');
  info.className = 'cn-match-info';

  const nameEl = document.createElement('span');
  nameEl.className = 'cn-match-name';
  nameEl.textContent = name;

  const hexEl = document.createElement('span');
  hexEl.className = 'cn-match-hex u-mono u-muted';
  hexEl.textContent = match.hex;

  const badge = document.createElement('span');
  badge.className = 'badge u-muted u-nowrap';
  badge.title = '基于 OKLab 感知色彩空间计算';
  if (match.dist < 0.01) badge.textContent = '完全匹配';
  else badge.textContent = rank === 0 ? `最接近 · ${match.dist.toFixed(1)}` : `差异 ${match.dist.toFixed(1)}`;

  info.append(nameEl, hexEl);
  item.append(swatch, info, badge);
  return item;
}

function renderBrowseCards(items) {
  const frag = document.createDocumentFragment();
  items.forEach(({ name, hex }) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'cn-browse-card';
    card.dataset.copy = hex;
    card.title = `查询并复制 ${name} ${hex}`;
    card.setAttribute('aria-label', card.title);

    const swatch = document.createElement('span');
    swatch.className = 'cn-browse-swatch';
    swatch.style.background = hex;

    const meta = document.createElement('span');
    meta.className = 'cn-browse-meta';

    const nameEl = document.createElement('span');
    nameEl.className = 'cn-browse-name';
    nameEl.textContent = name;

    const hexEl = document.createElement('span');
    hexEl.className = 'cn-browse-hex u-mono u-muted u-nowrap';
    hexEl.textContent = hex;

    meta.append(nameEl, hexEl);
    card.append(swatch, meta);
    frag.appendChild(card);
  });
  browseGrid.replaceChildren(frag);
}

function renderBrowse() {
  const filtered = getFilteredBrowseList();
  // 具体色相刻意取消分页，方便一次浏览完整色系。
  const paginate = browseState.hue === 'all';
  const totalPages = paginate ? Math.max(1, Math.ceil(filtered.length / PER_PAGE)) : 1;

  if (paginate && browseState.page > totalPages) browseState.page = totalPages;

  const pageItems = paginate
    ? filtered.slice((browseState.page - 1) * PER_PAGE, browseState.page * PER_PAGE)
    : filtered;
  renderBrowseCards(pageItems);

  const setLabel = browseState.set === 'cn' ? '传统色' : 'CSS 色';
  const hueLabel = HUE_TABS.find(tab => tab.id === browseState.hue)?.label ?? '全部';
  const huePart = browseState.hue === 'all' ? '' : `${hueLabel}系 · `;

  if (!filtered.length) {
    browseStatus.textContent = browseState.query
      ? `未找到匹配「${browseState.query}」的色名`
      : '当前分类下暂无颜色';
    browsePager.replaceChildren();
    return;
  }

  if (paginate && totalPages > 1) {
    browseStatus.textContent = `${setLabel} · ${huePart}共 ${filtered.length} 色 · 第 ${browseState.page} / ${totalPages} 页`;
    browsePager.innerHTML = `
      <button class="btn is-sm" type="button" ${browseState.page === 1 ? 'disabled' : ''} data-browse-page="${browseState.page - 1}">上一页</button>
      <span class="field-hint">${browseState.page} / ${totalPages}</span>
      <button class="btn is-sm" type="button" ${browseState.page === totalPages ? 'disabled' : ''} data-browse-page="${browseState.page + 1}">下一页</button>`;
  } else {
    browseStatus.textContent = `${setLabel} · ${huePart}共 ${filtered.length} 色`;
    browsePager.replaceChildren();
  }
}

function resetBrowseView({ resetSearch = false, resetHue = false } = {}) {
  if (resetSearch) {
    browseState.query = '';
    browseSearch.value = '';
  }
  if (resetHue) browseState.hue = 'all';
  browseState.page = 1;
  setTabs.render();
  hueTabs.render();
  renderBrowse();
}

function search(hex) {
  const normalized = normalizeHex(hex);
  preview.style.background = normalized;

  const cssMatches = findNearest(normalized, MATCH_DATASETS.css, TOP_N);
  const cnMatches = findNearest(normalized, MATCH_DATASETS.cn, TOP_N);

  cssListEl.replaceChildren(...cssMatches.map(renderColorItem));
  cnListEl.replaceChildren(...cnMatches.map(renderColorItem));
  resultsEl.hidden = false;
}

function setCurrentColor(hex) {
  const normalized = normalizeHex(hex);
  hexInput.value = normalized;
  pickerInput.value = normalized.toLowerCase();
  setInputValidity(true);
  search(normalized);
}

on(hexInput, 'input', () => {
  const value = hexInput.value.trim();
  if (!value) {
    setInputValidity(true);
    resultsEl.hidden = true;
    return;
  }
  if (!isValidHex(value)) {
    setInputValidity(false, true);
    resultsEl.hidden = true;
    return;
  }
  const normalized = normalizeHex(value);
  pickerInput.value = normalized.toLowerCase();
  setInputValidity(true);
  search(normalized);
});

on(hexInput, 'blur', () => {
  if (isValidHex(hexInput.value)) setCurrentColor(hexInput.value);
});

on(pickerInput, 'input', () => setCurrentColor(pickerInput.value));

on(document, 'click', event => {
  const card = event.target.closest('[data-browse-grid] [data-copy]');
  if (card) setCurrentColor(card.dataset.copy);
});

on(browseSearch, 'input', debounce(() => {
  browseState.query = browseSearch.value;
  browseState.page = 1;
  renderBrowse();
}));

on(browsePager, 'click', event => {
  const button = event.target.closest('[data-browse-page]');
  if (!button || button.disabled) return;
  browseState.page = Number(button.dataset.browsePage);
  renderBrowse();
  browseGrid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

setCurrentColor(DEFAULT_HEX);
resetBrowseView();
