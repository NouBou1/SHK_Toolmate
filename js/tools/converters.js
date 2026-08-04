// Tools & Converter Modul
// Unit-Umrechnung und Fehlercode-Suche

const PRESSURE_UNITS = ['bar', 'mbar', 'pascal'];
const POWER_UNITS = ['kw', 'watt'];

function readConversionInput() {
    return {
        value: parseFloat(document.getElementById('conv_val').value),
        from: document.getElementById('conv_from').value,
        to: document.getElementById('conv_to').value
    };
}

function convertUnits() {
    const { value, from, to } = readConversionInput();
    if (isNaN(value)) {
        return;
    }
    if (!areUnitsCompatible(from, to)) {
        showConversionError();
        return;
    }
    showConversionResult(value, from, to, performConversion(value, from, to));
}

function isPressureConversion(from, to) {
    return PRESSURE_UNITS.includes(from) && PRESSURE_UNITS.includes(to);
}

function isPowerConversion(from, to) {
    return POWER_UNITS.includes(from) && POWER_UNITS.includes(to);
}

function areUnitsCompatible(from, to) {
    return isPressureConversion(from, to) || isPowerConversion(from, to);
}

function performConversion(val, from, to) {
    if (isPressureConversion(from, to)) {
        return convertPressure(val, from, to);
    }
    return convertPower(val, from, to);
}

function convertPressure(val, from, to) {
    let base = val;

    if (from === 'mbar') {base = val / 1000;}
    if (from === 'pascal') {base = val / 100000;}

    let res = 0;
    if (to === 'bar') {res = base;}
    if (to === 'mbar') {res = base * 1000;}
    if (to === 'pascal') {res = base * 100000;}

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
    window.showResult?.('res_conv', 'Fehler: Kann Druck nicht in Leistung umrechnen!', true);
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
