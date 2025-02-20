let editor;

// 初始化编辑器
document.addEventListener('DOMContentLoaded', function() {
    editor = CodeMirror.fromTextArea(document.getElementById('source'), {
        mode: 'xml',
        theme: 'dracula',
        lineNumbers: true,
        lineWrapping: true,
        indentUnit: 2,
        autoCloseBrackets: true,
        matchBrackets: true,
        styleActiveLine: true
    });

    // 添加示例XML
    const exampleXML = `<?xml version="1.0" encoding="UTF-8"?>
<bookstore>
    <book category="fiction">
        <title lang="en">Harry Potter</title>
        <author>J.K. Rowling</author>
        <year>2005</year>
        <price>29.99</price>
    </book>
    <book category="science">
        <title lang="en">A Brief History of Time</title>
        <author>Stephen Hawking</author>
        <year>1988</year>
        <price>19.99</price>
    </book>
    <book category="technology">
        <title lang="en">Learning XML</title>
        <author>Erik T. Ray</author>
        <year>2003</year>
        <price>39.95</price>
    </book>
</bookstore>`;

    // 设置示例代码
    editor.setValue(exampleXML);
    
    // 设置初始大小
    updateFileSize();
    
    // 添加变化监听器
    editor.on('change', function() {
        updateFileSize();
    });
});

// 更新代码大小显示
function updateFileSize() {
    const code = editor.getValue();
    const bytes = new Blob([code]).size;
    let size;
    if (bytes < 1024) {
        size = bytes + ' B';
    } else if (bytes < 1024 * 1024) {
        size = (bytes / 1024).toFixed(2) + ' KB';
    } else {
        size = (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }
    document.getElementById('sourceSize').textContent = '大小: ' + size;
}

// XML格式化功能
function formatXML() {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(editor.getValue(), 'text/xml');
        
        // 检查是否有解析错误
        const parseError = xmlDoc.getElementsByTagName('parsererror');
        if (parseError.length > 0) {
            throw new Error('XML格式错误');
        }

        // 使用XMLSerializer格式化
        const serializer = new XMLSerializer();
        const formatted = serializer.serializeToString(xmlDoc)
            .replace(/></g, '>\n<') // 添加换行
            .replace(/\n/g, '\n  '); // 添加缩进

        editor.setValue(formatted);
        showToast('格式化成功！');
    } catch (err) {
        showError('格式化失败: ' + err.message);
    }
}

// XML校验功能
function validateXML() {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(editor.getValue(), 'text/xml');
        
        // 检查是否有解析错误
        const parseError = xmlDoc.getElementsByTagName('parsererror');
        if (parseError.length > 0) {
            throw new Error('XML格式无效');
        }

        showToast('XML格式有效！');
    } catch (err) {
        showError('校验失败: ' + err.message);
    }
}

// 复制代码
function copyCode() {
    const code = editor.getValue();
    if (!code) {
        showError('没有可复制的代码！');
        return;
    }
    navigator.clipboard.writeText(code).then(() => {
        showToast('复制成功！');
    }).catch(err => {
        showError('复制失败: ' + err.message);
    });
}

// 重置编辑器
function resetCode() {
    editor.setValue('');
    updateFileSize();
    showToast('已清空编辑器');
}

// 导出相关功能
function exportCode() {
    document.getElementById('exportModal').style.display = 'block';
}

function closeExportModal() {
    document.getElementById('exportModal').style.display = 'none';
}

function confirmExport() {
    const code = editor.getValue();
    if (!code) {
        showError('没有可导出的数据！');
        return;
    }

    try {
        const filename = document.getElementById('filename').value || 'data.xml';
        const blob = new Blob([code], { type: 'text/xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        closeExportModal();
        showToast('导出成功！');
    } catch (err) {
        showError('导出失败: ' + err.message);
    }
}

// 显示错误信息
function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.style.display = 'block';
    setTimeout(() => {
        errorEl.style.display = 'none';
    }, 3000);
}

// 处理文件选择
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        editor.setValue(e.target.result);
        updateFileSize();
    };
    reader.readAsText(file);
}

// 处理文件拖放
const dropZone = document.getElementById('dropZone');

dropZone.addEventListener('dragover', function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.style.backgroundColor = 'var(--bg-color-50)';
});

dropZone.addEventListener('dragleave', function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.style.backgroundColor = '';
});

dropZone.addEventListener('drop', function(e) {
    e.preventDefault();
    e.stopPropagation();
    this.style.backgroundColor = '';
    
    const dt = e.dataTransfer;
    const files = dt.files;
    
    if (files.length) {
        document.getElementById('fileInput').files = files;
        handleFileSelect({target: {files: files}});
    }
});