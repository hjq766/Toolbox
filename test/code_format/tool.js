let editor;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，开始初始化...'); // 调试信息
    
    // 确保元素存在
    const sourceTextarea = document.getElementById('source');
    const codeTypeSelect = document.getElementById('codeType');
    
    if (!sourceTextarea || !codeTypeSelect) {
        console.error('找不到必要的DOM元素！');
        return;
    }
    
    console.log('初始化编辑器...'); // 调试信息
    initEditor();
    console.log('初始化拖拽区域...'); // 调试信息
    initDropZone();
    
    // 监听语言模式变化
    codeTypeSelect.addEventListener('change', function() {
        console.log('语言模式改变:', this.value); // 调试信息
        updateCodeMode();
    });
});

// 初始化编辑器
function initEditor(content = '', mode = 'htmlmixed') {
    console.log('初始化编辑器，模式:', mode);
    
    editor = CodeMirror.fromTextArea(document.getElementById('source'), {
        mode: mode,
        theme: 'dracula',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        lineWrapping: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers'],
        extraKeys: { 'Ctrl-Space': 'autocomplete' }
    });

    if (content) {
        editor.setValue(content);
    }
    
    // 确保编辑器刷新以显示高亮
    editor.refresh();
}

// 初始化拖拽区域
function initDropZone() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    // 文件选择处理
    fileInput.addEventListener('change', e => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });

    // 点击上传
    dropZone.addEventListener('click', () => fileInput.click());

    // 拖拽处理
    dropZone.addEventListener('dragover', e => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', e => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
}

// 文件拖放处理
function handleFileDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files[0];
    if (file) {
        handleFile(file);
    }
}

// 处理文件
function handleFile(file) {
    console.log('开始处理文件:', file.name);
    
    if (!isValidFile(file)) {
        showError('不支持的文件格式！');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const mode = getLanguageFromFilename(file.name);
        console.log('文件类型检测结果:', mode);

        // 重置编辑器
        if (editor) {
            editor.toTextArea();
        }

        // 设置下拉框值
        const codeTypeSelect = document.getElementById('codeType');
        codeTypeSelect.value = mode;
        console.log('设置下拉框值为:', mode);

        // 初始化编辑器
        initEditor(content, mode);
        
        // 保存文件名
        document.getElementById('filename').value = file.name;
        
        // 最终确认
        console.log('最终设置 - 下拉框值:', codeTypeSelect.value);
        console.log('最终设置 - 编辑器模式:', editor.getOption('mode'));
        
        updateFileSize();
        showToast('文件导入成功！');
    };
    reader.onerror = () => showError('文件读取失败！');
    reader.readAsText(file);
}

// 获取文件语言类型
function getLanguageFromFilename(filename) {
    const ext = filename.toLowerCase().split('.').pop();
    console.log('文件扩展名:', ext);
    
    const languageMap = {
        'js': 'javascript',
        'css': 'css',
        'html': 'htmlmixed',
        'htm': 'htmlmixed',
        'py': 'python',
        'sql': 'sql',
        'php': 'php',                  // 简化 PHP 配置
        'java': 'text/x-java',
        'cpp': 'text/x-c++src',
        'c': 'text/x-csrc',
        'rb': 'ruby'
    };
    
    const mode = languageMap[ext];
    console.log('检测到的语言模式:', mode);
    return mode || 'htmlmixed';
}

// 检查文件类型
function isValidFile(file) {
    const validExtensions = ['.js', '.css', '.html', '.htm', '.py', '.sql', '.php', '.java', '.cpp', '.c', '.rb'];
    return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
}

// 更新代码模式
function updateCodeMode() {
    const mode = document.getElementById('codeType').value;
    console.log('更新代码模式为:', mode);
    editor.setOption('mode', mode);
}

// 更新文件大小
function updateFileSize() {
    const size = editor.getValue().length;
    document.getElementById('sourceSize').textContent = `${(size / 1024).toFixed(2)} KB`;
}

// 格式化代码
function processCode(type) {
    const code = editor.getValue();
    if (!code) {
        showError('请输入需要处理的代码！');
        return;
    }

    try {
        let result = code;
        const mode = document.getElementById('codeType').value;

        if (type === 'format') {
            const options = {
                indent_size: 4,
                max_preserve_newlines: 2
            };

            switch(mode) {
                case 'javascript':
                    result = js_beautify(code, options);
                    break;
                case 'css':
                    result = css_beautify(code, options);
                    break;
                case 'htmlmixed':
                    result = html_beautify(code, options);
                    break;
                default:
                    result = code;
            }
        } else if (type === 'remove-comments') {
            // 移除注释的逻辑...
        } else if (type === 'compress') {
            result = code.replace(/\s+/g, ' ').trim();
        }

        editor.setValue(result);
        updateFileSize();
        showToast('处理成功！');
    } catch (err) {
        showError('处理失败: ' + err.message);
    }
}

// 复制代码
function copyCode() {
    const code = editor.getValue();
    if (!code) {
        showError('没有可复制的代码！');
        return;
    }

    navigator.clipboard.writeText(code)
        .then(() => showToast('复制成功！'))
        .catch(() => showError('复制失败！'));
}

// 导出代码
function exportCode() {
    const code = editor.getValue();
    if (!code) {
        showError('没有可导出的代码！');
        return;
    }

    // 获取当前选择的语言模式
    const mode = document.getElementById('codeType').value;
    console.log('导出时的语言模式:', mode); // 调试信息

    let defaultFilename = document.getElementById('filename').value;
    console.log('导出时的文件名:', defaultFilename); // 调试信息

    document.getElementById('exportModal').style.display = 'block';
}

// 确认导出
function confirmExport() {
    const code = editor.getValue();
    let filename = document.getElementById('filename').value;
    const mode = document.getElementById('codeType').value;
    console.log('确认导出时的语言模式:', mode); // 调试信息
    
    // 确保文件有正确的扩展名
    const extensions = {
        'javascript': '.js',
        'css': '.css',
        'htmlmixed': '.html',
        'python': '.py',
        'sql': '.sql',
        'php': '.php',
        'java': '.java',
        'clike': '.cpp',
        'ruby': '.rb'
    };
    
    const ext = extensions[mode];
    console.log('选择的文件扩展名:', ext); // 调试信息
    
    if (!filename.toLowerCase().endsWith(ext)) {
        filename += ext;
    }
    console.log('最终的文件名:', filename); // 调试信息

    const blob = new Blob([code], { type: 'text/plain' });
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

// 关闭导出模态框
function closeExportModal() {
    document.getElementById('exportModal').style.display = 'none';
}

// 重置代码
function resetCode() {
    editor.setValue('');
    document.getElementById('filename').value = '';
    updateFileSize();
}

// 显示错误信息
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}
