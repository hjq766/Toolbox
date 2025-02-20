const fs = require('fs');
const path = require('path');

// 配置
const config = {
    toolsDir: path.join(__dirname, '../tools'),
    outputDir: path.join(__dirname, '../docs/migration/analysis')
};

// 分析单个工具
function analyzeTool(toolName) {
    const toolPath = path.join(config.toolsDir, toolName);
    const outputPath = path.join(config.outputDir, `${toolName}-analysis.md`);
    
    // 收集工具信息
    const files = fs.readdirSync(toolPath);
    const hasFiles = {
        html: files.includes('index.html'),
        css: files.includes('tool.css'),
        js: files.includes('tool.js')
    };

    // 分析HTML文件中的类
    const classes = new Set();
    const components = new Map();
    
    if (hasFiles.html) {
        const htmlContent = fs.readFileSync(path.join(toolPath, 'index.html'), 'utf8');
        
        // 提取类名
        const classRegex = /class="([^"]+)"/g;
        let match;
        while ((match = classRegex.exec(htmlContent)) !== null) {
            match[1].split(' ').forEach(className => classes.add(className.trim()));
        }

        // 提取组件结构
        const componentRegex = /<div class="([^"]+)">/g;
        while ((match = componentRegex.exec(htmlContent)) !== null) {
            const className = match[1].split(' ')[0];
            if (!components.has(className)) {
                components.set(className, new Set());
            }
        }
    }

    // 生成分析文档
    let doc = `# ${toolName} 工具迁移分析\n\n`;
    
    // 基础信息
    doc += `## 1. 工具基础信息\n`;
    doc += `- 工具名称：${toolName}\n`;
    doc += `- 文件结构：\n`;
    files.forEach(file => {
        doc += `  - ${file}\n`;
    });
    doc += '\n';

    // 类名分析
    doc += `## 2. 使用的类名\n`;
    doc += Array.from(classes).map(className => `- ${className}`).join('\n');
    doc += '\n\n';

    // 组件分析
    doc += `## 3. 主要组件\n`;
    components.forEach((children, component) => {
        doc += `- ${component}\n`;
    });
    doc += '\n';

    // CSS分析
    if (hasFiles.css) {
        doc += `## 4. 自定义样式\n`;
        const cssContent = fs.readFileSync(path.join(toolPath, 'tool.css'), 'utf8');
        doc += '```css\n' + cssContent + '\n```\n\n';
    }

    // Tailwind迁移建议
    doc += `## 5. Tailwind迁移建议\n\n`;
    doc += `### 5.1 组件迁移\n`;
    components.forEach((children, component) => {
        doc += `#### ${component}\n`;
        doc += `建议的Tailwind类：\n\`\`\`html\n<div class="...">\n\`\`\`\n\n`;
    });

    // 写入文件
    fs.writeFileSync(outputPath, doc);
    console.log(`分析完成：${outputPath}`);
}

// 获取命令行参数
const toolName = process.argv[2];
if (!toolName) {
    console.error('请指定工具名称，例如：node analyze-tool.js color_tool');
    process.exit(1);
}

// 运行分析
analyzeTool(toolName);
