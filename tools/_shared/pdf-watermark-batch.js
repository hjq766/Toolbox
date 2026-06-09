const A4_WIDTH = 595;
const A4_HEIGHT = 842;
const FONT_FAMILY = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export const DENSITY_PRESETS = {
  dense:   { label: '密集铺满', baseX: 6, baseY: 9, minX: 4, minY: 6, maxX: 9, maxY: 12 },
  medium:  { label: '适中分布', baseX: 4, baseY: 6, minX: 3, minY: 4, maxX: 6, maxY: 8 },
  sparse:  { label: '稀疏点缀', baseX: 3, baseY: 4, minX: 2, minY: 3, maxX: 5, maxY: 6 },
  minimal: { label: '极简标记', baseX: 2, baseY: 3, minX: 2, minY: 2, maxX: 4, maxY: 5 },
};

export function parseList(value = '') {
  return String(value)
    .split(/\r?\n/)
    .map(item => item.trim())
    .filter(Boolean);
}

export function buildRecipients(names, secondaryItems = [], options = {}) {
  const {
    primaryTemplate = '专属水印：{{name}}',
    secondaryTemplate = '联系方式：{{number}}',
    useSecondary = false,
    secondaryMode = 'row',
  } = options;

  return names.map((name, index) => {
    const secondaryValue = secondaryMode === 'shared'
      ? secondaryItems[0] || ''
      : secondaryItems[index] || '';
    return {
      index,
      name,
      secondaryValue,
      secondaryMode,
      primaryText: applyTemplate(primaryTemplate, { name }),
      secondaryText: useSecondary && secondaryValue
        ? applyTemplate(secondaryTemplate, { number: secondaryValue, name })
        : '',
      hasMissingSecondary: useSecondary && !secondaryValue,
    };
  });
}

export function getMismatchInfo(recipients) {
  return recipients
    .filter(item => item.hasMissingSecondary)
    .map(item => ({
      index: item.index,
      name: item.name,
      primaryText: item.primaryText,
    }));
}

export function createMismatchReport(mismatchInfo, totals = {}) {
  const now = new Date().toLocaleString('zh-CN');
  const lines = [
    'PDF 批量水印匹配检测报告',
    `生成时间：${now}`,
    '',
    `主水印数量：${totals.primaryCount || 0}`,
    `副水印数量：${totals.secondaryCount || 0}`,
    `副水印模式：${totals.secondaryMode === 'shared' ? '共用第一条' : '按行匹配'}`,
    `忽略副水印：${totals.ignoredSecondaryCount || 0}`,
    `缺失数量：${mismatchInfo.length}`,
    '',
  ];

  if (totals.ignoredSecondaryCount) {
    lines.push(`共用第一条模式下，额外 ${totals.ignoredSecondaryCount} 条副水印不会参与生成。`, '');
  }

  if (!mismatchInfo.length) {
    lines.push('未发现主水印与副水印不匹配。');
    return lines.join('\n');
  }

  lines.push(totals.secondaryMode === 'shared'
    ? '共用副水印为空，以下输出不会绘制副水印：'
    : '以下主水印缺少对应副水印：');
  mismatchInfo.forEach((item, index) => {
    lines.push(`${String(index + 1).padStart(2, '0')}. ${item.primaryText}`);
  });
  lines.push('', '处理方式：导出时这些文件仍会生成，但不会绘制副水印。');
  return lines.join('\n');
}

export function drawBatchWatermark(ctx, canvasW, canvasH, recipient, options) {
  const lines = getWatermarkLines(recipient, options);
  if (!lines.length) return;

  ctx.save();
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';

  const metrics = measureLines(ctx, lines);
  const angle = Number(options.angle || -30);
  const density = options.density || 'medium';
  const grid = calculateWatermarkGrid(canvasW, canvasH, metrics, angle, density);

  for (let x = grid.startX; x < canvasW + grid.spacingX * 0.5; x += grid.spacingX) {
    for (let y = grid.startY; y < canvasH + grid.spacingY * 0.5; y += grid.spacingY) {
      drawWatermarkBlock(ctx, lines, x, y, angle);
    }
  }

  ctx.restore();
}

export async function generateBatchWatermarkZip(pdfBytes, recipients, options, onProgress = () => {}) {
  if (typeof PDFLib === 'undefined') throw new Error('pdf-lib 未加载');
  if (typeof JSZip === 'undefined') throw new Error('JSZip 未加载');

  const zip = new JSZip();
  for (let i = 0; i < recipients.length; i++) {
    const recipient = recipients[i];
    const pdfDoc = await PDFLib.PDFDocument.load(pdfBytes);
    const pages = pdfDoc.getPages();

    for (let p = 0; p < pages.length; p++) {
      const page = pages[p];
      const { width, height } = page.getSize();
      const layerBytes = await createWatermarkLayer(width, height, recipient, options);
      const layerImage = await pdfDoc.embedPng(layerBytes);
      page.drawImage(layerImage, { x: 0, y: 0, width, height });
    }

    const out = await pdfDoc.save();
    zip.file(createOutputFileName(recipient, options.filenamePattern), out);
    onProgress({
      done: i + 1,
      total: recipients.length,
      recipient,
      percent: Math.round(((i + 1) / recipients.length) * 100),
    });
    await waitForFrame();
  }

  return zip.generateAsync({ type: 'blob', compression: 'DEFLATE' });
}

export function applyTemplate(template, data = {}) {
  return String(template || '').replace(/\{\{\s*(index|name|number)\s*\}\}/g, (_, key) => data[key] || '');
}

export function validateTemplates({ primaryTemplate, useSecondary, secondaryTemplate }) {
  if (!String(primaryTemplate || '').includes('{{name}}')) {
    return '主水印模板需要包含 {{name}}';
  }
  if (useSecondary && !String(secondaryTemplate || '').includes('{{number}}')) {
    return '副水印模板需要包含 {{number}}';
  }
  return '';
}

function getWatermarkLines(recipient, options) {
  const lines = [];
  if (recipient.primaryText) {
    lines.push({
      text: recipient.primaryText,
      size: Number(options.primarySize || 28),
      color: options.primaryColor || defaultCanvasColor(),
      opacity: Number(options.primaryOpacity || 8) / 100,
      gapBefore: 0,
    });
  }
  if (options.useSecondary && recipient.secondaryText) {
    lines.push({
      text: recipient.secondaryText,
      size: Number(options.secondarySize || 20),
      color: options.secondaryColor || defaultCanvasColor(),
      opacity: Number(options.secondaryOpacity || 6) / 100,
      gapBefore: Number(options.lineSpacing || 8),
    });
  }
  if (options.useFixed && options.fixedText) {
    lines.push({
      text: options.fixedText,
      size: Number(options.fixedSize || 16),
      color: options.fixedColor || defaultCanvasColor(),
      opacity: Number(options.fixedOpacity || 5) / 100,
      gapBefore: Number(options.fixedLineSpacing || 12),
    });
  }
  return lines;
}

function measureLines(ctx, lines) {
  let width = 0;
  let height = 0;
  lines.forEach((line, index) => {
    ctx.font = `${line.size}px ${FONT_FAMILY}`;
    width = Math.max(width, ctx.measureText(line.text).width);
    height += (index === 0 ? 0 : line.gapBefore) + line.size;
  });
  return { width: Math.max(width, 1), height: Math.max(height, 1) };
}

function calculateWatermarkGrid(pageW, pageH, metrics, angle, density) {
  const preset = DENSITY_PRESETS[density] || DENSITY_PRESETS.medium;
  const areaFactor = Math.sqrt((pageW * pageH) / (A4_WIDTH * A4_HEIGHT));
  const aspect = pageW / pageH;
  const a4Aspect = A4_WIDTH / A4_HEIGHT;
  const aspectFactor = aspect > a4Aspect * 1.25 ? 1.15 : aspect < a4Aspect * 0.8 ? 0.9 : 1;
  const textFactor = Math.max(0.72, Math.min(1.2, 1 - (metrics.width / pageW) * 1.4));

  let countX = Math.round(preset.baseX * areaFactor * aspectFactor * textFactor);
  let countY = Math.round(preset.baseY * areaFactor * textFactor);
  countX = clamp(countX, preset.minX, preset.maxX);
  countY = clamp(countY, preset.minY, preset.maxY);

  const rad = Math.abs(angle * Math.PI / 180);
  const rotatedW = Math.abs(metrics.width * Math.cos(rad)) + Math.abs(metrics.height * Math.sin(rad));
  const rotatedH = Math.abs(metrics.width * Math.sin(rad)) + Math.abs(metrics.height * Math.cos(rad));
  const minSpacingX = rotatedW * 1.18;
  const minSpacingY = rotatedH * 1.3;

  countX = Math.max(1, Math.min(countX, Math.floor(pageW / Math.max(minSpacingX, 1)) || 1));
  countY = Math.max(1, Math.min(countY, Math.floor(pageH / Math.max(minSpacingY, 1)) || 1));

  const spacingX = pageW / countX;
  const spacingY = pageH / countY;
  return {
    spacingX,
    spacingY,
    startX: spacingX * 0.1,
    startY: spacingY * 0.1,
  };
}

function drawWatermarkBlock(ctx, lines, x, y, angle) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle * Math.PI / 180);

  let cursorY = 0;
  lines.forEach((line, index) => {
    cursorY += index === 0 ? 0 : line.gapBefore;
    ctx.font = `${line.size}px ${FONT_FAMILY}`;
    ctx.globalAlpha = line.opacity;
    ctx.fillStyle = line.color;
    ctx.fillText(line.text, 0, cursorY);
    cursorY += line.size;
  });

  ctx.restore();
}

async function createWatermarkLayer(width, height, recipient, options) {
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil(width);
  canvas.height = Math.ceil(height);
  const ctx = canvas.getContext('2d');
  drawBatchWatermark(ctx, canvas.width, canvas.height, recipient, options);
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('水印图层生成失败');
  return blob.arrayBuffer();
}

export function createOutputFileName(recipient, pattern = '水印_{{name}}.pdf') {
  const raw = applyTemplate(pattern || '水印_{{name}}.pdf', {
    index: String((recipient.index || 0) + 1).padStart(2, '0'),
    name: recipient.name,
    number: recipient.secondaryValue,
  });
  const withExt = /\.pdf$/i.test(raw) ? raw : `${raw}.pdf`;
  const safeName = withExt
    .replace(/[\\/:*?"<>|]/g, '_')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 120);
  return safeName || `水印_${String(recipient.name || '未命名').replace(/[\\/:*?"<>|]/g, '_').slice(0, 80)}.pdf`;
}

function waitForFrame() {
  return new Promise(resolve => {
    if (typeof requestAnimationFrame === 'function') requestAnimationFrame(() => resolve());
    else setTimeout(resolve, 0);
  });
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function defaultCanvasColor() {
  return getComputedStyle(document.body).color;
}
