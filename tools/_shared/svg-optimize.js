// 通用 SVG 解析、安全清理、优化与序列化
// 同时服务于 svg_code_editor（单文件精修）与 svg_compress（批量压缩）
// 任何算法升级都应在此文件统一进行，两端自动受益

const SVG_NS = 'http://www.w3.org/2000/svg';

const DANGEROUS_ELEMENTS = new Set(['script', 'foreignobject', 'iframe', 'object', 'embed']);

const NUMERIC_ATTRS = new Set([
  'x', 'y', 'x1', 'y1', 'x2', 'y2', 'cx', 'cy', 'r', 'rx', 'ry',
  'width', 'height', 'stroke-width', 'opacity', 'fill-opacity',
  'stroke-opacity', 'stop-opacity', 'offset',
]);

// 属性默认值表：值等于这些默认值时可以安全移除（不改变渲染）
const ATTR_DEFAULTS = {
  fill: ['#000000', '#000', 'black'],
  stroke: ['none'],
  'stroke-width': ['1'],
  opacity: ['1'],
  'fill-opacity': ['1'],
  'stroke-opacity': ['1'],
  'stroke-linecap': ['butt'],
  'stroke-linejoin': ['miter'],
  'fill-rule': ['nonzero'],
};

/* ===== 档位预设 ===== */
export const PRESETS = {
  safe: {
    sanitize: true,
    removeComments: true,
    minifyWhitespace: true,
  },
  balanced: {
    sanitize: true,
    removeComments: true,
    removeMetadata: true,
    removeEmptyAttrs: true,
    removeEmptyGroups: true,
    removeDefaults: true,
    roundNumbers: true,
    numericPrecision: 3,
    minifyWhitespace: true,
  },
  aggressive: {
    sanitize: true,
    removeComments: true,
    removeMetadata: true,
    removeEmptyAttrs: true,
    removeEmptyGroups: true,
    removeDefaults: true,
    roundNumbers: true,
    numericPrecision: 2,
    roundPathData: true,
    pathPrecision: 2,
    minifyWhitespace: true,
  },
};

/* ===== 解析 ===== */
export function parseSvg(code) {
  const doc = new DOMParser().parseFromString(code, 'image/svg+xml');
  const err = doc.querySelector('parsererror');
  if (err) throw new Error('SVG 格式错误');
  const svg = doc.documentElement?.localName?.toLowerCase() === 'svg'
    ? doc.documentElement
    : doc.querySelector('svg');
  if (!svg) throw new Error('未找到 SVG 元素');
  return { doc, svg };
}

/* ===== 安全清理 ===== */
export function sanitizeSvg(svg) {
  const nodes = [svg, ...svg.querySelectorAll('*')];
  for (const node of nodes) {
    const name = node.localName?.toLowerCase();
    if (node !== svg && DANGEROUS_ELEMENTS.has(name)) {
      node.remove();
      continue;
    }
    for (const attr of [...node.attributes]) {
      const attrName = attr.name.toLowerCase();
      const value = attr.value.trim();
      const isJsUrl = /javascript\s*:/i.test(value);
      const isHtmlData = /^data:text\/html/i.test(value);
      const isUnsafeStyle = attrName === 'style'
        && /(expression\s*\(|url\s*\(\s*['"]?\s*javascript\s*:)/i.test(value);
      if (attrName.startsWith('on') || isJsUrl || isHtmlData || isUnsafeStyle) {
        node.removeAttribute(attr.name);
      }
    }
  }
  if (!svg.getAttribute('xmlns')) svg.setAttribute('xmlns', SVG_NS);
  return svg;
}

/* ===== 优化算子 ===== */
function removeComments(root) {
  const walker = root.ownerDocument.createTreeWalker(root, NodeFilter.SHOW_COMMENT);
  const list = [];
  while (walker.nextNode()) list.push(walker.currentNode);
  list.forEach(n => n.remove());
}

function removeMetadata(root) {
  root.querySelectorAll('metadata').forEach(el => el.remove());
}

function removeEmptyAttrs(root) {
  [root, ...root.querySelectorAll('*')].forEach(el => {
    [...el.attributes].forEach(a => {
      if (a.value.trim() === '') el.removeAttribute(a.name);
    });
  });
}

function removeEmptyGroups(root) {
  [...root.querySelectorAll('g')].reverse().forEach(g => {
    if (!g.children.length && !g.getAttribute('transform') && !g.attributes.length) {
      g.remove();
    } else if (!g.children.length && !g.textContent.trim()) {
      // 没子元素也没文本：即便有 transform 也无意义
      g.remove();
    }
  });
}

function removeDefaults(root) {
  [root, ...root.querySelectorAll('*')].forEach(el => {
    el.removeAttribute('version');
    el.removeAttribute('enable-background');
    for (const [attr, defaults] of Object.entries(ATTR_DEFAULTS)) {
      const v = el.getAttribute(attr);
      if (v != null && defaults.includes(String(v).toLowerCase())) {
        el.removeAttribute(attr);
      }
    }
  });
}

function roundNumericAttrs(root, digits) {
  [root, ...root.querySelectorAll('*')].forEach(el => {
    [...el.attributes].forEach(attr => {
      if (!NUMERIC_ATTRS.has(attr.name)) return;
      const v = attr.value.trim();
      if (!/^-?\d+(\.\d+)?$/.test(v)) return;
      const n = parseFloat(v);
      if (Number.isFinite(n)) {
        el.setAttribute(attr.name, String(round(n, digits)));
      }
    });
  });
}

// 路径 d 属性数字精度压缩
// 不改命令字母（M/L/C/Q/A...），只对其中的数字四舍五入
function roundPathData(root, digits) {
  root.querySelectorAll('path[d]').forEach(p => {
    const d = p.getAttribute('d');
    if (!d) return;
    const next = d.replace(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi, m => {
      const n = parseFloat(m);
      if (!Number.isFinite(n)) return m;
      return String(round(n, digits));
    });
    p.setAttribute('d', next);
  });
  // points 属性（polyline/polygon）也一起处理
  root.querySelectorAll('polyline[points], polygon[points]').forEach(p => {
    const v = p.getAttribute('points');
    if (!v) return;
    const next = v.replace(/-?\d*\.?\d+(?:e[-+]?\d+)?/gi, m => {
      const n = parseFloat(m);
      return Number.isFinite(n) ? String(round(n, digits)) : m;
    });
    p.setAttribute('points', next);
  });
}

function round(value, digits) {
  return Number.parseFloat(Number(value).toFixed(digits));
}

/* ===== 在 DOM 上执行优化（不序列化） ===== */
export function optimizeSvg(svg, options = {}) {
  const o = options;
  if (o.sanitize !== false) sanitizeSvg(svg);
  if (o.removeComments) removeComments(svg);
  if (o.removeMetadata) removeMetadata(svg);
  if (o.removeDefaults) removeDefaults(svg);
  if (o.roundNumbers) roundNumericAttrs(svg, o.numericPrecision ?? 3);
  if (o.roundPathData) roundPathData(svg, o.pathPrecision ?? 2);
  if (o.removeEmptyAttrs) removeEmptyAttrs(svg);
  if (o.removeEmptyGroups) removeEmptyGroups(svg);
  return svg;
}

/* ===== 序列化 ===== */
export function serializeSvg(svg, { pretty = false, minify = false } = {}) {
  const xml = new XMLSerializer().serializeToString(svg);
  if (pretty) return formatXml(xml);
  if (minify) return minifyXml(xml);
  return xml;
}

export function formatXml(xml) {
  let result = '';
  let indent = 0;
  const tab = '  ';
  const tokens = xml.replace(/>\s*</g, '>\n<').split('\n');
  for (const token of tokens) {
    const t = token.trim();
    if (!t) continue;
    if (/^<\//.test(t)) indent = Math.max(0, indent - 1);
    result += tab.repeat(indent) + t + '\n';
    if (/^<[^/!?][^>]*[^/]>$/.test(t) && !/<\//.test(t)) indent++;
  }
  return result.trim();
}

export function minifyXml(xml) {
  return xml
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/>\s+</g, '><')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/* ===== 一站式 API：字符串 → 优化 → 字符串 + 统计 ===== */
export function optimizeSvgString(code, options = {}) {
  const before = new Blob([code]).size;
  const { svg } = parseSvg(code);
  optimizeSvg(svg, options);
  const out = serializeSvg(svg, {
    minify: !!options.minifyWhitespace,
    pretty: !options.minifyWhitespace,
  });
  const after = new Blob([out]).size;
  return {
    code: out,
    stats: {
      before,
      after,
      saved: before > 0 ? 1 - after / before : 0,
    },
  };
}
