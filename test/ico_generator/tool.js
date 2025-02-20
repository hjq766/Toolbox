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
        { size: 16, label: '16×16 - 任务栏' },
        { size: 24, label: '24×24 - 列表视图' },
        { size: 32, label: '32×32 - 桌面图标' },
        { size: 48, label: '48×48 - 高DPI' },
        { size: 64, label: '64×64 - 高DPI' },
        { size: 128, label: '128×128 - 文件夹预览' },
        { size: 256, label: '256×256 - 高分屏' },
        { size: 512, label: '512×512 - 超高分辨率' }
    ],
    macos: [
        { size: 16, label: '16×16 - Dock栏' },
        { size: 32, label: '32×32 - Finder' },
        { size: 64, label: '64×64 - 预览' },
        { size: 128, label: '128×128 - 封面流' },
        { size: 256, label: '256×256 - 快速预览' },
        { size: 512, label: '512×512 - App Store' },
        { size: 1024, label: '1024×1024 - 市场展示' }
    ]
};

// 初始化尺寸选项
function updateSizeOptions() {
    const sizes = systemSizes[selectedSystem];
    sizeGrid.innerHTML = sizes.map(({ size, label }) => {
        const [value, desc] = label.split(' - ');
        return `
            <label class="size-option">
                <input type="checkbox" value="${size}" checked>
                <div class="size-info">
                    <div class="size-value">${value}</div>
                    <div class="size-desc">${desc}</div>
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
                const previewItem = document.createElement('div');
                previewItem.className = 'preview-item';
                
                // 获取图片尺寸
                const img = new Image();
                img.onload = () => {
                    previewItem.innerHTML = `
                        <div class="preview-image">
                            <img src="${e.target.result}" alt="${file.name}">
                        </div>
                        <div class="preview-info">
                            <div class="file-name">${file.name}</div>
                            <div class="info-row">
                                <span>尺寸</span>
                                <span>${img.width}×${img.height}</span>
                            </div>
                            <div class="info-row">
                                <span>大小</span>
                                <span>${formatFileSize(file.size)}</span>
                            </div>
                        </div>
                        <button class="remove-btn" onclick="removeFile(this)">×</button>
                    `;
                    previewGrid.appendChild(previewItem); // 确保预览项被添加到预览网格
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
async function generateIcon(file, size) {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = async () => {
            // 创建一个临时画布用于缩放
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            
            // 确保使用高质量的插值算法
            tempCtx.imageSmoothingEnabled = true;
            tempCtx.imageSmoothingQuality = 'high';

            // 计算缩放比例
            const scale = Math.max(size / img.width, size / img.height);
            const scaledWidth = img.width * scale;
            const scaledHeight = img.height * scale;

            // 设置画布尺寸
            tempCanvas.width = scaledWidth;
            tempCanvas.height = scaledHeight;

            // 清除画布
            tempCtx.clearRect(0, 0, scaledWidth, scaledHeight);
            
            // 绘制图像
            tempCtx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
            
            // 创建最终画布
            const canvas = document.createElement('canvas');
            canvas.width = size;
            canvas.height = size;
            const ctx = canvas.getContext('2d');

            // 使用高质量插值
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            // 计算居中位置
            const x = (size - scaledWidth) / 2;
            const y = (size - scaledHeight) / 2;

            // 绘制最终图像
            ctx.drawImage(tempCanvas, x, y, scaledWidth, scaledHeight);
            
            // 转换为Blob
            canvas.toBlob((blob) => {
                resolve(blob);
            }, 'image/png');
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
        .map(cb => parseInt(cb.value));

    const totalSteps = uploadedFiles.length * selectedSizes.length;
    let currentStep = 0;

    for (const file of uploadedFiles) {
        for (const size of selectedSizes) {
            const iconBlob = await generateIcon(file.file, size);
            
            // 创建预览
            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <div class="preview-image">
                    <img src="${URL.createObjectURL(iconBlob)}" alt="${size}x${size}">
                </div>
                <div class="preview-info">
                    <div class="file-name">${size}×${size}</div>
                    <div class="info-row">
                        <span>格式</span>
                        <span>${selectedSystem === 'windows' ? 'ICO' : 'ICNS'}</span>
                    </div>
                    <div class="info-row">
                        <span>大小</span>
                        <span>${formatFileSize(iconBlob.size)}</span>
                    </div>
                </div>
                <button class="btn" onclick="downloadIcon(${convertedFiles.length})">下载图标</button>
            `;
            previewGrid.appendChild(previewItem);

            // 保存转换后的文件
            convertedFiles.push({
                blob: iconBlob,
                name: `icon_${size}x${size}.${selectedSystem === 'windows' ? 'ico' : 'icns'}`,
                size: size
            });

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
});

// 下载单个图标
window.downloadIcon = function(index) {
    const file = convertedFiles[index];
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
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
        zip.file(file.name, file.blob);
    });
    
    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const a = document.createElement('a');
    a.href = url;
    a.download = `icons_${selectedSystem}.zip`;
    a.click();
    URL.revokeObjectURL(url);
});