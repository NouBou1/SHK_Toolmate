// Tools & Converter Modul
// Unit-Umrechnung und Fehlercode-Suche

function convertUnits() {
    const val = parseFloat(document.getElementById('conv_val').value);
    const from = document.getElementById('conv_from').value;
    const to = document.getElementById('conv_to').value;

    if (isNaN(val)) return;

    if (!areUnitsCompatible(from, to)) {
        showConversionError();
        return;
    }

    const result = performConversion(val, from, to);
    showConversionResult(val, from, to, result);
}

function areUnitsCompatible(from, to) {
    const pressureUnits = ['bar', 'mbar', 'pascal'];
    const powerUnits = ['kw', 'watt'];
    
    const fromIsPressure = pressureUnits.includes(from);
    const toIsPressure = pressureUnits.includes(to);
    const fromIsPower = powerUnits.includes(from);
    const toIsPower = powerUnits.includes(to);
    
    return (fromIsPressure && toIsPressure) || (fromIsPower && toIsPower);
}

function performConversion(val, from, to) {
    if (isPressureConversion(from, to)) {
        return convertPressure(val, from, to);
    } else {
        return convertPower(val, from, to);
    }
}

function isPressureConversion(from, to) {
    const pressureUnits = ['bar', 'mbar', 'pascal'];
    return pressureUnits.includes(from) && pressureUnits.includes(to);
}

function convertPressure(val, from, to) {
    let base = val;

    if (from === 'mbar') base = val / 1000;
    if (from === 'pascal') base = val / 100000;

    let res = 0;
    if (to === 'bar') res = base;
    if (to === 'mbar') res = base * 1000;
    if (to === 'pascal') res = base * 100000;

    return res;
}

function convertPower(val, from, to) {
    if (from === 'kw' && to === 'watt') {
        return val * 1000;
    } else if (from === 'watt' && to === 'kw') {
        return val / 1000;
    }
    return val;
}

function showConversionError() {
    window.showResult?.('res_conv', "Fehler: Kann Druck nicht in Leistung umrechnen!", true);
}

function showConversionResult(val, from, to, result) {
    window.showResult?.('res_conv', `${val} ${from} = ${result} ${to}`);
}

function searchError() {
    const code = document.getElementById('error_code').value;
    if (code) {
        const url = `https://www.google.com/search?q=Heizung+Fehlercode+${encodeURIComponent(code)}`;
        window.open(url, '_blank');
    }
}
