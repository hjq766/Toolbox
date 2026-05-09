let currentTab = 'code';
const turndownService = new TurndownService({
    headingStyle: 'atx',
    codeBlockStyle: 'fenced'
});

marked.setOptions({
    breaks: true,
    gfm: true
});

function switchTab(tab) {
    currentTab = tab;
    document.getElementById('codeTab').classList.toggle('active', tab === 'code');
    document.getElementById('previewTab').classList.toggle('active', tab === 'preview');
    document.getElementById('result').style.display = tab === 'code' ? 'block' : 'none';
    document.getElementById('preview').style.display = tab === 'preview' ? 'block' : 'none';
}

function autoConvert() {
    convertCode();
}

function convertCode() {
    const source = document.getElementById('source').value;
    const result = document.getElementById('result');
    const preview = document.getElementById('preview');
    
    try {
        const markdown = turndownService.turndown(source);
        result.value = markdown;
        preview.innerHTML = marked.parse(markdown);
        showToast('转换成功！');
    } catch (e) {
        console.error('转换错误:', e);
        showToast('转换失败：' + e.message);
    }
}

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

function downloadResult() {
    const result = document.getElementById('result').value;
    if (!result) {
        showToast('没有可导出的内容');
        return;
    }
    
    const blob = new Blob([result], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'converted.md';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('导出成功！');
}

// 页面加载时自动转换示例内容
window.onload = function() {
    convertCode();
}; 