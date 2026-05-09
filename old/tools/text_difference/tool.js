let sourceEditor, modifiedEditor;

// 文件拖拽处理
function setupFileDrop(dropZone, fileInput, editor) {
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');
        const file = e.dataTransfer.files[0];
        handleFile(file, editor);
    });

    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleFile(file, editor);
    });
}

// 初始化编辑器
function initEditors() {
    sourceEditor = CodeMirror(document.getElementById('source'), {
        mode: 'text/plain',
        theme: 'monokai',
        lineNumbers: true,
        lineWrapping: true,
        scrollbarStyle: null,
        tabSize: 4,
        indentUnit: 4,
        autofocus: true,
    });

    modifiedEditor = CodeMirror(document.getElementById('modified'), {
        mode: 'text/plain',
        theme: 'monokai',
        lineNumbers: true,
        lineWrapping: true,
        scrollbarStyle: null,
        tabSize: 4,
        indentUnit: 4,
        autofocus: true,
    });

    // 监听编辑器变化
    sourceEditor.on('change', debounce(compareDiff, 300));
    modifiedEditor.on('change', debounce(compareDiff, 300));
}

// 文件处理
function handleFile(file, editor) {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
        editor.setValue(e.target.result);
        // 强制刷新编辑器布局
        setTimeout(() => {
            editor.refresh();
            // 重置滚动位置
            editor.scrollTo(0, 0);
        }, 0);
    };
    reader.readAsText(file);
}

// 差异对比
function compareDiff() {
    const oldText = sourceEditor.getValue();
    const newText = modifiedEditor.getValue();

    if (!oldText || !newText) return;

    try {
        const diff = Diff.diffLines(oldText, newText);
        
        sourceEditor.operation(() => {
            const doc = sourceEditor.getDoc();
            const marks = doc.getAllMarks();
            marks.forEach(mark => mark.clear());

            let pos = 0;
            diff.forEach(part => {
                const text = part.value;
                const lines = text.split('\n').length - 1;
                
                if (part.removed) {
                    doc.markText(
                        {line: pos, ch: 0},
                        {line: pos + lines, ch: 0},
                        {className: 'highlight-removed'}
                    );
                }
                if (!part.added) {
                    pos += lines;
                }
            });
        });

        modifiedEditor.operation(() => {
            const doc = modifiedEditor.getDoc();
            const marks = doc.getAllMarks();
            marks.forEach(mark => mark.clear());

            let pos = 0;
            diff.forEach(part => {
                const text = part.value;
                const lines = text.split('\n').length - 1;
                
                if (part.added) {
                    doc.markText(
                        {line: pos, ch: 0},
                        {line: pos + lines, ch: 0},
                        {className: 'highlight-added'}
                    );
                }
                if (!part.removed) {
                    pos += lines;
                }
            });
        });
    } catch (error) {
        console.error('差异对比失败:', error);
        showToast('差异对比失败：' + error.message);
    }
}

// 辅助函数：转义 HTML
function escapeHtml(text) {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

// 清空单个编辑器
function clearEditor(id) {
    if (id === 'source') {
        sourceEditor.setValue('');
    } else if (id === 'modified') {
        modifiedEditor.setValue('');
    }
    compareDiff();
    showToast('已清空编辑器');
}

// 清空所有内容
function clearAll() {
    sourceEditor.setValue('');
    modifiedEditor.setValue('');
    document.getElementById('fileInput1').value = '';
    document.getElementById('fileInput2').value = '';
    compareDiff();
    showToast('已清空所有内容');
}

// 复制差异
function copyDiff() {
    if (!sourceEditor.getValue() || !modifiedEditor.getValue()) {
        showToast('请先输入需要对比的文本');
        return;
    }

    const diffText = `=== 原始文本 ===\n${sourceEditor.getValue()}\n\n=== 修改后文本 ===\n${modifiedEditor.getValue()}`;
    
    navigator.clipboard.writeText(diffText).then(() => {
        showToast('差异已复制到剪贴板');
    }).catch(err => {
        console.error('复制失败:', err);
        showToast('复制失败，请手动复制');
    });
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    initEditors();

    setupFileDrop(
        document.getElementById('dropZone1'),
        document.getElementById('fileInput1'),
        sourceEditor
    );
    setupFileDrop(
        document.getElementById('dropZone2'),
        document.getElementById('fileInput2'),
        modifiedEditor
    );
});

// 防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
