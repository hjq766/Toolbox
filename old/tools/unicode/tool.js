// 文字转Unicode
function textToUnicode() {
    const input = document.getElementById('textInput').value;
    const output = input.split('').map(char => {
        const unicode = char.charCodeAt(0).toString(16).toUpperCase();
        return `\\u${unicode.padStart(4, '0')}`;
    }).join('');
    
    document.getElementById('unicodeOutput').value = output;
}

// Unicode转文字
function unicodeToText() {
    const input = document.getElementById('unicodeInput').value;
    try {
        // 处理输入的Unicode编码
        const output = input.replace(/\\u([0-9a-fA-F]{4})/g, (match, p1) => {
            return String.fromCharCode(parseInt(p1, 16));
        });
        document.getElementById('textOutput').value = output;
    } catch (error) {
        showToast('Unicode编码格式不正确');
    }
}

// 复制到剪贴板
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    element.select();
    document.execCommand('copy');
    showToast('复制成功');
}

// 清空文本
function clearText(...elementIds) {
    elementIds.forEach(id => {
        document.getElementById(id).value = '';
    });
}
