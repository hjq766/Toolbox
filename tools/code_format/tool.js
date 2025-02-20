let editor;

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM加载完成，开始初始化...'); // 调试信息
    
    // 确保元素存在
    const sourceTextarea = document.getElementById('source');
    const codeTypeSelect = document.getElementById('codeType');
    
    if (!sourceTextarea || !codeTypeSelect) {
        console.error('找不到必要的DOM元素！');
        return;
    }
    
    console.log('初始化编辑器...'); // 调试信息
    initEditor();
    console.log('初始化拖拽区域...'); // 调试信息
    initDropZone();
    
    // 监听语言模式变化
    codeTypeSelect.addEventListener('change', function() {
        console.log('语言模式改变:', this.value); // 调试信息
        updateCodeMode();
    });
});

// 初始化编辑器
function initEditor(content = '', mode = 'auto') {
    console.log('初始化编辑器，模式:', mode);
    
    // 如果模式是 auto，尝试检测代码类型
    if (mode === 'auto' && content) {
        mode = detectCodeType(content);
        // 更新选择框
        document.getElementById('codeType').value = mode;
    }
    
    editor = CodeMirror.fromTextArea(document.getElementById('source'), {
        mode: mode,
        theme: 'dracula',
        lineNumbers: true,
        autoCloseBrackets: true,
        matchBrackets: true,
        indentUnit: 4,
        tabSize: 4,
        lineWrapping: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers'],
        extraKeys: { 'Ctrl-Space': 'autocomplete' }
    });

    if (content) {
        editor.setValue(content);
    }

    // 添加内容变化监听器
    editor.on('change', function() {
        updateFileSize();
        // 如果当前是自动检测模式，尝试检测代码类型
        if (document.getElementById('codeType').value === 'auto') {
            const newMode = detectCodeType(editor.getValue());
            if (newMode !== editor.getOption('mode')) {
                editor.setOption('mode', newMode);
            }
        }
    });
}

// 初始化拖拽区域
function initDropZone() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    // 文件选择处理
    fileInput.addEventListener('change', e => {
        if (e.target.files.length) {
            handleFile(e.target.files[0]);
        }
    });

    // 点击上传
    dropZone.addEventListener('click', () => fileInput.click());

    // 拖拽处理
    dropZone.addEventListener('dragover', e => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', e => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', e => {
        e.preventDefault();
        e.stopPropagation();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFile(e.dataTransfer.files[0]);
        }
    });
}

// 文件拖放处理
function handleFileDrop(event) {
    event.preventDefault();
    event.stopPropagation();
    
    const file = event.dataTransfer.files[0];
    if (file) {
        handleFile(file);
    }
}

// 处理文件
function handleFile(file) {
    console.log('开始处理文件:', file.name);
    
    if (!isValidFile(file)) {
        showError('不支持的文件格式！');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const content = e.target.result;
        const mode = getLanguageFromFilename(file.name);
        console.log('文件类型检测结果:', mode);

        // 重置编辑器
        if (editor) {
            editor.toTextArea();
        }

        // 设置下拉框值
        const codeTypeSelect = document.getElementById('codeType');
        codeTypeSelect.value = mode;
        console.log('设置下拉框值为:', mode);

        // 初始化编辑器
        initEditor(content, mode);
        
        // 保存文件名
        document.getElementById('filename').value = file.name;
        
        // 最终确认
        console.log('最终设置 - 下拉框值:', codeTypeSelect.value);
        console.log('最终设置 - 编辑器模式:', editor.getOption('mode'));
        
        updateFileSize();
        showToast('文件导入成功！');
    };
    reader.onerror = () => showError('文件读取失败！');
    reader.readAsText(file);
}

// 获取文件语言类型
function getLanguageFromFilename(filename) {
    const ext = filename.toLowerCase().split('.').pop();
    console.log('文件扩展名:', ext);
    
    const languageMap = {
        'js': 'javascript',
        'css': 'css',
        'html': 'htmlmixed',
        'htm': 'htmlmixed',
        'py': 'python',
        'sql': 'sql',
        'php': 'php',                  // 简化 PHP 配置
        'java': 'text/x-java',
        'cpp': 'text/x-c++src',
        'c': 'text/x-csrc',
        'rb': 'ruby'
    };
    
    const mode = languageMap[ext];
    console.log('检测到的语言模式:', mode);
    return mode || 'htmlmixed';
}

// 检查文件类型
function isValidFile(file) {
    const validExtensions = ['.js', '.css', '.html', '.htm', '.py', '.sql', '.php', '.java', '.cpp', '.c', '.rb'];
    return validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));
}

// 更新代码模式
function updateCodeMode() {
    const mode = document.getElementById('codeType').value;
    console.log('更新代码模式为:', mode);
    editor.setOption('mode', mode);
}

// 更新文件大小
function updateFileSize() {
    const size = editor.getValue().length;
    document.getElementById('sourceSize').textContent = `${(size / 1024).toFixed(2)} KB`;
}

// 格式化代码
function processCode(type) {
    const code = editor.getValue();
    if (!code) {
        showError('请输入需要处理的代码！');
        return;
    }

    try {
        let result = code;
        const mode = document.getElementById('codeType').value;

        if (type === 'format') {
            // 获取格式化配置
            const formatStyle = document.getElementById('formatStyle')?.value || 'default';
            console.log('当前格式化风格:', formatStyle);
            
            // 基础格式化选项
            const baseOptions = {
                indent_size: formatStyle === 'compact' ? 2 : 4,
                indent_char: ' ',
                max_preserve_newlines: formatStyle === 'compact' ? 1 : 2,
                preserve_newlines: formatStyle !== 'compact',
                end_with_newline: formatStyle !== 'compact',
                wrap_line_length: formatStyle === 'compact' ? 120 : 0
            };

            switch(mode) {
                case 'htmlmixed':
                    const htmlOptions = {
                        ...baseOptions,
                        indent_inner_html: true,
                        extra_liners: formatStyle === 'compact' ? [] : ['head', 'body', '/html'],
                        indent_scripts: 'keep',
                        wrap_attributes: formatStyle === 'compact' ? 'force-aligned' : 'auto',
                        wrap_line_length: formatStyle === 'compact' ? 120 : 0,
                        unformatted: formatStyle === 'compact' ? 
                            ['a', 'span', 'img', 'code', 'pre', 'sub', 'sup', 'em', 'strong', 'b', 'i', 'u', 'strike', 'big', 'small', 'pre'] : 
                            ['code', 'pre'],
                        content_unformatted: ['pre', 'textarea'],
                        max_preserve_newlines: formatStyle === 'compact' ? 0 : 2
                    };
                    result = html_beautify(code, htmlOptions);
                    break;

                case 'css':
                    const cssOptions = {
                        ...baseOptions,
                        newline_between_rules: formatStyle !== 'compact',
                        selector_separator_newline: formatStyle !== 'compact',
                        space_around_selector_separator: formatStyle === 'standard',
                        space_around_combinator: formatStyle !== 'compact'
                    };
                    result = css_beautify(code, cssOptions);
                    break;

                case 'javascript':
                    const jsOptions = {
                        ...baseOptions,
                        space_in_empty_paren: false,
                        space_in_paren: false,
                        space_in_brackets: false,
                        space_after_anon_function: formatStyle !== 'compact',
                        space_after_named_function: formatStyle !== 'compact',
                        keep_array_indentation: formatStyle !== 'compact',
                        break_chained_methods: formatStyle !== 'compact',
                        brace_style: formatStyle === 'compact' ? 'collapse-preserve-inline' : 'collapse'
                    };
                    result = js_beautify(code, jsOptions);
                    break;

                // ... 其他语言的处理保持不变 ...
            }
        } else if (type === 'remove-comments') {
            result = removeComments(code, mode);
        } else if (type === 'compress') {
            result = compressCode(code, mode);
        }

        editor.setValue(result);
        updateFileSize();
        showToast('处理成功！');
    } catch (err) {
        showError('处理失败: ' + err.message);
    }
}

// 移除注释
function removeComments(code, mode) {
    switch(mode) {
        case 'javascript':
        case 'css':
            // 移除单行和多行注释
            return code
                .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1')
                .replace(/^\s*\n/gm, '');
        
        case 'htmlmixed':
            // 移除 HTML 注释
            return code
                .replace(/<!--[\s\S]*?-->/g, '')
                .replace(/^\s*\n/gm, '');
        
        case 'python':
            // 移除 Python 注释
            return code
                .replace(/#.*$/gm, '')
                .replace(/^\s*\n/gm, '')
                .replace(/'''[\s\S]*?'''|"""[\s\S]*?"""/g, '');
        
        default:
            return code;
    }
}

// 压缩代码
function compressCode(code, mode) {
    switch(mode) {
        case 'javascript':
            return code
                .replace(/\/\*[\s\S]*?\*\/|([^\\:]|^)\/\/.*$/gm, '$1')
                .replace(/\s*([=+\-*/%&|^<>!?:,;{}()[\]])\s*/g, '$1')
                .replace(/\s+/g, ' ')
                .trim();
        
        case 'css':
            return code
                .replace(/\/\*[\s\S]*?\*\//g, '')
                .replace(/\s*([{}:;,])\s*/g, '$1')
                .replace(/\s+/g, ' ')
                .replace(/;\}/g, '}')
                .trim();
        
        case 'htmlmixed':
            return code
                .replace(/<!--[\s\S]*?-->/g, '')
                .replace(/>\s+</g, '><')
                .replace(/\s+/g, ' ')
                .trim();
        
        default:
            return code.replace(/\s+/g, ' ').trim();
    }
}

// Python 代码格式化
function formatPythonCode(code, style = 'default') {
    const lines = code.split('\n');
    const formattedLines = [];
    let currentIndent = 0;
    
    const indentSize = style === 'compact' ? 2 : 4;
    
    for (let line of lines) {
        const trimmedLine = line.trim();
        
        // 跳过空行（紧凑模式下）
        if (!trimmedLine && style === 'compact') {
            continue;
        }
        
        // 调整缩进
        if (trimmedLine.match(/^(elif |else:|except |finally:)/)) {
            currentIndent = Math.max(0, currentIndent - indentSize);
        }
        
        // 添加格式化后的行
        const indentedLine = ' '.repeat(currentIndent) + trimmedLine;
        formattedLines.push(indentedLine);
        
        // 更新下一行的缩进
        if (trimmedLine.endsWith(':')) {
            currentIndent += indentSize;
        }
    }
    
    let result = formattedLines.join('\n');
    
    // 根据不同风格处理空格
    if (style === 'standard') {
        result = result
            .replace(/\s*([=+\-*/%<>!&|^]+=?)\s*/g, ' $1 ')  // 运算符周围添加空格
            .replace(/\s*,\s*/g, ', ')                        // 逗号后添加空格
            .replace(/\s*:\s*/g, ': ');                       // 冒号后添加空格
    } else if (style === 'compact') {
        result = result
            .replace(/\s*([=+\-*/%<>!&|^]+=?)\s*/g, '$1')    // 移除运算符周围的空格
            .replace(/\s*,\s*/g, ',')                         // 移除逗号周围的空格
            .replace(/\s*:\s*/g, ':');                        // 移除冒号周围的空格
    }
    
    return result;
}

// 复制代码
function copyCode() {
    const code = editor.getValue();
    if (!code) {
        showError('没有可复制的代码！');
        return;
    }

    // 创建临时文本区域
    const textarea = document.createElement('textarea');
    textarea.value = code;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    
    try {
        // 选择文本
        textarea.select();
        textarea.setSelectionRange(0, textarea.value.length);
        
        // 执行复制命令
        const successful = document.execCommand('copy');
        
        if (successful) {
            showToast('复制成功！');
        } else {
            // 如果 execCommand 失败，尝试使用现代 API
            navigator.clipboard.writeText(code)
                .then(() => showToast('复制成功！'))
                .catch(() => showError('复制失败，请手动复制！'));
        }
    } catch (err) {
        showError('复制失败，请手动复制！');
    } finally {
        // 清理临时元素
        document.body.removeChild(textarea);
    }
}

// 导出代码
function exportCode() {
    const code = editor.getValue();
    if (!code) {
        showError('没有可导出的代码！');
        return;
    }

    // 获取当前选择的语言模式
    const selectedMode = document.getElementById('codeType').value;
    
    // 根据选择的语言模式设置默认文件名
    const extensions = {
        'auto': '.txt',
        'javascript': '.js',
        'css': '.css',
        'htmlmixed': '.html',
        'python': '.py',
        'sql': '.sql',
        'php': '.php',
        'java': '.java',
        'clike': '.cpp',
        'ruby': '.rb'
    };

    // 设置默认文件名
    const defaultExt = extensions[selectedMode] || '.txt';
    document.getElementById('filename').value = `code${defaultExt}`;
    
    // 显示导出对话框
    document.getElementById('exportModal').style.display = 'block';
}

// 确认导出
function confirmExport() {
    const code = editor.getValue();
    let filename = document.getElementById('filename').value;
    const selectedMode = document.getElementById('codeType').value;
    
    // 确保文件有正确的扩展名
    const extensions = {
        'auto': '.txt',
        'javascript': '.js',
        'css': '.css',
        'htmlmixed': '.html',
        'python': '.py',
        'sql': '.sql',
        'php': '.php',
        'java': '.java',
        'clike': '.cpp',
        'ruby': '.rb'
    };
    
    // 获取当前选择模式对应的扩展名
    const ext = extensions[selectedMode];
    
    // 如果文件名没有扩展名，添加对应的扩展名
    if (!filename.includes('.')) {
        filename += ext;
    }
    // 如果文件名的扩展名与当前选择的模式不匹配，替换扩展名
    else if (!filename.toLowerCase().endsWith(ext)) {
        filename = filename.replace(/\.[^.]+$/, ext);
    }

    // 创建并下载文件
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    closeExportModal();
    showToast('导出成功！');
}

// 关闭导出模态框
function closeExportModal() {
    document.getElementById('exportModal').style.display = 'none';
}

// 重置代码
function resetCode() {
    // 清空编辑器内容
    editor.setValue('');
    
    // 重置文件名
    document.getElementById('filename').value = '';
    
    // 重置语言选择为自动检测
    document.getElementById('codeType').value = 'auto';
    
    // 更新编辑器模式
    editor.setOption('mode', 'htmlmixed');
    
    // 更新文件大小显示
    updateFileSize();
    
    showToast('已清空编辑器');
}

// 显示错误信息
function showError(message) {
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => {
        errorDiv.style.display = 'none';
    }, 3000);
}

// 添加代码自动检测功能
function detectCodeType(code) {
    if (!code) return 'htmlmixed';
    
    // 特征匹配规则
    const patterns = {
        javascript: {
            keywords: /\b(function|const|let|var|if|else|return|new|class|import|export)\b/,
            patterns: [
                /\bdocument\./,
                /\bwindow\./,
                /\bconsole\./,
                /=>/,
                /\$\(/
            ]
        },
        php: {
            keywords: /\b(function|class|public|private|echo|require|include)\b/,
            patterns: [
                /<?php/,
                /\$_POST/,
                /\$_GET/,
                /\$[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/
            ]
        },
        python: {
            keywords: /\b(def|class|import|from|if|elif|else|try|except|for|in|while)\b/,
            patterns: [
                /^from\s+[\w.]+\s+import/m,
                /:\s*$/m,
                /print\(/,
                /self\./
            ]
        },
        html: {
            keywords: /\b(html|body|div|span|class|id|style)\b/,
            patterns: [
                /<[^>]+>/,
                /<\/[^>]+>/,
                /<!DOCTYPE/i,
                /<html/i
            ]
        },
        css: {
            keywords: /\b(body|class|id|margin|padding|color|background|width|height)\b/,
            patterns: [
                /{[^}]+}/,
                /\s*:\s*/,
                /@media/,
                /\#[\w-]+\s*{/,
                /\.[\w-]+\s*{/
            ]
        },
        sql: {
            keywords: /\b(SELECT|INSERT|UPDATE|DELETE|FROM|WHERE|JOIN|GROUP BY|ORDER BY|HAVING)\b/i,
            patterns: [
                /CREATE\s+TABLE/i,
                /ALTER\s+TABLE/i,
                /DROP\s+TABLE/i
            ]
        }
    };

    // 计算每种语言的匹配分数
    const scores = {};
    for (const [lang, rules] of Object.entries(patterns)) {
        scores[lang] = 0;
        
        // 检查关键字
        const keywordMatches = (code.match(rules.keywords) || []).length;
        scores[lang] += keywordMatches * 2;
        
        // 检查模式
        rules.patterns.forEach(pattern => {
            const matches = (code.match(pattern) || []).length;
            scores[lang] += matches;
        });
    }

    console.log('语言检测分数:', scores);

    // 找出得分最高的语言
    let maxScore = 0;
    let detectedLang = 'htmlmixed';

    for (const [lang, score] of Object.entries(scores)) {
        if (score > maxScore) {
            maxScore = score;
            detectedLang = lang === 'html' ? 'htmlmixed' : lang;
        }
    }

    console.log('检测到的语言:', detectedLang);
    return detectedLang;
}
