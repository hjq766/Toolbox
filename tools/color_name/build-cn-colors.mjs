#!/usr/bin/env node
/**
 * 从 zhongguose.com 导出的 colors.json 生成 colors-data.js 中的 CN_COLORS。
 * 用法：node build-cn-colors.mjs [colors.json 路径]
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIR = dirname(fileURLToPath(import.meta.url));
const JSON_PATH = process.argv[2] ? resolve(process.argv[2]) : join(DIR, 'colors.json');
const OUT_PATH = join(DIR, 'colors-data.js');

let json;
try {
  json = JSON.parse(await readFile(JSON_PATH, 'utf8'));
} catch (error) {
  throw new Error(`无法读取传统色源数据：${JSON_PATH}\n用法：node build-cn-colors.mjs /path/to/colors.json`, { cause: error });
}
const prev = await readFile(OUT_PATH, 'utf8');
const cssBlock = prev.match(/export const CSS_COLORS = \[[\s\S]*?\];/)?.[0];
if (!cssBlock) throw new Error('CSS_COLORS block not found');

const rows = json.map((c) => {
  const name = String(c.name).replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  const hex = `#${String(c.hex).replace(/^#/, '').toUpperCase()}`;
  return `  ['${name}','${hex}'],`;
});

const header = `// 颜色名称数据
// CSS 命名色来源：color-name (MIT) https://github.com/colorjs/color-name
//   对齐 W3C CSS Color Module Level 4 共 148 个关键字（含 gray/grey 等别名）
// 中国传统色来源：colorsea (MIT) https://github.com/waterbeside/colorsea 为基础，
//   已对照 zhongguose.com 补全至 ${json.length} 色（色值以官网为准）
`;

const out = `${header}${cssBlock}

export const CN_COLORS = [
${rows.join('\n')}
];
`;

await writeFile(OUT_PATH, out, 'utf8');
console.log(`✅ CN_COLORS: ${json.length} 色 → ${OUT_PATH}`);
