// 摩尔斯电码映射表
const morseCode = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
    'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
    'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
    'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..', ' ': '/',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-',
    '5': '.....', '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', 
    '@': '.--.-.', '&': '.-...', '(': '-.--.', ')': '-.--.-',
    ':': '---...', ';': '-.-.-.', '=': '-...-', '+': '.-.-.',
    '-': '-....-', '_': '..--.-', '"': '.-..-.', '$': '...-..-',
    '\'': '.----.', '/': '-..-.', '\\': '-..-.'
};

// 反向映射表
const reverseMorseCode = Object.fromEntries(
    Object.entries(morseCode).map(([key, value]) => [value, key])
);

// 中文转拼音函数
function toPinyin(chinese) {
    let result = '';
    for (let i = 0; i < chinese.length; i++) {
        const char = chinese[i];
        const pinyins = pinyin_dict_all[char];
        if (pinyins) {
            // 取第一个拼音（去掉声调）
            const pinyin = pinyins.split(',')[0].replace(/[āáǎàēéěèōóǒòīíǐìūúǔùǖǘǚǜ]/g, match => {
                const vowels = 'āáǎàēéěèōóǒòīíǐìūúǔùǖǘǚǜ';
                const plainVowels = 'aaaaeeeeooooiiiiuuuuüüüü';
                return plainVowels[vowels.indexOf(match)];
            });
            result += pinyin;
        } else {
            // 如果找不到拼音，保持原字符
            result += char;
        }
    }
    return result;
}

// 修改 convertToMorse 函数中的中文处理部分
function convertToMorse() {
    const text = document.getElementById('textInput').value;
    let morse = '';
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        // 如果是中文字符
        if (/[\u4e00-\u9fa5]/.test(char)) {
            const pinyin = toPinyin(char);
            for (let j = 0; j < pinyin.length; j++) {
                morse += morseCode[pinyin[j].toUpperCase()] || pinyin[j];
                morse += ' ';
            }
            morse += '/ ';
        }
        // 如果是其他字符
        else {
            morse += morseCode[char.toUpperCase()] || char;
            morse += ' ';
        }
    }
    
    document.getElementById('morseInput').value = morse.trim();
}

// 文本转摩尔斯电码
// 删除第一个 convertToMorse 函数，只保留下面这个修改后的版本
function convertToMorse() {
    const text = document.getElementById('textInput').value.toUpperCase();  // 移除 toUpperCase()
    let morse = '';
    let originalText = []; // 记录原文
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (/[\u4e00-\u9fa5]/.test(char)) {
            const pinyin = toPinyin(char);
            originalText.push(char); // 记录原中文字符
            for (let j = 0; j < pinyin.length; j++) {
                const code = morseCode[pinyin[j].toUpperCase()];
                if (code) {
                    morse += code + ' ';
                }
            }
            morse += '/ ';
        } else {
            originalText.push(char);
            const code = morseCode[char.toUpperCase()];
            if (code) {
                morse += code + ' ';
            } else {
                morse += char + ' ';
            }
        }
    }
    
    document.getElementById('morseInput').setAttribute('data-original', originalText.join(''));
    document.getElementById('morseInput').value = morse.trim();
}

// 摩尔斯电码转文本
function convertToText() {
    const morse = document.getElementById('morseInput').value;
    const original = document.getElementById('morseInput').getAttribute('data-original');
    
    // 如果有原文记录，直接使用原文
    if (original) {
        document.getElementById('textInput').value = original;
        return;
    }
    
    // 否则尝试转换
    const codes = morse.split(' ');
    let text = '';
    
    for (let code of codes) {
        if (code === '') continue;
        if (code === '/') {
            text += ' ';
        } else {
            text += reverseMorseCode[code] || code;
        }
    }
    
    document.getElementById('textInput').value = text;
}

// 清空文本
function clearText(type) {
    if (type === 'text') {
        document.getElementById('textInput').value = '';
    } else {
        document.getElementById('morseInput').value = '';
    }
}

// 粘贴文本
async function pasteText() {
    try {
        const text = await navigator.clipboard.readText();
        document.getElementById('textInput').value = text;
    } catch (err) {
        showToast('无法访问剪贴板');
    }
}

// 复制摩尔斯电码
async function copyMorse() {
    const morse = document.getElementById('morseInput').value;
    if (!morse) {
        showToast('没有可复制的内容');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(morse);
        showToast('复制成功');
    } catch (err) {
        showToast('复制失败');
    }
}
