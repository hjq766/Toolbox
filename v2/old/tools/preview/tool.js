// 等待所有依赖加载完成
window.addEventListener('load', function() {
    const urlInput = document.getElementById('urlInput');
    const previewBtn = document.getElementById('previewBtn');
    const qrcodeBtn = document.getElementById('qrcodeBtn');
    const previewFrame = document.getElementById('previewFrame');
    const deviceBtns = document.querySelectorAll('.device-btn');
    const qrcodeElement = document.getElementById('qrcode');
    const qrcodeArea = document.getElementById('qrcodeArea');
    
    let qrcode = null;
    let isQRCodeVisible = false;

    // 显示错误信息
    function showError(message) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.style.display = 'block';
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                toast.style.display = 'none';
            }, 300);
        }, 3000);
    }

    // 初始化二维码
    function initQRCode() {
        if (qrcodeElement.firstChild) {
            qrcodeElement.innerHTML = '';
        }
        
        try {
            qrcode = new QRCode(qrcodeElement, {
                width: 160,
                height: 160,
                colorDark: "#000000",
                colorLight: "#ffffff",
                correctLevel: QRCode.CorrectLevel.H
            });
        } catch (error) {
            console.error('QRCode 初始化失败:', error);
            showError('二维码生成失败');
            return false;
        }
        return true;
    }

    // 验证URL
    function isValidUrl(url) {
        try {
            new URL(url);
            return true;
        } catch (e) {
            return false;
        }
    }

    // 切换二维码显示
    function toggleQRCode() {
        const url = urlInput.value.trim();
        
        if (isQRCodeVisible) {
            // 如果已经显示，就隐藏
            isQRCodeVisible = false;
            qrcodeArea.style.display = 'none';
            qrcodeBtn.classList.remove('active');
        } else {
            // 如果要显示，先验证URL
            if (!url) {
                showError('请先输入要预览的网址');
                return;
            }
            
            if (!isValidUrl(url)) {
                showError('请输入有效的网址，需包含 http:// 或 https://');
                return;
            }

            // URL有效，显示二维码
            isQRCodeVisible = true;
            qrcodeArea.style.display = 'flex';
            qrcodeBtn.classList.add('active');
            
            // 生成二维码
            try {
                if (!qrcode && !initQRCode()) {
                    return;
                }
                qrcode.clear();
                qrcode.makeCode(url);
            } catch (error) {
                console.error('二维码生成失败:', error);
                showError('二维码生成失败');
                isQRCodeVisible = false;
                qrcodeArea.style.display = 'none';
                qrcodeBtn.classList.remove('active');
            }
        }
    }

    // 显示预览
    function showPreview() {
        const url = urlInput.value.trim();
        if (!url) {
            showError('请输入要预览的网址');
            return;
        }

        if (!isValidUrl(url)) {
            showError('请输入有效的网址，需包含 http:// 或 https://');
            return;
        }

        // 更新预览
        previewFrame.src = url;
        
        // 如果二维码可见，更新二维码
        if (isQRCodeVisible && qrcode) {
            try {
                qrcode.clear();
                qrcode.makeCode(url);
            } catch (error) {
                console.error('二维码更新失败:', error);
                showError('二维码更新失败');
            }
        }
    }

    // 切换设备
    function switchDevice(device) {
        const containerWidth = document.querySelector('main').clientWidth - 40; // 减去padding
        const containerHeight = document.querySelector('main').clientHeight - 40;
        
        const deviceSizes = {
            desktop: { width: 1440, height: 900 },
            laptop: { width: 1280, height: 800 },
            tablet: { width: 768, height: 1024 },
            mobile: { width: 390, height: 844 }
        };
        
        const size = deviceSizes[device];
        const scaleX = containerWidth / size.width;
        const scaleY = containerHeight / size.height;
        const scale = Math.min(scaleX, scaleY, 1); // 不超过原始大小

        // 对手机视图特殊处理，稍微放大一点
        const finalScale = device === 'mobile' ? scale * 1.0 : scale;
        
        document.querySelector('main').setAttribute('data-device', device);
        previewFrame.style.transform = `scale(${finalScale})`;
    }

    // 绑定事件
    previewBtn.addEventListener('click', showPreview);
    qrcodeBtn.addEventListener('click', toggleQRCode);
    
    // 监听回车键
    urlInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' || e.keyCode === 13) {
            e.preventDefault(); // 阻止默认行为
            showPreview();
        }
    });

    deviceBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            deviceBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            switchDevice(this.dataset.device);
        });
    });

    // 初始化
    switchDevice('desktop');
    
    // 点击其他区域关闭二维码
    document.addEventListener('click', function(e) {
        if (isQRCodeVisible && !qrcodeArea.contains(e.target) && !qrcodeBtn.contains(e.target)) {
            toggleQRCode();
        }
    });
});