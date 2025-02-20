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

// Tab切换逻辑
document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        // 移除所有active类
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        // 添加当前active类
        btn.classList.add('active');
        
        // 切换显示内容
        const category = btn.dataset.category;
        document.querySelector('.text-encode').style.display = category === 'text' ? 'block' : 'none';
        document.querySelector('.image-encode').style.display = category === 'image' ? 'block' : 'none';
    });
});

// 图片上传区域点击触发文件选择
document.getElementById('dropZone').addEventListener('click', () => {
    document.getElementById('fileInput').click();
});

// 文件选择处理
document.getElementById('fileInput').addEventListener('change', handleFileSelect);

// 拖拽处理
const dropZone = document.getElementById('dropZone');
dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('dragover');
});

dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('dragover');
});

dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('dragover');
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleFile(file);
    } else {
        showToast('请上传图片文件');
    }
});

// 处理选择的文件
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
}

// 处理图片文件
function handleFile(file) {
    if (!file.type.startsWith('image/')) {
        showToast('请选择图片文件');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const base64 = e.target.result;
        document.getElementById('preview').src = base64;
        document.getElementById('preview').style.display = 'block';
        document.querySelector('.preview-placeholder').style.display = 'none';
        document.getElementById('imageOutput').value = base64;
        showToast('图片转换成功！');
    };
    reader.readAsDataURL(file);
}

// 从Base64还原预览图片
function decodeImageBase64() {
    const base64 = document.getElementById('imageOutput').value.trim();
    if (!base64) {
        showToast('请先输入Base64编码');
        return;
    }

    try {
        document.getElementById('preview').src = base64;
        document.getElementById('preview').style.display = 'block';
        document.querySelector('.preview-placeholder').style.display = 'none';
        showToast('图片还原成功！');
    } catch (err) {
        showToast('Base64编码格式错误');
    }
}

// 复制图片Base64编码
function copyImageOutput() {
    const output = document.getElementById('imageOutput');
    if (!output.value) {
        showToast('没有可复制的内容');
        return;
    }
    copyToClipboard(output.value);
}

// 重置图片
function resetImage() {
    document.getElementById('fileInput').value = '';
    document.getElementById('preview').src = '';
    document.getElementById('preview').style.display = 'none';
    document.querySelector('.preview-placeholder').style.display = 'block';
    document.getElementById('imageOutput').value = '';
    showToast('已清空图片和编码');
}

// 初始化默认选中状态
document.addEventListener('DOMContentLoaded', () => {
    const defaultTab = document.querySelector('.tab-btn[data-category="text"]');
    if (defaultTab) {
        defaultTab.classList.add('active');
        document.querySelector('.text-encode').style.display = 'block';
        document.querySelector('.image-encode').style.display = 'none';
    }
}); 

