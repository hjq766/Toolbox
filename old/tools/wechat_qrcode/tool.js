// 全局变量
let currentQRCodeUrl = '';

// DOM 元素
const wechatIdInput = document.getElementById('wechatId');
const generateBtn = document.getElementById('generateBtn');
const clearBtn = document.getElementById('clearBtn');
const qrcodePreview = document.getElementById('qrcodePreview');
const loadingState = document.getElementById('loadingState');
const errorState = document.getElementById('errorState');
const errorMessage = document.getElementById('errorMessage');
const exportButtons = document.getElementById('exportButtons');

// 生成二维码
async function generateQRCode() {
    const wechatId = wechatIdInput.value.trim();
    
    // 验证输入
    if (!wechatId) {
        showToast('请输入公众号ID');
        wechatIdInput.focus();
        return;
    }

    // 验证格式（微信号通常是字母、数字、下划线、减号的组合）
    const validPattern = /^[a-zA-Z0-9_-]+$/;
    if (!validPattern.test(wechatId)) {
        showToast('公众号ID格式不正确，只能包含字母、数字、下划线和减号');
        return;
    }

    // 显示加载状态
    showLoading();
    hideError();
    hideExportButtons();

    // 构建微信官方二维码URL
    currentQRCodeUrl = `https://open.weixin.qq.com/qr/code?username=${encodeURIComponent(wechatId)}`;

    try {
        // 加载图片
        await loadQRCodeImage(currentQRCodeUrl);
        showToast('二维码加载成功');
        showExportButtons();
    } catch (error) {
        console.error('加载二维码失败:', error);
        showError('无法加载二维码，请检查公众号ID是否正确');
        currentQRCodeUrl = '';
    } finally {
        hideLoading();
    }
}

// 加载二维码图片
function loadQRCodeImage(url) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        
        // 添加时间戳避免缓存
        const timestamp = new Date().getTime();
        const urlWithTimestamp = url + (url.includes('?') ? '&' : '?') + '_t=' + timestamp;
        
        img.onload = function() {
            // 检查图片是否有效（微信返回的错误图片通常很小）
            if (img.width < 50 || img.height < 50) {
                reject(new Error('图片尺寸异常，可能是无效的公众号ID'));
                return;
            }
            
            displayQRCode(img);
            resolve();
        };
        
        img.onerror = function() {
            reject(new Error('图片加载失败，请检查公众号ID是否正确'));
        };
        
        // 直接加载图片
        img.src = urlWithTimestamp;
    });
}

// 显示二维码
function displayQRCode(img) {
    qrcodePreview.innerHTML = '';
    const clonedImg = img.cloneNode(true);
    qrcodePreview.appendChild(clonedImg);
}

// 下载原图
function downloadOriginalImage() {
    if (!currentQRCodeUrl) {
        showToast('请先生成二维码');
        return;
    }

    const wechatId = wechatIdInput.value.trim();
    
    // 方案1：尝试直接下载
    const link = document.createElement('a');
    link.href = currentQRCodeUrl;
    link.download = `wechat_qrcode_${wechatId}.jpg`;
    
    // 添加一个标记来检测是否成功下载
    let downloadStarted = false;
    
    // 监听点击事件
    link.addEventListener('click', () => {
        downloadStarted = true;
    });
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // 延迟检查是否成功
    setTimeout(() => {
        if (downloadStarted) {
            showToast('开始下载二维码');
        } else {
            // 如果直接下载失败，提示用户右键保存
            showToast('请在打开的页面中右键保存图片');
        }
    }, 100);
}

// 清空输入
function clearInput() {
    wechatIdInput.value = '';
    currentQRCodeUrl = '';
    
    // 重置预览区域
    qrcodePreview.innerHTML = `
        <div class="placeholder">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7"/>
                <rect x="14" y="3" width="7" height="7"/>
                <rect x="3" y="14" width="7" height="7"/>
                <rect x="14" y="14" width="7" height="7"/>
            </svg>
            <p>输入公众号ID后生成二维码</p>
        </div>
    `;
    
    hideError();
    hideExportButtons();
    wechatIdInput.focus();
}

// 显示/隐藏状态
function showLoading() {
    loadingState.style.display = 'block';
}

function hideLoading() {
    loadingState.style.display = 'none';
}

function showError(message) {
    errorMessage.textContent = message;
    errorState.style.display = 'block';
}

function hideError() {
    errorState.style.display = 'none';
}

function showExportButtons() {
    exportButtons.style.display = 'block';
}

function hideExportButtons() {
    exportButtons.style.display = 'none';
}

// 事件监听
generateBtn.addEventListener('click', generateQRCode);
clearBtn.addEventListener('click', clearInput);

// 回车键生成
wechatIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        generateQRCode();
    }
});

// 下载按钮事件
const downloadBtn = document.getElementById('downloadBtn');
if (downloadBtn) {
    downloadBtn.addEventListener('click', downloadOriginalImage);
}

// 页面加载完成后聚焦输入框
document.addEventListener('DOMContentLoaded', () => {
    wechatIdInput.focus();
});
