let lastTransformType = '';
const history = [];

document.addEventListener('DOMContentLoaded', function() {
    initializeTabs();
    initializeEventListeners();
    updateCharCount();
    updateHistoryList(); // 添加这行，初始化历史记录显示
});

function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const target = e.currentTarget;
            const category = target.getAttribute('data-tab');
            
            tabBtns.forEach(b => b.classList.remove('active'));
            tabPanes.forEach(p => p.classList.remove('active'));
            
            target.classList.add('active');
            document.getElementById(`${category}-panel`).classList.add('active');
        });
    });
}

function initializeEventListeners() {
    const sourceTextarea = document.getElementById('source');
    
    // Tab切换
    document.querySelectorAll('.form-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // 移除所有active类
            document.querySelectorAll('.form-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
            
            // 添加active类到当前tab
            tab.classList.add('active');
            const tabId = `${tab.dataset.tab}-panel`;
            document.getElementById(tabId).classList.add('active');
        });
    });

    // 实时转换
    sourceTextarea.addEventListener('input', () => {
        updateCharCount();
        if (lastTransformType) {
            transform(lastTransformType);
        }
    });

    // 文件拖放支持
    sourceTextarea.addEventListener('dragover', (e) => {
        e.preventDefault();
        sourceTextarea.classList.add('dragover');
    });

    sourceTextarea.addEventListener('dragleave', () => {
        sourceTextarea.classList.remove('dragover');
    });

    sourceTextarea.addEventListener('drop', (e) => {
        e.preventDefault();
        sourceTextarea.classList.remove('dragover');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type === 'text/plain') {
            const reader = new FileReader();
            reader.onload = (e) => {
                sourceTextarea.value = e.target.result;
                updateCharCount();
                if (lastTransformType) {
                    transform(lastTransformType);
                }
            };
            reader.readAsText(file);
        } else {
            showToast('只支持文本文件');
        }
    });

    // 快捷键支持
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey || e.metaKey) {
            switch(e.key.toLowerCase()) {
                case 'u':
                    e.preventDefault();
                    transform('uppercase');
                    break;
                case 'l':
                    e.preventDefault();
                    transform('lowercase');
                    break;
            }
        }
    });
}

function updateCharCount() {
    const sourceTextarea = document.getElementById('source');
    const charCount = document.querySelector('.char-count');
    if (charCount) {
        charCount.textContent = `${sourceTextarea.value.length} 个字符`;
    }
}

function transform(type) {
    const input = document.getElementById('source').value;
    if (!input) {
        showToast('请先输入需要转换的文本');
        return;
    }

    const currentModeSpan = document.querySelector('.current-mode');
    currentModeSpan.textContent = getTransformModeName(type);

    document.querySelectorAll('.transform-card.active, .format-card.active').forEach(card => {
        card.classList.remove('active');
    });

    const card = document.querySelector(`[data-type="${type}"]`);
    if (card) {
        card.classList.add('active');
    }

    let result = '';
    switch (type) {
        case 'uppercase':
            result = input.toUpperCase();
            break;
        case 'lowercase':
            result = input.toLowerCase();
            break;
        case 'capitalize':
            result = input.replace(/\b\w/g, c => c.toUpperCase());
            break;
        case 'sentenceCase':
            result = input.toLowerCase().replace(/(^\w|\.\s+\w)/g, c => c.toUpperCase());
            break;
        case 'lineFirstUpper':
            result = input.split('\n').map(line => 
                line.charAt(0).toUpperCase() + line.slice(1)
            ).join('\n');
            break;
        case 'spaceToUnderscore':
            result = input.replace(/\s+/g, '_');
            break;
        case 'underscoreToSpace':
            result = input.replace(/_+/g, ' ');
            break;
        case 'underscoreToDash':
            result = input.replace(/_+/g, '-');
            break;
        case 'dashToUnderscore':
            result = input.replace(/-+/g, '_');
            break;
    }

    const resultTextarea = document.getElementById('result');
    resultTextarea.value = result;
    lastTransformType = type;
    addToHistory(input, result, type);
    updateCharCount();
}

function getTransformModeName(type) {
    const modeNames = {
        'uppercase': '全大写',
        'lowercase': '全小写',
        'capitalize': '单词首字母大写',
        'sentenceCase': '句首字母大写',
        'lineFirstUpper': '行首字母大写',
        'spaceToUnderscore': '空格转下划线',
        'underscoreToSpace': '下划线转空格',
        'underscoreToDash': '下划线转中横线',
        'dashToUnderscore': '中横线转下划线'
    };
    return modeNames[type] || '';
}

function addToHistory(source, result, type) {
    const history = JSON.parse(localStorage.getItem('textHistory') || '[]');
    const timestamp = new Date().toLocaleTimeString();
    
    history.unshift({
        source,
        result,
        type,
        timestamp
    });

    if (history.length > 10) {
        history.pop();
    }

    localStorage.setItem('textHistory', JSON.stringify(history));
    updateHistoryList();
}

function updateHistoryList() {
    const historyList = document.querySelector('.history-list');
    const history = JSON.parse(localStorage.getItem('textHistory') || '[]');

    if (history.length === 0) {
        historyList.innerHTML = '<div class="history-empty">暂无历史记录</div>';
        return;
    }

    historyList.innerHTML = history.map(item => `
        <div class="history-item" onclick="applyHistory('${item.source}', '${item.result}')">
            <div class="history-content">
                <div class="history-text">${item.source.substring(0, 50)}${item.source.length > 50 ? '...' : ''}</div>
                <div class="history-info">
                    <span class="transform-type">${getTransformModeName(item.type)}</span>
                    <span>${item.timestamp}</span>
                </div>
            </div>
            <button class="btn-icon" onclick="event.stopPropagation(); copyText('${item.result}')">
                <span class="iconify" data-icon="tabler:copy" data-inline="false"></span>
            </button>
        </div>
    `).join('');
}

function applyHistory(source, result) {
    const sourceTextarea = document.getElementById('source');
    sourceTextarea.value = source;
    const resultTextarea = document.getElementById('result');
    resultTextarea.value = result;
    updateCharCount();
}

function copyResult() {
    const resultTextarea = document.getElementById('result');
    resultTextarea.select();
    try {
        document.execCommand('copy');
        showToast('已复制到剪贴板');
    } catch (err) {
        showToast('复制失败，请手动复制');
    }
}

function reset() {
    document.getElementById('source').value = '';
    document.getElementById('result').value = '';
    document.querySelector('.current-mode').textContent = '';
    updateCharCount();
    showToast('内容已清空');
}

function clearHistory() {
    if (confirm('确定要清空所有历史记录吗？')) {
        localStorage.removeItem('textHistory');
        updateHistoryList();
        showToast('历史记录已清空');
    }
}

function toggleDropdown() {
    document.getElementById('dropdown-menu').classList.toggle('show');
}

window.onclick = function(event) {
    if (!event.target.matches('.btn')) {
        const dropdowns = document.getElementsByClassName('dropdown-content');
        for (const dropdown of dropdowns) {
            if (dropdown.classList.contains('show')) {
                dropdown.classList.remove('show');
            }
        }
    }
}

function copyText(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand('copy');
    document.body.removeChild(textarea);
    showToast('已复制文本');
}

function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.style.display = 'block';
    toast.style.opacity = 1;
    
    setTimeout(() => {
        toast.style.opacity = 0;
        setTimeout(() => {
            toast.style.display = 'none';
        }, 300);
    }, 2000);
}