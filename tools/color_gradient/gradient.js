// DOM 引用
const DOM = {
    gradientContainer: document.getElementById('gradientContainer'),
    tabButtons: document.querySelectorAll('.tab-btn')
};

// 生成渐变色卡片 HTML
function generateGradientCard(name, code, category) {
    const isLight = category === 'light';
    return `
        <div class="gradient-card" style="background: ${code}" onclick="copyToClipboard('${code}')">
            <div class="gradient-name" style="color: ${isLight ? '#111' : 'white'}; text-shadow: ${isLight ? 'none' : '0 1px 3px rgba(0,0,0,0.3)'}">${name}</div>
            <button class="copy-btn" onclick="event.stopPropagation(); copyToClipboard('${code}')">
                <span class="iconify" data-icon="tabler:copy" data-inline="false"></span>
            </button>
            <div class="gradient-info">
                <div class="gradient-code">${code}</div>
            </div>
        </div>
    `;
}

// 显示指定分类的渐变色
function showGradients(category) {
    let gradientList = [];
    
    if (category === 'all') {
        // 如果是全部分类，合并所有渐变色并随机打乱
        gradientList = gradients.reduce((acc, curr) => {
            const categoryName = Object.keys(curr)[0];
            return acc.concat(curr[categoryName].map(item => [...item, categoryName]));
        }, []);
        
        // Fisher-Yates 洗牌算法随机打乱数组
        for (let i = gradientList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [gradientList[i], gradientList[j]] = [gradientList[j], gradientList[i]];
        }
    } else {
        // 显示指定分类
        const categoryData = gradients.find(item => Object.keys(item)[0] === category);
        if (!categoryData) return;
        gradientList = categoryData[category].map(item => [...item, category]);
    }

    DOM.gradientContainer.innerHTML = gradientList
        .map(([name, code, category]) => generateGradientCard(name, code, category))
        .join('');
}

// 切换分类
function switchCategory(category) {
    // 更新按钮状态
    DOM.tabButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.category === category);
    });
    // 显示对应分类的渐变色
    showGradients(category);
}

// 复制到剪贴板
async function copyToClipboard(text) {
    try {
        // 优先使用 Clipboard API
        if (navigator.clipboard && navigator.clipboard.writeText) {
            await navigator.clipboard.writeText(text);
            showToast('CSS代码已复制到剪贴板');
            return;
        }
        
        // 后备方案：使用传统的 execCommand 方法
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        
        try {
            const successful = document.execCommand('copy');
            document.body.removeChild(textarea);
            if (successful) {
                showToast('CSS代码已复制到剪贴板');
            } else {
                showToast('复制失败，请手动复制');
            }
        } catch (err) {
            document.body.removeChild(textarea);
            showToast('复制失败，请手动复制');
        }
    } catch (err) {
        console.error('复制失败:', err);
        showToast('复制失败，请手动复制');
    }
}

// 显示提示信息
function showToast(message) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    // 设置消息和显示
    toast.textContent = message;
    toast.style.display = 'block';
    
    // 2秒后自动隐藏
    setTimeout(() => {
        toast.style.display = 'none';
    }, 2000);
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    // 添加分类切换事件
    DOM.tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            switchCategory(btn.dataset.category);
        });
    });

    // 默认显示全部渐变色
    showGradients('all');
}); 