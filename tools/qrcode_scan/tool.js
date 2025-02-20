// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewArea = document.getElementById('previewArea');
const previewImage = document.getElementById('previewImage');
const resultText = document.getElementById('resultText');
const copyBtn = document.getElementById('copyBtn');

// 点击上传区域触发文件选择
uploadArea.addEventListener('click', () => fileInput.click());

// 处理文件拖拽
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
    handleFiles(e.dataTransfer.files);
});

// 处理文件选择
fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// 处理文件上传
function handleFiles(files) {
    if (files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
        showToast('请上传图片文件');
        return;
    }

    // 显示预览
    const reader = new FileReader();
    reader.onload = (e) => {
        previewImage.src = e.target.result;
        previewArea.style.display = 'block';
        uploadArea.style.display = 'none';
        
        // 开始识别二维码
        preprocessAndScan(file); // 调用预处理和扫描函数
    };
    reader.readAsDataURL(file);
}

// 图像预处理和重试扫描
async function preprocessAndScan(file) {
    const image = new Image();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    image.onload = () => {
        // 设置画布大小
        canvas.width = image.width;
        canvas.height = image.height;

        // 绘制原始图像
        ctx.drawImage(image, 0, 0);

        // 获取图像数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height);
        
        // 识别结果处理
        if (code) {
            const text = code.data;
            resultText.value = text;

            // 解析内容
            const parseResult = parseQRContent(text);
            
            // 更新类型显示
            const typeMap = {
                'wifi': 'WiFi 网络',
                'email': '电子邮件',
                'url': '网页链接',
                'vcard': '联系人名片',
                'text': '文本内容'
            };

            document.getElementById('resultType').textContent = typeMap[parseResult.type];
            document.getElementById('resultTime').textContent = new Date().toLocaleString();

            // 创建格式化的展示区域
            const formattedDiv = document.createElement('div');
            formattedDiv.className = 'formatted-result';
            formattedDiv.innerHTML = formatResult(parseResult);

            // 插入到文本框前
            const existingFormatted = document.querySelector('.formatted-result');
            if (existingFormatted) {
                existingFormatted.remove();
            }
            resultText.parentElement.insertBefore(formattedDiv, resultText);

            // 隐藏原始文本框
            resultText.style.display = 'none';
            copyBtn.style.display = 'inline-flex';
            showToast('识别成功');
        } else {
            showToast('未能识别二维码，请确保图片清晰度足够');
        }
    };

    image.src = URL.createObjectURL(file);
}

// 清除图片
function clearImage() {
    previewArea.style.display = 'none';
    uploadArea.style.display = 'block';
    previewImage.src = '';
    resultText.value = '';
    copyBtn.style.display = 'none';
    fileInput.value = '';
}

// 复制结果
function copyResult() {
    resultText.select();
    document.execCommand('copy');
    showToast('复制成功');
}

// 显示提示信息
function showToast(message) {
    // 使用全局的 toast 方法，需要确保主项目中已实现
    if (typeof window.showToast === 'function') {
        window.showToast(message);
    } else {
        alert(message);
    }
}
// 添加二维码类型识别和解析函数
function parseQRContent(text) {
    // WiFi 格式: WIFI:T:WPA;S:网络名;P:密码;;
    if (text.startsWith('WIFI:')) {
        const data = {};
        text.split(';').forEach(item => {
            const [key, value] = item.replace('WIFI:', '').split(':');
            if (value) data[key] = value;
        });
        return {
            type: 'wifi',
            data
        };
    }
    
    // 邮件格式: mailto:example@email.com?subject=主题&body=内容
    // 修改邮件解析部分
    if (text.startsWith('mailto:')) {
        const [email, params] = text.replace('mailto:', '').split('?');
        const data = { email };
        if (params) {
            new URLSearchParams(params).forEach((value, key) => {
                data[key] = decodeURIComponent(value);
            });
        }
        return {
            type: 'email',
            data,
            raw: text
        };
    }
    
    // 网址格式
    if (text.startsWith('http://') || text.startsWith('https://')) {
        return {
            type: 'url',
            data: { url: text }
        };
    }
    
    // vCard 格式
    if (text.startsWith('BEGIN:VCARD')) {
        return {
            type: 'vcard',
            data: parseVCard(text)
        };
    }
    
    // 普通文本
    return {
        type: 'text',
        data: { text }
    };
}

// 在 parseQRContent 函数中添加微信二维码识别
function parseQRContent(text) {
    // 微信二维码格式
    if (text.startsWith('wxp://') || text.startsWith('weixin://')) {
        return {
            type: 'weixin',
            data: { url: text }
        };
    }
    
    // WiFi 格式: WIFI:T:WPA;S:网络名;P:密码;;
    if (text.startsWith('WIFI:')) {
        const data = {};
        text.split(';').forEach(item => {
            const [key, value] = item.replace('WIFI:', '').split(':');
            if (value) data[key] = value;
        });
        return {
            type: 'wifi',
            data
        };
    }
    
    // 邮件格式: mailto:example@email.com?subject=主题&body=内容
    // 修改邮件解析部分
    if (text.startsWith('mailto:')) {
        const [email, params] = text.replace('mailto:', '').split('?');
        const data = { email };
        if (params) {
            new URLSearchParams(params).forEach((value, key) => {
                data[key] = decodeURIComponent(value);
            });
        }
        return {
            type: 'email',
            data,
            raw: text
        };
    }
    
    // 网址格式
    if (text.startsWith('http://') || text.startsWith('https://')) {
        return {
            type: 'url',
            data: { url: text }
        };
    }
    
    // vCard 格式
    if (text.startsWith('BEGIN:VCARD')) {
        return {
            type: 'vcard',
            data: parseVCard(text)
        };
    }
    
    // 普通文本
    return {
        type: 'text',
        data: { text }
    };
}

function formatResult(parseResult) {
    switch (parseResult.type) {
        case 'wifi':
            return `
                <div class="qr-result wifi-result">
                    <div class="qr-field">
                        <span class="qr-label">网络名称</span>
                        <span class="qr-value">${parseResult.data.S || '-'}</span>
                    </div>
                    <div class="qr-field">
                        <span class="qr-label">加密类型</span>
                        <span class="qr-value">${parseResult.data.T || 'WPA'}</span>
                    </div>
                    <div class="qr-field">
                        <span class="qr-label">密码</span>
                        <span class="qr-value password-value">
                            <span class="password-text">${parseResult.data.P || '-'}</span>
                            <button class="password-toggle" onclick="togglePassword(this)">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
                                </svg>
                            </button>
                        </span>
                    </div>
                </div>`;
            
        case 'email':
            return `
                <div class="qr-result email-result">
                    <div class="qr-field">
                        <span class="qr-label">收件人</span>
                        <span class="qr-value email-value">
                            <a href="mailto:${parseResult.data.email}" class="email-link">${parseResult.data.email}</a>
                        </span>
                    </div>
                    ${parseResult.data.subject ? `
                    <div class="qr-field">
                        <span class="qr-label">主题</span>
                        <span class="qr-value">${parseResult.data.subject}</span>
                    </div>` : ''}
                    ${parseResult.data.body ? `
                    <div class="qr-field message-field">
                        <span class="qr-label">正文</span>
                        <span class="qr-value message-value">${parseResult.data.body.replace(/\n/g, '<br>')}</span>
                    </div>` : ''}
                    <div class="email-actions">
                        <a href="${parseResult.raw}" class="action-link primary-action">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
                            </svg>
                            发送邮件
                        </a>
                        <button onclick="copyEmailContent('${parseResult.raw}')" class="action-link secondary-action">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                            </svg>
                            复制邮件内容
                        </button>
                    </div>
                </div>`;
            
        case 'url':
            return `
                <div class="qr-result url-result">
                    <div class="qr-field">
                        <span class="qr-label">网址</span>
                        <span class="qr-value url-value">${parseResult.data.url}</span>
                    </div>
                    <a href="${parseResult.data.url}" target="_blank" class="action-link">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                        </svg>
                        访问链接
                    </a>
                </div>`;
            
        case 'text':
            return `
                <div class="qr-result text-result">
                    <div class="qr-field">
                        <span class="qr-value text-value">${parseResult.data.text}</span>
                    </div>
                </div>`;
            
        default:
            return '';
    }
}

// 添加密码显示切换功能
function togglePassword(button) {
    const passwordText = button.parentElement.querySelector('.password-text');
    const isHidden = passwordText.style.webkitTextSecurity === 'disc';
    passwordText.style.webkitTextSecurity = isHidden ? 'none' : 'disc';
    button.classList.toggle('active');
}

// 在 formatResult 函数中添加微信二维码展示
function formatResult(parseResult) {
    switch (parseResult.type) {
        case 'weixin':
            return `
                <div class="qr-result weixin-result">
                    <div class="qr-field">
                        <span class="qr-label">类型</span>
                        <span class="qr-value">微信</span>
                    </div>
                    <div class="qr-field">
                        <span class="qr-label">链接</span>
                        <span class="qr-value weixin-value">${parseResult.data.url}</span>
                    </div>
                    <div class="weixin-actions">
                        <button onclick="openWeixin('${parseResult.data.url}')" class="action-link primary-action">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15h-2v-6h2v6zm-1-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm5 7h-2v-6h2v6z"/>
                            </svg>
                            在微信中打开
                        </button>
                        <button onclick="copyWeixinUrl('${parseResult.data.url}')" class="action-link secondary-action">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                            </svg>
                            复制链接
                        </button>
                    </div>
                </div>`;
        
        case 'email':
            return `
                <div class="qr-result email-result">
                    <div class="qr-field">
                        <span class="qr-label">收件人</span>
                        <span class="qr-value email-value">
                            <a href="mailto:${parseResult.data.email}" class="email-link">${parseResult.data.email}</a>
                        </span>
                    </div>
                    ${parseResult.data.subject ? `
                    <div class="qr-field">
                        <span class="qr-label">主题</span>
                        <span class="qr-value">${parseResult.data.subject}</span>
                    </div>` : ''}
                    ${parseResult.data.body ? `
                    <div class="qr-field message-field">
                        <span class="qr-label">正文</span>
                        <span class="qr-value message-value">${parseResult.data.body.replace(/\n/g, '<br>')}</span>
                    </div>` : ''}
                    <div class="email-actions">
                        <a href="${parseResult.raw}" class="action-link primary-action">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 14H4V8l8 5 8-5v10zm-8-7L4 6h16l-8 5z"/>
                            </svg>
                            发送邮件
                        </a>
                        <button onclick="copyEmailContent('${parseResult.raw}')" class="action-link secondary-action">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                            </svg>
                            复制邮件内容
                        </button>
                    </div>
                </div>`;
            
        case 'url':
            return `
                <div class="qr-result url-result">
                    <div class="qr-field">
                        <span class="qr-label">网址</span>
                        <span class="qr-value url-value">${parseResult.data.url}</span>
                    </div>
                    <a href="${parseResult.data.url}" target="_blank" class="action-link">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M19 19H5V5h7V3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2v-7h-2v7zM14 3v2h3.59l-9.83 9.83 1.41 1.41L19 6.41V10h2V3h-7z"/>
                        </svg>
                        访问链接
                    </a>
                </div>`;
            
        case 'text':
            return `
                <div class="qr-result text-result">
                    <div class="qr-field">
                        <span class="qr-value text-value">${parseResult.data.text}</span>
                    </div>
                </div>`;
            
        default:
            return '';
    }
}

// 添加微信相关的辅助函数
function openWeixin(url) {
    // 在移动设备上直接打开微信
    if (/Android|iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        window.location.href = url;
    } else {
        showToast('请使用手机扫描二维码');
    }
}

function copyWeixinUrl(url) {
    navigator.clipboard.writeText(url).then(() => {
        showToast('链接已复制');
    }).catch(() => {
        showToast('复制失败');
    });
}