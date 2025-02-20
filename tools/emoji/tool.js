// 获取 DOM 元素
const categoryTabs = document.getElementById('categoryTabs');
const symbolContent = document.getElementById('symbolContent');
const searchInput = document.getElementById('searchInput');

// 从 symbolData 中获取分类
function getCategoriesFromData() {
    const categories = [{ id: 'all', title: '全部表情' }];
    Object.entries(symbolData).forEach(([key, value]) => {
        categories.push({
            id: key,
            title: value.title || key
        });
    });
    return categories;
}

// 生成标签页
function renderCategoryTabs() {
    const categories = getCategoriesFromData();
    categoryTabs.innerHTML = ''; // 清空现有内容
    
    categories.forEach((category, index) => {
        const button = document.createElement('button');
        button.className = `tab-btn ${index === 0 ? 'active' : ''}`;
        button.setAttribute('data-category', category.id);
        button.textContent = category.title;
        button.onclick = () => switchCategory(category.id);
        categoryTabs.appendChild(button);
    });
}

// 渲染表情符号
function renderEmojis(categoryId = 'all') {
    symbolContent.innerHTML = '';

    if (categoryId === 'all') {
        // 渲染所有分类
        Object.entries(symbolData).forEach(([mainKey, mainValue]) => {
            renderMainCategory(mainKey, mainValue);
        });
    } else {
        // 渲染特定分类
        const categoryData = symbolData[categoryId];
        if (categoryData) {
            renderMainCategory(categoryId, categoryData);
        }
    }

    // 显示所有表情
    searchSymbols('');
}

// 渲染主分类
function renderMainCategory(key, data) {
    const section = document.createElement('section');
    section.className = 'symbol-section';
    section.setAttribute('data-category', key);
    
    const title = document.createElement('h2');
    title.textContent = data.title || key;
    section.appendChild(title);

    // 渲染子分类
    Object.entries(data.categories).forEach(([subKey, subData]) => {
        const subSection = document.createElement('div');
        subSection.className = 'sub-category';
        subSection.setAttribute('data-subcategory', subKey);
        
        const subTitle = document.createElement('h3');
        subTitle.textContent = subData.title || subKey;
        subSection.appendChild(subTitle);

        const grid = document.createElement('div');
        grid.className = 'symbol-grid';

        subData.symbols.forEach(symbol => {
            const item = document.createElement('div');
            item.className = 'symbol-item';
            item.textContent = symbol;
            item.onclick = async () => {
                try {
                    if (navigator.clipboard && window.isSecureContext) {
                        await navigator.clipboard.writeText(symbol);
                    } else {
                        // 创建临时文本区域
                        const textArea = document.createElement('textarea');
                        textArea.value = symbol;
                        textArea.style.position = 'fixed';
                        textArea.style.left = '-9999px';
                        document.body.appendChild(textArea);
                        textArea.select();
                        try {
                            document.execCommand('copy');
                        } catch (err) {
                            console.error('复制失败:', err);
                        }
                        document.body.removeChild(textArea);
                    }
                    window.showToast('表情已复制到剪贴板');
                } catch (err) {
                    console.error('复制失败:', err);
                    window.showToast('复制失败，请手动复制');
                }
            };
            grid.appendChild(item);
        });

        subSection.appendChild(grid);
        section.appendChild(subSection);
    });

    symbolContent.appendChild(section);
}

// 搜索表情
function searchSymbols(query) {
    query = query.toLowerCase().trim();
    const sections = document.querySelectorAll('.symbol-section');
    let totalVisible = 0;

    sections.forEach(section => {
        const subCategories = section.querySelectorAll('.sub-category');
        let sectionVisible = false;

        subCategories.forEach(subCategory => {
            const items = subCategory.querySelectorAll('.symbol-item');
            let subCategoryVisible = false;

            items.forEach(item => {
                const isVisible = item.textContent.toLowerCase().includes(query);
                item.style.display = isVisible ? '' : 'none';
                if (isVisible) {
                    subCategoryVisible = true;
                    sectionVisible = true;
                    totalVisible++;
                }
            });

            // 只在有可见项时显示子分类
            subCategory.style.display = subCategoryVisible ? '' : 'none';
        });

        // 仅在有可见项时显示主分类
        section.style.display = sectionVisible ? '' : 'none';
    });

    // 显示搜索结果状态
    const statusDiv = document.querySelector('.search-status') || (() => {
        const div = document.createElement('div');
        div.className = 'search-status';
        document.querySelector('.search-container').appendChild(div);
        return div;
    })();

    statusDiv.textContent = query ? `找到 ${totalVisible} 个匹配的表情` : '';
}

// 切换分类
function switchCategory(categoryId) {
    const buttons = document.querySelectorAll('.tab-btn');
    buttons.forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-category') === categoryId);
    });
    renderEmojis(categoryId);
    
    // 清空搜索框和搜索状态
    if (searchInput) {
        searchInput.value = '';
        searchSymbols('');
    }
}

// 初始化页面
document.addEventListener('DOMContentLoaded', () => {
    renderCategoryTabs();
    renderEmojis('all'); // 确保在页面加载时渲染所有表情
    
    // 添加搜索框事件监听
    if (searchInput) {
        let debounceTimer;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            debounceTimer = setTimeout(() => {
                searchSymbols(e.target.value);
            }, 200);
        });
    }
});
