/**
 * chart-data.js — 可编辑数据表格组件 + CSV 解析
 *
 * 数据模型（2D 数组）：
 *   data[0]    = 表头行（第一格为空串或说明文字）
 *   data[1..]  = 数据行（第一格为系列名 / 标签）
 *
 * 示例（柱状图 / 折线图）：
 *   [['', '一月', '二月', '三月'],
 *    ['系列1', 150, 230, 224],
 *    ['系列2', 320, 132, 301]]
 *
 * 示例（饼图）：
 *   [['项目', '值'],
 *    ['直接访问', 335],
 *    ['邮件营销', 310]]
 */

const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
const MAX_IMPORT_ROWS = 500;
const MAX_IMPORT_COLS = 100;

/* ========== CSV 工具 ========== */

/**
 * 解析 CSV / TSV 文本为 2D 数组
 * 自动检测分隔符（逗号 or Tab）
 */
export function parseCSV(text) {
  if (!text || !text.trim()) return [];
  const sep = detectSeparator(text);
  const rows = [];
  let row = [];
  let cell = '';
  let quoted = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (ch === '"') {
        quoted = false;
      } else {
        cell += ch;
      }
      continue;
    }
    if (ch === '"') {
      quoted = true;
    } else if (ch === sep) {
      row.push(parseCell(cell));
      cell = '';
    } else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && text[i + 1] === '\n') i++;
      row.push(parseCell(cell));
      rows.push(row);
      row = [];
      cell = '';
    } else {
      cell += ch;
    }
  }
  row.push(parseCell(cell));
  if (row.some(value => value !== '') || rows.length === 0) rows.push(row);
  return rows;
}

/**
 * 2D 数组导出为 CSV 文本
 */
export function toCSV(data) {
  return data.map(row => row.map(cell => {
    const value = String(cell ?? '');
    return /[",\r\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value;
  }).join(',')).join('\n');
}

function detectSeparator(text) {
  const firstLine = text.split(/\r?\n/, 1)[0];
  return firstLine.includes('\t') && !firstLine.includes(',') ? '\t' : ',';
}

function parseCell(value) {
  const trimmed = value.trim();
  const num = Number(trimmed);
  return trimmed !== '' && !Number.isNaN(num) ? num : trimmed;
}

/* ========== 可编辑数据表格 ========== */

/**
 * 创建可编辑数据表格
 * @param {HTMLElement} container - 挂载容器
 * @param {object} config
 * @param {(string|number)[][]} config.data - 初始 2D 数据
 * @param {function} config.onChange - 数据变更回调
 * @param {number} [config.minRows=2] - 最少数据行（不含表头）
 * @param {number} [config.minCols=2] - 最少列数
 * @returns {{ getData, setData, destroy }}
 */
export function createDataEditor(container, { data, onChange, minRows = 2, minCols = 2 }) {
  let d = normalizeData(data);

  /* ---- DOM 骨架 ---- */
  const wrap = el('div', 'cd-wrap');

  // 工具栏
  const toolbar = el('div', 'cd-toolbar');
  const btnAddRow = btn('+ 行', 'cd-btn');
  const btnAddCol = btn('+ 列', 'cd-btn');
  const btnImport = btn('导入', 'cd-btn');
  toolbar.append(btnAddRow, btnAddCol, btnImport);

  // 表格滚动容器
  const scroll = el('div', 'cd-scroll');

  wrap.append(toolbar, scroll);
  container.appendChild(wrap);

  /* ---- 渲染表格 ---- */
  function render() {
    const rows = d.length;
    const cols = d[0]?.length || 0;
    let html = '<table class="cd-table">';

    for (let r = 0; r < rows; r++) {
      html += '<tr>';
      for (let c = 0; c < cols; c++) {
        const isHeader = r === 0;
        const tag = isHeader ? 'th' : 'td';
        html += `<${tag} contenteditable="true" data-r="${r}" data-c="${c}">${esc(d[r][c])}</${tag}>`;
      }
      // 行删除按钮（数据行 > minRows 才显示）
      if (r > 0 && rows - 1 > minRows) {
        html += `<td class="cd-act" data-del-row="${r}" title="删除此行">×</td>`;
      } else {
        html += '<td class="cd-act-placeholder"></td>';
      }
      html += '</tr>';
    }

    // 列删除按钮行
    html += '<tr class="cd-col-acts">';
    for (let c = 0; c < cols; c++) {
      if (cols > minCols) {
        html += `<td class="cd-act" data-del-col="${c}" title="删除此列">×</td>`;
      } else {
        html += '<td></td>';
      }
    }
    html += '<td></td></tr>';

    html += '</table>';
    scroll.innerHTML = html;
  }

  /* ---- 单元格编辑 ---- */
  scroll.addEventListener('input', e => {
    const cell = e.target.closest('[data-r]');
    if (!cell) return;
    const r = +cell.dataset.r;
    const c = +cell.dataset.c;
    const raw = cell.textContent.trim();
    const num = Number(raw);
    d[r][c] = raw !== '' && !isNaN(num) && r > 0 && c > 0 ? num : raw;
    fire();
  });

  // 按 Tab 跳到下一个单元格
  scroll.addEventListener('keydown', e => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const cell = e.target.closest('[data-r]');
      if (!cell) return;
      let r = +cell.dataset.r, c = +cell.dataset.c;
      if (e.shiftKey) { c--; if (c < 0) { c = d[0].length - 1; r--; } }
      else { c++; if (c >= d[0].length) { c = 0; r++; } }
      const next = scroll.querySelector(`[data-r="${r}"][data-c="${c}"]`);
      if (next) { next.focus(); selectAll(next); }
    }
    // Enter = 跳到下一行同列
    if (e.key === 'Enter') {
      e.preventDefault();
      const cell = e.target.closest('[data-r]');
      if (!cell) return;
      const r = +cell.dataset.r + 1, c = +cell.dataset.c;
      const next = scroll.querySelector(`[data-r="${r}"][data-c="${c}"]`);
      if (next) { next.focus(); selectAll(next); }
    }
  });

  /* ---- 删除行 / 列 ---- */
  scroll.addEventListener('click', e => {
    const delRow = e.target.closest('[data-del-row]');
    if (delRow) {
      d.splice(+delRow.dataset.delRow, 1);
      render(); fire(); return;
    }
    const delCol = e.target.closest('[data-del-col]');
    if (delCol) {
      const c = +delCol.dataset.delCol;
      d.forEach(row => row.splice(c, 1));
      render(); fire();
    }
  });

  /* ---- 增加行 / 列 ---- */
  btnAddRow.addEventListener('click', () => {
    const cols = d[0].length;
    const idx = d.length;
    d.push([`系列${idx}`, ...Array(cols - 1).fill(0)]);
    render(); fire();
  });

  btnAddCol.addEventListener('click', () => {
    const idx = d[0].length;
    d[0].push(`类别${idx}`);
    for (let r = 1; r < d.length; r++) d[r].push(0);
    render(); fire();
  });

  /* ---- CSV 导入弹窗 ---- */
  btnImport.addEventListener('click', showImportModal);

  function showImportModal() {
    const overlay = el('div', 'cd-overlay');
    const modal   = el('div', 'cd-modal');
    modal.innerHTML =
      `<div class="cd-modal-head"><strong>导入数据</strong><button class="cd-modal-close" type="button">×</button></div>` +
      `<div class="cd-modal-file"><label class="btn is-sm" style="cursor:pointer">📁 选择文件<input type="file" accept=".csv,.tsv,.xlsx,.xls" hidden></label><span class="cd-modal-fname"></span></div>` +
      `<div class="cd-modal-hint">上传 Excel / CSV 文件，或直接在表格中粘贴数据（Ctrl+V）</div>` +
      `<div class="cd-scroll" data-preview></div>` +
      `<div class="cd-modal-foot"><button class="btn is-primary is-sm" data-ok>确认导入</button><button class="btn is-sm" data-cancel>取消</button></div>`;
    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    const previewBox = modal.querySelector('[data-preview]');
    const fileInput  = modal.querySelector('input[type="file"]');
    const fnameSpan  = modal.querySelector('.cd-modal-fname');
    let previewData  = cloneData(d);

    function applyImportedData(parsed) {
      const error = getImportError(parsed);
      if (error) {
        fnameSpan.textContent = error;
        return;
      }
      previewData = normalizeData(parsed);
      renderPreview();
    }

    /* 渲染预览表格 */
    function renderPreview() {
      const rows = previewData.length;
      const cols = previewData[0]?.length || 0;
      let html = '<table class="cd-table">';
      for (let r = 0; r < rows; r++) {
        html += '<tr>';
        for (let c = 0; c < cols; c++) {
          const tag = r === 0 ? 'th' : 'td';
          html += `<${tag} contenteditable="true" data-r="${r}" data-c="${c}">${esc(previewData[r][c])}</${tag}>`;
        }
        html += '</tr>';
      }
      html += '</table>';
      previewBox.innerHTML = html;
    }
    renderPreview();

    /* 单元格编辑 */
    previewBox.addEventListener('input', e => {
      const cell = e.target.closest('[data-r]');
      if (!cell) return;
      const r = +cell.dataset.r, c = +cell.dataset.c;
      const raw = cell.textContent.trim();
      const num = Number(raw);
      previewData[r][c] = raw !== '' && !isNaN(num) && r > 0 && c > 0 ? num : raw;
    });

    /* 粘贴多行数据 → 替换整个表格 */
    previewBox.addEventListener('paste', e => {
      const text = (e.clipboardData || window.clipboardData).getData('text/plain');
      if (text && (text.includes('\n') || text.includes('\t'))) {
        e.preventDefault();
        if (text.length > MAX_IMPORT_BYTES) {
          fnameSpan.textContent = '粘贴数据不能超过 5 MB';
          return;
        }
        const parsed = parseCSV(text);
        if (parsed.length >= 2 && parsed[0].length >= 2) {
          applyImportedData(parsed);
        }
      }
    });

    /* 文件上传 */
    fileInput.addEventListener('change', async () => {
      const file = fileInput.files[0];
      if (!file) return;
      fnameSpan.textContent = file.name;
      if (file.size > MAX_IMPORT_BYTES) {
        fnameSpan.textContent = '导入文件不能超过 5 MB';
        return;
      }
      try {
        let text;
        if (/\.xlsx?$/i.test(file.name) && window.XLSX) {
          const ab = await file.arrayBuffer();
          const wb = XLSX.read(ab);
          const ws = wb.Sheets[wb.SheetNames[0]];
          text = XLSX.utils.sheet_to_csv(ws);
        } else {
          text = await file.text();
        }
        const parsed = parseCSV(text);
        if (parsed.length >= 2 && parsed[0].length >= 2) {
          applyImportedData(parsed);
        }
      } catch (err) {
        fnameSpan.textContent = '读取失败';
      }
    });

    /* 关闭 / 确认 */
    const close = () => overlay.remove();
    overlay.addEventListener('click', e => { if (e.target === overlay) close(); });
    modal.querySelector('.cd-modal-close').addEventListener('click', close);
    modal.querySelector('[data-cancel]').addEventListener('click', close);
    modal.querySelector('[data-ok]').addEventListener('click', () => {
      if (previewData.length >= 2 && previewData[0].length >= 2) {
        d = normalizeData(previewData);
        render(); fire();
      }
      close();
    });
  }

  /* ---- 辅助 ---- */
  function fire() { onChange?.(d); }

  /* ---- 初始渲染 ---- */
  render();

  /* ---- 公开 API ---- */
  return {
    getData: () => cloneData(d),
    setData: (newData) => { d = normalizeData(newData); render(); },
    destroy: () => wrap.remove(),
  };
}

/* ========== 内部工具 ========== */

function cloneData(data) {
  return data.map(row => [...row]);
}

function getImportError(data) {
  if (data.length > MAX_IMPORT_ROWS) return `最多导入 ${MAX_IMPORT_ROWS} 行`;
  let maxCols = 0;
  data.forEach(row => { maxCols = Math.max(maxCols, row.length); });
  return maxCols > MAX_IMPORT_COLS ? `最多导入 ${MAX_IMPORT_COLS} 列` : '';
}

function normalizeData(data) {
  const cloned = cloneData(data);
  const cols = Math.max(...cloned.map(row => row.length), 0);
  return cloned.map(row => [...row, ...Array(cols - row.length).fill('')]);
}

function el(tag, cls) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  return e;
}

function btn(text, cls) {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = cls || '';
  b.textContent = text;
  return b;
}

function esc(v) {
  return String(v ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function selectAll(el) {
  const range = document.createRange();
  range.selectNodeContents(el);
  const sel = window.getSelection();
  sel.removeAllRanges();
  sel.addRange(range);
}
