/* ============================================================
   gradient-core.js — 渐变 CSS 生成 / 解析共享模块
   被 css_gradient、css_text_gradient 等工具共用
   ============================================================ */

export const DEFAULT_STOPS = [
  { color: '#ff0000', position: 0 },
  { color: '#0000ff', position: 100 },
];

export const ANGLE_MAP = {
  0: 'to top', 45: 'to top right', 90: 'to right', 135: 'to bottom right',
  180: 'to bottom', 225: 'to bottom left', 270: 'to left', 315: 'to top left',
};

/* ── CSS 生成 ────────────────────────────────────────────────
   state 结构：{ type, angle, shape, radialSize, posX, posY,
                 repeating, repeatCount, stops, previewW?, previewH? }
   radial 重复模式需要传入 previewW / previewH（像素尺寸），
   不传则退化为百分比模式。
   ─────────────────────────────────────────────────────────── */
export function buildGradientCSS(state) {
  const { type, angle, shape, radialSize, posX, posY,
          repeating, repeatCount, stops,
          previewW = 400, previewH = 300 } = state;
  const stopsStr = stops.map(s => `${s.color} ${s.position}%`).join(', ');

  if (type === 'linear') {
    if (repeating) {
      const adj = stops.map(s => `${s.color} ${(s.position / repeatCount).toFixed(1)}%`).join(', ');
      return `repeating-linear-gradient(${angle}deg, ${adj})`;
    }
    return `linear-gradient(${angle}deg, ${stopsStr})`;
  }

  if (type === 'radial') {
    const pos = `at ${posX}% ${posY}%`;
    if (repeating) {
      if (shape === 'circle') {
        const px = (radialSize / 100) * (Math.min(previewW, previewH) / repeatCount);
        return `repeating-radial-gradient(circle ${px}px ${pos}, ${stopsStr})`;
      }
      const sz = (radialSize / repeatCount).toFixed(1);
      return `repeating-radial-gradient(ellipse ${sz}% ${sz}% ${pos}, ${stopsStr})`;
    }
    if (shape === 'circle') {
      const px = (radialSize / 100) * Math.min(previewW, previewH);
      return `radial-gradient(circle ${px}px ${pos}, ${stopsStr})`;
    }
    return `radial-gradient(ellipse ${radialSize}% ${radialSize}% ${pos}, ${stopsStr})`;
  }

  // conic
  if (repeating) {
    const adj = stops.map(s => {
      const deg = (s.position * 360 / 100 / repeatCount).toFixed(1);
      return `${s.color} ${deg}deg`;
    }).join(', ');
    return `repeating-conic-gradient(from ${angle}deg at center, ${adj})`;
  }
  return `conic-gradient(from ${angle}deg at center, ${stopsStr})`;
}

/* ── 颜色解析（简版，用于色标） ─────────────────────────────── */
export function parseGradientColor(c) {
  if (c.startsWith('rgba')) {
    const m = c.match(/rgba\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/);
    if (m) {
      const hex = '#' + [m[1], m[2], m[3]].map(v => (+v).toString(16).padStart(2,'0')).join('');
      return { hex, alpha: +m[4] };
    }
  }
  if (c.startsWith('rgb')) {
    const alphaMatch = c.match(/rgb\(\s*(\d+)\s+(\d+)\s+(\d+)\s*\/\s*([\d.]+)\s*\)/);
    if (alphaMatch) {
      const hex = '#' + [alphaMatch[1], alphaMatch[2], alphaMatch[3]].map(v => (+v).toString(16).padStart(2,'0')).join('');
      return { hex, alpha: +alphaMatch[4] };
    }
    const m = c.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (m) {
      const hex = '#' + [m[1], m[2], m[3]].map(v => (+v).toString(16).padStart(2,'0')).join('');
      return { hex, alpha: 1 };
    }
  }
  return { hex: c.length === 7 ? c : c.padEnd(7,'0'), alpha: 1 };
}

/* ── CSS 渐变字符串解析 ──────────────────────────────────────── */
export function parseCSSGradient(cssText) {
  if (!cssText) return null;
  cssText = cssText.trim()
    .replace(/^background(?:-image)?:\s*/, '')
    .replace(/;$/, '')
    .replace(/\s+/g, ' ');

  const m = cssText.match(/^(repeating-)?(linear|radial|conic)-gradient\((.*)\)$/);
  if (!m) return null;

  const result = {
    type: m[2], repeating: !!m[1],
    angle: 90, shape: 'circle', size: 100, posX: 50, posY: 50, stops: [],
  };
  let content = m[3].trim();

  if (result.type === 'linear') {
    const dirMatch = content.match(/^to\s+(top|bottom|left|right)(?:\s+(left|right))?/);
    if (dirMatch) {
      const map = {
        'to right': 90, 'to left': 270, 'to bottom': 180, 'to top': 0,
        'to bottom right': 135, 'to bottom left': 225, 'to top right': 45, 'to top left': 315,
      };
      result.angle = map[dirMatch[0]] ?? 90;
      content = content.slice(dirMatch[0].length).replace(/^,\s*/, '');
    } else {
      const aMatch = content.match(/^(-?[\d.]+)deg/);
      if (aMatch) {
        result.angle = ((parseFloat(aMatch[1]) % 360) + 360) % 360;
        content = content.slice(aMatch[0].length).replace(/^,\s*/, '');
      }
    }
  } else if (result.type === 'radial') {
    const rm = content.match(/^(?:(circle|ellipse))?\s*(?:([\d.]+)(?:px|%))?\s*(?:at\s+([\d.]+%)\s+([\d.]+%))?,?\s*(.+)$/);
    if (rm) {
      if (rm[1]) result.shape = rm[1];
      if (rm[2]) result.size = parseFloat(rm[2]);
      if (rm[3]) result.posX = parseFloat(rm[3]);
      if (rm[4]) result.posY = parseFloat(rm[4]);
      content = rm[5] || content;
    }
  } else if (result.type === 'conic') {
    const cm = content.match(/^from\s+([\d.]+)deg(?:\s+at\s+\S+)?,?\s*(.+)$/);
    if (cm) { result.angle = parseFloat(cm[1]); content = cm[2]; }
  }

  result.stops = parseColorStops(content);
  return result;
}

export function parseColorStops(text) {
  if (!text) return [];
  return text.split(/\s*,\s*/).filter(Boolean).map((chunk, i, arr) => {
    const m = chunk.match(/^(#[0-9a-fA-F]{3,8}|rgba?\([^)]+\)|hsla?\([^)]+\)|[a-zA-Z]+)(?:\s+(-?[\d.]+)(?:%|deg)?)?/);
    if (!m) return null;
    const position = m[2] !== undefined
      ? parseFloat(m[2])
      : (i === 0 ? 0 : i === arr.length - 1 ? 100 : Math.round((i / (arr.length - 1)) * 100));
    return { color: m[1], position };
  }).filter(Boolean);
}

/* ── SVG 渐变生成 ────────────────────────────────────────────── */
export function generateSVG(state) {
  const { type, angle, shape, radialSize, posX, posY, stops, repeating } = state;
  if (type === 'conic' || repeating) return null;

  const id = 'g-' + Math.random().toString(36).slice(2, 9);
  let stopsXML = '';
  stops.forEach(s => {
    const p = parseGradientColor(s.color);
    stopsXML += `    <stop offset="${(s.position/100).toFixed(3)}" stop-color="${p.hex}" stop-opacity="${p.alpha}"/>\n`;
  });

  let gradEl;
  if (type === 'linear') {
    const rad = (angle - 90) * Math.PI / 180;
    const cos = Math.cos(rad), sin = Math.sin(rad);
    const x1=(0.5-cos*0.5).toFixed(3), y1=(0.5-sin*0.5).toFixed(3);
    const x2=(0.5+cos*0.5).toFixed(3), y2=(0.5+sin*0.5).toFixed(3);
    gradEl = `  <linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">\n${stopsXML}  </linearGradient>`;
  } else {
    const cx=(posX/100).toFixed(3), cy=(posY/100).toFixed(3), r=(radialSize/100).toFixed(3);
    const extra = shape === 'ellipse' ? ' gradientTransform="scale(1,0.6)"' : '';
    gradEl = `  <radialGradient id="${id}" cx="${cx}" cy="${cy}" r="${r}"${extra}>\n${stopsXML}  </radialGradient>`;
  }

  return `<svg width="400" height="400" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">\n  <defs>\n${gradEl}\n  </defs>\n  <rect width="400" height="400" fill="url(#${id})"/>\n</svg>`;
}
