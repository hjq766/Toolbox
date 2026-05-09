// 检查并应用已保存的主题设置
const savedTheme = localStorage.getItem('theme');
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
}

// 初始化主题和其他功能
document.addEventListener('DOMContentLoaded', () => {
    renderSymbols(symbolData);
    renderCategoryTabs(symbolData);
});

// 复制符号
function copySymbol(event) {
    const symbol = event.currentTarget.querySelector('td').textContent;
    try {
        navigator.clipboard.writeText(symbol);
        showToast('符号已复制到剪贴板');
    } catch (err) {
        console.error('复制失败:', err);
        showToast('复制失败，请重试');
    }
}

// 搜索符号
function searchSymbols(query) {
    query = query.toLowerCase();
    
    const sections = document.querySelectorAll('.symbol-section');
    let totalVisible = 0;
    
    sections.forEach(section => {
        let sectionVisible = false;
        const tables = section.querySelectorAll('.table-container');
        
        tables.forEach(table => {
            let tableVisible = false;
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                const isVisible = text.includes(query);
                row.style.display = isVisible ? '' : 'none';
                if (isVisible) {
                    tableVisible = true;
                    sectionVisible = true;
                    totalVisible++;
                }
            });
            
            table.style.display = tableVisible ? '' : 'none';
        });
        
        section.style.display = sectionVisible ? '' : 'none';
    });
    
    showSearchStatus(query, totalVisible);
}

// 显示搜索状态
function showSearchStatus(query, count) {
    let statusElement = document.getElementById('search-status');
    if (!statusElement) {
        statusElement = document.createElement('div');
        statusElement.id = 'search-status';
        statusElement.className = 'search-status';
        document.querySelector('.search-box').appendChild(statusElement);
    }
    
    statusElement.textContent = query ? 
        (count > 0 ? `找到 ${count} 个匹配结果` : '未找到匹配结果') : '';
}

// 渲染分类标签页
function renderCategoryTabs(data) {
    const tabsContainer = document.getElementById('categoryTabs');
    let html = '';
    
    Object.entries(data).forEach(([key, category], index) => {
        html += `
            <a href="#${key}" class="tab-btn ${index === 0 ? 'active' : ''}" 
                onclick="switchCategory(event, '${key}')">
                ${category.title}
            </a>
        `;
    });
    
    html += '<div class="slider"></div>';
    tabsContainer.innerHTML = html;
}

// 切换分类
function switchCategory(event, categoryKey) {
    event.preventDefault();
    
    // 更新标签页状态
    document.querySelectorAll('.tab-btn').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 显示/隐藏对应的分类内容
    document.querySelectorAll('.symbol-section').forEach(section => {
        section.style.display = section.dataset.category === categoryKey ? 'block' : 'none';
    });
}

// 渲染符号数据
function renderSymbols(data) {
    const container = document.getElementById('symbolContent');
    let html = '';
    
    for (const [key, category] of Object.entries(data)) {
        html += `
            <div class="symbol-section" data-category="${key}" 
                 style="display: ${key === Object.keys(data)[0] ? 'block' : 'none'}">
                <div class="tables-grid">
        `;
        
        category.sections.forEach(section => {
            html += `
                <div class="table-container">
                    <h3>${section.title}</h3>
                    <table class="symbol-table">
                        <thead>
                            <tr>
                                <th>符号</th>
                                <th>描述</th>
                                <th>实体名称</th>
                                <th>实体编号</th>
                            </tr>
                        </thead>
                        <tbody>
            `;
            
            section.symbols.forEach(symbol => {
                html += `
                    <tr onclick="copySymbol(event)">
                        <td>${symbol.symbol}</td>
                        <td>${symbol.desc}</td>
                        <td>${symbol.entity}</td>
                        <td>${symbol.code}</td>
                    </tr>
                `;
            });
            
            html += `
                        </tbody>
                    </table>
                </div>
            `;
        });
        
        html += `
                </div>
            </div>
        `;
    }
    
    container.innerHTML = html;
} 