function convertLength(from) {
    const value = document.getElementById(from).value;
    if (!value) {
        resetAll();
        return;
    }

    const num = parseFloat(value);
    let mm;
    switch(from) {
        case 'km': mm = num * 1000000; break;
        case 'm': mm = num * 1000; break;
        case 'dm': mm = num * 100; break;
        case 'cm': mm = num * 10; break;
        case 'li': mm = num * 500000; break;
        case 'zhang': mm = num * 3333.33; break;
        case 'chi': mm = num * 333.333; break;
        case 'cun': mm = num * 33.3333; break;
        case 'fen': mm = num * 3.33333; break;
        case 'li_small': mm = num * 0.333333; break;
        case 'nmi': mm = num * 1852000; break;
        case 'fathom': mm = num * 1828.8; break;
        case 'mile': mm = num * 1609344; break;
        case 'furlong': mm = num * 201168; break;
        case 'yard': mm = num * 914.4; break;
        case 'ft': mm = num * 304.8; break;
        case 'inch': mm = num * 25.4; break;
        case 'mm': mm = num; break;
        case 'um': mm = num * 0.001; break;
    }

    document.getElementById('km').value = formatNumber(mm / 1000000);
    document.getElementById('m').value = formatNumber(mm / 1000);
    document.getElementById('dm').value = formatNumber(mm / 100);
    document.getElementById('cm').value = formatNumber(mm / 10);
    document.getElementById('li').value = formatNumber(mm / 500000);
    document.getElementById('zhang').value = formatNumber(mm / 3333.33);
    document.getElementById('chi').value = formatNumber(mm / 333.333);
    document.getElementById('cun').value = formatNumber(mm / 33.3333);
    document.getElementById('fen').value = formatNumber(mm / 3.33333);
    document.getElementById('li_small').value = formatNumber(mm / 0.333333);
    document.getElementById('nmi').value = formatNumber(mm / 1852000);
    document.getElementById('fathom').value = formatNumber(mm / 1828.8);
    document.getElementById('mile').value = formatNumber(mm / 1609344);
    document.getElementById('furlong').value = formatNumber(mm / 201168);
    document.getElementById('yard').value = formatNumber(mm / 914.4);
    document.getElementById('ft').value = formatNumber(mm / 304.8);
    document.getElementById('inch').value = formatNumber(mm / 25.4);
    document.getElementById('mm').value = formatNumber(mm);
    document.getElementById('um').value = formatNumber(mm * 1000);
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