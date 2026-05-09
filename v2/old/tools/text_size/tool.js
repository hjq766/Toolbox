const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const content = document.getElementById('content');

const fileTypeValue = document.getElementById('fileType');
const sizeValue = document.getElementById('size');
const linesValue = document.getElementById('lines');
const nonEmptyLinesValue = document.getElementById('nonEmptyLines');
const maxLineLengthValue = document.getElementById('maxLineLength');
const charsValue = document.getElementById('chars');
const numbersValue = document.getElementById('numbers');
const chineseValue = document.getElementById('chinese');
const englishValue = document.getElementById('english');
const spacesValue = document.getElementById('spaces');
const punctuationValue = document.getElementById('punctuation');
const urlValue = document.getElementById('url');

// 支持的文件类型映射
const fileTypes = {
    'txt': '文本文件',
    'html': 'HTML',
    'css': 'CSS',
    'js': 'JavaScript',
    'json': 'JSON',
    'md': 'Markdown',
    'py': 'Python',
    'java': 'Java',
    'cpp': 'C++',
    'c': 'C',
    'php': 'PHP'
};

// 文件处理
function handleFile(file) {
    const extension = file.name.split('.').pop().toLowerCase();
    
    if (!fileTypes[extension]) {
        showToast('不支持的文件类型！');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        content.value = e.target.result;
        updateStats(file);
        showToast('文件加载成功！');
    };
    reader.readAsText(file);
}

function updateStats(file = null) {
    const text = content.value || '';
    
    if (file) {
        const extension = file.name.split('.').pop().toLowerCase();
        fileTypeValue.textContent = fileTypes[extension] || '-';
    }
    
    const bytes = new Blob([text]).size;
    sizeValue.textContent = formatSize(bytes);
    
    // 计算行相关统计
    const allLines = text.split('\n');
    const nonEmptyLines = allLines.filter(line => line.trim());
    const totalLines = allLines.length;
    
    linesValue.textContent = totalLines;
    nonEmptyLinesValue.textContent = nonEmptyLines.length;

    // 计算行长度统计
    if (nonEmptyLines.length > 0) {
        const lineLengths = nonEmptyLines.map(line => line.length);
        const maxLength = Math.max(...lineLengths);
        maxLineLengthValue.textContent = maxLength;
    } else {
        maxLineLengthValue.textContent = '0';
    }
    
    const chars = text.replace(/\s/g, '').length;
    charsValue.textContent = chars;

    // 统计数值个数
    const numbers = text.match(/[+-]?\d+(\.\d+)?/g) || [];
    numbersValue.textContent = numbers.length;

    // 统计中文字数
    const chinese = text.match(/[\u4e00-\u9fa5]/g) || [];
    chineseValue.textContent = chinese.length;

    // 统计英文单词数
    const english = text.match(/[a-zA-Z]/g) || [];
    englishValue.textContent = english.length;

    // 统计空格数量
    const spaces = text.match(/[\s]/g) || [];
    spacesValue.textContent = spaces.length;

    // 统计标点符号数量（包括中英文标点）
    const punctuation = text.match(/[!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~。，、；：？！…—·「」『』（）《》〈〉【】]/g) || [];
    punctuationValue.textContent = punctuation.length;

    // 统计URL链接数量
    const urls = text.match(/https?:\/\/[^\s/$.?#].[^\s]*/g) || [];
    urlValue.textContent = urls.length;
}

function formatSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function clearContent() {
    content.value = '';
    fileTypeValue.textContent = '-';
    updateStats();
    showToast('内容已清空！');
}

function downloadTxt() {
    const textToDownload = content.value;
    
    if (!textToDownload) {
        showToast('没有可下载的内容！');
        return;
    }

    const blob = new Blob([textToDownload], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'text_' + new Date().getTime() + '.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('下载开始！');
}

function removeEmptyLines() {
    const text = content.value;
    if (!text) {
        showToast('没有可处理的内容！');
        return;
    }
    
    // 移除空行（包括只包含空白字符的行）
    const lines = text.split('\n');
    const nonEmptyLines = lines.filter(line => line.trim());
    content.value = nonEmptyLines.join('\n');
    
    updateStats();
    showToast('空行已删除！');
}

// 事件监听
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('drag-over');
});

dropZone.addEventListener('dragleave', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file) {
        handleFile(file);
    }
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
});

content.addEventListener('input', () => {
    updateStats();
});

content.addEventListener('paste', () => {
    setTimeout(() => {
        updateStats();
    }, 0);
}); 