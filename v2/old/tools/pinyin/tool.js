// 拼音转换核心函数
function pinyin(text, options = {}) {
    if (typeof pinyin_dict_all === 'undefined') {
        console.error('拼音字典未加载！');
        return text;
    }
    
    const result = text.split('').map(char => {
        const pinyinStr = pinyin_dict_all[char];
        if (!pinyinStr) return char;

        let py = pinyinStr.split(',')[0];
        if (options.style === 'STYLE_FIRST_LETTER') {
            py = py.charAt(0);
        } else if (options.style === 'STYLE_NORMAL') {
            py = py
                .replace(/[āáǎàa]/g, 'a')
                .replace(/[ēéěèe]/g, 'e')
                .replace(/[īíǐìi]/g, 'i')
                .replace(/[ōóǒòo]/g, 'o')
                .replace(/[ūúǔùu]/g, 'u')
                .replace(/[ǖǘǚǜüv]/g, 'v');
        }
        return py;
    });
    return result.join(' ');
}

function updateCharCount() {
    const text = document.getElementById('inputText').value;
    document.getElementById('charCount').textContent = text.length;
}

function handleAutoConvert() {
    if (document.getElementById('autoConvert').checked) {
        convertToPinyin();
    }
}

function convertToPinyin() {
    const text = document.getElementById('inputText').value.trim();
    if (!text) {
        showToast('请输入需要转换的汉字！');
        return;
    }

    const showTone = document.getElementById('toneOption').checked;
    const firstLetter = document.getElementById('firstLetterOption').checked;
    const upperCase = document.getElementById('upperCaseOption').checked;
    
    const loadingIndicator = document.getElementById('loadingIndicator');
    loadingIndicator.style.display = 'block';

    setTimeout(() => {
        const options = {
            style: firstLetter ? 'STYLE_FIRST_LETTER' : showTone ? 'STYLE_TONE' : 'STYLE_NORMAL'
        };

        let result = pinyin(text, options);
        if (upperCase) {
            result = result.toUpperCase();
        }

        const characters = text.split('');
        const pinyinArray = result.split(' ');
        let formattedResult = '';

        characters.forEach((char, index) => {
            if (char.trim()) {
                formattedResult += `<div class="result-item">
                    <span class="hanzi">${char}</span>
                    <span class="pinyin">${pinyinArray[index]}</span>
                </div>`;
            }
        });

        document.getElementById('result').innerHTML = formattedResult;
        loadingIndicator.style.display = 'none';
    }, 100);
}

function copyResult() {
    const resultItems = document.querySelectorAll('.result-item');
    if (!resultItems.length) {
        showToast('没有可复制的内容');
        return;
    }
    
    let textToCopy = '';
    resultItems.forEach(item => {
        const hanzi = item.querySelector('.hanzi').textContent;
        const pinyin = item.querySelector('.pinyin').textContent;
        textToCopy += `${hanzi}(${pinyin}) `;
    });

    const text = textToCopy.trim();
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text)
            .then(() => showToast('已复制到剪贴板'))
            .catch(() => {
                copyTextFallback(text);
            });
    } else {
        copyTextFallback(text);
    }
}

function copyTextFallback(text) {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    
    try {
        document.execCommand('copy');
        showToast('已复制到剪贴板');
    } catch (err) {
        showToast('复制失败，请手动复制');
    } finally {
        document.body.removeChild(textarea);
    }
}

function resetForm() {
    document.getElementById('inputText').value = '';
    document.getElementById('result').innerHTML = '';
    document.getElementById('toneOption').checked = true;
    document.getElementById('firstLetterOption').checked = false;
    document.getElementById('upperCaseOption').checked = false;
    document.getElementById('autoConvert').checked = false;
    document.getElementById('charCount').textContent = '0';
    showToast('内容已重置');
}

document.addEventListener('DOMContentLoaded', function() {
    const inputText = document.getElementById('inputText');
    const optionInputs = document.querySelectorAll('.checkbox-wrapper input');
    
    inputText.addEventListener('input', () => {
        updateCharCount();
        handleAutoConvert();
    });
    
    optionInputs.forEach(input => {
        input.addEventListener('change', () => {
            if (document.getElementById('autoConvert').checked) {
                convertToPinyin();
            }
        });
    });
});