// DOM 元素
const app = document.getElementById('app');
const searchInput = document.querySelector('.search-box');
const clearSearchBtn = document.querySelector('.clear-search');
const breadcrumb = document.querySelector('.breadcrumb');
const regionList = document.querySelector('.region-list');
const regionContent = document.querySelector('.region-content');

// 状态管理
let state = {
    list: [],
    currentProvinceIdx: 0,
    currentCityIdx: 0,
    searchText: '',
    recentSearches: []
};

// 初始化
function init() {
    if (typeof areaZip !== 'undefined') {
        state.list = areaZip;
        loadSavedState();
        loadRecentSearches();
        renderAll();
    } else {
        console.error('数据加载失败，请检查data.js');
    }
}

// 加载保存的状态
function loadSavedState() {
    const savedIdx = localStorage.getItem('zipcode_idx');
    if (savedIdx) {
        const [pIdx, cIdx] = savedIdx.split('_');
        state.currentProvinceIdx = parseInt(pIdx) || 0;
        state.currentCityIdx = parseInt(cIdx) || 0;
    }
}

// 加载最近搜索记录
function loadRecentSearches() {
    const recent = localStorage.getItem('zipcode_recent');
    if (recent) {
        state.recentSearches = JSON.parse(recent);
    }
}

// 渲染所有内容
function renderAll() {
    renderProvinceList();
    renderBreadcrumb();
    renderContent();
}

// 渲染省份列表
function renderProvinceList() {
    if (!regionList) return;
    
    regionList.innerHTML = state.list.map((province, idx) => `
        <div class="region-item ${idx === state.currentProvinceIdx ? 'active' : ''}"
             onclick="selectRegion(${idx}, 0)">
            ${province.name}
        </div>
    `).join('');
}

// 渲染面包屑
function renderBreadcrumb() {
    if (!breadcrumb) return;
    
    const currentProvince = state.list[state.currentProvinceIdx];
    const currentCity = currentProvince?.child?.[state.currentCityIdx];
    
    if (!currentProvince) {
        breadcrumb.style.display = 'none';
        return;
    }

    breadcrumb.style.display = 'block';
    breadcrumb.innerHTML = `
        <span onclick="resetSelection()">全部省份</span>
        <span class="separator">/</span>
        <span>${currentProvince.name}</span>
        ${currentCity ? `
            <span class="separator">/</span>
            <span>${currentCity.name}</span>
        ` : ''}
    `;
}

// 渲染内容区域
function renderContent() {
    if (!regionContent) return;
    
    const currentProvince = state.list[state.currentProvinceIdx];
    if (!currentProvince) {
        regionContent.style.display = 'none';
        return;
    }

    regionContent.style.display = 'block';
    const currentCity = currentProvince.child?.[state.currentCityIdx];

    let html = '';
    
    // 渲染城市列表
    if (currentProvince.child?.length) {
        html += `
            <div class="cities-section">
                <div class="cities-grid">
                    ${currentProvince.child.map((city, idx) => `
                        <div class="city-item ${idx === state.currentCityIdx ? 'active' : ''}"
                             onclick="selectRegion(${state.currentProvinceIdx}, ${idx})">
                            <div class="city-name">${city.name}</div>
                            ${city.zipcode ? `<div class="city-code">${city.zipcode}</div>` : ''}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // 渲染区县列表
    if (currentCity?.child?.length) {
        html += `
            <div class="counties-section">
                <div class="section-divider"></div>
                <h3 class="section-title">${currentCity.name}下辖区县</h3>
                <div class="counties-grid">
                    ${currentCity.child.map(area => `
                        <div class="county-item" onclick="copyZipcode('${area.zipcode}', '${area.name}')">
                            <div class="county-name">${area.name}</div>
                            <div class="county-code">
                                ${area.zipcode}
                                <button class="copy-btn">
                                    <span class="iconify" data-icon="tabler:copy"></span>
                                </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    regionContent.innerHTML = html;
}

// 选择区域
function selectRegion(provinceIdx, cityIdx) {
    state.currentProvinceIdx = provinceIdx;
    state.currentCityIdx = cityIdx;
    localStorage.setItem('zipcode_idx', `${provinceIdx}_${cityIdx}`);
    renderAll();
}

// 重置选择
function resetSelection() {
    state.currentProvinceIdx = 0;
    state.currentCityIdx = 0;
    renderAll();
}

// 搜索功能
function search() {
    const searchText = searchInput.value.trim();
    
    if (!searchText) {
        alert('请输入需要查询的地址或邮政编码');
        return;
    }
    
    if (searchText.length < 2) {
        alert('查询关键词不能低于2个字符');
        return;
    }

    // 添加到最近搜索
    if (!state.recentSearches.includes(searchText)) {
        state.recentSearches.unshift(searchText);
        if (state.recentSearches.length > 5) {
            state.recentSearches.pop();
        }
        localStorage.setItem('zipcode_recent', JSON.stringify(state.recentSearches));
    }

    let found = false;
    
    for (let pIdx = 0; pIdx < state.list.length; pIdx++) {
        const province = state.list[pIdx];
        
        // 搜索省份
        if (province.name?.includes(searchText)) {
            selectRegion(pIdx, 0);
            found = true;
            break;
        }

        // 搜索城市和区县
        if (province.child) {
            for (let cIdx = 0; cIdx < province.child.length; cIdx++) {
                const city = province.child[cIdx];
                
                if (city.name?.includes(searchText)) {
                    selectRegion(pIdx, cIdx);
                    found = true;
                    break;
                }

                // 搜索区县
                if (city.child) {
                    for (const area of city.child) {
                        if (area.name?.includes(searchText) || 
                            area.zipcode === searchText) {
                            selectRegion(pIdx, cIdx);
                            found = true;
                            break;
                        }
                    }
                }
                if (found) break;
            }
        }
        if (found) break;
    }

    if (!found) {
        alert('未查询到相关数据，请输入完整的城市地址或邮编号码');
    }
}

// 清除搜索
function clearSearch() {
    searchInput.value = '';
    searchInput.focus();
}

// 复制邮政编码
function copyZipcode(zipcode, areaName) {
    if (!zipcode) return;
    
    // 创建临时输入框
    const input = document.createElement('input');
    input.value = zipcode;
    document.body.appendChild(input);
    input.select();
    
    try {
        document.execCommand('copy');
        window.showToast(`已复制 ${areaName} 的邮政编码：${zipcode}`);
    } catch (err) {
        window.showToast('复制失败，请手动复制');
    }
    
    document.body.removeChild(input);
}

// 绑定事件
searchInput?.addEventListener('keyup', (e) => {
    if (e.key === 'Enter') {
        search();
    }
});

// 初始化
document.addEventListener('DOMContentLoaded', init);