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
     });
 });

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
     if (maintainAspectRatio) {
         heightInput.value = Math.round(widthInput.value / aspectRatio);
     }
 });

 heightInput.addEventListener('input', () => {
     if (maintainAspectRatio) {
         widthInput.value = Math.round(heightInput.value * aspectRatio);
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

 // 创建预览项
 function createPreviewItem(file) {
     const previewItem = document.createElement('div');
     previewItem.className = 'preview-item';
     const index = uploadedFiles.length;
     previewItem.innerHTML = `
         <div class="preview-image">
             <img src="${URL.createObjectURL(file)}" alt="${file.name}">
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
     };
     img.src = URL.createObjectURL(file);

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
                 convertedFiles.push({
                     file: convertedFile,
                     name: convertedFile.name
                 });
                 continue;
             }

             // 需要转换格式或调整尺寸
             const img = new Image();
             await new Promise((resolve, reject) => {
                 img.onload = resolve;
                 img.onerror = reject;
                 img.src = file.preview;
             });

             // 获取目标尺寸
             let targetWidth, targetHeight;
             switch (selectedPreset) {
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
                     const size = Math.min(widthInput.value || 1000, heightInput.value || 1000);
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
             const ctx = canvas.getContext('2d');
             canvas.width = finalWidth;
             canvas.height = finalHeight;

             // 对于PNG格式，保持透明度
             if (selectedFormat === 'png') {
                 ctx.clearRect(0, 0, finalWidth, finalHeight);
             }

             ctx.drawImage(img, 0, 0, finalWidth, finalHeight);

            // 转换为指定格式
            const mimeType = `image/${selectedFormat}`;
            const quality = 1.0; // 最高质量

            // 获取转换后的文件
             const blob = await new Promise(resolve => {
                canvas.toBlob(resolve, mimeType, quality);
            });

             // 更新预览信息
             previewItem.querySelector('.converted-format').textContent = selectedFormat.toUpperCase();
            previewItem.querySelector('.converted-size').textContent = formatFileSize(blob.size);
            previewItem.querySelector('.converted-dimensions').textContent = `${finalWidth} × ${finalHeight}`;

            // 显示下载按钮
            const downloadButton = previewItem.querySelector('.btn');
            downloadButton.style.display = 'block';
            downloadButton.onclick = () => {
                const url = URL.createObjectURL(blob);
                     const a = document.createElement('a');
                     a.href = url;
                a.download = `converted_${file.file.name.split('.')[0]}.${selectedFormat}`;
                     a.click();
                     URL.revokeObjectURL(url);
            };

             // 保存转换后的文件
             convertedFiles.push({
                file: blob,
                name: `converted_${file.file.name.split('.')[0]}.${selectedFormat}`
            });
        }

        // 显示批量下载按钮
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
        a.download = file.name;
         a.click();
         URL.revokeObjectURL(url);
        showToast('开始下载');
     } else {
         // 多个文件打包下载
         const zip = new JSZip();
        convertedFiles.forEach(file => {
            zip.file(file.name, file.file);
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

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}