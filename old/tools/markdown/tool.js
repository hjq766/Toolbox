// 初始化编辑器
let editor;
let isPreviewMode = false;
let lastContent = '';

// 初始化 CodeMirror
function initEditor() {
    editor = CodeMirror.fromTextArea(document.getElementById('markdown-editor'), {
        mode: 'markdown',
        lineNumbers: true,
        lineWrapping: true,
        theme: 'default',
        autofocus: true,
        tabSize: 2,
        scrollbarStyle: null,
        extraKeys: {
            'Ctrl-B': () => insertMarkdown('bold'),
            'Ctrl-I': () => insertMarkdown('italic'),
            'Ctrl-K': () => insertMarkdown('code'),
            'Ctrl-L': () => showPopup('link-popup'),
            'Ctrl-H': () => insertMarkdown('heading'),
            'Ctrl-Q': () => insertMarkdown('quote'),
        }
    });

    // 编辑器变化事件
    editor.on('change', () => {
        const content = editor.getValue();
        updatePreview(content);
        updateWordCount(content);
        updateCursorPosition(editor);
        saveToLocalStorage(content);
    });

    // 光标位置变化事件
    editor.on('cursorActivity', () => {
        updateCursorPosition(editor);
    });

    // 加载上次编辑的内容
    loadFromLocalStorage();
}

// 更新预览
function updatePreview(content) {
    if (content === lastContent) return;
    lastContent = content;
    
    const preview = document.getElementById('preview-content');
    const html = marked.parse(content);
    preview.innerHTML = DOMPurify.sanitize(html);
}

// 更新字数统计
function updateWordCount(content) {
    const wordCount = content.replace(/\s+/g, ' ').trim().length;
    document.querySelector('.word-count').textContent = `字数：${wordCount}`;
}

// 更新光标位置
function updateCursorPosition(editor) {
    const pos = editor.getCursor();
    document.querySelector('.cursor-position').textContent = 
        `行：${pos.line + 1}，列：${pos.ch + 1}`;
}

// 工具栏按钮事件处理
function initToolbar() {
    document.querySelectorAll('.tool-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const action = btn.getAttribute('data-action');
            const format = btn.getAttribute('data-format');
            
            if (action) handleToolAction(action);
            if (format) handleExport(format);
        });
    });
}

// 处理工具栏动作
function handleToolAction(action) {
    switch (action) {
        case 'undo': editor.undo(); break;
        case 'redo': editor.redo(); break;
        case 'bold': insertMarkdown('bold'); break;
        case 'italic': insertMarkdown('italic'); break;
        case 'strikethrough': insertMarkdown('strikethrough'); break;
        case 'heading': insertMarkdown('heading'); break;
        case 'quote': insertMarkdown('quote'); break;
        case 'code': insertMarkdown('code'); break;
        case 'list-ul': insertMarkdown('unordered-list'); break;
        case 'list-ol': insertMarkdown('ordered-list'); break;
        case 'task': insertMarkdown('task-list'); break;
        case 'link': showPopup('link-popup'); break;
        case 'image': showPopup('image-insert-popup'); break;
        case 'table': showPopup('table-popup'); break;
        case 'code-block': showPopup('code-block-popup'); break;
        case 'emoji': showPopup('emoji-popup'); break;
        case 'format': formatMarkdown(); break;
        case 'preview': togglePreview(); break;
        case 'edit-only': toggleEditMode(); break;
        case 'fullscreen': toggleFullscreen(); break;
        case 'clear':
            if (confirm('确定要清空编辑器内容吗？此操作不可撤销。')) {
                editor.setValue('');
                editor.focus();
            }
            break;
    }
}

// 插入 Markdown 语法
function insertMarkdown(type) {
    const selections = editor.getSelections();
    const replacements = selections.map(text => {
        switch (type) {
            case 'bold': return `**${text || '粗体文字'}**`;
            case 'italic': return `*${text || '斜体文字'}*`;
            case 'strikethrough': return `~~${text || '删除文字'}~~`;
            case 'heading': return `### ${text || '标题'}`;
            case 'quote': return `> ${text || '引用文字'}`;
            case 'code': return `\`${text || 'code'}\``;
            case 'unordered-list': return `- ${text || '列表项'}`;
            case 'ordered-list': return `1. ${text || '列表项'}`;
            case 'task-list': return `- [ ] ${text || '任务项'}`;
            default: return text;
        }
    });
    
    editor.replaceSelections(replacements);
    editor.focus();
}

// 显示弹出层
function showPopup(id) {
    const popup = document.getElementById(id);
    popup.classList.add('active');
    
    // 绑定关闭事件
    const closeButtons = popup.querySelectorAll('.popup-close');
    closeButtons.forEach(btn => {
        btn.onclick = () => popup.classList.remove('active');
    });
}

// 初始化链接插入
function initLinkInsertion() {
    document.getElementById('insert-link').addEventListener('click', () => {
        const text = document.getElementById('link-text').value;
        const url = document.getElementById('link-url').value;
        
        if (url) {
            const markdown = `[${text || url}](${url})`;
            editor.replaceSelection(markdown);
            document.getElementById('link-popup').classList.remove('active');
            editor.focus();
        }
    });
}

// 初始化图片插入
function initImageInsertion() {
    const imageInput = document.getElementById('image-file-input');
    const dragArea = document.getElementById('image-drag-area');
    
    // 切换面板
    document.querySelectorAll('.btn-group-option').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.btn-group-option').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            
            const type = btn.getAttribute('data-type');
            document.querySelectorAll('.panel').forEach(panel => panel.classList.remove('active'));
            document.getElementById(`${type}-panel`).classList.add('active');
        });
    });
    
    // 处理图片链接插入
    document.getElementById('insert-image').addEventListener('click', () => {
        const activePanel = document.querySelector('.panel.active');
        if (activePanel.id === 'link-panel') {
            const url = document.getElementById('image-url').value.trim();
            const altText = document.getElementById('link-image-text').value || '图片';
            if (url) {
                editor.replaceSelection(`![${altText}](${url})`);
                document.getElementById('image-insert-popup').classList.remove('active');
                document.getElementById('image-url').value = '';
                editor.focus();
            }
        }
    });
    
    // 处理图片上传
    initImageUpload(imageInput, dragArea);
}

// 添加图片上传初始化函数
function initImageUpload(imageInput, dragArea) {
    // 处理拖放
    dragArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        dragArea.classList.add('active');
    });
    
    dragArea.addEventListener('dragleave', () => {
        dragArea.classList.remove('active');
    });
    
    dragArea.addEventListener('drop', (e) => {
        e.preventDefault();
        dragArea.classList.remove('active');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageFile(file);
        }
    });
    
    // 处理点击上传
    dragArea.addEventListener('click', () => imageInput.click());
    imageInput.addEventListener('change', () => {
        const file = imageInput.files[0];
        if (file) handleImageFile(file);
    });
}

// 处理图片文件
function handleImageFile(file) {
    const maxRetries = 3;
    let currentRetry = 0;

    const tryLoadImage = () => {
        const reader = new FileReader();
        
        reader.onerror = (error) => {
            console.error('图片读取失败:', error);
            if (currentRetry < maxRetries) {
                currentRetry++;
                console.log(`重试第 ${currentRetry} 次...`);
                setTimeout(tryLoadImage, 1000);
            } else {
                alert('图片上传失败，请重试');
                resetDragArea();
            }
        };

        reader.onload = (e) => {
            const imageUrl = e.target.result;
            // 预压缩大图片
            if (file.size > 2 * 1024 * 1024) {
                compressImage(imageUrl, (compressedUrl) => {
                    updateDragAreaPreview(compressedUrl);
                });
            } else {
                updateDragAreaPreview(imageUrl);
            }
        };

        try {
            reader.readAsDataURL(file);
        } catch (error) {
            reader.onerror(error);
        }
    };

    tryLoadImage();
}

// 预压缩图片
function compressImage(imageUrl, callback) {
    const img = new Image();
    img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;
        
        // 限制最大尺寸
        const maxSize = 1920;
        if (width > maxSize || height > maxSize) {
            if (width > height) {
                height = (maxSize / width) * height;
                width = maxSize;
            } else {
                width = (maxSize / height) * width;
                height = maxSize;
            }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // 使用较低质量进行压缩
        const compressedUrl = canvas.toDataURL('image/jpeg', 0.6);
        callback(compressedUrl);
    };
    img.src = imageUrl;
}

// 更新预览区域
function updateDragAreaPreview(imageUrl) {
    const dragArea = document.getElementById('image-drag-area');
    dragArea.innerHTML = `
        <img src="${imageUrl}" style="max-height: 200px; margin-bottom: 10px;">
        <p>点击"插入"按钮完成图片插入</p>
    `;
    dragArea.dataset.imageData = imageUrl;
}

// 修改插入图片按钮的处理逻辑
document.getElementById('insert-image').addEventListener('click', () => {
    const activePanel = document.querySelector('.panel.active');
    if (activePanel.id === 'upload-panel') {
        const dragArea = document.getElementById('image-drag-area');
        const imageUrl = dragArea.dataset.imageData;
        const altText = document.getElementById('upload-image-text').value || '图片';
        
        if (imageUrl) {
            // 检查是否需要压缩
            if (imageUrl.length > 2 * 1024 * 1024 && document.getElementById('auto-edit').checked) {
                openImageEditor(imageUrl, altText);
            } else {
                insertImageToEditor(imageUrl, altText);
            }
            // 重置上传区域
            resetDragArea();
        }
    } else if (activePanel.id === 'link-panel') {
        // 处理图片链接插入...
    }
    document.getElementById('image-insert-popup').classList.remove('active');
});

// 添加重置上传区域的函数
function resetDragArea() {
    const dragArea = document.getElementById('image-drag-area');
    dragArea.innerHTML = `
        <span class="iconify" data-icon="tabler:upload"></span>
        <p>拖拽图片到此处或点击上传</p>
        <small>支持 JPG、PNG、GIF 等格式</small>
    `;
    dragArea.dataset.imageData = '';
    document.getElementById('upload-image-text').value = '';
}

// 打开图片编辑器


// 插入图片到编辑器
function insertImageToEditor(imageUrl, altText) {
    const timestamp = Date.now();
    const imageKey = `markdown-image-${timestamp}`;
    localStorage.setItem(imageKey, imageUrl);
    
    // 在编辑器中插入折叠的图片代码
    const cursor = editor.getCursor();
    const line = cursor.line;
    
    editor.replaceSelection(`![${altText}](local:${imageKey})`);
    
    // 添加折叠标记
    editor.markText(
        {line: line, ch: 0},
        {line: line, ch: editor.getLine(line).length},
        {
            collapsed: true,
            replacedWith: createImagePreview(altText, imageKey)
        }
    );
}

// 添加创建图片预览元素的函数
function createImagePreview(altText, imageKey) {
    const wrapper = document.createElement('div');
    wrapper.className = 'image-preview-wrapper';
    
    const preview = document.createElement('img');
    preview.src = localStorage.getItem(imageKey);
    preview.alt = altText;
    preview.style.maxHeight = '100px';
    
    const label = document.createElement('span');
    label.textContent = `[图片: ${altText}]`;
    label.className = 'image-preview-label';
    
    wrapper.appendChild(preview);
    wrapper.appendChild(label);
    
    return wrapper;
}

// 修改表格选择逻辑
function initTableInsertion() {
    const preview = document.getElementById('table-grid-preview');
    let isSelecting = false;
    let startCell = null;
    let currentRows = 3, currentCols = 3;
    
    // 创建预览网格
    for (let i = 0; i < 10; i++) {
        for (let j = 0; j < 10; j++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            preview.appendChild(cell);
        }
    }
    
    // 鼠标按下开始选择
    preview.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('grid-cell')) {
            isSelecting = true;
            startCell = e.target;
            clearSelection();
            updateSelection(e.target);
        }
    });
    
    // 鼠标移动更新选择
    preview.addEventListener('mousemove', (e) => {
        if (!isSelecting || !e.target.classList.contains('grid-cell')) return;
        updateSelection(e.target);
    });
    
    // 鼠标松开完成选择
    document.addEventListener('mouseup', () => {
        if (!isSelecting) return;
        isSelecting = false;
        const cells = document.querySelectorAll('.grid-cell.selecting');
        cells.forEach(cell => {
            cell.classList.remove('selecting');
            cell.classList.add('active');
        });
    });
    
    function clearSelection() {
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            cell.classList.remove('selecting', 'active');
        });
    }
    
    function updateSelection(currentCell) {
        const startRow = parseInt(startCell.dataset.row);
        const startCol = parseInt(startCell.dataset.col);
        const endRow = parseInt(currentCell.dataset.row);
        const endCol = parseInt(currentCell.dataset.col);
        
        const minRow = Math.min(endRow, startRow);
        const maxRow = Math.max(endRow, startRow);
        const minCol = Math.min(endCol, startCol);
        const maxCol = Math.max(endCol, startCol);
        
        currentRows = maxRow - minRow + 1;
        currentCols = maxCol - minCol + 1;
        
        clearSelection();
        document.getElementById('table-size-label').textContent = `${currentRows} × ${currentCols}`;
        
        const cells = document.querySelectorAll('.grid-cell');
        cells.forEach(cell => {
            const row = parseInt(cell.dataset.row);
            const col = parseInt(cell.dataset.col);
            if (row >= minRow && row <= maxRow && col >= minCol && col <= maxCol) {
                cell.classList.add('selecting');
            }
        });
    }
}

// 更新预览更新函数
function updatePreview(content) {
    if (content === lastContent) return;
    lastContent = content;
    
    // 替换本地图片占位符
    const processedContent = content.replace(/!\[(.*?)\]\(local:(markdown-image-\d+)\)/g, (match, alt, key) => {
        const imageData = localStorage.getItem(key);
        return imageData ? `![${alt}](${imageData})` : match;
    });
    
    const preview = document.getElementById('preview-content');
    const html = marked.parse(processedContent);
    preview.innerHTML = DOMPurify.sanitize(html);
}

// 初始化表格插入
function initTableInsertion() {
    // 插入表格按钮事件
    document.getElementById('insert-table').addEventListener('click', () => {
        const rows = parseInt(document.getElementById('table-rows').value) || 3;
        const cols = parseInt(document.getElementById('table-cols').value) || 3;
        if (rows > 0 && cols > 0) {
            insertTable(rows, cols);
        }
    });
}

// 更新表格预览
function updateTablePreview(rows, cols) {
    document.getElementById('table-size-label').textContent = `${rows} × ${cols}`;
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);
        cell.classList.toggle('active', row < rows && col < cols);
    });
    // 更新当前选择的行列数
    currentRows = rows;
    currentCols = cols;
}

// 插入表格
function insertTable(rows, cols) {
    const hasHeader = document.getElementById('table-header').checked;
    const align = document.querySelector('input[name="align"]:checked').value;
    
    let markdown = '\n';
    
    // 表头
    if (hasHeader) {
        markdown += '|' + Array(cols).fill(' 表头 ').join('|') + '|\n';
        markdown += '|' + Array(cols).fill(getAlignment(align).trim()).join('|') + '|\n';
        rows = Math.max(0, rows - 1); // 如果有表头，内容行数减1
    }
    
    // 表格内容
    for (let i = 0; i < rows; i++) {
        markdown += '|' + Array(cols).fill(' 内容 ').join('|') + '|\n';
    }
    
    editor.replaceSelection(markdown);
    document.getElementById('table-popup').classList.remove('active');
    editor.focus();
}

function getAlignment(align) {
    switch (align) {
        case 'left': return ':---';
        case 'center':
            return ':---:';
        case 'right':
            return '---:';
        default:
            return '---';
    }
}

// 初始化代码块插入
function initCodeBlockInsertion() {
    document.getElementById('insert-code-block').addEventListener('click', () => {
        const language = document.getElementById('code-language').value;
        const content = document.getElementById('code-content').value;
        
        const markdown = `\n\`\`\`${language}\n${content}\n\`\`\`\n`;
        editor.replaceSelection(markdown);
        document.getElementById('code-block-popup').classList.remove('active');
        editor.focus();
    });
}

// 切换预览模式
function togglePreview() {
    const wrapper = document.querySelector('.editor-wrapper');
    isPreviewMode = !isPreviewMode;
    wrapper.classList.toggle('preview-mode', isPreviewMode);
    
    const previewBtn = document.querySelector('[data-action="preview"]');
    previewBtn.classList.toggle('active', isPreviewMode);
}

// 切换编辑模式
function toggleEditMode() {
    const editorWrapper = document.querySelector('.editor-wrapper');
    const editorPane = document.querySelector('.editor-pane');
    const previewPane = document.querySelector('.preview-pane');
    const editButton = document.querySelector('[data-action="edit-only"]');
    
    editorWrapper.classList.toggle('edit-only-mode');
    editButton.classList.toggle('active');
    
    if (editorWrapper.classList.contains('edit-only-mode')) {
        previewPane.style.display = 'none';
        editorPane.style.width = '100%';
    } else {
        previewPane.style.display = '';
        editorPane.style.width = '';
    }
    
    editor.refresh();
}

// 切换全屏模式
function toggleFullscreen() {
    const container = document.querySelector('.editor-container');
    container.classList.toggle('fullscreen');
    
    const fullscreenBtn = document.querySelector('[data-action="fullscreen"]');
    fullscreenBtn.classList.toggle('active');
}

// 本地存储
function saveToLocalStorage(content) {
    localStorage.setItem('markdown-content', content);
}

function loadFromLocalStorage() {
    const content = localStorage.getItem('markdown-content');
    if (content) {
        editor.setValue(content);
        updatePreview(content);
    }
}

// 导出功能
function handleExport(format) {
    const content = editor.getValue();
    switch (format) {
        case 'md':
            downloadFile(content, 'document.md', 'text/markdown');
            break;
        case 'html':
            const html = marked.parse(content);
            downloadFile(html, 'document.html', 'text/html');
            break;
        case 'pdf':
            exportToPDF(content);
            break;
    }
}

function downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

async function exportToPDF(content) {
    const html = marked.parse(content);
    const element = document.createElement('div');
    element.className = 'markdown-body';
    element.innerHTML = DOMPurify.sanitize(html);
    document.body.appendChild(element);
    
    try {
        const pdf = await html2pdf().from(element).save('document.pdf');
    } finally {
        element.remove();
    }
}

// 初始化
function initEmojiPicker() {
    const emojiGrid = document.getElementById('emoji-grid');
    const searchInput = document.getElementById('emoji-search');
    let allEmojis = [];

    // 收集所有表情符号
    Object.values(symbolData).forEach(section => {
        Object.values(section.categories).forEach(category => {
            allEmojis = allEmojis.concat(category.symbols);
        });
    });

    // 渲染表情符号
    function renderEmojis(emojis) {
        emojiGrid.innerHTML = '';
        emojis.forEach(emoji => {
            const emojiButton = document.createElement('button');
            emojiButton.className = 'emoji-item';
            emojiButton.textContent = emoji;
            emojiButton.onclick = () => {
                editor.replaceSelection(emoji);
                document.getElementById('emoji-popup').classList.remove('active');
                editor.focus();
            };
            emojiGrid.appendChild(emojiButton);
        });
    }

    // 初始渲染
    renderEmojis(allEmojis);

    // 搜索功能
    searchInput.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        const filteredEmojis = allEmojis.filter(emoji => {
            return emoji.toLowerCase().includes(searchTerm);
        });
        renderEmojis(filteredEmojis);
    });
}

// 在页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    initEditor();
    initToolbar();
    initLinkInsertion();
    initImageInsertion();
    initTableInsertion();
    initCodeBlockInsertion();
    initEmojiPicker(); // 添加表情选择器初始化
});