function generateMeta() {
    const title = document.getElementById('title').value;
    const description = document.getElementById('description').value;
    const keywords = document.getElementById('keywords').value;
    const author = document.getElementById('author').value;
    const language = document.getElementById('language').value;
    const copyright = document.getElementById('copyright').value;
    const robots = document.getElementById('robots').value;
    const viewport = document.getElementById('viewport').value;

    let metaContent = '';
    metaContent += '<meta charset="utf-8">\n';
    
    if (title) {
        metaContent += `<title>${title}</title>\n`;
    }
    
    if (language) {
        metaContent += `<meta http-equiv="content-language" content="${language}">\n`;
    }
    
    if (copyright) {
        metaContent += `<meta name="copyright" content="${copyright}">\n`;
    }
    
    if (description) {
        metaContent += `<meta name="description" content="${description}">\n`;
    }
    
    if (keywords) {
        metaContent += `<meta name="keywords" content="${keywords}">\n`;
    }
    
    if (author) {
        metaContent += `<meta name="author" content="${author}">\n`;
    }
    
    if (robots) {
        metaContent += `<meta name="robots" content="${robots}">\n`;
    }
    
    if (viewport) {
        const viewportSelect = document.getElementById('viewport');
        const selectedOption = viewportSelect.options[viewportSelect.selectedIndex].text;
        if (selectedOption === '适应PC端') {
            // PC端不添加viewport标签
        } else if (selectedOption === 'PC和手机端自适应') {
            metaContent += `<meta name="viewport" content="${viewport}">\n`;
            metaContent += `<meta name="applicable-device" content="pc,mobile">\n`;
        } else {
            // 手机端只添加viewport标签
            metaContent += `<meta name="viewport" content="${viewport}">\n`;
        }
    }

    document.getElementById('result').value = metaContent;
}

function copyResult() {
    const result = document.getElementById('result');
    result.select();
    try {
        document.execCommand('copy');
        showToast('复制成功！');
    } catch (err) {
        console.error('复制错误:', err);
        showToast('复制失败，请手动复制');
    }
}

function resetForm() {
    document.getElementById('metaForm').reset();
    document.getElementById('result').value = '';
}

function toggleTooltip(tooltipId) {
    const tooltip = document.getElementById(tooltipId);
    document.querySelectorAll('.tooltip-content').forEach(tip => {
        if (tip.id !== tooltipId) {
            tip.classList.remove('show');
        }
    });
    tooltip.classList.toggle('show');
}

document.addEventListener('click', function(event) {
    if (!event.target.closest('.input-with-tooltip')) {
        document.querySelectorAll('.tooltip-content').forEach(tip => {
            tip.classList.remove('show');
        });
    }
}); 