// 初始化转换器
const converters = {
    zh_cn: OpenCC.Converter({ from: 'tw', to: 'cn' }),
    zh_hant: OpenCC.Converter({ from: 'cn', to: 'tw' }),
    zh_hk: OpenCC.Converter({ from: 'cn', to: 'hk' }),
    zh_tw: OpenCC.Converter({ from: 'cn', to: 'twp' })
};

new Vue({
    el: '.tool-container',
    data: {
        set: {
            input: '',
            output: ''
        },
        lastTransformType: ''
    },
    mounted() {
        this.initializeEventListeners();
        this.updateCharCount();
        this.updateHistoryList();
    },
    methods: {
        initializeEventListeners() {
            const input = document.getElementById('input');
            
            // 文件拖放支持
            input.addEventListener('dragover', (e) => {
                e.preventDefault();
                input.classList.add('dragover');
            });

            input.addEventListener('dragleave', () => {
                input.classList.remove('dragover');
            });

            input.addEventListener('drop', (e) => {
                e.preventDefault();
                input.classList.remove('dragover');
                
                const file = e.dataTransfer.files[0];
                if (file && file.type === 'text/plain') {
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.set.input = e.target.result;
                        this.updateCharCount();
                        if (this.lastTransformType) {
                            this.convert(this.lastTransformType);
                        }
                    };
                    reader.readAsText(file);
                } else {
                    showToast('只支持文本文件');
                }
            });

            // 实时转换
            input.addEventListener('input', () => {
                this.updateCharCount();
                if (this.lastTransformType) {
                    this.convert(this.lastTransformType);
                }
            });
        },
        updateCharCount() {
            const charCount = document.querySelector('.char-count');
            if (charCount) {
                charCount.textContent = `${this.set.input.length} 个字符`;
            }
        },
        convert(type) {
            if (!this.set.input) {
                showToast('请输入需要转换的文本');
                return;
            }
            
            try {
                const converter = converters[type];
                if (converter) {
                    this.set.output = converter(this.set.input);
                    this.lastTransformType = type;
                    
                    // 更新当前转换模式
                    const currentMode = document.querySelector('.current-mode');
                    if (currentMode) {
                        currentMode.textContent = this.getModeName(type);
                    }
                    
                    // 添加到历史记录
                    this.addToHistory(this.set.input, this.set.output, type);
                } else {
                    throw new Error('不支持的转换类型');
                }
            } catch (error) {
                console.error('转换失败：', error);
                this.set.output = '转换失败，请稍后重试';
                showToast('转换失败：' + error.message);
            }
        },
        getModeName(type) {
            const modeNames = {
                'zh_cn': '大陆简体',
                'zh_hant': '繁体中文',
                'zh_hk': '港澳繁體',
                'zh_tw': '台灣正體'
            };
            return modeNames[type] || '';
        },
        reset() {
            this.set.input = '';
            this.set.output = '';
            this.lastTransformType = '';
            this.updateCharCount();
            showToast('内容已清空');
        },
        copyOutput() {
            if (!this.set.output) {
                showToast('没有可复制的内容');
                return;
            }
            const output = document.getElementById('output');
            output.select();
            document.execCommand('copy');
            showToast('已复制转换结果');
        },
        addToHistory(source, result, type) {
            const history = JSON.parse(localStorage.getItem('zhHistory') || '[]');
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

            localStorage.setItem('zhHistory', JSON.stringify(history));
            this.updateHistoryList();
        },
        updateHistoryList() {
            const historyList = document.querySelector('.history-list');
            const history = JSON.parse(localStorage.getItem('zhHistory') || '[]');

            if (history.length === 0) {
                historyList.innerHTML = '<div class="history-empty">暂无历史记录</div>';
                return;
            }

            historyList.innerHTML = history.map(item => `
                <div class="history-item" onclick="app.applyHistory('${item.source}', '${item.result}')">
                    <div class="history-content">
                        <div class="history-text">${item.source.substring(0, 50)}${item.source.length > 50 ? '...' : ''}</div>
                        <div class="history-info">
                            <span class="transform-type">${this.getModeName(item.type)}</span>
                            <span>${item.timestamp}</span>
                        </div>
                    </div>
                    <button class="btn-icon" onclick="event.stopPropagation(); app.copyText('${item.result}')">
                        <span class="iconify" data-icon="tabler:copy" data-inline="false"></span>
                    </button>
                </div>
            `).join('');
        },
        applyHistory(source, result) {
            this.set.input = source;
            this.set.output = result;
            this.updateCharCount();
        },
        copyText(text) {
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showToast('已复制文本');
        },
        clearHistory() {
            if (confirm('确定要清空所有历史记录吗？')) {
                localStorage.removeItem('zhHistory');
                this.updateHistoryList();
                showToast('历史记录已清空');
            }
        },
        showToast(message) {
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = message;
            document.body.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 2000);
        }
    }
});