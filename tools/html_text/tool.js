// DOM 元素
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const input = document.getElementById('input');
const output = document.getElementById('output');

// 文件拖放处理
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = 'var(--primary-color)';
    dropZone.style.background = 'var(--primary-color-10)';
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '';
    dropZone.style.background = '';
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.style.borderColor = '';
    dropZone.style.background = '';
    
    const file = e.dataTransfer.files[0];
    if (file && (file.type === 'text/html' || file.name.match(/\.(html|htm)$/i))) {
        handleFile(file);
    } else {
        showToast('请上传HTML文件');
    }
});

// 文件上传处理
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
}

function handleFile(file) {
    const reader = new FileReader();
    reader.onload = (e) => {
        input.value = e.target.result;
    };
    reader.readAsText(file);
}

// HTML转文本
function convertToText() {
    if (!input.value.trim()) {
        showToast('请输入HTML内容');
        return;
    }

    try {
        // 创建临时DOM元素
        const temp = document.createElement('div');
        temp.innerHTML = input.value;
        
        // 提取文本，保留基本格式
        const text = extractFormattedText(temp);
        
        // 设置结果
        output.value = text;
    } catch (error) {
        showToast('转换失败：' + error.message);
    }
}

// 提取格式化文本
function extractFormattedText(element) {
    let result = '';
    
    // 遍历所有子节点
    element.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            // 处理文本节点
            result += node.textContent.replace(/\s+/g, ' ');
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            // 处理元素节点
            const tag = node.tagName.toLowerCase();
            
            // 在块级元素前后添加换行
            if (isBlockElement(tag)) {
                result += '\n' + extractFormattedText(node) + '\n';
            } else {
                result += extractFormattedText(node);
            }
        }
    });
    
    // 清理多余的空行，但保留基本格式
    return result.replace(/\n{3,}/g, '\n\n').trim();
}

// 判断是否为块级元素
function isBlockElement(tag) {
    const blockElements = [
        'div', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
        'ul', 'ol', 'li', 'table', 'tr', 'article', 'section',
        'header', 'footer', 'nav', 'form', 'blockquote'
    ];
    return blockElements.includes(tag);
}

// 复制功能
function copyInput() {
    copyText(input);
}

function copyOutput() {
    copyText(output);
}

function copyText(element) {
    if (!element.value) {
        showToast('没有可复制的内容');
        return;
    }
    
    element.select();
    document.execCommand('copy');
    showToast('已复制到剪贴板');
}

// 导出文件
function exportText() {
    if (!output.value) {
        showToast('没有可导出的内容');
        return;
    }

    const blob = new Blob([output.value], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted_text.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// 清空内容
function clearAll() {
    input.value = '';
    output.value = '';
}
