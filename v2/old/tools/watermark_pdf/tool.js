// 引入 PDF.js
const pdfjsLib = window['pdfjs-dist/build/pdf'];

// 初始化 PDF.js
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewCanvas = document.getElementById('previewCanvas');
const ctx = previewCanvas.getContext('2d');
const downloadBtn = document.getElementById('downloadBtn');
const pageNavigation = document.querySelector('.page-navigation');
const prevPageBtn = document.getElementById('prevPage');
const nextPageBtn = document.getElementById('nextPage');
const pageInfo = document.getElementById('pageInfo');

// 水印设置相关元素
const watermarkText = document.getElementById('watermarkText');
const fontSize = document.getElementById('fontSize');
const fontColor = document.getElementById('fontColor');
const opacity = document.getElementById('opacity');
const tileSettings = document.getElementById('tileSettings');

// 状态变量
let pdfDoc = null;
let currentPage = 1;
let watermarkType = 'text';
let watermarkMode = 'single';
let selectedPosition = 'middle-center';
let watermarkImage = null;

// 添加页面范围相关变量
const pageRange = document.getElementById('pageRange');
let selectedPages = [];
const rangeTypeButtons = document.querySelectorAll('.page-range-type .btn-group-option');
const customRangeSettings = document.getElementById('customRangeSettings');
const rangeTypeRadios = document.getElementsByName('rangeType');
const intervalSettings = document.querySelector('.interval-settings');
const intervalStart = document.getElementById('intervalStart');
const intervalStep = document.getElementById('intervalStep');

// 添加防抖函数
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 修改更新预览函数
const debouncedRenderPage = debounce(async (pageNum) => {
    await renderPage(pageNum);
}, 300);

// 初始化事件监听
function initEventListeners() {
    // 文件拖放
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
        handlePdfUpload(e.dataTransfer.files[0]);
    });

    // 文件选择
    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', (e) => handlePdfUpload(e.target.files[0]));

    // 水印类型切换
    document.querySelectorAll('[data-type]').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('[data-type]').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            watermarkType = option.dataset.type;
            document.getElementById('textSettings').style.display = watermarkType === 'text' ? 'block' : 'none';
            document.getElementById('imageSettings').style.display = watermarkType === 'image' ? 'block' : 'none';
            updatePreview();
        });
    });

    // 水印模式切换
    document.querySelectorAll('[data-mode]').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('[data-mode]').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            watermarkMode = option.dataset.mode;
            
            // 根据水印模式显示/隐藏相关设置
            tileSettings.style.display = watermarkMode === 'tile' ? 'block' : 'none';
            // 添加这行：控制位置选择的显示/隐藏
            document.querySelector('.position-grid').closest('.form-group').style.display = 
                watermarkMode === 'single' ? 'block' : 'none';
            
            updatePreview();
        });
    });

    // 实时预览
    [watermarkText, fontSize, fontColor, opacity].forEach(input => {
        input.addEventListener('input', () => debouncedRenderPage(currentPage));
    });

    // 页面导航
    prevPageBtn?.addEventListener('click', () => {
        if (currentPage > 1) {
            currentPage--;
            debouncedRenderPage(currentPage);
            updatePageButtons();
            pageInfo.textContent = `第 ${currentPage} 页，共 ${pdfDoc.numPages} 页`;
        }
    });
    
    nextPageBtn?.addEventListener('click', () => {
        if (currentPage < pdfDoc.numPages) {
            currentPage++;
            debouncedRenderPage(currentPage);
            updatePageButtons();
            pageInfo.textContent = `第 ${currentPage} 页，共 ${pdfDoc.numPages} 页`;
        }
    });

    // 下载按钮
    downloadBtn.addEventListener('click', downloadPdf);

    // 页面范围输入监听
    pageRange.addEventListener('input', () => {
        parsePageRange();
        updatePreview();
    });

    // 全部/自定义范围切换
    rangeTypeButtons.forEach(button => {
        button.addEventListener('click', () => {
            rangeTypeButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            customRangeSettings.style.display = 
                button.dataset.range === 'custom' ? 'block' : 'none';
            updatePageRange();
        });
    });

    // 范围类型切换
    rangeTypeRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            intervalSettings.style.display = 
                radio.value === 'interval' ? 'block' : 'none';
            updatePageRange();
        });
    });

    // 间隔设置变化
    [intervalStart, intervalStep].forEach(input => {
        input.addEventListener('input', updatePageRange);
    });

    // 图片上传处理
    const watermarkUpload = document.getElementById('watermarkUpload');
    const watermarkInput = document.getElementById('watermarkInput');
    const watermarkPreview = document.getElementById('watermarkPreview');

    watermarkUpload.addEventListener('click', () => watermarkInput.click());
    watermarkInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file || !file.type.startsWith('image/')) {
            showToast('请选择有效的图片文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                watermarkImage = img;
                watermarkPreview.src = e.target.result;
                document.querySelector('.upload-content').style.display = 'none';
                document.querySelector('.preview-content').style.display = 'block';
                updatePreview();
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });

    // 水印位置选择
    document.querySelectorAll('.position-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.position-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            selectedPosition = option.dataset.position;
            debouncedRenderPage(currentPage);
        });
    });

    // 铺满水印设置监听
    const tileRotation = document.getElementById('tileRotation');
    const tileSpacingX = document.getElementById('tileSpacingX');
    const tileSpacingY = document.getElementById('tileSpacingY');

    [tileRotation, tileSpacingX, tileSpacingY].forEach(input => {
        input.addEventListener('input', () => {
            // 更新显示值
            const display = input.nextElementSibling;
            if (display) {
                const value = input.value;
                display.textContent = input.id === 'tileRotation' ? 
                    `${value}°` : `${value}%`;
            }
            updatePreview();
        });
    });

    // 角度预设点击事件
    document.querySelectorAll('.angle-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.angle-option').forEach(opt => 
                opt.classList.remove('active'));
            option.classList.add('active');
            const angle = option.dataset.angle;
            tileRotation.value = angle;
            tileRotation.nextElementSibling.textContent = `${angle}°`;
            updatePreview();
        });
    });

    // 添加清空水印功能
    const clearBtn = document.getElementById('clearBtn');

    clearBtn.addEventListener('click', () => {
        // 重置水印相关设置
        watermarkText.value = '';
        fontSize.value = '24';
        fontColor.value = '#000000';
        opacity.value = '50';
        watermarkImage = null;
        
        // 重置图片上传区域
        document.querySelector('.upload-content').style.display = 'block';
        document.querySelector('.preview-content').style.display = 'none';
        
        // 更新预览
        updatePreview();
    });

    // 添加文字大小显示更新
    fontSize.addEventListener('input', () => {
        fontSize.nextElementSibling.textContent = `${fontSize.value}px`;
        debouncedRenderPage(currentPage);
    });

    // 添加图片大小显示更新
    const watermarkSize = document.getElementById('watermarkSize');
    watermarkSize.addEventListener('input', () => {
        watermarkSize.nextElementSibling.textContent = `${watermarkSize.value}%`;
        debouncedRenderPage(currentPage);
    });
}

// 处理PDF文件上传
async function handlePdfUpload(file) {
    if (!file || file.type !== 'application/pdf') {
        showToast('请选择有效的PDF文件');
        return;
    }

    try {
        const arrayBuffer = await file.arrayBuffer();
        // 先清除旧的 pdfDoc
        if (pdfDoc) {
            pdfDoc.destroy();
        }
        pdfDoc = await pdfjsLib.getDocument({data: arrayBuffer}).promise;
        
        // 获取第一页来确定页面比例
        const firstPage = await pdfDoc.getPage(1);
        const viewport = firstPage.getViewport({ scale: 1.0 });
        
        // 设置容器宽高比
        const container = document.querySelector('.canvas-container');
        const aspectRatio = viewport.width / viewport.height;
        container.style.aspectRatio = `${aspectRatio}`;
        
        // 初始化页面范围（默认选择所有页面）
        currentPage = 1;  // 重置当前页码
        parsePageRange();
        
        // 显示预览区域和页面导航
        document.querySelector('.preview-area').style.display = 'flex';
        pageNavigation.style.display = 'flex';
        pageInfo.textContent = `第 ${currentPage} 页，共 ${pdfDoc.numPages} 页`;
        
        // 更新翻页按钮状态
        updatePageButtons();
        
        // 使用延迟渲染
        delayedRender(1);
        
        // 启用下载按钮
        downloadBtn.disabled = false;
        clearBtn.disabled = false;
    } catch (error) {
        console.error('PDF加载失败:', error);
        showToast('PDF文件加载失败');
    }
}

// 渲染PDF页面
async function renderPage(pageNumber) {
    try {
        const page = await pdfDoc.getPage(pageNumber);
        const originalViewport = page.getViewport({ scale: 1.0 });
        
        // 获取容器尺寸
        const container = document.querySelector('.canvas-container');
        if (!container) {
            throw new Error('预览容器不存在');
        }
        
        // 计算适合容器的缩放比例
        const containerWidth = container.clientWidth - 40;
        const containerHeight = container.clientHeight - 40;
        
        let scale = 1.0;
        if (containerWidth && containerHeight) {
            const scaleX = containerWidth / originalViewport.width;
            const scaleY = containerHeight / originalViewport.height;
            scale = Math.min(scaleX, scaleY);
        }
        
        // 使用计算出的缩放比例创建新的视口
        const viewport = page.getViewport({ scale });
        
        // 设置画布尺寸
        previewCanvas.width = viewport.width;
        previewCanvas.height = viewport.height;
        
        // 保存页面信息到 canvas 元素，供水印使用
        previewCanvas.pdfPageInfo = {
            width: originalViewport.width,
            height: originalViewport.height,
            scale: scale
        };
        
        // 清除画布
        ctx.clearRect(0, 0, previewCanvas.width, previewCanvas.height);
        
        // 渲染PDF页面
        await page.render({
            canvasContext: ctx,
            viewport: viewport
        }).promise;
        
        // 添加水印
        if (watermarkType === 'text' && watermarkText.value) {
            addWatermark();
        } else if (watermarkType === 'image' && watermarkImage) {
            addImageWatermark();
        }
        
        // ... 其他代码保持不变
    } catch (error) {
        console.error('页面渲染失败:', error);
        showToast('页面渲染失败');
    }
}

// 添加一个延迟渲染函数
function delayedRender(pageNumber) {
    setTimeout(() => {
        renderPage(pageNumber);
    }, 100); // 延迟100ms等待DOM更新
}

// 添加窗口大小变化监听
window.addEventListener('resize', () => {
    if (pdfDoc) {
        renderPage(currentPage);
    }
});

// 添加水印
function addWatermark() {
    const text = watermarkText.value;
    const size = fontSize.value;
    const color = fontColor.value;
    const alpha = opacity.value / 100;

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.font = `${size}px Arial`;
    ctx.fillStyle = color;
    ctx.textBaseline = 'middle';
    
    if (watermarkMode === 'tile') {
        addTileWatermark(text);
    } else {
        addSingleWatermark(text);
    }
    
    ctx.restore();
}

// 添加单个水印
function addSingleWatermark(text) {
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = parseInt(fontSize.value);
    const position = calculatePosition(textWidth, textHeight);
    
    // 添加文字水印
    ctx.textAlign = 'center'; // 添加这行以确保文字水平居中
    ctx.fillText(text, position.x, position.y);
}

// 添加平铺水印
async function addTileWatermark(text) {
    const metrics = ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = parseInt(fontSize.value);
    
    const rotation = (parseInt(tileRotation.value) * Math.PI) / 180;
    const spacingX = textWidth * (parseInt(tileSpacingX.value) / 100);
    const spacingY = textHeight * (parseInt(tileSpacingY.value) / 100);
    
    ctx.translate(previewCanvas.width/2, previewCanvas.height/2);
    ctx.rotate(rotation);
    ctx.translate(-previewCanvas.width/2, -previewCanvas.height/2);
    
    const diagonal = Math.sqrt(previewCanvas.width * previewCanvas.width + previewCanvas.height * previewCanvas.height);
    
    // 增加水印密度
    const density = 1.5; // 可以调整这个值来控制水印密度
    for (let y = -diagonal * density; y < diagonal * density; y += spacingY) {
        for (let x = -diagonal * density; x < diagonal * density; x += spacingX) {
            ctx.fillText(text, x, y);
        }
    }
}

// 计算水印位置
function calculatePosition(width, height) {
    const padding = 40;
    
    // 获取PDF页面信息
    const pageInfo = previewCanvas.pdfPageInfo || {
        width: previewCanvas.width,
        height: previewCanvas.height,
        scale: 1
    };
    
    // 使用PDF页面的实际尺寸
    const canvasWidth = pageInfo.width * pageInfo.scale;
    const canvasHeight = pageInfo.height * pageInfo.scale;
    
    // 计算水印尺寸（考虑缩放）
    const scaledWidth = width;
    const scaledHeight = height;
    
    const positions = {
        'top-left': { 
            x: padding + scaledWidth/2, 
            y: padding + scaledHeight/2 
        },
        'top-center': { 
            x: canvasWidth/2, 
            y: padding + scaledHeight/2 
        },
        'top-right': { 
            x: canvasWidth - padding - scaledWidth/2, 
            y: padding + scaledHeight/2 
        },
        'middle-left': { 
            x: padding + scaledWidth/2, 
            y: canvasHeight/2 
        },
        'middle-center': { 
            x: canvasWidth/2, 
            y: canvasHeight/2 
        },
        'middle-right': { 
            x: canvasWidth - padding - scaledWidth/2, 
            y: canvasHeight/2 
        },
        'bottom-left': { 
            x: padding + scaledWidth/2, 
            y: canvasHeight - padding - scaledHeight/2 
        },
        'bottom-center': { 
            x: canvasWidth/2, 
            y: canvasHeight - padding - scaledHeight/2 
        },
        'bottom-right': { 
            x: canvasWidth - padding - scaledWidth/2, 
            y: canvasHeight - padding - scaledHeight/2 
        }
    };

    return positions[selectedPosition] || positions['middle-center'];
}

// 添加进度提示函数
function updateProgress(current, total) {
    const percent = Math.round((current / total) * 100);
    downloadBtn.textContent = `处理中 ${percent}%`;
}

// 修改 downloadPdf 函数
async function downloadPdf() {
    try {
        // 检查是否有选择页面范围
        if (!pdfDoc) {
            showToast('请先上传PDF文件');
            return;
        }

        // 检查水印内容
        if (watermarkType === 'text' && !watermarkText.value.trim()) {
            showToast('请输入水印文字');
            return;
        } else if (watermarkType === 'image' && !watermarkImage) {
            showToast('请上传水印图片');
            return;
        }

        // 更新页面范围
        updatePageRange();
        
        if (selectedPages.length === 0) {
            showToast('请选择要添加水印的页面范围');
            return;
        }

        // 显示加载提示
        downloadBtn.disabled = true;
        downloadBtn.textContent = '处理中 0%';
        
        // 创建新的PDF文档
        const newPdf = await PDFLib.PDFDocument.create();
        
        // 获取原始PDF数据
        const existingPdfBytes = await pdfDoc.getData();
        const existingPdf = await PDFLib.PDFDocument.load(existingPdfBytes);

        // 如果是图片水印，先将图片转换为 ArrayBuffer
        let watermarkImageData = null;
        if (watermarkType === 'image' && watermarkImage) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = watermarkImage.width;
            tempCanvas.height = watermarkImage.height;
            const tempCtx = tempCanvas.getContext('2d');
            tempCtx.drawImage(watermarkImage, 0, 0);
            const blob = await new Promise(resolve => tempCanvas.toBlob(resolve, 'image/png'));
            watermarkImageData = await blob.arrayBuffer();
        }
        
        // 复制选中的页面并添加水印
        for (let i = 0; i < selectedPages.length; i++) {
            const pageNum = selectedPages[i];
            
            // 更新进度
            updateProgress(i + 1, selectedPages.length);
            
            // 获取原始页面
            const [page] = await newPdf.copyPages(existingPdf, [pageNum - 1]);
            newPdf.addPage(page);
            
            // 获取页面尺寸
            const { width, height } = page.getSize();
            
            // 创建临时 canvas 用于渲染水印
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = width;
            tempCanvas.height = height;
            const tempCtx = tempCanvas.getContext('2d');
            
            // 使用与预览相同的渲染逻辑
            if (watermarkType === 'text' && watermarkText.value) {
                // 设置与预览相同的样式
                tempCtx.font = `${fontSize.value}px Arial`;
                tempCtx.fillStyle = fontColor.value;
                tempCtx.textBaseline = 'middle';
                tempCtx.globalAlpha = opacity.value / 100;
                
                if (watermarkMode === 'tile') {
                    // 铺满水印逻辑
                    const rotation = (parseInt(tileRotation.value) * Math.PI) / 180;
                    const metrics = tempCtx.measureText(watermarkText.value);
                    const textWidth = metrics.width;
                    const textHeight = parseInt(fontSize.value);
                    const spacingX = textWidth * (parseInt(tileSpacingX.value) / 100);
                    const spacingY = textHeight * (parseInt(tileSpacingY.value) / 100);
                    
                    tempCtx.translate(width/2, height/2);
                    tempCtx.rotate(rotation);
                    tempCtx.translate(-width/2, -height/2);
                    
                    const diagonal = Math.sqrt(width * width + height * height);
                    
                    // 增加水印密度
                    const density = 1.5; // 可以调整这个值来控制水印密度
                    for (let y = -diagonal * density; y < diagonal * density; y += spacingY) {
                        for (let x = -diagonal * density; x < diagonal * density; x += spacingX) {
                            tempCtx.fillText(watermarkText.value, x, y);
                        }
                    }
                } else {
                    // 单个水印逻辑
                    const metrics = tempCtx.measureText(watermarkText.value);
                    const textWidth = metrics.width;
                    const textHeight = parseInt(fontSize.value);
                    
                    // 修改这里：使用页面实际尺寸计算位置
                    const position = calculatePositionForPdf(textWidth, textHeight, width, height);
                    tempCtx.textAlign = 'center';
                    tempCtx.fillText(watermarkText.value, position.x, position.y);
                }
            } else if (watermarkType === 'image' && watermarkImage) {
                // 图片水印处理
                tempCtx.globalAlpha = opacity.value / 100;
                const size = parseInt(document.getElementById('watermarkSize').value) / 100;
                const watermarkWidth = width * size;
                const watermarkHeight = (watermarkImage.height / watermarkImage.width) * watermarkWidth;
                
                if (watermarkMode === 'tile') {
                    // 铺满图片水印逻辑
                    const rotation = (parseInt(tileRotation.value) * Math.PI) / 180;
                    const spacingX = watermarkWidth * (parseInt(tileSpacingX.value) / 100);
                    const spacingY = watermarkHeight * (parseInt(tileSpacingY.value) / 100);
                    
                    tempCtx.translate(width/2, height/2);
                    tempCtx.rotate(rotation);
                    tempCtx.translate(-width/2, -height/2);
                    
                    const diagonal = Math.sqrt(width * width + height * height);
                    const density = 1.5;
                    
                    for (let y = -diagonal * density; y < diagonal * density; y += spacingY) {
                        for (let x = -diagonal * density; x < diagonal * density; x += spacingX) {
                            tempCtx.drawImage(watermarkImage, x, y, watermarkWidth, watermarkHeight);
                        }
                    }
                } else {
                    // 单个图片水印逻辑
                    const watermarkWidth = width * size;
                    const watermarkHeight = (watermarkImage.height / watermarkImage.width) * watermarkWidth;
                    
                    // 修改这里：使用页面实际尺寸计算位置
                    const position = calculatePositionForPdf(watermarkWidth, watermarkHeight, width, height);
                    tempCtx.drawImage(watermarkImage,
                        position.x - watermarkWidth/2,
                        position.y - watermarkHeight/2,
                        watermarkWidth,
                        watermarkHeight
                    );
                }
            }
            
            // 将临时 canvas 的内容作为水印添加到 PDF
            const watermarkBytes = await fetch(tempCanvas.toDataURL('image/png')).then(res => res.arrayBuffer());
            const pdfWatermarkImage = await newPdf.embedPng(watermarkBytes);
            page.drawImage(pdfWatermarkImage, {
                x: 0,
                y: 0,
                width: width,
                height: height
            });
        }
        
        // 保存前更新进度为99%
        downloadBtn.textContent = '处理中 99%';
        const pdfBytes = await newPdf.save();
        
        // 下载文件
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'watermarked.pdf';
        link.click();
        URL.revokeObjectURL(url);
        
        showToast('PDF导出成功');
    } catch (error) {
        console.error('PDF导出失败:', error);
        showToast('PDF导出失败');
    } finally {
        // 恢复按钮状态
        downloadBtn.disabled = false;
        downloadBtn.textContent = '下载PDF';
    }
}

// 辅助函数：为 pdf-lib 转换颜色格式
function hexToRgbForPdfLib(hex) {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;
    return PDFLib.rgb(r, g, b);
}

// 辅助函数：为 pdf-lib 计算位置
function calculatePositionForPdfLib(width, height, fontSize) {
    const padding = 40;
    const positions = {
        'top-left': { 
            x: padding, 
            y: height - padding 
        },
        'top-center': { 
            x: width / 2, 
            y: height - padding 
        },
        'top-right': { 
            x: width - padding, 
            y: height - padding 
        },
        'middle-left': { 
            x: padding, 
            y: height / 2 
        },
        'middle-center': { 
            x: width / 2, 
            y: height / 2 
        },
        'middle-right': { 
            x: width - padding, 
            y: height / 2 
        },
        'bottom-left': { 
            x: padding, 
            y: padding + fontSize 
        },
        'bottom-center': { 
            x: width / 2, 
            y: padding + fontSize 
        },
        'bottom-right': { 
            x: width - padding, 
            y: padding + fontSize 
        }
    };

    return positions[selectedPosition] || positions['middle-center'];
}

// 解析页面范围
function parsePageRange() {
    const range = pageRange.value.trim();
    selectedPages = [];
    
    if (!range) {
        // 如果为空，则选择所有页面
        if (pdfDoc) {
            selectedPages = Array.from({length: pdfDoc.numPages}, (_, i) => i + 1);
        }
        return;
    }
    
    // 解析页面范围（例如：1-5,8,11-13）
    const parts = range.split(',');
    parts.forEach(part => {
        const rangeParts = part.trim().split('-');
        if (rangeParts.length === 1) {
            // 单个页码
            const page = parseInt(rangeParts[0]);
            if (!isNaN(page) && page > 0 && (!pdfDoc || page <= pdfDoc.numPages)) {
                selectedPages.push(page);
            }
        } else if (rangeParts.length === 2) {
            // 页码范围
            const start = parseInt(rangeParts[0]);
            const end = parseInt(rangeParts[1]);
            if (!isNaN(start) && !isNaN(end) && start > 0 && end >= start) {
                for (let i = start; i <= end && (!pdfDoc || i <= pdfDoc.numPages); i++) {
                    selectedPages.push(i);
                }
            }
        }
    });
    
    // 去重并排序
    selectedPages = [...new Set(selectedPages)].sort((a, b) => a - b);
}

// 更新页面范围
function updatePageRange() {
    if (!pdfDoc) return;

    const rangeType = document.querySelector('.page-range-type .active').dataset.range;
    if (rangeType === 'all') {
        selectedPages = Array.from({length: pdfDoc.numPages}, (_, i) => i + 1);
        return;
    }

    // 确保 selectedPages 被初始化为空数组
    selectedPages = [];

    const selectedRangeType = document.querySelector('input[name="rangeType"]:checked').value;
    switch (selectedRangeType) {
        case 'specific':
            parsePageRange();  // 直接调用 parsePageRange，不传参数
            break;
        case 'even':
            selectedPages = Array.from({length: Math.floor(pdfDoc.numPages/2)}, 
                (_, i) => (i + 1) * 2);
            break;
        case 'odd':
            selectedPages = Array.from({length: Math.ceil(pdfDoc.numPages/2)}, 
                (_, i) => i * 2 + 1)
                .filter(page => page <= pdfDoc.numPages);
            break;
        case 'interval':
            const start = parseInt(intervalStart.value) || 1;
            const step = parseInt(intervalStep.value) || 1;
            selectedPages = [];
            for (let i = start; i <= pdfDoc.numPages; i += step) {
                selectedPages.push(i);
            }
            break;
    }

    // 确保页面范围有效
    selectedPages = selectedPages.filter(page => page > 0 && page <= pdfDoc.numPages);
}

// 修改水印预览功能
function updatePreview() {
    if (!pdfDoc) return;
    renderPage(currentPage);
}

// 添加图片水印渲染函数
function addImageWatermark() {
    if (!watermarkImage) return;

    ctx.save();
    ctx.globalAlpha = opacity.value / 100;
    
    const size = parseInt(document.getElementById('watermarkSize').value) / 100;
    const watermarkWidth = previewCanvas.width * size;
    const watermarkHeight = (watermarkImage.height / watermarkImage.width) * watermarkWidth;
    
    if (watermarkMode === 'tile') {
        addTileImageWatermark(watermarkWidth, watermarkHeight);
    } else {
        addSingleImageWatermark(watermarkWidth, watermarkHeight);
    }
    
    ctx.restore();
}

// 添加单个图片水印
function addSingleImageWatermark(width, height) {
    const position = calculatePosition(width, height);
    
    // 在水印层上绘制图片
    ctx.drawImage(watermarkImage, 
        position.x - width/2,
        position.y - height/2,
        width, 
        height
    );
}

// 添加平铺图片水印
function addTileImageWatermark(width, height) {
    const rotation = (parseInt(tileRotation.value) * Math.PI) / 180;
    const spacingX = width * (parseInt(tileSpacingX.value) / 100);
    const spacingY = height * (parseInt(tileSpacingY.value) / 100);
    
    ctx.translate(previewCanvas.width/2, previewCanvas.height/2);
    ctx.rotate(rotation);
    ctx.translate(-previewCanvas.width/2, -previewCanvas.height/2);
    
    const diagonal = Math.sqrt(previewCanvas.width * previewCanvas.width + 
                             previewCanvas.height * previewCanvas.height);
    const density = 1.5;
    
    for (let y = -diagonal * density; y < diagonal * density; y += spacingY) {
        for (let x = -diagonal * density; x < diagonal * density; x += spacingX) {
            ctx.drawImage(watermarkImage, x, y, width, height);
        }
    }
}

// 添加新的位置计算函数，专门用于 PDF 导出
function calculatePositionForPdf(width, height, pageWidth, pageHeight) {
    const padding = 40;
    
    const positions = {
        'top-left': { 
            x: padding + width/2, 
            y: padding + height/2 
        },
        'top-center': { 
            x: pageWidth/2, 
            y: padding + height/2 
        },
        'top-right': { 
            x: pageWidth - padding - width/2, 
            y: padding + height/2 
        },
        'middle-left': { 
            x: padding + width/2, 
            y: pageHeight/2 
        },
        'middle-center': { 
            x: pageWidth/2, 
            y: pageHeight/2 
        },
        'middle-right': { 
            x: pageWidth - padding - width/2, 
            y: pageHeight/2 
        },
        'bottom-left': { 
            x: padding + width/2, 
            y: pageHeight - padding - height/2 
        },
        'bottom-center': { 
            x: pageWidth/2, 
            y: pageHeight - padding - height/2 
        },
        'bottom-right': { 
            x: pageWidth - padding - width/2, 
            y: pageHeight - padding - height/2 
        }
    };

    return positions[selectedPosition] || positions['middle-center'];
}

// 添加更新翻页按钮状态的函数
function updatePageButtons() {
    if (!pdfDoc) {
        prevPageBtn.disabled = true;
        nextPageBtn.disabled = true;
        return;
    }
    
    prevPageBtn.disabled = currentPage <= 1;
    nextPageBtn.disabled = currentPage >= pdfDoc.numPages;
}

// 初始化
initEventListeners();