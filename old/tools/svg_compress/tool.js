// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', () => {
    // 获取DOM元素
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previewGrid = document.getElementById('previewGrid');
    const convertBtn = document.getElementById('convertBtn');
    const downloadBtn = document.getElementById('downloadBtn');

    // 存储上传的文件和设置
    let uploadedFiles = [];
    let compressedFiles = [];
    let compressionMode = 'standard';

    // 文件大小格式化
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

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

    // SVG压缩函数 - 统一的压缩算法
    function compressSvg(svgContent) {
        try {
            console.log(`使用${compressionMode}模式压缩`);
            
            // 首先验证SVG的有效性
            if (!isValidSvg(svgContent)) {
                throw new Error('无效的SVG文件');
            }
            
            const compressed = unifiedCompress(svgContent);
            
            // 压缩后再次验证
            if (!isValidSvg(compressed)) {
                console.warn('压缩后SVG可能损坏，返回原始文件');
                return svgContent;
            }
            
            return compressed;
        } catch (error) {
            console.error('SVG压缩失败，返回原始文件:', error);
            return svgContent; // 失败时返回原始文件，确保安全
        }
    }



    // SVG有效性验证
    function isValidSvg(svgContent) {
        try {
            // 基础格式检查
            if (!svgContent || typeof svgContent !== 'string') {
                return false;
            }
            
            // 检查是否包含SVG标签
            if (!/<svg[\s\S]*?<\/svg>/i.test(svgContent)) {
                return false;
            }
            
            // 尝试解析为DOM
            const parser = new DOMParser();
            const doc = parser.parseFromString(svgContent, 'image/svg+xml');
            
            // 检查解析错误
            const parserError = doc.querySelector('parsererror');
            if (parserError) {
                return false;
            }
            
            // 检查是否有SVG根元素
            const svgElement = doc.querySelector('svg');
            return svgElement !== null;
            
        } catch (error) {
            return false;
        }
    }

    // 统一的压缩算法 - 根据模式进行不同程度的优化
    function unifiedCompress(svgContent) {
        let compressed = svgContent;
        const originalSize = compressed.length;

        // 根据模式进行不同程度的优化
        switch (compressionMode) {
            case 'minimal':
                console.log('最小压缩：仅移除注释');
                compressed = minimalCompress(compressed);
                break;
            case 'standard':
                console.log('标准压缩：平衡优化');
                compressed = standardCompress(compressed);
                break;
            case 'enhanced':
                console.log('增强压缩：更好效果');
                compressed = enhancedCompress(compressed);
                break;
            case 'maximum':
                console.log('最大压缩：追求最小体积');
                compressed = maximumCompress(compressed);
                break;
            default:
                compressed = standardCompress(compressed);
        }

        const finalSize = compressed.length;
        const compressionRatio = ((originalSize - finalSize) / originalSize * 100).toFixed(1);
        console.log(`压缩完成：${originalSize} → ${finalSize} bytes (${compressionRatio}% 压缩)`);

        return compressed;
    }

    // 最小压缩 - 只做最安全的操作
    function minimalCompress(svgContent) {
        let compressed = svgContent;
        // 只移除注释
        compressed = compressed.replace(/<!--[\s\S]*?-->/g, '');
        // 移除首尾空白
        compressed = compressed.replace(/^\s+|\s+$/g, '');
        return compressed;
    }

    // 标准压缩 - 平衡效果
    function standardCompress(svgContent) {
        let compressed = svgContent;
        
        // 移除注释
        compressed = compressed.replace(/<!--[\s\S]*?-->/g, '');
        
        // 移除常见默认属性
        compressed = compressed.replace(/\s+fill=["']#000000["']/gi, '');
        compressed = compressed.replace(/\s+fill=["']black["']/gi, '');
        compressed = compressed.replace(/\s+stroke=["']none["']/gi, '');
        
        // 空白字符优化
        compressed = compressed.replace(/>\s+</g, '><');
        compressed = compressed.replace(/^\s+|\s+$/g, '');
        
        return compressed;
    }

    // 增强压缩 - 更好效果但仍然安全
    function enhancedCompress(svgContent) {
        let compressed = svgContent;
        
        // 移除注释和元数据
        compressed = compressed.replace(/<!--[\s\S]*?-->/g, '');
        compressed = compressed.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
        compressed = compressed.replace(/<title[\s\S]*?<\/title>/gi, '');
        compressed = compressed.replace(/<desc[\s\S]*?<\/desc>/gi, '');
        
        // 移除更多默认属性
        compressed = compressed.replace(/\s+fill=["'](?:#000000|#000|black)["']/gi, '');
        compressed = compressed.replace(/\s+stroke=["']none["']/gi, '');
        compressed = compressed.replace(/\s+fill-opacity=["']1(?:\.0+)?["']/gi, '');
        compressed = compressed.replace(/\s+stroke-opacity=["']1(?:\.0+)?["']/gi, '');
        
        // 优化数值精度
        compressed = compressed.replace(/(\d+\.\d{3,})/g, (match) => {
            const num = parseFloat(match);
            return num.toFixed(2).replace(/\.00$/, '');
        });
        
        // 空白字符优化
        compressed = compressed.replace(/\s+/g, ' ');
        compressed = compressed.replace(/>\s+</g, '><');
        compressed = compressed.replace(/^\s+|\s+$/g, '');
        
        return compressed;
    }

    // 最大压缩 - 追求最小体积
    function maximumCompress(svgContent) {
        let compressed = svgContent;
        
        // 移除所有元数据
        compressed = compressed.replace(/<!--[\s\S]*?-->/g, '');
        compressed = compressed.replace(/<metadata[\s\S]*?<\/metadata>/gi, '');
        compressed = compressed.replace(/<title[\s\S]*?<\/title>/gi, '');
        compressed = compressed.replace(/<desc[\s\S]*?<\/desc>/gi, '');
        
        // 移除所有默认属性
        compressed = compressed.replace(/\s+fill=["'](?:#000000|#000|black)["']/gi, '');
        compressed = compressed.replace(/\s+stroke=["']none["']/gi, '');
        compressed = compressed.replace(/\s+fill-opacity=["']1(?:\.0+)?["']/gi, '');
        compressed = compressed.replace(/\s+stroke-opacity=["']1(?:\.0+)?["']/gi, '');
        compressed = compressed.replace(/\s+opacity=["']1(?:\.0+)?["']/gi, '');
        
        // 移除空的group标签（小心处理）
        compressed = compressed.replace(/<g\s*>\s*<\/g>/gi, '');
        compressed = compressed.replace(/<g\s+[^>]*>\s*<\/g>/gi, (match) => {
            // 只移除没有重要属性的空group
            if (!/(?:transform|style|class|id)=/i.test(match)) {
                return '';
            }
            return match;
        });
        
        // 激进的数值精度优化
        compressed = compressed.replace(/(\d+\.\d{2,})/g, (match) => {
            const num = parseFloat(match);
            return num.toFixed(1).replace(/\.0$/, '');
        });
        
        // 路径数据优化
        compressed = compressed.replace(/d=["']([^"']+)["']/gi, (match, pathData) => {
            const optimized = pathData
                .replace(/\s+/g, ' ')
                .replace(/([MLHVCSQTAZ])\s+/gi, '$1')
                .replace(/\s+([MLHVCSQTAZ])/gi, '$1')
                .replace(/,\s+/g, ',')
                .trim();
            return `d="${optimized}"`;
        });
        
        // 最大化空白字符优化
        compressed = compressed.replace(/\s+/g, ' ');
        compressed = compressed.replace(/>\s+</g, '><');
        compressed = compressed.replace(/^\s+|\s+$/g, '');
        
        return compressed;
    }



    // 创建预览项
    function createPreviewItem(file, content) {
        const div = document.createElement('div');
        div.className = 'preview-item';
        
        const originalSize = formatFileSize(file.size);
        div.innerHTML = `
            <div class="preview-wrapper">
                <div class="preview-svg">${content}</div>
            </div>
            <div class="file-info">
                <p class="file-name">${file.name}</p>
                <p class="file-size">原始大小: ${originalSize}</p>
                <p class="compressed-size"></p>
            </div>
        `;
        
        return div;
    }

    // 处理上传的文件
    function handleFiles(files) {
        uploadedFiles = Array.from(files).filter(file => file.name.toLowerCase().endsWith('.svg'));
        
        if (uploadedFiles.length === 0) {
            showToast('请上传SVG格式的文件');
            return;
        }

        // 重置状态
        previewGrid.innerHTML = '';
        compressedFiles = [];
        convertBtn.disabled = false;
        convertBtn.textContent = '开始压缩';
        downloadBtn.style.display = 'none';

        for (const file of uploadedFiles) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const previewItem = createPreviewItem(file, e.target.result);
                previewGrid.appendChild(previewItem);
            };
            reader.readAsText(file);
        }
    }

    // 文件拖放处理
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    // 点击上传区域触发文件选择
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    // 文件选择变化处理
    fileInput.addEventListener('change', (e) => {
        handleFiles(e.target.files);
    });

    // 压缩模式选择
    document.querySelectorAll('.mode-option').forEach(option => {
        option.addEventListener('click', () => {
            document.querySelectorAll('.mode-option').forEach(opt => opt.classList.remove('active'));
            option.classList.add('active');
            compressionMode = option.dataset.mode;
            
            // 如果已经有压缩结果，启用重新压缩
            if (compressedFiles.length > 0) {
                convertBtn.disabled = false;
                convertBtn.textContent = '重新压缩';
                showToast(`已切换到${option.querySelector('.mode-name').textContent}，可重新压缩`);
            }
        });
    });

    // 开始压缩
    convertBtn.addEventListener('click', async () => {
        if (uploadedFiles.length === 0) return;

        const progressBar = document.querySelector('.progress-bar');
        const progress = document.querySelector('.progress');
        progressBar.style.display = 'block';
        convertBtn.disabled = true;

        const compressedFiles = [];
        let processedCount = 0;

        for (const file of uploadedFiles) {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const svgContent = e.target.result;
                    const result = compressSvg(svgContent);
                    
                    const previewItems = previewGrid.children;
                    const currentPreview = previewItems[processedCount];
                    
                    if (currentPreview) {
                        const infoDiv = currentPreview.querySelector('.preview-info');
                        const sizeSpan = currentPreview.querySelector('.compressed-size');
                        sizeSpan.textContent = `压缩后大小: ${formatFileSize(result.length)}`;
                        
                        // 更新预览
                        const previewSvg = currentPreview.querySelector('.preview-svg');
                        previewSvg.innerHTML = result;
                    }

                    compressedFiles.push({
                        name: file.name,
                        content: result
                    });

                    processedCount++;
                    progress.style.width = `${(processedCount / uploadedFiles.length) * 100}%`;

                    if (processedCount === uploadedFiles.length) {
                        progressBar.style.display = 'none';
                        // 移动到外面处理
                    }
                } catch (error) {
                    console.error('压缩失败:', error);
                    showToast('压缩失败，请检查文件格式是否正确');
                }
            };
            reader.readAsText(file);
        }

        // 显示下载按钮
        downloadBtn.style.display = 'block';
        downloadBtn.textContent = uploadedFiles.length > 1 ? '批量下载' : '下载SVG';
        showToast('压缩完成！');
        
        // 重置按钮状态，允许重新压缩
        convertBtn.disabled = false;
        convertBtn.textContent = '重新压缩';

        // 下载按钮事件
        downloadBtn.onclick = () => {
            if (compressedFiles.length === 1) {
                // 单个文件直接下载
                const file = compressedFiles[0];
                const blob = new Blob([file.content], { type: 'image/svg+xml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `compressed_${file.name}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            } else {
                // 多个文件打包下载
                const zip = new JSZip();
                compressedFiles.forEach(file => {
                    zip.file(`compressed_${file.name}`, file.content);
                });
                
                zip.generateAsync({type: 'blob'}).then(content => {
                    const url = URL.createObjectURL(content);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'compressed_svgs.zip';
                    document.body.appendChild(a);
                    a.click();
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                });
            }
        };
    });
});
