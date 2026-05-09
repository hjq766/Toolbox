// 等待所有依赖加载完成
window.addEventListener('load', function() {
    const htmlInput = document.getElementById('htmlCode');
    const cssInput = document.getElementById('cssCode');
    const jsInput = document.getElementById('jsCode');
    const previewFrame = document.getElementById('previewFrame');
    const exportHtmlBtn = document.getElementById('exportHtmlBtn');
    const exportImgBtn = document.getElementById('exportImgBtn');
    const exportPdfBtn = document.getElementById('exportPdfBtn');
    const deviceBtns = document.querySelectorAll('.device-btn');
    const previewPane = document.querySelector('.preview-pane');

    // 默认代码模版
    const defaultHTML = '<div class="container">\n    <h1>Hello World</h1>\n    <p>Start editing to see some magic happen!</p>\n</div>';
    const defaultCSS = 'body {\n    font-family: sans-serif;\n    padding: 20px;\n}\n\n.container {\n    text-align: center;\n    color: #333;\n}\n\nh1 {\n    color: #007bff;\n}';
    const defaultJS = 'console.log("Hello from JavaScript!");';

    // 初始化输入框内容
    if (!htmlInput.value) htmlInput.value = defaultHTML;
    if (!cssInput.value) cssInput.value = defaultCSS;
    if (!jsInput.value) jsInput.value = defaultJS;

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

    // 构建完整HTML
    function buildHTML() {
        const html = htmlInput.value;
        const css = cssInput.value;
        const js = jsInput.value;

        return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <style>
${css}
    </style>
</head>
<body>
${html}
    <script>
        try {
${js}
        } catch (e) {
            console.error(e);
        }
    <\/script>
</body>
</html>`;
    }

    // 更新预览
    function updatePreview() {
        const content = buildHTML();
        const doc = previewFrame.contentDocument || previewFrame.contentWindow.document;
        doc.open();
        doc.write(content);
        doc.close();
    }

    // 防抖函数
    function debounce(func, wait) {
        let timeout;
        return function() {
            const context = this;
            const args = arguments;
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                func.apply(context, args);
            }, wait);
        };
    }

    // 导出 HTML
    function exportHTML() {
        const content = buildHTML();
        const blob = new Blob([content], { type: 'text/html' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'index.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showError('HTML 导出成功！');
    }

    // 导出图片
    function exportImage() {
        if (!window.html2canvas) {
            showError('正在加载组件，请稍后重试...');
            return;
        }
        
        const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
        const element = iframeDoc.documentElement; // 使用 documentElement 捕获整个页面

        html2canvas(element, {
            useCORS: true,
            allowTaint: true,
            logging: false,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            const url = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = url;
            a.download = 'preview.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            showError('图片导出成功！');
        }).catch(err => {
            console.error(err);
            showError('图片导出失败：' + err.message);
        });
    }

    // 导出 PDF
    function exportPDF() {
         if (!window.html2canvas || !window.jspdf) {
            showError('正在加载组件，请稍后重试...');
            return;
        }
        
        const iframeDoc = previewFrame.contentDocument || previewFrame.contentWindow.document;
        const element = iframeDoc.documentElement;
        
        html2canvas(element, {
            useCORS: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
        }).then(canvas => {
            const imgData = canvas.toDataURL('image/png');
            const { jsPDF } = window.jspdf;
            
            const pdf = new jsPDF({
                orientation: canvas.width > canvas.height ? 'l' : 'p',
                unit: 'px',
                format: [canvas.width, canvas.height]
            });
            
            pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
            pdf.save('preview.pdf');
            showError('PDF 导出成功！');
        }).catch(err => {
            console.error(err);
            showError('PDF 导出失败：' + err.message);
        });
    }

    // 切换设备
    function switchDevice(device) {
        const containerWidth = previewPane.clientWidth; // 移除 padding 计算
        const containerHeight = previewPane.clientHeight;
        
        const deviceSizes = {
            desktop: { width: 1440, height: 900 },
            laptop: { width: 1440, height: 900 }, // Preview frame sets specific size
            tablet: { width: 834, height: 1194 },
            mobile: { width: 390, height: 844 }
        };
        
        // 如果是 desktop，不需要缩放
        if (device === 'desktop') {
            previewPane.setAttribute('data-device', device);
            previewFrame.style.transform = 'none';
            return;
        }
        
        const size = deviceSizes[device];
        const scaleX = containerWidth / size.width;
        const scaleY = containerHeight / size.height;
        const scale = Math.min(scaleX, scaleY, 1); // 不超过原始大小

        // 对手机视图特殊处理，稍微放大一点
        const finalScale = device === 'mobile' ? Math.min(scale * 1.0, 1) : scale;
        
        previewPane.setAttribute('data-device', device);
        previewFrame.style.transform = `scale(${finalScale})`;
    }

    // 绑定事件
    const debouncedUpdate = debounce(updatePreview, 500);
    
    htmlInput.addEventListener('input', debouncedUpdate);
    cssInput.addEventListener('input', debouncedUpdate);
    jsInput.addEventListener('input', debouncedUpdate);
    
    exportHtmlBtn.addEventListener('click', exportHTML);
    exportImgBtn.addEventListener('click', exportImage);
    exportPdfBtn.addEventListener('click', exportPDF);

    deviceBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            deviceBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            switchDevice(this.dataset.device);
        });
    });

    // 监听窗口大小变化以调整缩放
    window.addEventListener('resize', debounce(() => {
        const activeDevice = document.querySelector('.device-btn.active').dataset.device;
        switchDevice(activeDevice);
    }, 200));

    // 初始化
    updatePreview();
    switchDevice('desktop');
});
