// Base64编码
function encode() {
    const input = document.getElementById('input').value;
    if (!input) {
        showToast('请输入需要编码的文本');
        return;
    }
    try {
        const encoded = btoa(unescape(encodeURIComponent(input)));
        document.getElementById('output').value = encoded;
        showToast('编码成功！');
    } catch (err) {
        showToast('编码失败：' + err.message);
    }
}

// Base64解码
function decode() {
    const input = document.getElementById('input').value;
    if (!input) {
        showToast('请输入需要解码的Base64文本');
        return;
    }
    try {
        const decoded = decodeURIComponent(escape(atob(input)));
        document.getElementById('output').value = decoded;
        showToast('解码成功！');
    } catch (err) {
        showToast('解码失败：输入的不是有效的Base64编码');
    }
}

// 复制输入框内容
function copyInput() {
    const input = document.getElementById('input');
    if (!input.value) {
        showToast('没有可复制的内容');
        return;
    }
    copyToClipboard(input.value);
}

// 复制输出框内容
function copyOutput() {
    const output = document.getElementById('output');
    if (!output.value) {
        showToast('没有可复制的内容');
        return;
    }
    copyToClipboard(output.value);
}

// 清空输入框
function clearInput() {
    document.getElementById('input').value = '';
    showToast('已清空输入框');
}

// 清空输出框
function clearOutput() {
    document.getElementById('output').value = '';
    showToast('已清空输出框');
}

// 复制到剪贴板
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('复制成功！');
    }).catch(err => {
        showToast('复制失败：' + err.message);
    });
} 