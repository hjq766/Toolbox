function convertWeight(from) {
    const value = document.getElementById(from).value;
    if (!value) {
        resetAll();
        return;
    }

    const num = parseFloat(value);
    let g; // 统一转换到克
    switch(from) {
        // 公制
        case 'ton': g = num * 1000000; break;
        case 'kg': g = num * 1000; break;
        case 'g': g = num; break;
        case 'mg': g = num * 0.001; break;
        // 市制
        case 'jin': g = num * 500; break;
        case 'dan': g = num * 50000; break;
        case 'liang': g = num * 50; break;
        case 'qian': g = num * 5; break;
        // 金衡制
        case 'troy_pound': g = num * 373.2417216; break;
        case 'troy_ounce': g = num * 31.1034768; break;
        case 'pennyweight': g = num * 1.55517384; break;
        case 'troy_grain': g = num * 0.06479891; break;
        // 常衡制
        case 'long_ton': g = num * 1016046.9088; break;
        case 'short_ton': g = num * 907184.74; break;
        case 'long_hundredweight': g = num * 50802.34544; break;
        case 'short_hundredweight': g = num * 45359.237; break;
        case 'stone': g = num * 6350.29318; break;
        case 'pound': g = num * 453.59237; break;
        case 'ounce': g = num * 28.349523125; break;
        case 'dram': g = num * 1.7718451953125; break;
        case 'grain': g = num * 0.06479891; break;
    }

    // 更新所有输入框的值
    // 公制
    document.getElementById('ton').value = formatNumber(g / 1000000);
    document.getElementById('kg').value = formatNumber(g / 1000);
    document.getElementById('g').value = formatNumber(g);
    document.getElementById('mg').value = formatNumber(g * 1000);
    // 市制
    document.getElementById('jin').value = formatNumber(g / 500);
    document.getElementById('dan').value = formatNumber(g / 50000);
    document.getElementById('liang').value = formatNumber(g / 50);
    document.getElementById('qian').value = formatNumber(g / 5);
    // 金衡制
    document.getElementById('troy_pound').value = formatNumber(g / 373.2417216);
    document.getElementById('troy_ounce').value = formatNumber(g / 31.1034768);
    document.getElementById('pennyweight').value = formatNumber(g / 1.55517384);
    document.getElementById('troy_grain').value = formatNumber(g / 0.06479891);
    // 常衡制
    document.getElementById('long_ton').value = formatNumber(g / 1016046.9088);
    document.getElementById('short_ton').value = formatNumber(g / 907184.74);
    document.getElementById('long_hundredweight').value = formatNumber(g / 50802.34544);
    document.getElementById('short_hundredweight').value = formatNumber(g / 45359.237);
    document.getElementById('stone').value = formatNumber(g / 6350.29318);
    document.getElementById('pound').value = formatNumber(g / 453.59237);
    document.getElementById('ounce').value = formatNumber(g / 28.349523125);
}

function resetAll() {
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.value = '';
    });
}

function formatNumber(num) {
    if (Number.isInteger(num)) {
        return num.toString();
    }
    return Number(num.toFixed(8)).toString();
} 