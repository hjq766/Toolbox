# 8 类工具模板

> 新增或改版工具时**先对号入座**，选定类型后去 `assets/templates/<type>/` 复制起步代码。

---

## 1. 线性单位换算器 `convert_*`

**代表工具**：`convert_length` · `convert_weight` · `convert_area` · `convert_volume` · `convert_byte` · `convert_power` · `convert_press` · `convert_heat`

**模板**：`assets/templates/converter-linear/`

**布局**：`grid-sidebar-r` + 左多 `.panel`（按单位体系分组：公制 / 英制 / 中国市制）

**JS 核心**：
```js
const FACTORS = {
  m: 1,        // 基准单位
  km: 1000,
  cm: 0.01,
  mm: 0.001,
  mi: 1609.344,
  ft: 0.3048,
};
const NAMES = {
  m: '米', km: '千米', cm: '厘米', mm: '毫米',
  mi: '英里', ft: '英尺',
};

function convert(fromUnit, value) {
  if (!isFinite(value)) return;
  const base = value * FACTORS[fromUnit];
  for (const k of Object.keys(FACTORS)) {
    if (k === fromUnit) continue;
    const v = base / FACTORS[k];
    const el = $(`[data-unit="${k}"]`);
    if (el && document.activeElement !== el) {
      el.value = roundTo(v, precision);
    }
  }
}
```

**侧栏必含**：
- 快速输入预设（1 / 10 / 100 / 1000 按钮）
- 精度滑块（2-10 位小数，`.range-row`）
- 操作组（复制全部 / 重置，`.act-group`）

**初始化**：预填 `1` 并立即触发一次全量换算，用户进入即看到结果。

---

## 2. 非线性换算器

**代表工具**：`convert_temp`

**模板**：`assets/templates/converter-nonlinear/`

**差异**：用 `toBase / fromBase` 函数对替代因子表：

```js
const UNITS = {
  C: {
    name: '摄氏度',
    toBase: v => v,               // 以摄氏度为基准
    fromBase: v => v,
  },
  F: {
    name: '华氏度',
    toBase:   v => (v - 32) * 5/9,
    fromBase: v => v * 9/5 + 32,
  },
  K: {
    name: '开尔文',
    toBase:   v => v - 273.15,
    fromBase: v => v + 273.15,
  },
};

function convert(fromUnit, value) {
  const base = UNITS[fromUnit].toBase(value);
  for (const k of Object.keys(UNITS)) {
    if (k === fromUnit) continue;
    const v = UNITS[k].fromBase(base);
    $(`[data-unit="${k}"]`).value = roundTo(v, precision);
  }
}
```

**其余结构**与 §1 相同。

---

## 3. 图片处理器 `images_*`

**代表工具**：`images_flip` · `images_convert` · `images_compress` · `images_cut` · `images_color`

**模板**：`assets/templates/image-tool/`

**布局**：`grid-sidebar-r` `--sidebar-w:300px`

**左主区结构**（自上而下）：
1. 上传区 `<label data-drop>`（复用 `initUploadZone`）
2. 预览区（`<canvas>` 单图 / `.preview-grid` 批量）
3. 可选：文件信息面板（文件名/尺寸/大小/格式）
4. 可选：当前状态面板（如变换状态）

**批量模式**需引入 `_shared/preview-grid.css`（提供 `.preview-grid` / `.preview-item` / `.remove-btn` / `.img-modal` 等），见 [shared-modules §2](./shared-modules.md#2-preview-gridcss)。

**右侧栏结构**：
- 参数面板（输出格式 / 质量 / 尺寸…）
- `.act-group` 含：`.is-primary` 执行 + `.is-ghost` 重置 + `.is-ghost` 删除/清空

**核心状态**：
```js
let currentFile = null;       // 单图
let currentImage = null;      // Image 对象
let uploadedFiles = [];       // 批量
let convertedFiles = [];      // 输出结果
```

**必备能力**：
- 复用 `initUploadZone`（拖拽/粘贴/点击）
- 文件大小限制提示（典型 10MB）
- 输出用 `downloadBlob`，批量用 `JSZip` CDN

---

## 4. 代码编辑器类

**代表工具**：`code_format` · `code_json` · `code_xml` · `svg_code_editor` · `html_preview` · `html_markdown` · `markdown_html` · `html_javascript` · `html_text` · `meta`

**模板**：`assets/templates/code-editor/`

**布局**：
- 输入→输出互转：`grid-2`
- 实时生成：`grid-sidebar-r`（侧栏放表单）
- 复杂编辑器：自定义（如 `html_preview` 三编辑器）

**核心**：用 `_shared/code-editor.js` 的 `createEditor` 包装 `<textarea>`：

```js
import { createEditor } from '../_shared/code-editor.js';

const srcEl = $('[data-input="src"]');
const outEl = $('[data-output]');

const cmSrc = await createEditor(srcEl, { mode: 'javascript' });
const cmOut = await createEditor(outEl, { mode: 'javascript', readOnly: true });

// 之后直接用 srcEl.value，createEditor 自动代理
on(srcEl, 'input', debounce(format, 300));

function format() {
  try {
    outEl.value = beautify(srcEl.value);
  } catch (e) {
    showToast(`格式化失败：${e.message}`, { type: 'error' });
  }
}
```

**支持的 mode**：`javascript` / `xml` / `css` / `htmlmixed` / `markdown`（`json` 复用 javascript 模式）

---

## 5. 文本处理器

**代表工具**：`text_size` · `text_deduplicate` · `text_difference` · `text_morse` · `urlcode` · `base64` · `hex_convert` · `en_case` · `zh_convert`

**模板**：`assets/templates/text-tool/`

**布局**：`grid-2`（最常见）

**典型结构**：
```html
<div class="panel">
  <div class="grid grid-2">
    <div class="field">
      <label class="field-label" for="src">输入</label>
      <textarea class="textarea" id="src" data-input="src"></textarea>
    </div>
    <div class="field">
      <label class="field-label" for="out">输出</label>
      <textarea class="textarea" id="out" data-output readonly></textarea>
    </div>
  </div>

  <!-- 选项（若有） -->
  <div class="u-row u-gap-4 u-mt-3" style="flex-wrap:wrap">
    <label class="checkbox"><input type="checkbox" data-opt="trim"> 去首尾空白</label>
    <label class="checkbox"><input type="checkbox" data-opt="dedupe"> 去重</label>
  </div>

  <!-- 操作 -->
  <div class="u-row u-gap-3 u-mt-4">
    <button class="btn is-primary" data-action="run">转换</button>
    <button class="btn" data-action="copy">复制结果</button>
    <button class="btn" data-action="swap">交换</button>
    <button class="btn is-ghost" data-action="clear">清空</button>
  </div>
</div>

<!-- 若有统计，用 stat-grid -->
<div class="stat-grid u-mt-4" data-stats hidden>
  <div class="stat"><div class="stat-label">字符数</div><div class="stat-value" data-stat="chars">0</div></div>
  <div class="stat"><div class="stat-label">词数</div><div class="stat-value" data-stat="words">0</div></div>
</div>
```

---

## 6. 实时生成器

**代表工具**：`meta` · `qrcode` · `rmb` · `rand_password` · `ico_generator`

**模板**：`assets/templates/generator/`

**布局**：`grid-sidebar-r`，左预览/输出，右**所有**参数

**核心原则**：
- **不要**「生成」按钮，所有字段 `input` / `change` 事件即时重算
- 初始载入也触发一次生成，用户立即看到默认结果
- 重算用 `debounce(update, 200)` 避免高频刷新

**典型结构**：
```js
const fields = $$('[data-field]');
fields.forEach(el => {
  on(el, 'input', debounce(update, 200));
  on(el, 'change', update);
});

function update() {
  const data = collect();          // 从所有 [data-field] 收集
  const output = generate(data);
  outEl.value = output;
}

update();                          // 初始化
```

---

## 7. 查询类工具（本地数据库）

**代表工具**：`areacode` · `phone_localtion` · `idcard_calc` · `pinyin` · `zodiac`

**模板**：无独立模板（差异太大），参考 `v2/tools/areacode/`

**布局选项**：
- `grid-sidebar` — 左导航列表 + 右详情（`areacode`）
- 单面板 + result-row — 输入 → 多行结果（`phone_localtion`）
- 批量表格 — 数据量大时（`idcard_calc`）

**关键模式**：vendor 大文件放 `v2/public/vendor/`，HTML 全局注入：

```html
<script src="../../public/vendor/idcard_area.js"></script>
```

```js
// JS 里加载守卫
if (typeof provinceData === 'undefined') {
  showToast('数据文件未加载，请刷新重试', { type: 'error' });
  return;
}
```

---

## 8. 水印类工具

**代表工具**：`watermark_images` · `watermark_pdf`

**模板**：无独立模板，参考 `v2/tools/watermark_images/`

**布局**：`grid-sidebar-r` `--sidebar-w:320px`

**侧栏特色组件**（来自 `sidebar.css`）：
- `.pos-grid` + `.pos-cell` — 3×3 位置九宫格
- `.opt-row` — 预设样式切换
- `.range-row` — 不透明度 / 旋转角度
- `.act-group` — 下载 / 重置

**九宫格模板**：
```html
<div class="pos-grid" data-pos-grid>
  <button class="pos-cell" data-pos="tl">↖</button>
  <button class="pos-cell" data-pos="tc">↑</button>
  <button class="pos-cell" data-pos="tr">↗</button>
  <button class="pos-cell" data-pos="ml">←</button>
  <button class="pos-cell is-active" data-pos="mc">●</button>
  <button class="pos-cell" data-pos="mr">→</button>
  <button class="pos-cell" data-pos="bl">↙</button>
  <button class="pos-cell" data-pos="bc">↓</button>
  <button class="pos-cell" data-pos="br">↘</button>
</div>
```

---

## 决策树：我该选哪个模板？

```text
用户需求是什么？
├─ 数值换算？
│  ├─ 线性比例（长度/重量/面积…） → 模板 1
│  └─ 非线性（温度/对数…）         → 模板 2
├─ 图片处理？                        → 模板 3
├─ 代码编辑/格式化？                 → 模板 4
├─ 纯文本输入输出互转？              → 模板 5
├─ 实时表单 → 输出代码/图？          → 模板 6
├─ 查本地数据库？                    → 参考 areacode（无模板）
├─ 加水印？                          → 参考 watermark_images
└─ 都不是？
   ├─ 多结果展示？→ 布局 4（单面板+result-strip/result-row）
   ├─ 多设备预览？→ 布局 5（iframe）
   └─ 其他       → 从 _base 模板起步
```
