const sourceText = document.getElementById('sourceText');
const resultText = document.getElementById('resultText');

// 更新统计信息
function updateStats() {
    const source = sourceText.value;
    const result = resultText.value;
    
    // 原文本统计
    document.getElementById('originalLines').textContent = source ? source.split('\n').length : 0;
    document.getElementById('originalChars').textContent = source.length;
    document.getElementById('originalWords').textContent = source ? source.trim().split(/\s+/).length : 0;
    
    // 结果统计
    document.getElementById('uniqueLines').textContent = result ? result.split('\n').length : 0;
    document.getElementById('uniqueChars').textContent = result.length;
    document.getElementById('duplicateCount').textContent = source ? 
        source.split('\n').length - (result ? result.split('\n').length : 0) : 0;
}

// 文本去重
function deduplicate() {
    const text = sourceText.value;
    if (!text) {
        showToast('请输入需要去重的文本！');
        return;
    }

    const ignoreCase = document.getElementById('ignoreCase').checked;
    const ignorePunctuation = document.getElementById('ignorePunctuation').checked;
    const ignoreSpaces = document.getElementById('ignoreSpaces').checked;
    const trimLines = document.getElementById('trimLines').checked;

    // 将文本分割成行
    let lines = text.split('\n');

    // 处理每一行
    lines = lines.map(line => {
        let processedLine = line;
        if (trimLines) {
            processedLine = processedLine.trim();
        }
        return processedLine;
    });

    // 创建用于比较的处理后文本
    const processedLines = lines.map(line => {
        let processedLine = line;
        if (ignoreCase) {
            processedLine = processedLine.toLowerCase();
        }
        if (ignorePunctuation) {
            processedLine = processedLine.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, '');
        }
        if (ignoreSpaces) {
            processedLine = processedLine.replace(/\s+/g, '');
        }
        return processedLine;
    });

    // 使用 Set 去重
    const uniqueSet = new Set();
    const uniqueLines = [];
    
    processedLines.forEach((processedLine, index) => {
        if (!uniqueSet.has(processedLine)) {
            uniqueSet.add(processedLine);
            uniqueLines.push(lines[index]);
        }
    });

    // 更新结果
    resultText.value = uniqueLines.join('\n');
    updateStats();
    showToast('去重完成！');
}

// 复制结果
function copyResult() {
    const result = resultText.value;
    if (!result) {
        showToast('没有可复制的内容！');
        return;
    }

    navigator.clipboard.writeText(result).then(() => {
        showToast('复制成功！');
    }).catch(err => {
        showToast('复制失败：' + err);
    });
}

// 清空内容
function clearText() {
    sourceText.value = '';
    resultText.value = '';
    updateStats();
    showToast('已清空内容！');
}

// 添加输入监听
sourceText.addEventListener('input', updateStats);
resultText.addEventListener('input', updateStats);

// 添加文件拖放支持
sourceText.addEventListener('dragover', (e) => {
    e.preventDefault();
    sourceText.style.borderColor = 'var(--primary-color)';
});

sourceText.addEventListener('dragleave', () => {
    sourceText.style.borderColor = 'var(--border-color)';
});

sourceText.addEventListener('drop', (e) => {
    e.preventDefault();
    sourceText.style.borderColor = 'var(--border-color)';
    
    const file = e.dataTransfer.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            sourceText.value = e.target.result;
            updateStats();
        };
        reader.readAsText(file);
    }
}); 