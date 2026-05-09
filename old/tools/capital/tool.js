// DOM 元素
const searchInput = document.getElementById('capitalSearch');
const clearButton = document.getElementById('clearSearch');
const capitalsGrid = document.getElementById('capitalsGrid');
const emptyState = document.getElementById('emptyState');
const categoryTabs = document.getElementById('categoryTabs');

// 生成分类标签页
const mainCategories = [
    { id: 'all', title: '全部地区' },
    { id: 'asia', title: '亚洲' },
    { id: 'europe', title: '欧洲' },
    { id: 'africa', title: '非洲' },
    { id: 'northAmerica', title: '北美洲' },
    { id: 'southAmerica', title: '南美洲' },
    { id: 'oceania', title: '大洋洲' },

];

// 当前选中的分类
let currentCategory = 'all';

// 生成标签页
mainCategories.forEach((category, index) => {
    const button = document.createElement('button');
    button.className = `tab-btn ${index === 0 ? 'active' : ''}`;
    button.setAttribute('data-category', category.id);
    button.textContent = category.title;
    button.onclick = () => switchCategory(category.id);
    categoryTabs.appendChild(button);
});

// 更新滑块位置
function updateSliderPosition(activeButton) {
    const slider = document.querySelector('.slider');
    if (activeButton && slider) {
        const buttonWidth = activeButton.offsetWidth;
        slider.style.width = '32px';
        slider.style.left = `${activeButton.offsetLeft + (buttonWidth / 2) - 0}px`;
    }
}

// 初始化滑块位置
function initSlider() {
    const activeButton = document.querySelector('.tab-btn.active');
    updateSliderPosition(activeButton);
}

// 切换分类
function switchCategory(categoryId) {
    currentCategory = categoryId;
    
    // 更新按钮状态
    const buttons = document.querySelectorAll('.tab-btn');
    
    buttons.forEach(btn => {
        if (btn.getAttribute('data-category') === categoryId) {
            btn.classList.add('active');
            // 更新滑块位置
            updateSliderPosition(btn);
        } else {
            btn.classList.remove('active');
        }
    });

    // 如果搜索框有内容，执行搜索
    if (searchInput.value.trim()) {
        handleSearch({ target: searchInput });
    } else {
        // 否则显示选中分类的数据
        renderCapitals();
    }
}

// 初始化页面
function initializePage() {
    // 渲染所有首都数据
    renderCapitals();

    // 添加搜索事件监听
    searchInput.addEventListener('input', handleSearch);

    // 添加清除按钮事件监听
    clearButton.addEventListener('click', () => {
        searchInput.value = '';
        clearButton.style.display = 'none';
        renderCapitals();
    });

    // 初始化滑块
    initSlider();
}

// 处理搜索
function handleSearch(event) {
    const searchText = event.target.value.toLowerCase().trim();
    clearButton.style.display = searchText ? 'flex' : 'none';

    // 如果搜索框为空，显示当前分类的数据
    if (!searchText) {
        renderCapitals();
        return;
    }

    // 清空现有内容
    capitalsGrid.innerHTML = '';
    let hasResults = false;

    // 遍历每个大洲
    Object.entries(capitalData).forEach(([continentKey, continentData]) => {
        // 如果选择了特定分类，只显示该分类
        if (currentCategory !== 'all' && continentKey !== currentCategory) {
            return;
        }

        // 过滤该大洲的国家
        const filteredCountries = continentData.countries.filter(item => {
            return item.country.toLowerCase().includes(searchText) || 
                   item.countryEn.toLowerCase().includes(searchText) ||
                   item.capital.toLowerCase().includes(searchText) ||
                   item.capitalEn.toLowerCase().includes(searchText) ||
                   item.details.toLowerCase().includes(searchText);
        });

        // 如果该大洲有匹配的国家，创建大洲区域
        if (filteredCountries.length > 0) {
            hasResults = true;
            createContinentSection(continentData.name, continentData.nameEn, filteredCountries);
        }
    });

    // 显示空状态
    emptyState.style.display = hasResults ? 'none' : 'block';
}

// 渲染首都数据
function renderCapitals() {
    // 清空现有内容
    capitalsGrid.innerHTML = '';
    
    // 遍历并渲染每个大洲
    Object.entries(capitalData).forEach(([continentKey, continentData]) => {
        // 如果选择了特定分类，只显示该分类
        if (currentCategory !== 'all' && continentKey !== currentCategory) {
            return;
        }
        createContinentSection(continentData.name, continentData.nameEn, continentData.countries);
    });

    // 隐藏空状态
    emptyState.style.display = 'none';
}

// 创建大洲区域
function createContinentSection(continentName, continentNameEn, countries) {
    const section = document.createElement('div');
    section.className = 'continent-section';
    
    // 创建大洲标题
    const title = document.createElement('div');
    title.className = 'continent-title';
    title.innerHTML = `<h2>${continentName}<span>${continentNameEn}</span></h2>`;
    section.appendChild(title);

    // 创建国家卡片网格
    const grid = document.createElement('div');
    grid.className = 'continent-grid';
    
    // 添加所有国家卡片
    countries.forEach(country => {
        const card = createCapitalCard(country);
        grid.appendChild(card);
    });

    section.appendChild(grid);
    capitalsGrid.appendChild(section);
}

// 创建首都卡片
function createCapitalCard(data) {
    const card = document.createElement('div');
    card.className = 'capital-card';
    
    card.innerHTML = `
        <div class="card-header">
            <div class="flag-container">
                <span class="fi fi-${data.flag}"></span>
            </div>
            <div class="country-info">
                <div class="name-group">
                    <div class="name-line">
                        <span class="country">${data.country}</span>
                        <span class="country-en">${data.countryEn}</span>
                    </div>
                    <div class="capital-line">
                        <span class="capital">${data.capital}</span>
                        <span class="capital-en">${data.capitalEn}</span>
                    </div>
                </div>
            </div>
        </div>
        <div class="card-content">
            <div class="details-container">
                <div class="location-icon">
                    <span class="iconify" data-icon="tabler:map-pin" data-inline="false"></span>
                </div>
                <div class="details">${data.details}</div>
            </div>
        </div>
    `;

    // 添加点击事件（复制到剪贴板）
    card.addEventListener('click', () => {
        const text = `${data.country}（${data.countryEn}）的首都是${data.capital}（${data.capitalEn}），${data.details}`;
        navigator.clipboard.writeText(text).then(() => {
            showToast('已复制到剪贴板');
        });
    });

    return card;
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initializePage);

// 窗口大小改变时重新计算滑块位置
window.addEventListener('resize', initSlider);