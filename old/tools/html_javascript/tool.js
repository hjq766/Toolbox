function convertToJS () {
    const source = document.getElementById('input')
        .value.trim();
    if (!source) {
        showToast('请输入HTML代码！');
        return;
    }

    const useCreateElement = document.getElementById('useCreateElement')
        .checked;
    const minifyOutput = document.getElementById('minifyOutput')
        .checked;

    try {
        let result = '';
        if (useCreateElement) {
            result = convertToCreateElement(source, minifyOutput);
        } else {
            result = convertToString(source, minifyOutput);
        }
        document.getElementById('output')
            .value = result;
        showToast('转换成功！');
    } catch (e) {
        console.error('转换错误:', e);
        showToast('转换失败：' + e.message);
    }
}

function convertToCreateElement (html, minify) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    const jsLines = [];

    jsLines.push('function createHTML() {');
    processNode(doc.body, 'document.body', jsLines);
    jsLines.push('}');

    return minify ? jsLines.join('') : jsLines.join('\n');
}

function processNode (node, parentVar, jsLines) {
    if (node.nodeType === 3) {
        const text = node.textContent.replace(/\s+/g, ' ')
            .trim();
        if (text) {
            jsLines.push(`${parentVar}.appendChild(document.createTextNode("${escapeString(text)}"));`);
        }
        return;
    }

    if (node.nodeType !== 1) return;

    const varName = '_el' + Math.random()
        .toString(36)
        .substr(2, 9);
    jsLines.push(`const ${varName} = document.createElement("${node.tagName.toLowerCase()}");`);

    if (node.tagName.toLowerCase() === 'style') {
        const cssText = node.textContent.replace(/\s+/g, ' ')
            .trim();
        if (cssText) {
            jsLines.push(`${varName}.textContent = "${escapeString(cssText)}";`);
        }
    } else {
        Array.from(node.attributes)
            .forEach(attr => {
                const value = attr.value.trim();
                if (attr.name === 'class') {
                    const classes = value.replace(/\s+/g, ' ')
                        .trim();
                    if (classes) {
                        jsLines.push(`${varName}.className = "${classes}";`);
                    }
                } else if (attr.name === 'style') {
                    jsLines.push(`${varName}.style.cssText = "${escapeString(value)}";`);
                } else if (value) {
                    jsLines.push(`${varName}.setAttribute("${attr.name}", "${escapeString(value)}");`);
                }
            });

        Array.from(node.childNodes)
            .forEach(child => {
                if (!(child.nodeType === 3 && !child.textContent.trim())) {
                    processNode(child, varName, jsLines);
                }
            });
    }

    jsLines.push(`${parentVar}.appendChild(${varName});`);
}

function convertToString (html, minify) {
    const cleanHtml = html
        .replace(/>\s+</g, '><')
        .replace(/\s+/g, ' ')
        .trim();

    const escaped = escapeString(cleanHtml);
    const jsLines = [];

    jsLines.push('function createHTML() {');
    jsLines.push(`    document.write("${escaped}");`);
    jsLines.push('}');

    return minify ? jsLines.join('') : jsLines.join('\n');
}

function escapeString (str) {
    return str
        .replace(/\\/g, '\\\\')
        .replace(/"/g, '\\"')
        .replace(/\n/g, '\\n')
        .replace(/\r/g, '\\r')
        .replace(/\t/g, '\\t');
}

function clearInput () {
    document.getElementById('input')
        .value = '';
    document.getElementById('output')
        .value = '';
}

function copyInput () {
    const input = document.getElementById('input');
    input.select();
    document.execCommand('copy');
    showToast('已复制输入内容');
}

function copyOutput () {
    const output = document.getElementById('output');
    output.select();
    document.execCommand('copy');
    showToast('已复制转换结果');
}

// 文件上传处理
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');

// 阻止默认拖放行为
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults (e) {
    e.preventDefault();
    e.stopPropagation();
}

// 添加拖放视觉反馈
        ['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

        ['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight (e) {
    dropZone.classList.add('drag-over');
}

function unhighlight (e) {
    dropZone.classList.remove('drag-over');
}

// 处理文件拖放
dropZone.addEventListener('drop', handleDrop, false);

function handleDrop (e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

// 处理文件上传
function handleFileUpload (event) {
    const files = event.target.files;
    handleFiles(files);
}

function handleFiles (files) {
    if (files.length === 0) return;

    const file = files[0];
    // 检查文件类型
    if (!file.name.match(/\.(html|htm)$/i)) {
        showToast('请上传HTML文件！');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        const content = e.target.result;
        document.getElementById('input')
            .value = content;
        showToast('文件上传成功！');
    };
    reader.onerror = function () {
        showToast('文件读取失败！');
    };
    reader.readAsText(file);
}

// 点击上传区域触发文件选择
dropZone.addEventListener('click', () => {
    fileInput.click();
});

// 添加导出功能
function exportJS () {
    const output = document.getElementById('output')
        .value;
    if (!output) {
        showToast('没有可导出的内容');
        return;
    }

    // 创建 Blob
    const blob = new Blob([output], {
        type: 'text/javascript'
    });
    // 创建下载链接
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted_' + new Date()
        .getTime() + '.js';

    // 触发下载
    document.body.appendChild(a);
    a.click();

    // 清理
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
    showToast('文件导出成功');
}
