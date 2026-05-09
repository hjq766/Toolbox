// 全局变量
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const previewGrid = document.getElementById('previewGrid');
const convertBtn = document.getElementById('convertBtn');
const downloadBtn = document.getElementById('downloadBtn');
const progress = document.querySelector('.progress');
const progressBar = document.querySelector('.progress-bar');
const widthInput = document.getElementById('widthInput');
const heightInput = document.getElementById('heightInput');
const linkIcon = document.querySelector('.link-icon');

let uploadedFiles = [];
let convertedFiles = [];
let selectedFormat = 'jpg';
let selectedPreset = 'original';
let maintainAspectRatio = true;
let aspectRatio = 1;
let currentImageAspectRatio = 1; // 当前选中图片的宽高比
let namingMode = 'original'; // 命名方式：'original' 或 'converted'
let preserveAlpha = true; // WebP透明度保留选项
let webpSupported = false; // WebP支持检测

// 检测浏览器是否支持WebP格式
function checkWebPSupport() {
    return new Promise((resolve) => {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        canvas.toBlob((blob) => {
            resolve(blob && blob.type === 'image/webp');
        }, 'image/webp');
    });
}

// 页面加载时检测WebP支持
checkWebPSupport().then(supported => {
    webpSupported = supported;
    console.log('WebP支持:', supported);
    if (!supported) {
        console.warn('当前浏览器不支持WebP格式转换');
    }
});

// 拖放处理
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('drag-over');
});

uploadArea.addEventListener('dragleave', (e) => {
    // 只有当离开整个上传区域时才移除样式
    if (!uploadArea.contains(e.relatedTarget)) {
        uploadArea.classList.remove('drag-over');
    }
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

// 格式选择
document.querySelectorAll('.format-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.format-option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        selectedFormat = option.dataset.format;

        // 显示/隐藏质量调节和透明度选项
        updateQualityDisplay();
        updateAlphaDisplay();
    });
});

// 质量调节
const qualitySlider = document.getElementById('qualitySlider');
const qualityValue = document.getElementById('qualityValue');
let imageQuality = 0.95;

// 初始化质量调节显示状态
function updateQualityDisplay() {
    const qualityGroup = document.getElementById('qualityGroup');
    if (selectedFormat === 'jpg' || selectedFormat === 'webp') {
        qualityGroup.style.display = 'block';
    } else {
        qualityGroup.style.display = 'none';
    }
}

if (qualitySlider) {
    qualitySlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        imageQuality = value / 100;
        qualityValue.textContent = `${value}%`;
    });
}

// 页面加载时初始化质量显示
updateQualityDisplay();

// 透明度选项显示控制
function updateAlphaDisplay() {
    const alphaGroup = document.getElementById('alphaGroup');
    // 只有选择WebP格式时才显示透明度选项
    if (selectedFormat === 'webp') {
        alphaGroup.style.display = 'block';
    } else {
        alphaGroup.style.display = 'none';
    }
}

// 透明度选项选择
document.querySelectorAll('.alpha-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.alpha-option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        preserveAlpha = option.dataset.alpha === 'preserve';
    });
});

// 页面加载时初始化透明度选项显示
updateAlphaDisplay();

// 尺寸预设
document.querySelectorAll('.size-preset').forEach(preset => {
    preset.addEventListener('click', () => {
        document.querySelectorAll('.size-preset').forEach(p => p.classList.remove('active'));
        preset.classList.add('active');
        selectedPreset = preset.dataset.preset;

        const sizeInputs = document.querySelector('.size-inputs');
        sizeInputs.style.display = selectedPreset === 'custom' ? 'grid' : 'none';
    });
});

// 宽高比联动
linkIcon.addEventListener('click', () => {
    maintainAspectRatio = !maintainAspectRatio;
    linkIcon.classList.toggle('active', maintainAspectRatio);
});

widthInput.addEventListener('input', () => {
    if (maintainAspectRatio && currentImageAspectRatio && widthInput.value) {
        const newHeight = Math.round(widthInput.value / currentImageAspectRatio);
        heightInput.value = newHeight;
        console.log(`宽度输入: ${widthInput.value}, 计算高度: ${newHeight}, 宽高比: ${currentImageAspectRatio}`);
    }
});

heightInput.addEventListener('input', () => {
    if (maintainAspectRatio && currentImageAspectRatio && heightInput.value) {
        const newWidth = Math.round(heightInput.value * currentImageAspectRatio);
        widthInput.value = newWidth;
        console.log(`高度输入: ${heightInput.value}, 计算宽度: ${newWidth}, 宽高比: ${currentImageAspectRatio}`);
    }
});

// 删除文件
function removeFile(index) {
    previewGrid.children[index].remove();
    uploadedFiles.splice(index, 1);
    if (convertedFiles[index]) {
        convertedFiles.splice(index, 1);
    }

    if (uploadedFiles.length === 0) {
        convertBtn.disabled = true;
        downloadBtn.style.display = 'none';
    }

    if (convertedFiles.length > 0) {
        downloadBtn.innerHTML = convertedFiles.length > 1 ?
            '批量下载' :
            '下载图片';
    }
}

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

// 创建预览项
function createPreviewItem(file) {
    const previewItem = document.createElement('div');
    previewItem.className = 'preview-item';
    const index = uploadedFiles.length;
    const isFirstImage = uploadedFiles.length === 0; // 记录是否是第一张图片
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
                 <span>原始尺寸：</span>
                 <span class="original-dimensions">-</span>
             </div>
             <div class="info-row">
                 <span>转换格式：</span>
                 <span class="converted-format">-</span>
             </div>
             <div class="info-row">
                 <span>转换大小：</span>
                 <span class="converted-size">-</span>
             </div>
             <div class="info-row">
                 <span>转换尺寸：</span>
                 <span class="converted-dimensions">-</span>
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

    // 获取图片尺寸
    const img = new Image();
    img.onload = () => {
        previewItem.querySelector('.original-dimensions').textContent =
            `${img.naturalWidth} × ${img.naturalHeight}`;

        // 更新当前图片的宽高比（使用第一张图片的宽高比）
        if (isFirstImage) {
            currentImageAspectRatio = img.naturalWidth / img.naturalHeight;
            console.log('设置宽高比:', currentImageAspectRatio, `(${img.naturalWidth}×${img.naturalHeight})`);

            // 如果自定义尺寸输入框有值，更新对应的值
            if (selectedPreset === 'custom') {
                if (widthInput.value && maintainAspectRatio) {
                    heightInput.value = Math.round(widthInput.value / currentImageAspectRatio);
                } else if (heightInput.value && maintainAspectRatio) {
                    widthInput.value = Math.round(heightInput.value * currentImageAspectRatio);
                }
            }
        }
    };
    img.src = imageUrl;

    // 添加图片点击事件
    const previewImg = previewItem.querySelector('.preview-image img');
    previewImg.addEventListener('click', () => {
        showImageModal(imageUrl);
    });

    return previewItem;
}

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
        downloadBtn.innerHTML = validFiles > 1 ?
            '批量下载' :
            '下载图片';

        // 显示清空按钮
        const clearButton = document.getElementById('clearBtn');
        if (clearButton) {
            clearButton.style.display = 'inline-flex';
        }
    }
}

// 转换按钮点击事件
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
        for (let i = 0; i < uploadedFiles.length; i++) {
            const file = uploadedFiles[i];
            const previewItem = previewGrid.children[i];

            // 更新进度条
            progress.style.width = `${((i + 1) / uploadedFiles.length) * 100}%`;

            // 获取原始文件格式
            const originalFormat = file.file.type.split('/')[1];

            // 如果格式相同且不需要调整尺寸，直接使用原始文件
            if (originalFormat === selectedFormat && selectedPreset === 'original') {
                const convertedFile = file.file;

                // 更新预览信息
                previewItem.querySelector('.converted-format').textContent = selectedFormat.toUpperCase();
                previewItem.querySelector('.converted-size').textContent = formatFileSize(convertedFile.size);

                // 获取图片尺寸
                const img = await createImageBitmap(convertedFile);
                previewItem.querySelector('.converted-dimensions').textContent =
                    `${img.width} × ${img.height}`;

                // 保存转换后的文件
                const extension = selectedFormat === 'jpg' ? 'jpg' : selectedFormat;
                convertedFiles.push({
                    file: convertedFile,
                    name: getConvertedFileName(file.file.name, extension)
                });
                continue;
            }

            // 需要转换格式或调整尺寸
            const img = new Image();
            img.crossOrigin = 'anonymous'; // 避免跨域问题
            await new Promise((resolve, reject) => {
                img.onload = () => {
                    // 确保图片完全加载
                    if (img.complete && img.naturalWidth > 0) {
                        resolve();
                    } else {
                        reject(new Error('图片加载失败'));
                    }
                };
                img.onerror = reject;
                img.src = file.preview;
            });

            // 获取目标尺寸
            let targetWidth, targetHeight;
            switch (selectedPreset) {
                case '0.5x':
                    targetWidth = Math.round(img.naturalWidth * 0.5);
                    targetHeight = Math.round(img.naturalHeight * 0.5);
                    break;
                case '2x':
                    targetWidth = Math.round(img.naturalWidth * 2);
                    targetHeight = Math.round(img.naturalHeight * 2);
                    break;
                case 'hd':
                    targetWidth = 1280;
                    targetHeight = 720;
                    break;
                case 'fhd':
                    targetWidth = 1920;
                    targetHeight = 1080;
                    break;
                case '4k':
                    targetWidth = 3840;
                    targetHeight = 2160;
                    break;
                case 'square':
                    const size = Math.min(img.naturalWidth, img.naturalHeight);
                    targetWidth = targetHeight = size;
                    break;
                case 'custom':
                    targetWidth = parseInt(widthInput.value) || img.naturalWidth;
                    targetHeight = parseInt(heightInput.value) || img.naturalHeight;
                    break;
                default:
                    targetWidth = img.naturalWidth;
                    targetHeight = img.naturalHeight;
            }

            // 计算实际尺寸（保持宽高比）
            let finalWidth = targetWidth;
            let finalHeight = targetHeight;

            if (maintainAspectRatio && selectedPreset !== 'square') {
                const ratio = img.naturalWidth / img.naturalHeight;
                if (targetWidth && !targetHeight) {
                    finalHeight = Math.round(targetWidth / ratio);
                } else if (!targetWidth && targetHeight) {
                    finalWidth = Math.round(targetHeight * ratio);
                } else {
                    const targetRatio = targetWidth / targetHeight;
                    if (ratio > targetRatio) {
                        finalHeight = Math.round(targetWidth / ratio);
                    } else {
                        finalWidth = Math.round(targetHeight * ratio);
                    }
                }
            }

            // 创建canvas并绘制
            const canvas = document.createElement('canvas');
            // 判断是否需要透明通道
            const needsAlpha = selectedFormat === 'png' || (selectedFormat === 'webp' && preserveAlpha);
            const ctx = canvas.getContext('2d', {
                alpha: needsAlpha,
                colorSpace: 'srgb'
            });
            canvas.width = finalWidth;
            canvas.height = finalHeight;

            // 根据格式和透明度设置背景
            if (selectedFormat === 'webp' && !preserveAlpha) {
                // WebP不保留透明度时填充白色背景
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, finalWidth, finalHeight);
            } else if (selectedFormat !== 'png' && selectedFormat !== 'webp') {
                // 其他非PNG格式填充白色背景
                ctx.fillStyle = '#FFFFFF';
                ctx.fillRect(0, 0, finalWidth, finalHeight);
            }

            // 设置图像渲染质量
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';

            ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

            // 转换为指定格式
            const mimeTypeMap = {
                'jpg': 'image/jpeg',
                'jpeg': 'image/jpeg',
                'png': 'image/png',
                'webp': 'image/webp',
                'gif': 'image/gif',
                'bmp': 'image/bmp',
                'tiff': 'image/tiff'
            };

            const mimeType = mimeTypeMap[selectedFormat] || `image/${selectedFormat}`;

            // 根据格式设置质量
            let quality;
            if (selectedFormat === 'jpg' || selectedFormat === 'jpeg' || selectedFormat === 'webp') {
                quality = imageQuality; // 使用用户设置的质量
            } else {
                quality = undefined; // PNG等无损格式不需要质量参数
            }

            // 获取转换后的文件
            let blob = await new Promise((resolve, reject) => {
                if (quality !== undefined) {
                    canvas.toBlob((result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(new Error('转换失败'));
                        }
                    }, mimeType, quality);
                } else {
                    canvas.toBlob((result) => {
                        if (result) {
                            resolve(result);
                        } else {
                            reject(new Error('转换失败'));
                        }
                    }, mimeType);
                }
            });

            // 验证转换后的格式是否正确
            if (selectedFormat === 'webp' && blob.type !== 'image/webp') {
                console.warn(`WebP转换失败，实际格式: ${blob.type}，回退到PNG格式`);
                showToast('浏览器不支持WebP，已转换为PNG格式');
                
                // 重新转换为PNG
                blob = await new Promise((resolve) => {
                    canvas.toBlob(resolve, 'image/png');
                });
                
                // 更新文件扩展名
                const extension = 'png';
                convertedFiles.push({
                    file: blob,
                    name: getConvertedFileName(file.file.name, extension)
                });
                
                previewItem.querySelector('.converted-format').textContent = 'PNG (WebP不支持)';
            } else {
                // 保存转换后的文件
                const extension = selectedFormat === 'jpg' ? 'jpg' : selectedFormat;
                convertedFiles.push({
                    file: blob,
                    name: getConvertedFileName(file.file.name, extension)
                });
                
                previewItem.querySelector('.converted-format').textContent = selectedFormat.toUpperCase();
            }

            // 更新预览信息
            previewItem.querySelector('.converted-size').textContent = formatFileSize(blob.size);
            previewItem.querySelector('.converted-dimensions').textContent = `${finalWidth} × ${finalHeight}`;

            // 显示下载按钮
            const downloadButton = previewItem.querySelector('.btn');
            downloadButton.style.display = 'block';
            const currentFileIndex = convertedFiles.length - 1;
            downloadButton.onclick = () => {
                const currentFile = convertedFiles[currentFileIndex];
                const url = URL.createObjectURL(currentFile.file);
                const a = document.createElement('a');
                a.href = url;
                a.download = currentFile.name;
                a.click();
                URL.revokeObjectURL(url);
            };
        }

        // 显示命名方式选择和批量下载按钮
        const namingGroup = document.getElementById('namingGroup');
        if (namingGroup) {
            namingGroup.style.display = 'block';
        }
        downloadBtn.style.display = 'block';

        showToast('转换完成！');
    } catch (error) {
        console.error('转换错误:', error);
        showToast('转换失败，请重试');
    } finally {
        convertBtn.disabled = false;
        progressBar.style.display = 'none';
    }
});

// 批量下载按钮点击事件
downloadBtn.addEventListener('click', async () => {
    if (convertedFiles.length === 0) {
        showToast('没有可下载的文件');
        return;
    }

    if (convertedFiles.length === 1) {
        // 单个文件直接下载
        const file = convertedFiles[0];
        const url = URL.createObjectURL(file.file);
        const a = document.createElement('a');
        a.href = url;

        // 根据当前命名模式生成文件名
        const extension = selectedFormat === 'jpg' ? 'jpg' : selectedFormat;
        const originalFileName = uploadedFiles[0].file.name;
        a.download = getConvertedFileName(originalFileName, extension);

        a.click();
        URL.revokeObjectURL(url);
        showToast('开始下载');
    } else {
        // 多个文件打包下载
        const zip = new JSZip();
        convertedFiles.forEach((file, index) => {
            // 根据当前命名模式生成文件名
            const extension = selectedFormat === 'jpg' ? 'jpg' : selectedFormat;
            const originalFileName = uploadedFiles[index].file.name;
            const fileName = getConvertedFileName(originalFileName, extension);
            zip.file(fileName, file.file);
        });

        zip.generateAsync({
            type: 'blob'
        }).then(content => {
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `converted_images.zip`;
            a.click();
            URL.revokeObjectURL(url);
            showToast('开始下载压缩包');
        });
    }
});

// 命名方式选择
document.querySelectorAll('.naming-option').forEach(option => {
    option.addEventListener('click', () => {
        document.querySelectorAll('.naming-option').forEach(opt => opt.classList.remove('active'));
        option.classList.add('active');
        namingMode = option.dataset.naming;
    });
});

// 命名预览功能已简化，不再需要动态更新

// 清空所有按钮
const clearBtn = document.getElementById('clearBtn');
if (clearBtn) {
    clearBtn.addEventListener('click', () => {
        // 清空上传的文件
        uploadedFiles = [];
        convertedFiles = [];

        // 清空预览网格
        previewGrid.innerHTML = '';

        // 重置按钮状态
        convertBtn.disabled = true;
        downloadBtn.style.display = 'none';
        clearBtn.style.display = 'none';

        // 隐藏命名方式选择
        const namingGroup = document.getElementById('namingGroup');
        if (namingGroup) {
            namingGroup.style.display = 'none';
        }

        // 重置进度条
        progressBar.style.display = 'none';
        progress.style.width = '0%';

        showToast('已清空所有内容');
    });
}

// 清空按钮的显示逻辑已经集成到原始handleFiles函数中

// 修改转换完成后的文件命名逻辑
function getConvertedFileName(originalName, format) {
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf('.')) || originalName;

    if (namingMode === 'original') {
        // 保留原名，只改扩展名
        return `${nameWithoutExt}.${format}`;
    } else {
        // 转换命名，添加converted前缀
        return `converted_${nameWithoutExt}.${format}`;
    }
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}