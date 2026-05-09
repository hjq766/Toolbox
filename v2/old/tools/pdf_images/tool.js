// 全局变量
let pdfFile = null;
let pdfDoc = null;
let pageImages = [];
let currentPageIndex = 0;
let zoomLevel = 100;
let isGridLayout = false;

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
    
    // 获取所需的DOM元素
    const fileNameEl = document.getElementById('fileName');
    const fileSizeEl = document.getElementById('fileSize');
    const pageCountEl = document.getElementById('pageCount');
    const convertContainerEl = document.getElementById('convertContainer');
    
    // 检查元素是否存在
    if (!fileNameEl || !fileSizeEl || !pageCountEl || !convertContainerEl) {
        console.error('找不到必要的DOM元素');
        showToast('页面元素加载失败');
        return;
    }
    
    // 显示文件信息
    fileNameEl.textContent = file.name;
    fileSizeEl.textContent = formatFileSize(file.size);
    
    try {
        // 读取文件为 ArrayBuffer
        const arrayBuffer = await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });

        // 加载 PDF 文件
        pdfDoc = await pdfjsLib.getDocument({
            data: arrayBuffer,
            cMapUrl: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/cmaps/',
            cMapPacked: true,
        }).promise;
        
        pageCountEl.textContent = `${pdfDoc.numPages}页`;
        convertContainerEl.style.display = 'grid';
        
        // 转换并显示预览
        await convertPages();
        
    } catch (error) {
        console.error('PDF处理错误:', error);
        showToast('PDF文件处理失败：' + (error.message || '未知错误'));
    }
}

// 更新进度条显示
function updateProgress(current, total) {
    const progressEl = document.getElementById('convertProgress');
    const progressBar = progressEl.querySelector('.progress-bar');
    const currentEl = progressEl.querySelector('.current');
    const totalEl = progressEl.querySelector('.total');
    
    const percentage = (current / total) * 100;
    progressBar.style.width = `${percentage}%`;
    currentEl.textContent = current;
    totalEl.textContent = total;
}

// 添加并发转换函数
async function convertPage(pageNum) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({scale: 1.5});
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: false });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    context.fillStyle = '#ffffff';
    context.fillRect(0, 0, canvas.width, canvas.height);
    
    await page.render({
        canvasContext: context,
        viewport: viewport,
        background: 'white',
        intent: 'display',
        enableWebGL: true
    }).promise;
    
    const imageUrl = canvas.toDataURL('image/png', 0.9);
    
    // 释放内存
    canvas.width = 0;
    canvas.height = 0;
    
    return {
        pageNum: pageNum,
        imageUrl: imageUrl
    };
}

// 修改主转换函数
async function convertPages() {
    const pageContainer = document.getElementById('pageContainer');
    const progressEl = document.getElementById('convertProgress');
    
    if (!pageContainer || !progressEl) {
        console.error('找不到必要的DOM元素');
        showToast('页面元素加载失败');
        return;
    }

    pageContainer.innerHTML = '';
    progressEl.style.display = 'block';
    updateProgress(0, pdfDoc.numPages);
    
    pageImages = [];
    let convertedCount = 0;
    
    try {
        // 使用并发处理，每次处理3页
        const batchSize = 3;
        for (let i = 1; i <= pdfDoc.numPages; i += batchSize) {
            const pagePromises = [];
            
            // 创建一批转换任务
            for (let j = 0; j < batchSize && i + j <= pdfDoc.numPages; j++) {
                pagePromises.push(convertPage(i + j));
            }
            
            // 等待当前批次完成
            const results = await Promise.all(pagePromises);
            
            // 按顺序保存结果
            results.forEach(result => {
                pageImages[result.pageNum - 1] = result.imageUrl;
                convertedCount++;
                updateProgress(convertedCount, pdfDoc.numPages);
            });
        }
        
        progressEl.style.display = 'none';
        updatePreview();
        
        const downloadBtn = document.getElementById('downloadBtn');
        if (downloadBtn) {
            downloadBtn.style.display = 'inline-flex';
        }
        
        showToast('转换完成！');
        
    } catch (error) {
        console.error('转换错误:', error);
        showToast('页面转换失败：' + (error.message || '未知错误'));
        progressEl.style.display = 'none';
    }
}

// 更新预览区域
function updatePreview() {
    const pageContainer = document.getElementById('pageContainer');
    const currentPage = document.getElementById('currentPage');
    const totalPages = document.getElementById('totalPages');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    pageContainer.innerHTML = '';
    
    if (pageImages.length > 0) {
        if (isGridLayout) {
            // 网格布局模式
            pageContainer.className = 'page-container grid-layout';
            currentPage.textContent = '1';
            totalPages.textContent = pageImages.length;
            prevBtn.disabled = true;
            nextBtn.disabled = true;
            
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
                
                // 点击缩略图切换到单页模式并显示对应页面
                pageItem.addEventListener('click', () => {
                    isGridLayout = false;
                    currentPageIndex = index;
                    const singlePageBtn = document.getElementById('singlePageBtn');
                    const gridPageBtn = document.getElementById('gridPageBtn');
                    
                    // 更新按钮样式
                    singlePageBtn.classList.add('active');
                    singlePageBtn.classList.add('btn-primary');
                    gridPageBtn.classList.remove('active');
                    gridPageBtn.classList.remove('btn-primary');
                    
                    updatePreview();
                });
            });
        } else {
            // 单页模式
            pageContainer.className = 'page-container';
            currentPage.textContent = currentPageIndex + 1;
            totalPages.textContent = pageImages.length;
            
            const img = document.createElement('img');
            img.src = pageImages[currentPageIndex];
            img.alt = `第 ${currentPageIndex + 1} 页`;
            img.style.transform = `scale(${zoomLevel / 100})`;
            
            const pageNumber = document.createElement('div');
            pageNumber.className = 'page-number';
            pageNumber.textContent = `第 ${currentPageIndex + 1} 页`;
            
            pageContainer.appendChild(img);
            pageContainer.appendChild(pageNumber);
            
            // 更新按钮状态
            prevBtn.disabled = currentPageIndex === 0;
            nextBtn.disabled = currentPageIndex === pageImages.length - 1;
        }
    }
}

// 页面导航
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPageIndex > 0) {
        currentPageIndex--;
        updatePreview();
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    if (currentPageIndex < pageImages.length - 1) {
        currentPageIndex++;
        updatePreview();
    }
});

// 缩放控制
document.getElementById('zoomIn').addEventListener('click', () => {
    if (zoomLevel < 200) {
        zoomLevel += 25;
        document.getElementById('zoomLevel').textContent = `${zoomLevel}%`;
        updatePreview();
    }
});

document.getElementById('zoomOut').addEventListener('click', () => {
    if (zoomLevel > 50) {
        zoomLevel -= 25;
        document.getElementById('zoomLevel').textContent = `${zoomLevel}%`;
        updatePreview();
    }
});

// 键盘快捷键
document.addEventListener('keydown', (e) => {
    if (pageImages.length === 0) return;
    
    switch(e.key) {
        case 'ArrowLeft':
            if (currentPageIndex > 0) {
                currentPageIndex--;
                updatePreview();
            }
            break;
        case 'ArrowRight':
            if (currentPageIndex < pageImages.length - 1) {
                currentPageIndex++;
                updatePreview();
            }
            break;
        case '+':
        case '=':
            if (zoomLevel < 200) {
                zoomLevel += 25;
                document.getElementById('zoomLevel').textContent = `${zoomLevel}%`;
                updatePreview();
            }
            break;
        case '-':
            if (zoomLevel > 50) {
                zoomLevel -= 25;
                document.getElementById('zoomLevel').textContent = `${zoomLevel}%`;
                updatePreview();
            }
            break;
    }
});

// 导出质量配置
const exportConfigs = {
    fast: {
        scale: 1.5,
        quality: 0.9
    },
    high: {
        scale: 2.0,
        quality: 1.0
    }
};

// 导出单页图片
async function exportPage(pageNum, config, format) {
    const page = await pdfDoc.getPage(pageNum);
    const viewport = page.getViewport({scale: config.scale});
    
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d', { alpha: format === 'png' });
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    
    if (format !== 'png') {
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    await page.render({
        canvasContext: context,
        viewport: viewport,
        background: 'white',
        intent: 'print'
    }).promise;
    
    const imageUrl = canvas.toDataURL(`image/${format}`, config.quality);
    
    // 释放内存
    canvas.width = 0;
    canvas.height = 0;
    
    return imageUrl;
}

// 处理导出
async function handleExport() {
    try {
        const quality = document.querySelector('input[name="quality"]:checked').value;
        const format = document.querySelector('input[name="format"]:checked').value;
        const config = exportConfigs[quality];
        
        showToast(quality === 'high' ? '正在生成高清图片...' : '正在导出图片...');
        
        const zip = new JSZip();
        const pdfName = pdfFile.name.replace('.pdf', '');
        
        // 显示进度条
        const progressEl = document.getElementById('convertProgress');
        progressEl.style.display = 'block';
        updateProgress(0, pdfDoc.numPages);
        
        // 分批处理导出
        const batchSize = 3;
        for (let i = 1; i <= pdfDoc.numPages; i += batchSize) {
            const pagePromises = [];
            
            for (let j = 0; j < batchSize && i + j <= pdfDoc.numPages; j++) {
                pagePromises.push(exportPage(i + j, config, format));
            }
            
            const results = await Promise.all(pagePromises);
            
            results.forEach((imageUrl, idx) => {
                const pageNum = i + idx;
                const imageData = imageUrl.split(',')[1];
                zip.file(`${pdfName}_第${pageNum}页.${format}`, imageData, {base64: true});
                updateProgress(pageNum, pdfDoc.numPages);
            });
        }
        
        // 隐藏进度条
        progressEl.style.display = 'none';
        
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
        console.error('导出错误:', error);
        showToast('导出失败');
    }
}

// 修改下载按钮点击事件
document.getElementById('downloadBtn').addEventListener('click', () => {
    if (!pageImages.length) return;
    handleExport();
});

// 工具函数：格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 布局切换处理
document.getElementById('singlePageBtn').addEventListener('click', () => {
    if (isGridLayout) {
        isGridLayout = false;
        const singlePageBtn = document.getElementById('singlePageBtn');
        const gridPageBtn = document.getElementById('gridPageBtn');
        
        // 更新单页模式按钮样式
        singlePageBtn.classList.add('active');
        singlePageBtn.classList.add('btn-primary');
        
        // 更新网格模式按钮样式
        gridPageBtn.classList.remove('active');
        gridPageBtn.classList.remove('btn-primary');
        
        updatePreview();
    }
});

document.getElementById('gridPageBtn').addEventListener('click', () => {
    if (!isGridLayout) {
        isGridLayout = true;
        const singlePageBtn = document.getElementById('singlePageBtn');
        const gridPageBtn = document.getElementById('gridPageBtn');
        
        // 更新网格模式按钮样式
        gridPageBtn.classList.add('active');
        gridPageBtn.classList.add('btn-primary');
        
        // 更新单页模式按钮样式
        singlePageBtn.classList.remove('active');
        singlePageBtn.classList.remove('btn-primary');
        
        updatePreview();
    }
});
