// 全局变量
let pdfFile = null;
let pdfDoc = null;
let pageImages = [];

// 初始化上传区域
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');

// 文件拖放处理
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('drag-over');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('drag-over');
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
        handleFile(file);
    } else {
        showToast('请上传PDF文件');
    }
});

// 点击上传区域触发文件选择
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// 文件选择处理
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        handleFile(file);
    }
});

// 处理上传的文件
async function handleFile(file) {
    if (file.size > 100 * 1024 * 1024) {
        showToast('文件大小不能超过100MB');
        return;
    }

    pdfFile = file;
    
    // 显示文件信息
    document.getElementById('fileName').textContent = file.name;
    document.getElementById('fileSize').textContent = formatFileSize(file.size);
    
    try {
        // 加载PDF文件
        const arrayBuffer = await file.arrayBuffer();
        pdfDoc = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
        
        document.getElementById('pageCount').textContent = `${pdfDoc.numPages}页`;
        document.getElementById('pdfInfo').style.display = 'block';
        
        // 转换并显示预览
        await convertPages();
        
    } catch (error) {
        console.error('PDF处理错误:', error);
        showToast('PDF文件处理失败');
    }
}

// 转换PDF页面为图片
async function convertPages() {
    const pageContainer = document.getElementById('pageContainer');
    pageContainer.innerHTML = '<div class="loading"><div class="loading-spinner"></div>正在转换中...</div>';
    document.getElementById('previewArea').style.display = 'block';
    
    pageImages = [];
    
    try {
        for (let i = 1; i <= pdfDoc.numPages; i++) {
            const page = await pdfDoc.getPage(i);
            const viewport = page.getViewport({scale: 2}); // 2倍缩放以获得更清晰的图像
            
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;
            
            // 将Canvas转换为图片
            const imageUrl = canvas.toDataURL('image/png');
            pageImages.push(imageUrl);
            
            // 更新预览
            updatePreview();
        }
        
        document.getElementById('downloadBtn').style.display = 'inline-flex';
        
    } catch (error) {
        console.error('转换错误:', error);
        showToast('页面转换失败');
    }
}

// 更新预览区域
function updatePreview() {
    const pageContainer = document.getElementById('pageContainer');
    pageContainer.innerHTML = '';
    
    pageImages.forEach((imageUrl, index) => {
        const pageItem = document.createElement('div');
        pageItem.className = 'page-item';
        
        const img = document.createElement('img');
        img.src = imageUrl;
        img.alt = `第 ${index + 1} 页`;
        
        const pageNumber = document.createElement('div');
        pageNumber.className = 'page-number';
        pageNumber.textContent = `第 ${index + 1} 页`;
        
        pageItem.appendChild(img);
        pageItem.appendChild(pageNumber);
        pageContainer.appendChild(pageItem);
    });
}

// 下载处理
document.getElementById('downloadBtn').addEventListener('click', async () => {
    if (!pageImages.length) return;
    
    try {
        const zip = new JSZip();
        const pdfName = pdfFile.name.replace('.pdf', '');
        
        // 添加每页图片到zip
        pageImages.forEach((imageUrl, index) => {
            const imageData = imageUrl.split(',')[1];
            zip.file(`${pdfName}_第${index + 1}页.png`, imageData, {base64: true});
        });
        
        // 生成并下载zip文件
        const content = await zip.generateAsync({type: 'blob'});
        const downloadUrl = URL.createObjectURL(content);
        
        const link = document.createElement('a');
        link.href = downloadUrl;
        link.download = `${pdfName}_转换图片.zip`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        URL.revokeObjectURL(downloadUrl);
        showToast('下载已开始');
        
    } catch (error) {
        console.error('打包下载错误:', error);
        showToast('下载失败');
    }
});

// 工具函数：格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
