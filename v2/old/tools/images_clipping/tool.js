document.addEventListener('DOMContentLoaded', () => {
    // DOM 元素
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previewSection = document.getElementById('previewSection');
    const resultSection = document.getElementById('resultSection');
    const imagePreview = document.getElementById('imagePreview');
    const previewCanvas = document.getElementById('previewCanvas');
    const cropBox = document.getElementById('cropBox');
    const cropSizeEl = document.getElementById('cropSize');
    const originalSizeEl = document.getElementById('originalSize');
    const resultImage = document.getElementById('resultImage');
    
    // 工具按钮
    const rotateLeftBtn = document.getElementById('rotateLeftBtn');
    const rotateRightBtn = document.getElementById('rotateRightBtn');
    const flipHBtn = document.getElementById('flipHBtn');
    const flipVBtn = document.getElementById('flipVBtn');
    const resetBtn = document.getElementById('resetBtn');
    const deleteImageBtn = document.getElementById('deleteImageBtn');
    
    // 设置按钮
    const ratioBtns = document.querySelectorAll('.ratio-btn');
    const cropBtn = document.getElementById('cropBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const continueBtn = document.getElementById('continueBtn');
    const fileInfo = document.getElementById('fileInfo');
    const fileFormat = document.getElementById('fileFormat');
    const fileSize = document.getElementById('fileSize');

    // 格式选择按钮
    const formatOptions = document.querySelectorAll('.format-option');
    
    // 格式选择处理
    formatOptions.forEach(option => {
        option.addEventListener('click', () => {
            formatOptions.forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
        });
    });
    
    // 变量
    let currentImage = null;
    let currentFile = null;
    let originalExtension = 'png';
    let ctx = previewCanvas.getContext('2d');
    let rotation = 0;
    let flipH = false;
    let flipV = false;
    let currentRatio = 'free';
    let isDragging = false;
    let isResizing = false;
    let resizeHandle = null;
    let startX = 0;
    let startY = 0;
    let cropData = { x: 0, y: 0, width: 0, height: 0 };
    let canvasScale = 1;
    let canvasOffsetX = 0;
    let canvasOffsetY = 0;

    // 文件上传处理
    uploadArea.addEventListener('click', () => fileInput.click());
    
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
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        }
    });
    
    fileInput.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleImageUpload(e.target.files[0]);
        }
    });

    // 粘贴上传
    document.addEventListener('paste', (e) => {
        const items = e.clipboardData.items;
        for (let item of items) {
            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile();
                handleImageUpload(file);
                e.preventDefault();
                break;
            }
        }
    });

    // 图片上传处理
    function handleImageUpload(file) {
        currentFile = file;
        
        // 获取文件格式信息
        originalExtension = file.name.split('.').pop().toLowerCase();
        
        // 显示文件信息
        fileFormat.textContent = originalExtension.toUpperCase();
        fileSize.textContent = formatFileSize(file.size);
        fileInfo.style.display = 'block';
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                currentImage = img;
                rotation = 0;
                flipH = false;
                flipV = false;
                
                uploadArea.style.display = 'none';
                previewSection.style.display = 'block';
                resultSection.style.display = 'none';
                
                setTimeout(() => {
                    displayImage();
                    initCropBox();
                    toggleSettings(true);
                }, 0);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    // 格式化文件大小
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
    }

    // 显示图片
    function displayImage() {
        if (!currentImage) return;
        
        const container = imagePreview;
        const containerWidth = container.offsetWidth;
        const containerHeight = container.offsetHeight;
        
        let imgWidth = currentImage.width;
        let imgHeight = currentImage.height;
        
        // 考虑旋转
        if (rotation % 180 !== 0) {
            [imgWidth, imgHeight] = [imgHeight, imgWidth];
        }
        
        // 计算缩放比例
        const scaleX = containerWidth / imgWidth;
        const scaleY = containerHeight / imgHeight;
        canvasScale = Math.min(scaleX, scaleY, 1);
        
        const displayWidth = imgWidth * canvasScale;
        const displayHeight = imgHeight * canvasScale;
        
        canvasOffsetX = (containerWidth - displayWidth) / 2;
        canvasOffsetY = (containerHeight - displayHeight) / 2;
        
        previewCanvas.width = displayWidth;
        previewCanvas.height = displayHeight;
        previewCanvas.style.width = displayWidth + 'px';
        previewCanvas.style.height = displayHeight + 'px';
        
        // 绘制图片
        ctx.save();
        ctx.clearRect(0, 0, displayWidth, displayHeight);
        ctx.translate(displayWidth / 2, displayHeight / 2);
        ctx.rotate((rotation * Math.PI) / 180);
        ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
        
        const drawWidth = rotation % 180 === 0 ? displayWidth : displayHeight;
        const drawHeight = rotation % 180 === 0 ? displayHeight : displayWidth;
        
        ctx.drawImage(currentImage, -drawWidth / 2, -drawHeight / 2, drawWidth, drawHeight);
        ctx.restore();
        
        // 更新原始尺寸显示
        originalSizeEl.textContent = `${currentImage.width} × ${currentImage.height}`;
    }

    // 初始化裁剪框
    function initCropBox() {
        const canvasRect = previewCanvas.getBoundingClientRect();
        const containerRect = imagePreview.getBoundingClientRect();
        
        const boxWidth = previewCanvas.width;
        const boxHeight = previewCanvas.height;
        
        cropData = {
            x: 0,
            y: 0,
            width: boxWidth,
            height: boxHeight
        };
        
        updateCropBox();
        cropBox.classList.add('active');
    }

    // 更新裁剪框位置和大小
    function updateCropBox() {
        const canvasRect = previewCanvas.getBoundingClientRect();
        const containerRect = imagePreview.getBoundingClientRect();
        
        const left = canvasRect.left - containerRect.left + cropData.x;
        const top = canvasRect.top - containerRect.top + cropData.y;
        
        cropBox.style.left = left + 'px';
        cropBox.style.top = top + 'px';
        cropBox.style.width = cropData.width + 'px';
        cropBox.style.height = cropData.height + 'px';
        
        // 更新裁剪尺寸显示
        const actualWidth = Math.round(cropData.width / canvasScale);
        const actualHeight = Math.round(cropData.height / canvasScale);
        cropSizeEl.textContent = `${actualWidth} × ${actualHeight}`;
    }

    // 裁剪框拖动
    cropBox.addEventListener('mousedown', (e) => {
        if (e.target.classList.contains('crop-handle')) {
            isResizing = true;
            resizeHandle = e.target.classList[1];
        } else {
            isDragging = true;
        }
        
        startX = e.clientX;
        startY = e.clientY;
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isDragging && !isResizing) return;
        
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        if (isDragging) {
            cropData.x += dx;
            cropData.y += dy;
            
            // 限制在画布内
            cropData.x = Math.max(0, Math.min(cropData.x, previewCanvas.width - cropData.width));
            cropData.y = Math.max(0, Math.min(cropData.y, previewCanvas.height - cropData.height));
        } else if (isResizing) {
            resizeCropBox(dx, dy);
        }
        
        startX = e.clientX;
        startY = e.clientY;
        updateCropBox();
    });

    document.addEventListener('mouseup', () => {
        isDragging = false;
        isResizing = false;
        resizeHandle = null;
    });

    // 调整裁剪框大小
    function resizeCropBox(dx, dy) {
        const minSize = 50;
        let newX = cropData.x;
        let newY = cropData.y;
        let newWidth = cropData.width;
        let newHeight = cropData.height;
        
        switch (resizeHandle) {
            case 'nw':
                newX += dx;
                newY += dy;
                newWidth -= dx;
                newHeight -= dy;
                break;
            case 'ne':
                newY += dy;
                newWidth += dx;
                newHeight -= dy;
                break;
            case 'sw':
                newX += dx;
                newWidth -= dx;
                newHeight += dy;
                break;
            case 'se':
                newWidth += dx;
                newHeight += dy;
                break;
            case 'n':
                newY += dy;
                newHeight -= dy;
                break;
            case 's':
                newHeight += dy;
                break;
            case 'w':
                newX += dx;
                newWidth -= dx;
                break;
            case 'e':
                newWidth += dx;
                break;
        }
        
        // 应用比例限制
        if (currentRatio !== 'free') {
            const [ratioW, ratioH] = currentRatio.split(':').map(Number);
            const ratio = ratioW / ratioH;
            
            if (resizeHandle.includes('e') || resizeHandle.includes('w')) {
                newHeight = newWidth / ratio;
            } else {
                newWidth = newHeight * ratio;
            }
            
            if (resizeHandle.includes('n') || resizeHandle.includes('w')) {
                if (resizeHandle.includes('n')) newY = cropData.y + cropData.height - newHeight;
                if (resizeHandle.includes('w')) newX = cropData.x + cropData.width - newWidth;
            }
        }
        
        // 限制最小尺寸和边界
        if (newWidth >= minSize && newHeight >= minSize &&
            newX >= 0 && newY >= 0 &&
            newX + newWidth <= previewCanvas.width &&
            newY + newHeight <= previewCanvas.height) {
            cropData.x = newX;
            cropData.y = newY;
            cropData.width = newWidth;
            cropData.height = newHeight;
        }
    }

    // 比例按钮
    ratioBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            ratioBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRatio = btn.dataset.ratio;
            
            if (currentRatio !== 'free') {
                const [ratioW, ratioH] = currentRatio.split(':').map(Number);
                const targetRatio = ratioW / ratioH;
                
                const canvasWidth = previewCanvas.width;
                const canvasHeight = previewCanvas.height;
                const canvasRatio = canvasWidth / canvasHeight;
                
                let newWidth, newHeight;
                
                // 计算最大化的裁剪框尺寸
                if (targetRatio > canvasRatio) {
                    // 目标比画布更宽，宽度撑满画布，高度自适应
                    newWidth = canvasWidth;
                    newHeight = newWidth / targetRatio;
                } else {
                    // 目标比画布更高或一样，高度撑满画布，宽度自适应
                    newHeight = canvasHeight;
                    newWidth = newHeight * targetRatio;
                }
                
                // 居中裁剪框
                cropData.width = newWidth;
                cropData.height = newHeight;
                cropData.x = (canvasWidth - newWidth) / 2;
                cropData.y = (canvasHeight - newHeight) / 2;
                
                updateCropBox();
            }
        });
    });

    // 旋转和翻转
    rotateLeftBtn.addEventListener('click', () => {
        rotation = (rotation - 90 + 360) % 360;
        displayImage();
        initCropBox();
    });

    rotateRightBtn.addEventListener('click', () => {
        rotation = (rotation + 90) % 360;
        displayImage();
        initCropBox();
    });

    flipHBtn.addEventListener('click', () => {
        flipH = !flipH;
        displayImage();
    });

    flipVBtn.addEventListener('click', () => {
        flipV = !flipV;
        displayImage();
    });

    resetBtn.addEventListener('click', () => {
        rotation = 0;
        flipH = false;
        flipV = false;
        displayImage();
        initCropBox();
    });

    deleteImageBtn.addEventListener('click', () => {
        currentImage = null;
        currentFile = null;
        previewSection.style.display = 'none';
        resultSection.style.display = 'none';
        uploadArea.style.display = 'block';
        cropBox.classList.remove('active');
        fileInput.value = '';
        toggleSettings(true);
        cropBtn.disabled = true;
        fileInfo.style.display = 'none';
    });

    // 裁剪按钮
    cropBtn.addEventListener('click', () => {
        performCrop();
    });

    // 执行裁剪
    function performCrop() {
        if (!currentImage) return;
        
        try {
            // 1. 计算变换后的图像尺寸
            const isRotated = rotation % 180 !== 0;
            const transformedWidth = isRotated ? currentImage.height : currentImage.width;
            const transformedHeight = isRotated ? currentImage.width : currentImage.height;

            // 2. 创建临时画布绘制完整的变换图像
            const fullCanvas = document.createElement('canvas');
            fullCanvas.width = transformedWidth;
            fullCanvas.height = transformedHeight;
            const fullCtx = fullCanvas.getContext('2d');
            
            // 3. 绘制变换后的图像
            fullCtx.save();
            fullCtx.translate(transformedWidth / 2, transformedHeight / 2);
            fullCtx.rotate((rotation * Math.PI) / 180);
            fullCtx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
            fullCtx.drawImage(
                currentImage,
                -currentImage.width / 2,
                -currentImage.height / 2
            );
            fullCtx.restore();

            // 获取输出设置
            const activeFormat = document.querySelector('.format-option.active');
            let mimeType = activeFormat ? activeFormat.dataset.format : 'image/jpeg';
            let quality = 1.0;

            // 4. 计算裁剪区域（映射回变换后的图像坐标系）
            const cropX = cropData.x / canvasScale;
            const cropY = cropData.y / canvasScale;
            const cropW = cropData.width / canvasScale;
            const cropH = cropData.height / canvasScale;

            // 5. 创建结果画布
            const resultCanvas = document.createElement('canvas');
            resultCanvas.width = cropW;
            resultCanvas.height = cropH;
            const resultCtx = resultCanvas.getContext('2d');

            // 如果是 JPG，填充白色背景（处理透明图片转JPG变黑的问题）
            if (mimeType === 'image/jpeg') {
                resultCtx.fillStyle = '#FFFFFF';
                resultCtx.fillRect(0, 0, cropW, cropH);
            }
            
            // 6. 从变换后的图像中截取
            resultCtx.drawImage(
                fullCanvas,
                cropX, cropY, cropW, cropH,
                0, 0, cropW, cropH
            );
            
            // 转换为图片
            const dataUrl = resultCanvas.toDataURL(mimeType, quality);
            resultImage.src = dataUrl;
            
            // 更新下载时的文件扩展名
            if (activeFormat) {
                 const extMap = {
                     'image/jpeg': 'jpg',
                     'image/png': 'png',
                     'image/webp': 'webp'
                 };
                 originalExtension = extMap[mimeType] || 'jpg';
            }

            previewSection.style.display = 'none';
            resultSection.style.display = 'block';
            toggleSettings(false);
            
            showToast('裁剪完成！');
        } catch (error) {
            console.error('Crop error:', error);
            showToast('裁剪失败: ' + error.message);
        }
    }

    // 下载按钮
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        const fileName = currentFile ? currentFile.name.replace(/\.[^/.]+$/, '') : 'cropped-image';
        link.download = `${fileName}-cropped.${originalExtension}`;
        link.href = resultImage.src;
        link.click();
        showToast('图片已下载！');
    });

    // 继续裁剪
    continueBtn.addEventListener('click', () => {
        resultSection.style.display = 'none';
        previewSection.style.display = 'block';
        toggleSettings(true);
    });

    // 快捷键
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !cropBtn.disabled) {
            performCrop();
        } else if (e.key === 'Escape') {
            if (resultSection.style.display === 'block') {
                continueBtn.click();
            } else if (previewSection.style.display === 'block') {
                resetBtn.click();
            }
        } else if (e.key === 'Delete' && previewSection.style.display === 'block') {
            deleteImageBtn.click();
        }
    });

    // 切换设置面板状态
    function toggleSettings(enable) {
        cropBtn.disabled = !enable;
        
        const setStatus = (elements) => {
            elements.forEach(el => {
                el.style.pointerEvents = enable ? 'auto' : 'none';
                el.style.opacity = enable ? '1' : '0.5';
            });
        };
        
        setStatus(ratioBtns);
        setStatus(formatOptions);
    }

    // Toast 提示
    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }
});
