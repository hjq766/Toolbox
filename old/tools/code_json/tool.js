let editor;

// 初始化CodeMirror
document.addEventListener('DOMContentLoaded', function() {
    editor = CodeMirror.fromTextArea(document.getElementById('source'), {
        mode: 'application/json',
        theme: 'dracula',
        lineNumbers: true,
        lineWrapping: true,
        indentUnit: 2,
        autoCloseBrackets: true,
        matchBrackets: true,
        styleActiveLine: true
    });

    // 添加示例JSON
    const exampleJSON = {
        "name": "示例数据",
        "type": "JSON示例",
        "description": "这是一个JSON格式示例",
        "features": [
            "支持嵌套结构",
            "支持数组",
            "支持多种数据类型"
        ],
        "types": {
            "string": "文本",
            "number": 123,
            "boolean": true,
            "null": null,
            "array": [1, 2, 3],
            "object": {
                "key": "value"
            }
        },
        "createTime": "2024-03-20",
        "version": 1.0
    };

    // 设置格式化后的示例代码
    editor.setValue(JSON.stringify(exampleJSON, null, 2));

    // 设置初始大小
    updateFileSize();

    // 添加变化监听器
    editor.on('change', function() {
        updateFileSize();
    });
    updateValidateButton();
});

// 格式化JSON
function formatJSON() {
    try {
        const code = editor.getValue();
        if (!code) {
            showError('请输入JSON数据！');
            return;
        }
        const obj = JSON.parse(code);
        const formatted = JSON.stringify(obj, null, 2);
        editor.setValue(formatted);
        showToast('格式化成功！');
    } catch (err) {
        showError('无效的JSON格式: ' + err.message);
    }
}

// 压缩JSON
function compressJSON() {
    try {
        const code = editor.getValue();
        if (!code) {
            showError('请输入JSON数据！');
            return;
        }
        const obj = JSON.parse(code);
        const compressed = JSON.stringify(obj);
        editor.setValue(compressed);
        showToast('压缩成功！');
    } catch (err) {
        showError('无效的JSON格式: ' + err.message);
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
    originalJsonData = null;
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
        originalJsonData = null;
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

// 添加 YAML 转换库
document.head.appendChild(Object.assign(document.createElement('script'), {
    src: 'https://cdnjs.cloudflare.com/ajax/libs/js-yaml/4.1.0/js-yaml.min.js'
}));

// 添加一个变量跟踪当前格式
let currentFormat = 'json';

// 修改 previewAs 函数
function previewAs(format) {
    try {
        const code = editor.getValue();
        if (!code) {
            showError('没有数据可预览！');
            return;
        }

        // 更新按钮状态
        document.querySelectorAll('.btn-switch').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`.btn-switch[onclick*="${format}"]`).classList.add('active');

        // 如果已经有原始 JSON 数据，直接使用
        let jsonData = originalJsonData;

        // 如果没有原始数据，尝试解析当前内容
        if (!jsonData) {
            try {
                jsonData = JSON.parse(code);
                originalJsonData = jsonData; // 保存原始 JSON 数据
            } catch (err) {
                showError('无效的 JSON 格式，请检查语法');
                return;
            }
        }

        let output;
        switch (format) {
            case 'json':
                output = JSON.stringify(jsonData, null, 2);
                editor.setOption('mode', 'application/json');
                break;
            case 'yaml':
                output = jsyaml.dump(jsonData);
                editor.setOption('mode', 'yaml');
                break;
            case 'csv':
                if (!jsonData || (typeof jsonData !== 'object' && !Array.isArray(jsonData))) {
                    throw new Error('只有对象或数组可以转换为 CSV');
                }
                output = jsonToCSV(jsonData);
                editor.setOption('mode', 'text');
                break;
        }

        editor.setValue(output);
        currentFormat = format; // 更新当前格式
        updateValidateButton(); // 更新校验按钮状态
        showToast(`已切换到 ${format.toUpperCase()} 预览`);
    } catch (err) {
        showError('预览失败: ' + err.message);
    }
}

// 添加更新校验按钮状态的函数
function updateValidateButton() {
    const validateBtn = document.querySelector('.btn[onclick*="validateJSON"]');
    if (currentFormat === 'json') {
        validateBtn.removeAttribute('disabled');
        validateBtn.style.opacity = '1';
        validateBtn.style.cursor = 'pointer';
        validateBtn.title = '校验JSON';
    } else {
        validateBtn.setAttribute('disabled', 'true');
        validateBtn.style.opacity = '0.5';
        validateBtn.style.cursor = 'not-allowed';
        validateBtn.title = '请切换到JSON格式后再校验';
    }
}

// 修改校验函数
function validateJSON() {
    if (currentFormat !== 'json') {
        showError('请先切换到 JSON 格式后再进行校验');
        return;
    }

    try {
        const code = editor.getValue();
        if (!code) {
            showError('请输入JSON数据！');
            return;
        }
        JSON.parse(code);
        showToast('JSON格式有效！');
    } catch (err) {
        showError('JSON格式无效: ' + err.message);
    }
}

// 修改 exportCode 函数
function exportCode() {
    // 显示普通的导出模态框（用于导出 JSON 文件）
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
        const filename = document.getElementById('filename').value || 'data.json';
        const blob = new Blob([code], {
            type: 'application/json'
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
    } catch (err) {
        showError('导出失败: ' + err.message);
    }
}

// 格式转换相关函数
function showExportOptions() {
    const modal = document.getElementById('exportOptionsModal');
    const modalTitle = modal.querySelector('h3');
    modalTitle.textContent = '选择导出格式';
    modal.style.display = 'block';
}

function closeExportOptionsModal() {
    document.getElementById('exportOptionsModal').style.display = 'none';
}

function exportAs(format) {
    try {
        const code = editor.getValue();
        if (!code) {
            showError('没有可导出的数据！');
            return;
        }

        // 使用原始 JSON 数据或当前格式的数据
        let jsonData = originalJsonData;
        if (!jsonData && currentFormat === 'json') {
            try {
                jsonData = JSON.parse(code);
            } catch (err) {
                showError('无效的 JSON 格式，请检查语法');
                return;
            }
        } else if (!jsonData) {
            showError('请先切换到 JSON 格式后再导出');
            return;
        }

        let output, fileType, extension;
        switch (format) {
            case 'json':
                output = JSON.stringify(jsonData, null, 2);
                fileType = 'application/json';
                extension = 'json';
                break;
            case 'yaml':
                output = jsyaml.dump(jsonData);
                fileType = 'text/yaml';
                extension = 'yaml';
                break;
            case 'csv':
                if (!jsonData || (typeof jsonData !== 'object' && !Array.isArray(jsonData))) {
                    throw new Error('只有对象或数组可以转换为 CSV');
                }
                output = jsonToCSV(jsonData);
                fileType = 'text/csv';
                extension = 'csv';
                break;
        }

        // 创建并触发下载
        const blob = new Blob([output], {
            type: fileType
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `data.${extension}`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        closeExportOptionsModal();
        showToast(`已导出为 ${format.toUpperCase()} 格式！`);
    } catch (err) {
        showError('导出失败: ' + err.message);
    }
}

// JSON转CSV辅助函数
function jsonToCSV(jsonData) {
    // 如果是单个对象，转换为数组
    const array = Array.isArray(jsonData) ? jsonData : [jsonData];
    if (array.length === 0) {
        throw new Error('没有数据可以转换为 CSV');
    }

    // 获取所有可能的标题（合并所有对象的键）
    const headers = Array.from(new Set(
        array.reduce((keys, obj) => keys.concat(Object.keys(obj)), [])
    ));

    // 创建 CSV 行
    const csvRows = [
        headers.join(',') // 标题行
    ];

    // 添加数据行
    array.forEach(obj => {
        const row = headers.map(header => {
            const value = obj[header];
            // 处理不同类型的值
            if (value === null || value === undefined) return '';
            if (typeof value === 'object') return JSON.stringify(value);
            if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
            return value;
        });
        csvRows.push(row.join(','));
    });

    return csvRows.join('\n');
}

// 添加一个变量保存原始 JSON 数据
let originalJsonData = null;

// 在编辑器内容变化时重置原始 JSON 数据
editor.on('change', function() {
    originalJsonData = null;
    updateFileSize();
});