// Tab 切换
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        // 移除所有 active
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // 添加当前 active
        btn.classList.add('active');
        const tabId = btn.dataset.tab + '-tab';
        document.getElementById(tabId).classList.add('active');
    });
});

// 输入框字符数统计
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const inputCount = document.getElementById('input-count');
const outputCount = document.getElementById('output-count');

inputText.addEventListener('input', () => {
    const count = inputText.value.length;
    inputCount.textContent = `输入字符数：${count}`;
});

outputText.addEventListener('input', () => {
    updateOutputStats();
});

// 更新输出区统计信息
function updateOutputStats() {
    const text = outputText.value;
    const count = text.length;
    const bytes = new Blob([text]).size;
    
    outputCount.textContent = `字符数：${count}`;
    document.getElementById('output-size').textContent = `大小：${formatFileSize(bytes)}`;
}

// 图片输出字符数统计
const imageOutput = document.getElementById('image-output');
const imageOutputCount = document.getElementById('image-output-count');

imageOutput.addEventListener('input', () => {
    updateImageOutputStats();
});

// 更新图片输出统计信息
function updateImageOutputStats() {
    const text = imageOutput.value;
    const count = text.length;
    const bytes = new Blob([text]).size;
    
    imageOutputCount.textContent = `字符数：${count}`;
    document.getElementById('image-output-size').textContent = `大小：${formatFileSize(bytes)}`;
}

// Base64 编码（使用 TextEncoder 替代已弃用的 escape/unescape）
function encodeText() {
    const input = inputText.value;
    if (!input) {
        showToast('请输入需要编码的文本');
        return;
    }
    
    try {
        const urlSafe = document.getElementById('urlsafe').checked;
        const lineBreak = document.getElementById('linebreak').value;
        
        // 使用 TextEncoder 进行 UTF-8 编码
        const encoder = new TextEncoder();
        const data = encoder.encode(input);
        
        // 转换为 Base64
        let base64 = btoa(String.fromCharCode(...data));
        
        // URL-safe 模式
        if (urlSafe) {
            base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
        }
        
        // 换行格式
        if (lineBreak === '76') {
            base64 = base64.match(/.{1,76}/g).join('\n');
        }
        
        outputText.value = base64;
        updateOutputStats();
        showToast('编码成功！');
    } catch (err) {
        showToast('编码失败：' + err.message);
    }
}

// Base64 解码
function decodeText() {
    const input = inputText.value.trim();
    if (!input) {
        showToast('请输入需要解码的 Base64 文本');
        return;
    }
    
    try {
        const urlSafe = document.getElementById('urlsafe').checked;
        let base64 = input.replace(/\s/g, ''); // 移除所有空白字符
        
        // URL-safe 模式还原
        if (urlSafe) {
            base64 = base64.replace(/-/g, '+').replace(/_/g, '/');
            // 补齐 padding
            while (base64.length % 4) {
                base64 += '=';
            }
        }
        
        // 解码
        const binaryString = atob(base64);
        const bytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
        }
        
        // 使用 TextDecoder 解码 UTF-8
        const decoder = new TextDecoder('utf-8');
        const decoded = decoder.decode(bytes);
        
        outputText.value = decoded;
        updateOutputStats();
        showToast('解码成功！');
    } catch (err) {
        showToast('解码失败：输入的不是有效的 Base64 编码');
    }
}

// 一键转换（自动识别）
function convertText() {
    const input = inputText.value.trim();
    if (!input) {
        showToast('请输入内容');
        return;
    }
    
    // 简单判断：如果看起来像 Base64，就解码，否则编码
    const base64Pattern = /^[A-Za-z0-9+/=\-_\s]+$/;
    if (base64Pattern.test(input) && input.length % 4 === 0) {
        decodeText();
    } else {
        encodeText();
    }
}

// 复制输出
function copyOutput() {
    const output = outputText.value;
    if (!output) {
        showToast('没有可复制的内容');
        return;
    }
    
    navigator.clipboard.writeText(output).then(() => {
        showToast('复制成功！');
    }).catch(() => {
        showToast('复制失败');
    });
}

// 交换到输入
function swapText() {
    const output = outputText.value;
    if (!output) {
        showToast('输出区域为空');
        return;
    }
    
    inputText.value = output;
    outputText.value = '';
    inputCount.textContent = `输入字符数：${output.length}`;
    outputCount.textContent = `字符数：0`;
    showToast('已交换到输入区');
}

// 清空输出
function clearOutput() {
    outputText.value = '';
    updateOutputStats();
    showToast('已清空输出');
}

// 清空所有
function clearAll() {
    inputText.value = '';
    outputText.value = '';
    inputCount.textContent = `输入字符数：0`;
    updateOutputStats();
    showToast('已清空所有内容');
}

// ========== 图片编码功能 ==========

const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const previewSection = document.getElementById('preview-section');
const previewImage = document.getElementById('preview-image');
const fileInfo = document.getElementById('file-info');
const fileName = document.getElementById('file-name');
const fileSize = document.getElementById('file-size');

// 点击上传
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// 文件选择
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleImageFile(file);
    }
});

// 拖拽上传
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
        handleImageFile(file);
    } else {
        showToast('请上传图片文件');
    }
});

// 处理图片文件
function handleImageFile(file) {
    if (!file.type.startsWith('image/')) {
        showToast('请选择图片文件');
        return;
    }
    
    // 显示文件信息
    fileName.textContent = `文件：${file.name}`;
    fileSize.textContent = `(${formatFileSize(file.size)})`;
    fileInfo.style.display = 'inline-flex';
    
    // 读取文件
    const reader = new FileReader();
    reader.onload = (e) => {
        const base64 = e.target.result;
        
        // 显示预览
        previewImage.src = base64;
        previewSection.style.display = 'block';
        
        // 显示 Base64
        imageOutput.value = base64;
        updateImageOutputStats();
        
        showToast('图片转换成功！');
    };
    reader.readAsDataURL(file);
}

// 复制图片 Base64
function copyImageOutput() {
    const output = imageOutput.value;
    if (!output) {
        showToast('没有可复制的内容');
        return;
    }
    
    navigator.clipboard.writeText(output).then(() => {
        showToast('复制成功！');
    }).catch(() => {
        showToast('复制失败');
    });
}

// 从 Base64 还原预览
function decodeImage() {
    const base64 = imageOutput.value.trim();
    if (!base64) {
        showToast('请先输入 Base64 编码');
        return;
    }
    
    try {
        previewImage.src = base64;
        previewSection.style.display = 'block';
        showToast('图片还原成功！');
    } catch (err) {
        showToast('Base64 编码格式错误');
    }
}

// 重置图片
function resetImage() {
    fileInput.value = '';
    previewImage.src = '';
    previewSection.style.display = 'none';
    imageOutput.value = '';
    fileInfo.style.display = 'none';
    updateImageOutputStats();
    showToast('已清空图片和编码');
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}
