let editor;

// 初始化CodeMirror
document.addEventListener('DOMContentLoaded', function() {
    editor = CodeMirror.fromTextArea(document.getElementById('source'), {
        mode: 'javascript',
        theme: 'dracula',
        lineNumbers: true,
        lineWrapping: true,
        indentUnit: 4,
        autoCloseBrackets: true,
        matchBrackets: true,
        styleActiveLine: true
    });

    // 设置初始大小
    updateFileSize();

    // 添加变化监听器
    editor.on('change', function() {
        updateFileSize();
    });
});

// 处理代码加密
function processCode(type) {
    const sourceCode = editor.getValue();
    if (!sourceCode) {
        showError('请输入需要加密的代码！');
        return;
    }

    try {
        const mode = editor.getOption('mode');
        const compressed = sourceCode.replace(/\/\*[\s\S]*?\*\/|\/\/.*/g, '').replace(/\s+/g, ' ').trim();
        const encoded = btoa(encodeURIComponent(compressed));
        const id = '_' + Math.random().toString(36).substr(2, 9);
        let result = '';

        // 包装函数
        function jsWrapper(code) {
            return '(function(){' + code + '})();';
        }

        function htmlWrapper(id, code) {
            return '<div id="' + id + '"><!--' + encoded + '--></div>' +
                '<script>' + code + '<\/script>';
        }

        function cssWrapper(id, code) {
            return '<style id="' + id + '">/*' + encoded + '*/<\/style>' +
                '<script>' + code + '<\/script>';
        }

        if (type === 'encrypt') {
            // 基础加密
            const jsCode = 'eval(decodeURIComponent(atob("' + encoded + '")))';
            const domCode = 'document.getElementById("' + id + '").innerHTML=decodeURIComponent(atob("' + encoded + '"))';

            switch (mode) {
                case 'javascript':
                    result = jsWrapper(jsCode);
                    break;
                case 'css':
                    result = cssWrapper(id, jsWrapper(domCode));
                    break;
                default:
                    result = htmlWrapper(id, jsWrapper(domCode));
            }
        } else {
            // 高级加密
            const chunks = encoded.match(/.{1,64}/g) || [];
            const shuffled = chunks.map((chunk, i) => ({
                    chunk,
                    i
                }))
                .sort(() => Math.random() - 0.5);
            const parts = shuffled.map(({
                chunk
            }) => chunk).join('');
            const order = shuffled.map(({
                i
            }) => i).join(',');

            const decode = 'var p="' + parts + '",o=[' + order + '],r="";' +
                'for(var i=0;i<o.length;i++)r+=p.substr(o[i]*64,64);';

            const jsCode = decode + 'eval(decodeURIComponent(atob(r)))';
            const domCode = decode + 'document.getElementById("' + id + '").innerHTML=decodeURIComponent(atob(r))';

            switch (mode) {
                case 'javascript':
                    result = jsWrapper(jsCode);
                    break;
                case 'css':
                    result = cssWrapper(id, jsWrapper(domCode));
                    break;
                default:
                    result = htmlWrapper(id, jsWrapper(domCode));
            }
        }

        editor.setValue(result);
        updateFileSize();
        showToast('加密成功！');
    } catch (err) {
        showError('加密失败: ' + err.message);
    }
}

// 更新文件大小显示
function updateFileSize() {
    const size = new Blob([editor.getValue()]).size;
    document.getElementById('sourceSize').textContent = formatSize(size);
}

// 格式化文件大小
function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

// 显示提示信息
function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.style.display = 'block';
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
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

// 处理文件选择
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        editor.setValue(e.target.result);
        updateFileSize();

        // 根据文件类型设置编辑器模式
        const ext = file.name.split('.').pop().toLowerCase();
        switch (ext) {
            case 'js':
                editor.setOption('mode', 'javascript');
                break;
            case 'css':
                editor.setOption('mode', 'css');
                break;
            case 'html':
            case 'htm':
                editor.setOption('mode', 'htmlmixed');
                break;
        }
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
        handleFileSelect({
            target: {
                files: files
            }
        });
    }
});

// 导出功能
function exportCode() {
    const code = editor.getValue();
    if (!code) {
        showError('没有可导出的代码！');
        return;
    }

    // 根据编辑器模式设置默认文件扩展名
    const mode = editor.getOption('mode');
    const extensions = {
        'javascript': '.js',
        'css': '.css',
        'htmlmixed': '.html'
    };
    const defaultExt = extensions[mode] || '.js';

    // 设置默认文件名
    document.getElementById('filename').value = 'encrypted' + defaultExt;
    document.getElementById('exportModal').style.display = 'block';
}

function closeExportModal() {
    document.getElementById('exportModal').style.display = 'none';
}

function confirmExport() {
    const filename = document.getElementById('filename').value;
    const code = editor.getValue();

    const blob = new Blob([code], {
        type: 'text/plain'
    });
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
}