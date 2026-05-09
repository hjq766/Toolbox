function convertTemp(from) {
    const value = document.getElementById(from).value;
    if (!value) {
        resetAll();
        return;
    }

    const num = parseFloat(value);
    let c, f, k, ra, re;

    switch(from) {
        case 'celsius':
            c = num;
            f = c * 9/5 + 32;
            k = c + 273.15;
            ra = f + 459.67;
            re = c * 4/5;
            break;
        case 'fahrenheit':
            f = num;
            c = (f - 32) * 5/9;
            k = (f + 459.67) * 5/9;
            ra = f + 459.67;
            re = (f - 32) * 4/9;
            break;
        case 'kelvin':
            k = num;
            c = k - 273.15;
            f = k * 9/5 - 459.67;
            ra = k * 1.8;
            re = (k - 273.15) * 4/5;
            break;
        case 'rankine':
            ra = num;
            f = ra - 459.67;
            c = (ra - 491.67) * 5/9;
            k = ra * 5/9;
            re = (ra - 491.67) * 4/9;
            break;
        case 'reaumur':
            re = num;
            c = re * 5/4;
            f = re * 9/4 + 32;
            k = re * 5/4 + 273.15;
            ra = re * 9/4 + 491.67;
            break;
    }

    document.getElementById('celsius').value = formatNumber(c);
    document.getElementById('fahrenheit').value = formatNumber(f);
    document.getElementById('kelvin').value = formatNumber(k);
    document.getElementById('rankine').value = formatNumber(ra);
    document.getElementById('reaumur').value = formatNumber(re);
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