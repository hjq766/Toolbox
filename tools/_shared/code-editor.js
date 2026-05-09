/**
 * code-editor.js — 轻量 CodeMirror 5 封装
 *
 * 用法：
 *   import { createEditor, MODES } from '../_shared/code-editor.js';
 *   createEditor(textareaEl, { mode: 'javascript' });
 *
 * 特性：
 *   - 按需从 CDN 动态加载 CodeMirror（首次约 70 KB gzip）
 *   - 自动注入与设计系统匹配的主题
 *   - 透明代理：覆写 textarea.value + 派发 input 事件，现有代码无需改动
 *   - textarea._cm 可直接访问 CodeMirror 实例
 */

const CDN = 'https://cdnjs.cloudflare.com/ajax/libs/codemirror/5.65.18';
let bootPromise = null;

/* ---------- 资源加载 ---------- */
function injectScript(src) {
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}
function injectCSS(href) {
  const l = document.createElement('link');
  l.rel = 'stylesheet'; l.href = href;
  document.head.appendChild(l);
}

/* ---------- 主题注入（匹配 design tokens） ---------- */
function injectTheme() {
  const s = document.createElement('style');
  s.textContent = `
.CodeMirror{font-family:'SF Mono',Menlo,Monaco,Consolas,monospace;font-size:var(--text-sm);line-height:1.6;height:auto;max-height:65vh;border:1px solid var(--border-base);border-radius:var(--radius-md);background:var(--bg-surface);color:var(--fg-base);transition:border-color .15s,box-shadow .15s;min-width:0;max-width:100%}
.CodeMirror-scroll{max-height:65vh;overflow:auto!important}
.CodeMirror-focused{border-color:var(--color-brand);box-shadow:0 0 0 3px color-mix(in srgb,var(--color-brand) 12%,transparent)}
.CodeMirror-gutters{background:var(--bg-surface-2);border-right:1px solid var(--border-subtle)}
.CodeMirror-linenumber{color:var(--fg-muted);font-size:11px}
.CodeMirror-cursor{border-left-color:var(--fg-base)}
.CodeMirror-selected{background:color-mix(in srgb,var(--color-brand) 15%,transparent)}
.CodeMirror-matchingbracket{color:var(--color-brand)!important;font-weight:700}
.CodeMirror pre.CodeMirror-placeholder{color:var(--fg-muted)}
.CodeMirror-scroll{min-height:inherit}
.cm-keyword{color:#c678dd}.cm-atom{color:#d19a66}.cm-number{color:#d19a66}
.cm-def{color:#61afef}.cm-variable{color:var(--fg-base)}.cm-variable-2{color:#e06c75}
.cm-type{color:#e5c07b}.cm-property{color:#e06c75}.cm-operator{color:var(--fg-muted)}
.cm-comment{color:#7f848e;font-style:italic}
.cm-string{color:#98c379}.cm-string-2{color:#98c379}
.cm-tag{color:#e06c75}.cm-attribute{color:#d19a66}.cm-bracket{color:var(--fg-muted)}
.cm-builtin{color:#56b6c2}.cm-meta{color:#7f848e}.cm-link{color:var(--color-brand)}
.cm-header{color:#e06c75;font-weight:700}.cm-error{color:#e06c75}
`;
  document.head.appendChild(s);
}

/* ---------- CodeMirror 启动 ---------- */
function boot() {
  if (bootPromise) return bootPromise;
  bootPromise = (async () => {
    if (window.CodeMirror) return window.CodeMirror;

    injectCSS(`${CDN}/codemirror.min.css`);
    injectTheme();
    await injectScript(`${CDN}/codemirror.min.js`);

    /* 插件 */
    await Promise.all([
      injectScript(`${CDN}/addon/edit/matchbrackets.min.js`),
      injectScript(`${CDN}/addon/edit/closebrackets.min.js`),
      injectScript(`${CDN}/addon/display/placeholder.min.js`),
    ]);

    /* 语言模式（依赖顺序：xml → js+css → htmlmixed+markdown） */
    await injectScript(`${CDN}/mode/xml/xml.min.js`);
    await Promise.all([
      injectScript(`${CDN}/mode/javascript/javascript.min.js`),
      injectScript(`${CDN}/mode/css/css.min.js`),
    ]);
    await Promise.all([
      injectScript(`${CDN}/mode/htmlmixed/htmlmixed.min.js`),
      injectScript(`${CDN}/mode/markdown/markdown.min.js`),
    ]);

    return window.CodeMirror;
  })();
  return bootPromise;
}

/* ---------- 模式映射 ---------- */
export const MODES = {
  js:         'javascript',
  javascript: 'javascript',
  json:       { name: 'javascript', json: true },
  css:        'css',
  html:       'htmlmixed',
  htmlmixed:  'htmlmixed',
  xml:        'xml',
  svg:        'xml',
  md:         'markdown',
  markdown:   'markdown',
};

/**
 * 将 textarea 升级为 CodeMirror 编辑器
 * @param {HTMLTextAreaElement} textarea
 * @param {object} opts
 * @param {string|object} opts.mode   CodeMirror 模式
 * @param {boolean} opts.readOnly     只读（默认自动检测 readonly 属性）
 * @param {boolean} opts.lineNumbers  行号（默认 true）
 * @returns {Promise<CodeMirror.Editor>}
 */
export async function createEditor(textarea, { mode = 'javascript', readOnly, lineNumbers = true } = {}) {
  const CM = await boot();

  const isReadOnly = readOnly ?? textarea.hasAttribute('readonly');

  const cm = CM.fromTextArea(textarea, {
    mode,
    lineNumbers,
    lineWrapping: true,
    tabSize: 2,
    indentWithTabs: false,
    readOnly: isReadOnly || false,
    matchBrackets: !isReadOnly,
    autoCloseBrackets: !isReadOnly,
    placeholder: textarea.placeholder || '',
  });

  /* 继承 min-height */
  const minH = textarea.style.minHeight;
  if (minH) {
    cm.getWrapperElement().style.minHeight = minH;
    cm.setSize(null, null);
  }

  /* 透明代理：覆写 textarea.value */
  Object.defineProperty(textarea, 'value', {
    get()  { return cm.getValue(); },
    set(v) { cm.setValue(v ?? ''); },
    configurable: true,
  });

  /* 将 CM change 映射为 textarea 的 input 事件 */
  let dispatching = false;
  cm.on('changes', () => {
    if (dispatching) return;
    dispatching = true;
    textarea.dispatchEvent(new Event('input', { bubbles: true }));
    dispatching = false;
  });

  /* 方便外部访问 CM 实例 */
  textarea._cm = cm;
  return cm;
}
