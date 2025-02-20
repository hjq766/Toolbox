const fs = require('fs');
const path = require('path');

// 配置
const config = {
    toolsDir: path.join(__dirname, '../tools'),
    outputDir: path.join(__dirname, '../docs/styles'),
    ignoreClasses: ['active', 'hidden', 'disabled'] // 忽略一些通用状态类
};

// 用于存储分析结果
const styleAnalysis = {
    components: new Map(),  // 组件级别的类
    layout: new Map(),      // 布局相关的类
    forms: new Map(),       // 表单相关的类
    utilities: new Map()    // 工具类
};

// 分类规则
const classificationRules = {
    components: className => className.includes('-container') || className.includes('-card') || className.includes('-modal'),
    layout: className => className.includes('section') || className.includes('wrapper') || className.includes('grid'),
    forms: className => className.includes('form-') || className.includes('input-') || className.includes('button-'),
    utilities: className => className.includes('text-') || className.includes('bg-') || className.includes('margin-')
};

function classifyClass(className) {
    if (classificationRules.components(className)) return 'components';
    if (classificationRules.layout(className)) return 'layout';
    if (classificationRules.forms(className)) return 'forms';
    return 'utilities';
}

function addToAnalysis(className, filePath) {
    if (config.ignoreClasses.includes(className)) return;
    
    const category = classifyClass(className);
    const map = styleAnalysis[category];
    
    if (!map.has(className)) {
        map.set(className, new Set());
    }
    map.get(className).add(filePath);
}

function extractClasses(content, filePath) {
    const classRegex = /class="([^"]+)"/g;
    let match;
    while ((match = classRegex.exec(content)) !== null) {
        match[1].split(' ').forEach(className => {
            className = className.trim();
            if (className) {
                addToAnalysis(className, filePath);
            }
        });
    }
}

function generateReport() {
    if (!fs.existsSync(config.outputDir)) {
        fs.mkdirSync(config.outputDir, { recursive: true });
    }

    // 生成总览报告
    let overview = '# 样式分析报告\n\n';
    overview += `分析时间: ${new Date().toLocaleString()}\n\n`;

    for (const [category, classMap] of Object.entries(styleAnalysis)) {
        const reportPath = path.join(config.outputDir, `${category}.md`);
        let report = `# ${category} 类分析\n\n`;
        
        for (const [className, files] of classMap) {
            report += `## ${className}\n`;
            report += '使用位置：\n';
            files.forEach(file => {
                report += `- ${path.relative(config.toolsDir, file)}\n`;
            });
            report += '\n';
        }
        
        fs.writeFileSync(reportPath, report);
        overview += `- [${category}](${category}.md) (${classMap.size} 个类)\n`;
    }
    
    fs.writeFileSync(path.join(config.outputDir, 'overview.md'), overview);
}

// 主函数
function analyzeStyles() {
    // 遍历工具目录
    fs.readdirSync(config.toolsDir).forEach(tool => {
        const toolPath = path.join(config.toolsDir, tool);
        if (fs.statSync(toolPath).isDirectory()) {
            const files = fs.readdirSync(toolPath);
            files.forEach(file => {
                if (file.endsWith('.html')) {
                    const filePath = path.join(toolPath, file);
                    const content = fs.readFileSync(filePath, 'utf8');
                    extractClasses(content, filePath);
                }
            });
        }
    });

    generateReport();
}

// 运行分析
analyzeStyles();
