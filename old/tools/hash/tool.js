// Tab 切换
document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
        // 移除所有 active
        document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        
        // 添加当前 active
        btn.classList.add('active');
        const tabId = btn.dataset.tab + '-tab';
        document.getElementById(tabId).classList.add('active');
    });
});

// 输入框字符数统计
const inputText = document.getElementById('input-text');
const textCount = document.getElementById('text-count');

inputText.addEventListener('input', () => {
    const count = inputText.value.length;
    textCount.textContent = `字符数：${count}`;
});

// HMAC 开关
const useHmac = document.getElementById('use-hmac');
const hmacKey = document.getElementById('hmac-key');

useHmac.addEventListener('change', () => {
    hmacKey.disabled = !useHmac.checked;
    if (useHmac.checked) {
        hmacKey.focus();
    }
});

// 获取选中的算法（文本模式）
function getSelectedAlgorithms() {
    const checkboxes = document.querySelectorAll('#text-tab .algorithm-chips input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// 获取文件模式选中的算法
function getFileAlgorithms() {
    const checkboxes = document.querySelectorAll('#file-tab .algorithm-chips input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

// 计算文本哈希
function calculateHash() {
    const text = inputText.value;
    
    if (!text) {
        showToast('请输入需要计算哈希的文本');
        return;
    }
    
    const algorithms = getSelectedAlgorithms();
    if (algorithms.length === 0) {
        showToast('请至少选择一种哈希算法');
        return;
    }
    
    const isHmac = useHmac.checked;
    const key = hmacKey.value;
    
    if (isHmac && !key) {
        showToast('使用 HMAC 模式需要输入密钥');
        return;
    }
    
    const resultsList = document.getElementById('results-list');
    resultsList.innerHTML = '';
    
    algorithms.forEach(algo => {
        try {
            let hash;
            const algoUpper = algo.toUpperCase().replace('-', '');
            
            if (isHmac) {
                // HMAC 模式
                const hmacAlgo = 'Hmac' + algoUpper;
                if (CryptoJS[hmacAlgo]) {
                    hash = CryptoJS[hmacAlgo](text, key).toString();
                } else {
                    hash = '该算法不支持 HMAC';
                }
            } else {
                // 普通哈希
                if (CryptoJS[algoUpper]) {
                    hash = CryptoJS[algoUpper](text).toString();
                } else {
                    hash = '不支持的算法';
                }
            }
            
            const resultItem = createHashResultItem(algo.toUpperCase(), hash);
            resultsList.appendChild(resultItem);
        } catch (err) {
            console.error(`计算 ${algo} 失败:`, err);
        }
    });
    
    showToast('哈希计算完成！');
}

// 创建哈希结果项
function createHashResultItem(algoName, hashValue) {
    const item = document.createElement('div');
    item.className = 'hash-result-item';
    
    item.innerHTML = `
        <div class="hash-result-header">
            <span class="hash-algo-name">${algoName}</span>
            <div class="hash-actions">
                <button class="btn btn-secondary" onclick="copyHash(this, '${hashValue}')">复制</button>
            </div>
        </div>
        <div class="hash-value">${hashValue}</div>
    `;
    
    return item;
}

// 复制哈希值
function copyHash(btn, value) {
    navigator.clipboard.writeText(value).then(() => {
        const originalText = btn.textContent;
        btn.textContent = '已复制';
        btn.style.background = '#10b981';
        btn.style.borderColor = '#10b981';
        btn.style.color = 'white';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
            btn.style.borderColor = '';
            btn.style.color = '';
        }, 1500);
        
        showToast('复制成功！');
    }).catch(() => {
        showToast('复制失败');
    });
}

// 清空文本
function clearText() {
    inputText.value = '';
    textCount.textContent = '字符数：0';
    document.getElementById('results-list').innerHTML = `
        <div class="empty-state">
            <span class="iconify" data-icon="tabler:hash" style="font-size: 48px; opacity: 0.3;"></span>
            <p>输入文本并选择算法后点击计算</p>
        </div>
    `;
    showToast('已清空');
}

// ========== 文件哈希功能 ==========

const uploadArea = document.getElementById('upload-area');
const fileInput = document.getElementById('file-input');
const fileResultsSection = document.getElementById('file-results-section');
const fileList = document.getElementById('file-list');

// 点击上传
uploadArea.addEventListener('click', () => {
    fileInput.click();
});

// 文件选择
fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        processFiles(files);
    }
});

// 拖拽上传
uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
        processFiles(files);
    }
});

// 处理文件
function processFiles(files) {
    const algorithms = getFileAlgorithms();
    
    if (algorithms.length === 0) {
        showToast('请至少选择一种哈希算法');
        return;
    }
    
    fileResultsSection.style.display = 'block';
    
    files.forEach(file => {
        const fileItem = createFileItem(file);
        fileList.appendChild(fileItem);
        
        calculateFileHash(file, algorithms, fileItem);
    });
}

// 创建文件项
function createFileItem(file) {
    const item = document.createElement('div');
    item.className = 'file-item';
    
    item.innerHTML = `
        <div class="file-item-header">
            <span class="file-name">${file.name}</span>
            <span class="file-size">${formatFileSize(file.size)}</span>
        </div>
        <div class="file-hashes" data-file-name="${file.name}">
            <div style="text-align: center; padding: 20px; color: var(--text-secondary);">
                <span class="iconify" data-icon="tabler:loader" data-inline="false" style="font-size: 24px; animation: spin 1s linear infinite;"></span>
                <p style="margin-top: 8px;">正在计算...</p>
            </div>
        </div>
    `;
    
    return item;
}

// 计算文件哈希
function calculateFileHash(file, algorithms, fileItem) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
        const wordArray = CryptoJS.lib.WordArray.create(e.target.result);
        const hashesContainer = fileItem.querySelector('.file-hashes');
        hashesContainer.innerHTML = '';
        
        algorithms.forEach(algo => {
            try {
                const algoUpper = algo.toUpperCase().replace('-', '');
                let hash;
                
                if (CryptoJS[algoUpper]) {
                    hash = CryptoJS[algoUpper](wordArray).toString();
                } else {
                    hash = '不支持的算法';
                }
                
                const hashRow = document.createElement('div');
                hashRow.className = 'file-hash-row';
                hashRow.innerHTML = `
                    <span class="file-hash-label">${algo.toUpperCase()}</span>
                    <span class="file-hash-value">${hash}</span>
                    <button class="btn btn-secondary" onclick="copyHash(this, '${hash}')">复制</button>
                `;
                hashesContainer.appendChild(hashRow);
            } catch (err) {
                console.error(`计算 ${algo} 失败:`, err);
            }
        });
        
        showToast(`${file.name} 计算完成`);
    };
    
    reader.onerror = () => {
        showToast(`读取文件 ${file.name} 失败`);
    };
    
    reader.readAsArrayBuffer(file);
}

// 清空文件列表
function clearFiles() {
    fileList.innerHTML = '';
    fileResultsSection.style.display = 'none';
    fileInput.value = '';
    showToast('已清空文件列表');
}

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
}

// 添加旋转动画
const style = document.createElement('style');
style.textContent = `
    @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
    }
`;
document.head.appendChild(style);
