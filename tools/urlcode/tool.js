// 清空输入框
function clearInput(inputId) {
    document.getElementById(inputId).value = '';
}

// 输入处理
function handleInput(value) {
    updateStats('source', value);
}

// 更新统计信息
function updateStats(id, value) {
    const charCount = value.length;
    const lineCount = value.split('\n').length;
    
    const charElement = document.getElementById(`${id === 'source' ? '' : 'result'}charCount`);
    const lineElement = document.getElementById(`${id === 'source' ? '' : 'result'}lineCount`);
    
    // 只在元素存在时更新统计信息
    if (charElement) {
        charElement.textContent = `${charCount} 个字符`;
    }
    if (lineElement) {
        lineElement.textContent = `${lineCount} 行`;
    }
}

// 从剪贴板粘贴
async function pasteFromClipboard() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('source').value = text;
        updateStats('source', text);
        showToast('已粘贴剪贴板内容');
    } catch (err) {
        showToast('无法访问剪贴板');
    }
}

// 交换内容
function swapContent() {
    const source = document.getElementById('source');
    const result = document.getElementById('result');
    const temp = source.value;
    
    source.value = result.value;
    result.value = temp;
    
    updateStats('source', source.value);
    updateStats('result', result.value);
}

// 添加快捷键支持
document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        if (e.shiftKey) {
            convertFromHex();
        } else {
            convertToHex();
        }
    }
});

// 优化原有的转换函数
function convertToHex() {
    const source = document.getElementById('source').value.trim();
    if (!source) {
        showToast('请输入需要转换的内容');
        return;
    }

    try {
        const lines = source.split('\n');
        const converted = lines.map(line => {
            if (!line.trim()) return '';
            
            // 处理URL前缀
            let prefix = '';
            let urlToConvert = line;
            
            if (line.startsWith('http://')) {
                prefix = 'http://';
                urlToConvert = line.substring(7);
            } else if (line.startsWith('https://')) {
                prefix = 'https://';
                urlToConvert = line.substring(8);
            }

            // 转换为16进制
            const hexResult = Array.from(urlToConvert)
                .map(char => '%' + char.charCodeAt(0).toString(16).toUpperCase())
                .join('');

            return prefix + hexResult;
        }).join('\n');

        const result = document.getElementById('result');
        result.value = converted;
        updateStats('result', converted);
        showToast('转换成功');
    } catch (e) {
        console.error('转换错误:', e);
        showToast('转换失败：' + e.message);
    }
}

// 优化解码函数
function convertFromHex() {
    const source = document.getElementById('source').value.trim();
    if (!source) {
        showToast('请输入需要解码的内容');
        return;
    }

    try {
        const lines = source.split('\n');
        const decoded = lines.map(line => {
            if (!line.trim()) return '';
            
            // 处理URL前缀
            let prefix = '';
            let hexToDecode = line;
            
            if (line.startsWith('http://')) {
                prefix = 'http://';
                hexToDecode = line.substring(7);
            } else if (line.startsWith('https://')) {
                prefix = 'https://';
                hexToDecode = line.substring(8);
            }

            // 解码16进制
            const decodedText = hexToDecode.replace(/%([0-9A-Fa-f]{2})/g, 
                (match, p1) => String.fromCharCode(parseInt(p1, 16))
            );

            return prefix + decodedText;
        }).join('\n');

        const result = document.getElementById('result');
        result.value = decoded;
        updateStats('result', decoded);
        showToast('解码成功');
    } catch (e) {
        console.error('解码错误:', e);
        showToast('解码失败：' + e.message);
    }
}

// 复制结果
function copyResult() {
    const result = document.getElementById('result');
    result.select();
    try {
        document.execCommand('copy');
        showToast('复制成功！');
    } catch (err) {
        console.error('复制错误:', err);
        showToast('复制失败，请手动复制');
    }
}