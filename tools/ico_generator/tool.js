// DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewGrid = document.getElementById('previewGrid');
const convertBtn = document.getElementById('convertBtn');
const downloadBtn = document.getElementById('downloadBtn');
const sizeGrid = document.getElementById('sizeGrid');
const progressBar = document.querySelector('.progress-bar');
const progress = document.querySelector('.progress');

// 状态变量
let uploadedFiles = [];
let convertedFiles = [];
let selectedSystem = 'windows';

// 系统对应的尺寸
const systemSizes = {
    windows: [
        { size: 16, label: '16×16' },
        { size: 32, label: '32×32' },
        { size: 48, label: '48×48' },
        { size: 64, label: '64×64' },
        { size: 128, label: '128×128' },
        { size: 256, label: '256×256' },
        { size: 512, label: '512×512' }
    ],
    macos: [
        { size: 256, label: '256×256' },
        { size: 512, label: '512×512' },
        { size: 1024, label: '1024×1024' }
    ]
};

// 初始化尺寸选项
function updateSizeOptions() {
    const selectedSystem = document.querySelector('.option-tab.active').dataset.system;
    const sizes = systemSizes[selectedSystem];
    
    // 清空现有选项
    sizeGrid.innerHTML = '';
    
    // 添加所有尺寸选项，默认全部选中
    sizeGrid.innerHTML = sizes.map(({ size, label }) => {
        return `
            <label class="size-option">
                <input type="checkbox" value="${size}" checked>
                <div class="size-info">
                    <div class="size-value">${label}</div>
                </div>
            </label>
        `;
    }).join('');
}

// 系统选择切换
document.querySelectorAll('.option-tab').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelector('.option-tab.active').classList.remove('active');
        option.classList.add('active');
        selectedSystem = option.dataset.system;
        updateSizeOptions();
    });
});

// 初始化尺寸选项
updateSizeOptions();

// 上传区域拖拽处理
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
    handleFiles(e.dataTransfer.files);
});

// 点击上传
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    handleFiles(e.target.files);
});

// 处理上传的文件
function handleFiles(files) {
    uploadedFiles = [];
    previewGrid.innerHTML = '';
    convertBtn.disabled = true;
    downloadBtn.style.display = 'none';

    Array.from(files).forEach(file => {
        if (file.type.startsWith('image/')) {
            uploadedFiles.push({
                file: file,
                name: file.name
            });

            // 创建预览
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    const previewItem = createPreview(canvas, Math.max(img.width, img.height));
                    previewGrid.appendChild(previewItem);
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }
    });

    if (uploadedFiles.length > 0) {
        convertBtn.disabled = false;
    }
}

// 移除文件
window.removeFile = function(btn) {
    const item = btn.closest('.preview-item');
    const index = Array.from(previewGrid.children).indexOf(item);
    uploadedFiles.splice(index, 1);
    item.remove();
    
    if (uploadedFiles.length === 0) {
        convertBtn.disabled = true;
        downloadBtn.style.display = 'none';
    }
};

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 生成指定尺寸的图标
function generateIcon(file, targetSize) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = targetSize;
            canvas.height = targetSize;
            
            const ctx = canvas.getContext('2d');
            ctx.imageSmoothingEnabled = false;
            ctx.imageSmoothingQuality = 'high';
            
            // 清除画布
            ctx.clearRect(0, 0, targetSize, targetSize);
            
            // 计算缩放和位置
            let drawWidth = targetSize;
            let drawHeight = targetSize;
            let x = 0;
            let y = 0;
            
            const ratio = img.width / img.height;
            if (ratio > 1) {
                drawHeight = targetSize / ratio;
                y = (targetSize - drawHeight) / 2;
            } else if (ratio < 1) {
                drawWidth = targetSize * ratio;
                x = (targetSize - drawWidth) / 2;
            }
            
            // 使用Math.round确保整数像素
            x = Math.round(x);
            y = Math.round(y);
            drawWidth = Math.round(drawWidth);
            drawHeight = Math.round(drawHeight);
            
            // 绘制图像
            ctx.drawImage(img, x, y, drawWidth, drawHeight);
            
            // 转换为Blob
            canvas.toBlob((blob) => {
                const finalBlob = new Blob([blob], { 
                    type: 'image/png',
                    name: `icon_${targetSize}x${targetSize}.png`
                });
                resolve(finalBlob);
            }, 'image/png', 1.0);
        };
        img.onerror = (error) => {
            reject(error);
        };
        img.src = URL.createObjectURL(file);
    });
}

// 开始生成图标
convertBtn.addEventListener('click', async () => {
    if (uploadedFiles.length === 0) return;

    convertBtn.disabled = true;
    downloadBtn.style.display = 'none';
    progressBar.style.display = 'block';
    progress.style.width = '0%';
    convertedFiles = [];
    previewGrid.innerHTML = '';

    // 获取选中的尺寸
    const selectedSizes = Array.from(document.querySelectorAll('.size-option input:checked'))
        .map(cb => parseInt(cb.value))
        .sort((a, b) => a - b);

    const totalSteps = uploadedFiles.length * selectedSizes.length;
    let currentStep = 0;

    try {
        for (const file of uploadedFiles) {
            for (const size of selectedSizes) {
                // 生成图标
                const iconBlob = await generateIcon(file.file, size);
                
                // 创建预览图
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = size;
                    canvas.height = size;
                    const ctx = canvas.getContext('2d');
                    
                    // 清除画布
                    ctx.clearRect(0, 0, size, size);
                    
                    // 禁用图像平滑
                    ctx.imageSmoothingEnabled = false;
                    
                    // 直接绘制，不进行任何缩放
                    ctx.drawImage(img, 0, 0, size, size);
                    
                    // 保存转换后的文件
                    convertedFiles.push({
                        blob: iconBlob,
                        size: size,
                        name: `icon_${size}x${size}.${selectedSystem === 'windows' ? 'ico' : 'icns'}`
                    });
                    
                    // 使用当前文件的索引创建预览
                    const previewItem = createPreview(canvas, size, convertedFiles.length - 1, iconBlob.size);
                    previewGrid.appendChild(previewItem);
                };
                img.src = URL.createObjectURL(iconBlob);

                // 更新进度
                currentStep++;
                progress.style.width = `${(currentStep / totalSteps) * 100}%`;
            }
        }

        convertBtn.disabled = false;
        progressBar.style.display = 'none';
        
        if (convertedFiles.length > 0) {
            downloadBtn.style.display = 'block';
            downloadBtn.textContent = convertedFiles.length > 1 ? '批量下载' : '下载图标';
        }
    } catch (error) {
        alert('生成图标时出错，请重试');
        convertBtn.disabled = false;
        progressBar.style.display = 'none';
    }
});

// 创建预览图
function createPreview(canvas, size, index, blobSize) {
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    
    const previewImage = document.createElement('div');
    previewImage.className = 'preview-image';
    
    // 创建包装容器，用于固定尺寸的显示
    const imageWrapper = document.createElement('div');
    imageWrapper.style.display = 'flex';
    imageWrapper.style.alignItems = 'center';
    imageWrapper.style.justifyContent = 'center';
    imageWrapper.style.background = 'transparent';
    
    // 对于经典尺寸（128及以下），使用实际尺寸显示
    if (size <= 128) {
        imageWrapper.style.width = size + 'px';
        imageWrapper.style.height = size + 'px';
        imageWrapper.style.margin = '0 auto';
        canvas.style.width = size + 'px';
        canvas.style.height = size + 'px';
        // 移除任何边框和圆角
        canvas.style.border = 'none';
        canvas.style.borderRadius = '0';
        canvas.style.backgroundColor = 'transparent';
    } else {
        imageWrapper.style.width = '200px';
        imageWrapper.style.height = '200px';
        canvas.style.width = '100%';
        canvas.style.height = '100%';
    }
    
    imageWrapper.appendChild(canvas);
    previewImage.appendChild(imageWrapper);
    previewItem.appendChild(previewImage);
    
    // 添加尺寸和文件信息
    const previewInfo = document.createElement('div');
    previewInfo.className = 'preview-info';
    previewInfo.innerHTML = `
        <div class="file-name">${size}×${size}</div>
        <div class="info-row">
            <span>尺寸</span>
            <span>${size}×${size}px</span>
        </div>
        <div class="info-row">
            <span>格式</span>
            <span>${selectedSystem === 'windows' ? 'ICO' : 'ICNS'}</span>
        </div>
        <div class="info-row">
            <span>大小</span>
            <span>${formatFileSize(blobSize)}</span>
        </div>
        <button class="btn" onclick="downloadIcon(${index})">下载图标</button>
    `;
    previewItem.appendChild(previewInfo);
    
    return previewItem;
}

// 下载单个图标
window.downloadIcon = function(index) {
    const file = convertedFiles[index];
    if (!file) return;
    
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icon_${file.size}x${file.size}.${selectedSystem === 'windows' ? 'ico' : 'icns'}`;
    a.click();
    URL.revokeObjectURL(url);
};

// 批量下载
downloadBtn.addEventListener('click', async () => {
    if (convertedFiles.length === 1) {
        downloadIcon(0);
        return;
    }

    const zip = new JSZip();
    convertedFiles.forEach(file => {
        const fileName = `icon_${file.size}x${file.size}.${selectedSystem === 'windows' ? 'ico' : 'icns'}`;
        zip.file(fileName, file.blob);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icons_${selectedSystem}.zip`;
    a.click();
    URL.revokeObjectURL(url);
});