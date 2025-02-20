function convertVolume(from) {
    const value = document.getElementById(from).value;
    if (!value) {
        resetAll();
        return;
    }

    const num = parseFloat(value);
    let ml; // 统一转换到毫升
    switch(from) {
        // 公制
        case 'cubicm': ml = num * 1000000; break;
        case 'cubicdm': ml = num * 1000; break;
        case 'cubiccm': ml = num; break;
        case 'cubicmm': ml = num * 0.001; break;
        case 'hl': ml = num * 100000; break;
        case 'l': ml = num * 1000; break;
        case 'dl': ml = num * 100; break;
        case 'cl': ml = num * 10; break;
        case 'ml': ml = num; break;
        // 市制
        case 'shi': ml = num * 100000; break;
        case 'hu': ml = num * 50000; break;
        case 'dou': ml = num * 10000; break;
        case 'sheng': ml = num * 1000; break;
        case 'he': ml = num * 100; break;
        case 'shao': ml = num * 10; break;
        case 'cuo': ml = num * 1; break;
        case 'chao': ml = num * 0.1; break;
        case 'gui': ml = num * 0.01; break;
        case 'liao': ml = num * 0.001; break;
        // 英制
        case 'cubicyd': ml = num * 764554.858; break;
        case 'cubicft': ml = num * 28316.846592; break;
        case 'cubicin': ml = num * 16.387064; break;
        case 'ukgallon': ml = num * 4546.09; break;
        case 'ukquart': ml = num * 1136.5225; break;
        case 'ukpint': ml = num * 568.26125; break;
        case 'ukfloz': ml = num * 28.4130625; break;
        // 美制
        case 'usgallon': ml = num * 3785.411784; break;
        case 'usquart': ml = num * 946.352946; break;
        case 'uspint': ml = num * 473.176473; break;
        case 'uscup': ml = num * 236.588236; break;
        case 'usfloz': ml = num * 29.5735295625; break;
        case 'ustbsp': ml = num * 14.7867647813; break;
        case 'ustsp': ml = num * 4.92892159375; break;
    }

    // 公制
    document.getElementById('cubicm').value = formatNumber(ml / 1000000);
    document.getElementById('cubicdm').value = formatNumber(ml / 1000);
    document.getElementById('cubiccm').value = formatNumber(ml);
    document.getElementById('cubicmm').value = formatNumber(ml * 1000);
    document.getElementById('hl').value = formatNumber(ml / 100000);
    document.getElementById('l').value = formatNumber(ml / 1000);
    document.getElementById('dl').value = formatNumber(ml / 100);
    document.getElementById('cl').value = formatNumber(ml / 10);
    document.getElementById('ml').value = formatNumber(ml);
    // 市制
    document.getElementById('shi').value = formatNumber(ml / 100000);
    document.getElementById('hu').value = formatNumber(ml / 50000);
    document.getElementById('dou').value = formatNumber(ml / 10000);
    document.getElementById('sheng').value = formatNumber(ml / 1000);
    document.getElementById('he').value = formatNumber(ml / 100);
    document.getElementById('shao').value = formatNumber(ml / 10);
    document.getElementById('cuo').value = formatNumber(ml);
    document.getElementById('chao').value = formatNumber(ml * 10);
    document.getElementById('gui').value = formatNumber(ml * 100);
    document.getElementById('liao').value = formatNumber(ml * 1000);
    // 英制
    document.getElementById('cubicyd').value = formatNumber(ml / 764554.858);
    document.getElementById('cubicft').value = formatNumber(ml / 28316.846592);
    document.getElementById('cubicin').value = formatNumber(ml / 16.387064);
    document.getElementById('ukgallon').value = formatNumber(ml / 4546.09);
    document.getElementById('ukquart').value = formatNumber(ml / 1136.5225);
    document.getElementById('ukpint').value = formatNumber(ml / 568.26125);
    document.getElementById('ukfloz').value = formatNumber(ml / 28.4130625);
    // 美制
    document.getElementById('usgallon').value = formatNumber(ml / 3785.411784);
    document.getElementById('usquart').value = formatNumber(ml / 946.352946);
    document.getElementById('uspint').value = formatNumber(ml / 473.176473);
    document.getElementById('uscup').value = formatNumber(ml / 236.588236);
    document.getElementById('usfloz').value = formatNumber(ml / 29.5735295625);
    document.getElementById('ustbsp').value = formatNumber(ml / 14.7867647813);
    document.getElementById('ustsp').value = formatNumber(ml / 4.92892159375);
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