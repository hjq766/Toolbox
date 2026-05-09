// 全局变量
let uploadArea, fileInput, previewGrid, convertBtn, downloadBtn, progress, progressBar, keepExif;

let uploadedFiles = [];
let convertedFiles = [];
let compressionMode = 'balanced';
let targetFileSize = null;

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function () {
    // 初始化DOM元素
    uploadArea = document.getElementById('uploadArea');
    fileInput = document.getElementById('fileInput');
    previewGrid = document.getElementById('previewGrid');
    convertBtn = document.getElementById('convertBtn');
    downloadBtn = document.getElementById('downloadBtn');
    progress = document.querySelector('.progress');
    progressBar = document.querySelector('.progress-bar');
    keepExif = document.getElementById('keepExif');

    // 图片预览模态框
    const imageModal = document.getElementById('imageModal');
    const modalImage = document.getElementById('modalImage');
    const closeModal = document.getElementById('closeModal');

    function showImageModal(src) {
        modalImage.src = src;
        imageModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function hideImageModal() {
        imageModal.classList.remove('active');
        document.body.style.overflow = '';
    }

    closeModal.addEventListener('click', hideImageModal);
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            hideImageModal();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && imageModal.classList.contains('active')) {
            hideImageModal();
        }
    });

    // 压缩模式选择
    document.querySelectorAll('.mode-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.mode-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            compressionMode = option.dataset.mode;

            // 显示/隐藏相关设置
            const customQuality = document.getElementById('customQuality');
            const targetSize = document.getElementById('targetSize');

            if (compressionMode === 'custom') {
                customQuality.style.display = 'block';
                // 初始化质量滑块
                initQualitySlider();
            } else {
                customQuality.style.display = 'none';
            }

            if (compressionMode === 'size') {
                targetSize.style.display = 'block';
            } else {
                targetSize.style.display = 'none';
            }
        });
    });

    // 初始化质量滑块
    function initQualitySlider() {
        const qualitySlider = document.getElementById('qualitySlider');
        const qualityValue = document.getElementById('qualityValue');

        if (qualitySlider && qualityValue) {
            // 设置初始值
            qualityValue.textContent = qualitySlider.value + '%';

            // 添加事件监听器（避免重复添加）
            qualitySlider.removeEventListener('input', handleQualityChange);
            qualitySlider.addEventListener('input', handleQualityChange);
        }
    }

    // 处理质量变化
    function handleQualityChange(e) {
        const qualityValue = document.getElementById('qualityValue');
        if (qualityValue) {
            qualityValue.textContent = e.target.value + '%';
        }
    }

    // 目标文件大小输入
    const targetSizeInput = document.getElementById('targetSizeInput');
    if (targetSizeInput) {
        targetSizeInput.addEventListener('input', (e) => {
            targetFileSize = parseInt(e.target.value) * 1024; // 转换为字节
        });
    }

    // 拖放处理
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

    // 支持粘贴上传
    document.addEventListener('paste', (e) => {
        const items = e.clipboardData?.items;
        if (items) {
            const files = [];
            for (let item of items) {
                if (item.type.startsWith('image/')) {
                    files.push(item.getAsFile());
                }
            }
            if (files.length > 0) {
                handleFiles(files);
                showToast('已从剪贴板添加图片');
            }
        }
    });

    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // 处理文件上传
    function handleFiles(files) {
        let validFiles = 0;
        for (const file of files) {
            if (file.type.startsWith('image/')) {
                validFiles++;
                const preview = createPreviewItem(file);
                previewGrid.appendChild(preview);
                uploadedFiles.push({
                    file: file,
                    preview: URL.createObjectURL(file)
                });
            }
        }

        if (validFiles === 0) {
            showToast('请选择有效的图片文件');
        } else {
            convertBtn.disabled = false;
            downloadBtn.style.display = 'none';
        }
    }

    // 创建预览项
    function createPreviewItem(file) {
        const previewItem = document.createElement('div');
        previewItem.className = 'preview-item';
        const index = uploadedFiles.length;
        const imageUrl = URL.createObjectURL(file);
        previewItem.innerHTML = `
        <div class="preview-image">
            <img src="${imageUrl}" alt="${file.name}">
        </div>
        <div class="preview-info">
            <div class="file-name">${file.name}</div>
            <div class="info-row">
                <span>原始大小：</span>
                <span class="original-size">${formatFileSize(file.size)}</span>
            </div>
            <div class="info-row">
                <span>压缩大小：</span>
                <span class="compressed-size">-</span>
            </div>
            <div class="info-row">
                <span>压缩比例：</span>
                <span class="compression-ratio">-</span>
            </div>
            <div class="info-row">
                <span>节省空间：</span>
                <span class="space-saved">-</span>
            </div>
            <button class="btn" style="display: none;">
                下载此图片
            </button>
        </div>
        <button class="remove-btn" onclick="removeFile(${index})">
            <svg viewBox="0 0 24 24" width="16" height="16">
                <path fill="currentColor" d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/>
            </svg>
        </button>
    `;

        // 添加图片点击事件
        const previewImg = previewItem.querySelector('.preview-image img');
        previewImg.addEventListener('click', () => {
            showImageModal(imageUrl);
        });

        return previewItem;
    }



    // 压缩按钮点击事件
    convertBtn.addEventListener('click', async () => {
        if (uploadedFiles.length === 0) {
            showToast('请先上传图片');
            return;
        }

        convertBtn.disabled = true;
        progressBar.style.display = 'block';
        progress.style.width = '0%';
        convertedFiles = [];

        try {
            // 根据压缩模式设置参数
            let quality;
            let maxSizeMB = Infinity;

            switch (compressionMode) {
                case 'quality':
                    quality = 0.9;
                    break;
                case 'balanced':
                    quality = 0.8;
                    break;
                case 'aggressive':
                    quality = 0.5;
                    break;
                case 'size':
                    quality = 0.4;
                    if (targetFileSize) {
                        maxSizeMB = targetFileSize / (1024 * 1024);
                    }
                    break;
                case 'custom':
                    const customQualitySlider = document.getElementById('qualitySlider');
                    quality = customQualitySlider ? (parseInt(customQualitySlider.value) / 100) : 0.8;
                    break;
                default:
                    quality = 0.8;
            }

            for (let i = 0; i < uploadedFiles.length; i++) {
                const file = uploadedFiles[i];
                const previewItem = previewGrid.children[i];

                // 更新进度条
                progress.style.width = `${((i + 1) / uploadedFiles.length) * 100}%`;

                try {
                    // 如果质量是100%，直接使用原图
                    if (quality === 1) {
                        const compressedSize = formatFileSize(file.file.size);

                        previewItem.querySelector('.compressed-size').textContent = compressedSize;
                        previewItem.querySelector('.compression-ratio').textContent = '0%（原图）';
                        previewItem.querySelector('.space-saved').textContent = '0 B';

                        // 显示下载按钮
                        const downloadButton = previewItem.querySelector('.btn');
                        downloadButton.style.display = 'block';
                        downloadButton.onclick = () => {
                            const url = URL.createObjectURL(file.file);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = file.file.name;
                            a.click();
                            URL.revokeObjectURL(url);
                        };

                        // 保存文件
                        convertedFiles.push({
                            file: file.file,
                            name: file.file.name
                        });
                        continue;
                    }

                    // 获取文件格式信息
                    const fileType = file.file.type;
                    const isPNG = fileType === 'image/png';
                    const isJPEG = fileType === 'image/jpeg' || fileType === 'image/jpg';
                    const isWebP = fileType === 'image/webp';
                    const isGIF = fileType === 'image/gif';

                    let compressedFile;

                    // 针对不同格式采用不同的压缩策略
                    if (isPNG) {
                        compressedFile = await compressPNG(file.file, quality, maxSizeMB, compressionMode, targetFileSize);
                    } else if (isJPEG) {
                        compressedFile = await compressJPEG(file.file, quality, maxSizeMB, compressionMode, targetFileSize);
                    } else if (isWebP) {
                        compressedFile = await compressWebP(file.file, quality, maxSizeMB, compressionMode, targetFileSize);
                    } else if (isGIF) {
                        compressedFile = await compressGIF(file.file, quality, maxSizeMB, compressionMode, targetFileSize);
                    } else {
                        // 其他格式，尝试通用压缩
                        compressedFile = await compressGeneric(file.file, quality, maxSizeMB, compressionMode, targetFileSize);
                    }

                    // 检查压缩效果
                    const compressionRatio = compressedFile.size / file.file.size;

                    // 如果压缩后反而变大了，使用原图
                    if (compressionRatio >= 1) {
                        const originalSize = formatFileSize(file.file.size);
                        previewItem.querySelector('.compressed-size').textContent = originalSize;
                        previewItem.querySelector('.compression-ratio').textContent = '0%';
                        previewItem.querySelector('.space-saved').textContent = '0 B';

                        // 显示下载按钮
                        const downloadButton = previewItem.querySelector('.btn');
                        downloadButton.style.display = 'block';
                        downloadButton.onclick = () => {
                            const url = URL.createObjectURL(file.file);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = file.file.name;
                            a.click();
                            URL.revokeObjectURL(url);
                        };

                        // 保存原始文件
                        convertedFiles.push({
                            file: file.file,
                            name: file.file.name
                        });
                    } else {
                        // 使用压缩后的文件
                        const compressedSize = formatFileSize(compressedFile.size);
                        const ratio = Math.round((1 - compressionRatio) * 100);
                        const spaceSaved = formatFileSize(file.file.size - compressedFile.size);

                        // 检查是否达到目标大小
                        let sizeText = compressedSize;
                        if (compressionMode === 'size' && targetFileSize) {
                            const targetKB = Math.round(targetFileSize / 1024);
                            const actualKB = Math.round(compressedFile.size / 1024);
                            if (actualKB <= targetKB) {
                                sizeText += ' ✅';
                            } else {
                                sizeText += ` (目标${targetKB}KB)`;
                            }
                        }

                        // 在自定义模式下显示质量信息
                        let ratioText = `${ratio}%`;
                        if (compressionMode === 'custom') {
                            const customQualitySlider = document.getElementById('qualitySlider');
                            if (customQualitySlider && (isJPEG || isWebP)) {
                                ratioText += ` (质量${customQualitySlider.value}%)`;
                            } else if (!isJPEG && !isWebP) {
                                ratioText += ' (分辨率优化)';
                            }
                        }

                        previewItem.querySelector('.compressed-size').textContent = sizeText;
                        previewItem.querySelector('.compression-ratio').textContent = ratioText;
                        previewItem.querySelector('.space-saved').textContent = spaceSaved;

                        // 显示下载按钮
                        const downloadButton = previewItem.querySelector('.btn');
                        downloadButton.style.display = 'block';
                        downloadButton.onclick = () => {
                            const url = URL.createObjectURL(compressedFile);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = `compressed_${file.file.name}`;
                            a.click();
                            URL.revokeObjectURL(url);
                        };

                        // 保存压缩后的文件
                        convertedFiles.push({
                            file: compressedFile,
                            name: `compressed_${file.file.name}`
                        });
                    }
                } catch (err) {
                    console.error('压缩失败:', err);
                    previewItem.querySelector('.compressed-size').textContent = '压缩失败';
                    previewItem.querySelector('.compression-ratio').textContent = '-';
                }
            }

            // 根据处理的图片数量显示不同的下载按钮
            if (convertedFiles.length > 0) {
                downloadBtn.style.display = 'block';
                if (convertedFiles.length === 1) {
                    downloadBtn.textContent = '下载图片';
                    // 单张图片时，点击直接下载
                    downloadBtn.onclick = () => {
                        const file = convertedFiles[0];
                        const url = URL.createObjectURL(file.file);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = file.name;
                        a.click();
                        URL.revokeObjectURL(url);
                    };
                } else {
                    downloadBtn.textContent = '批量下载';
                    // 多张图片时，打包下载
                    downloadBtn.onclick = () => {
                        const zip = new JSZip();
                        convertedFiles.forEach(file => {
                            zip.file(file.name, file.file);
                        });

                        zip.generateAsync({ type: 'blob' }).then(content => {
                            const url = URL.createObjectURL(content);
                            const a = document.createElement('a');
                            a.href = url;
                            a.download = 'compressed_images.zip';
                            a.click();
                            URL.revokeObjectURL(url);
                        });
                    };
                }
                showToast('处理完成！');
            }
        } catch (error) {
            console.error('处理错误:', error);
            showToast('处理失败，请重试');
        } finally {
            convertBtn.disabled = false;
            progressBar.style.display = 'none';
        }
    });





    // 显示提示信息
    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('show');
            setTimeout(() => {
                toast.classList.remove('show');
                setTimeout(() => {
                    document.body.removeChild(toast);
                }, 300);
            }, 3000);
        }, 100);
    }

}); // DOMContentLoaded 结束

// 针对PNG格式的专门压缩函数
async function compressPNG(file, quality, maxSizeMB, compressionMode, targetFileSize) {
    // PNG压缩策略：通过调整分辨率和优化来压缩
    const options = {
        maxSizeMB: maxSizeMB,
        useWebWorker: true,
        maxIteration: 25,
        alwaysKeepResolution: false,
        fileType: 'image/png'
    };

    if (compressionMode === 'size' && targetFileSize) {
        options.maxSizeMB = targetFileSize / (1024 * 1024);
        options.maxIteration = 35;
    }

    try {
        return await imageCompression(file, options);
    } catch (e) {
        console.log('PNG压缩失败:', e);
        return file;
    }
}

// 针对JPEG格式的压缩函数
async function compressJPEG(file, quality, maxSizeMB, compressionMode, targetFileSize) {
    const options = {
        maxSizeMB: maxSizeMB,
        useWebWorker: true,
        initialQuality: quality,
        maxIteration: 15,
        fileType: 'image/jpeg',
        alwaysKeepResolution: false
    };

    if (compressionMode === 'size' && targetFileSize) {
        options.maxSizeMB = targetFileSize / (1024 * 1024);
        options.maxIteration = 25;
        options.initialQuality = Math.min(quality, 0.5);
    }

    try {
        return await imageCompression(file, options);
    } catch (e) {
        console.log('JPEG压缩失败:', e);
        return file;
    }
}

// 针对WebP格式的压缩函数
async function compressWebP(file, quality, maxSizeMB, compressionMode, targetFileSize) {
    const options = {
        maxSizeMB: maxSizeMB,
        useWebWorker: true,
        initialQuality: quality,
        maxIteration: 12,
        fileType: 'image/webp',
        alwaysKeepResolution: false
    };

    if (compressionMode === 'size' && targetFileSize) {
        options.maxSizeMB = targetFileSize / (1024 * 1024);
        options.maxIteration = 20;
    }

    try {
        return await imageCompression(file, options);
    } catch (e) {
        console.log('WebP压缩失败:', e);
        return file;
    }
}

// 针对GIF格式的压缩函数
async function compressGIF(file, quality, maxSizeMB, compressionMode, targetFileSize) {
    // GIF压缩主要通过调整分辨率
    const options = {
        maxSizeMB: maxSizeMB,
        useWebWorker: true,
        maxIteration: 30,
        alwaysKeepResolution: false,
        fileType: 'image/gif'
    };

    if (compressionMode === 'size' && targetFileSize) {
        options.maxSizeMB = targetFileSize / (1024 * 1024);
        options.maxIteration = 40;
    }

    try {
        return await imageCompression(file, options);
    } catch (e) {
        console.log('GIF压缩失败:', e);
        return file;
    }
}

// 通用格式压缩函数
async function compressGeneric(file, quality, maxSizeMB, compressionMode, targetFileSize) {
    const options = {
        maxSizeMB: maxSizeMB,
        useWebWorker: true,
        maxIteration: 15,
        alwaysKeepResolution: false
    };

    if (compressionMode === 'size' && targetFileSize) {
        options.maxSizeMB = targetFileSize / (1024 * 1024);
        options.maxIteration = 25;
    }

    try {
        return await imageCompression(file, options);
    } catch (e) {
        console.log('通用压缩失败:', e);
        return file;
    }
}



// 需要全局访问的函数
function removeFile(index) {
    if (previewGrid && previewGrid.children[index]) {
        previewGrid.children[index].remove();
        uploadedFiles.splice(index, 1);
        if (convertedFiles[index]) {
            convertedFiles.splice(index, 1);
        }

        if (uploadedFiles.length === 0) {
            if (convertBtn) convertBtn.disabled = true;
            if (downloadBtn) downloadBtn.style.display = 'none';
        }
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}