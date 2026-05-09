/**
 * 水印绘制核心模块 — watermark_images / watermark_pdf 共用
 *
 * API:
 *   drawTextWatermark(ctx, opts)
 *   drawImageWatermark(ctx, opts)
 *
 * opts 共用字段:
 *   mode           'single' | 'tile'
 *   position       'top-left' … 'bottom-right'（single 模式）
 *   opacity        1-100
 *   canvasW / canvasH
 *   tileRotation   0-360（tile 模式）
 *   tileSpacingX   100-300（tile 模式，百分比）
 *   tileSpacingY   100-300
 *
 * drawTextWatermark 额外:
 *   text, fontSize, fontColor
 *
 * drawImageWatermark 额外:
 *   watermarkImage (Image), watermarkSize (5-100，百分比)
 */

/* ---------- 内部工具 ---------- */

function resolvePosition(position, canvasW, canvasH, itemW, itemH) {
  const pad = Math.min(canvasW, canvasH) * 0.03;
  const map = {
    'top-left':      [pad, pad],
    'top-center':    [(canvasW - itemW) / 2, pad],
    'top-right':     [canvasW - itemW - pad, pad],
    'middle-left':   [pad, (canvasH - itemH) / 2],
    'middle-center': [(canvasW - itemW) / 2, (canvasH - itemH) / 2],
    'middle-right':  [canvasW - itemW - pad, (canvasH - itemH) / 2],
    'bottom-left':   [pad, canvasH - itemH - pad],
    'bottom-center': [(canvasW - itemW) / 2, canvasH - itemH - pad],
    'bottom-right':  [canvasW - itemW - pad, canvasH - itemH - pad],
  };
  return map[position] || map['middle-center'];
}

function drawTiled(ctx, drawOne, itemW, itemH, opts) {
  const { canvasW, canvasH, tileRotation = 315, tileSpacingX = 150, tileSpacingY = 150 } = opts;
  const rad = ((tileRotation > 180 ? tileRotation - 360 : tileRotation)) * Math.PI / 180;
  const spacingX = itemW * (tileSpacingX / 100);
  const spacingY = itemH * (tileSpacingY / 100);
  const diag = Math.sqrt(canvasW * canvasW + canvasH * canvasH);

  ctx.save();
  ctx.translate(canvasW / 2, canvasH / 2);
  ctx.rotate(rad);

  const startX = -diag;
  const startY = -diag;
  for (let y = startY; y < diag; y += spacingY) {
    for (let x = startX; x < diag; x += spacingX) {
      drawOne(ctx, x, y);
    }
  }
  ctx.restore();
}

/* ---------- 文字水印 ---------- */

export function drawTextWatermark(ctx, opts) {
  const { text, fontSize = 24, fontColor = '#000000', opacity = 50,
          mode = 'single', position = 'middle-center', canvasW, canvasH } = opts;
  if (!text) return;

  const alpha = opacity / 100;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `${fontSize}px sans-serif`;
  ctx.fillStyle = fontColor;
  ctx.textBaseline = 'top';

  const metrics = ctx.measureText(text);
  const textW = metrics.width;
  const textH = fontSize * 1.2;

  if (mode === 'tile') {
    drawTiled(ctx, (c, x, y) => c.fillText(text, x, y), textW, textH, opts);
  } else {
    const [x, y] = resolvePosition(position, canvasW, canvasH, textW, textH);
    ctx.fillText(text, x, y);
  }
  ctx.restore();
}

/* ---------- 图片水印 ---------- */

export function drawImageWatermark(ctx, opts) {
  const { watermarkImage, watermarkSize = 30, opacity = 50,
          mode = 'single', position = 'middle-center', canvasW, canvasH } = opts;
  if (!watermarkImage) return;

  const alpha = opacity / 100;
  const scale = watermarkSize / 100;
  const imgW = canvasW * scale;
  const imgH = (watermarkImage.height / watermarkImage.width) * imgW;

  ctx.save();
  ctx.globalAlpha = alpha;

  if (mode === 'tile') {
    drawTiled(ctx, (c, x, y) => c.drawImage(watermarkImage, x, y, imgW, imgH), imgW, imgH, opts);
  } else {
    const [x, y] = resolvePosition(position, canvasW, canvasH, imgW, imgH);
    ctx.drawImage(watermarkImage, x, y, imgW, imgH);
  }
  ctx.restore();
}
