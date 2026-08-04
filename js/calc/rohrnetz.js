// ==========================================
// SHK-MATE - Rechner: Rohrnetz
// ==========================================
// Rohrinhalt und Fliessgeschwindigkeit.
// ==========================================

// ========== ROHRINHALT ==========

function readPipeVolumeInputs() {
    return {
        length: parseFloat(document.getElementById('vol_len').value),
        dn: parseFloat(document.getElementById('vol_dim').value)
    };
}

function getPipeVolumeFactor(dn) {
    return PIPE_VOLUME_FACTORS[dn] || null;
}

function validatePipeVolumeInputs(inputs) {
    if (isNaN(inputs.length) || inputs.length <= 0) {
        return { valid: false, error: 'Bitte gültige Länge eingeben' };
    }
    if (inputs.length > INPUT_LIMITS.PIPE_LENGTH_MAX) {
        return { valid: false, error: 'Warnung: Sehr lange Leitung!' };
    }
    if (!getPipeVolumeFactor(inputs.dn)) {
        return { valid: false, error: 'Bitte gültigen DN-Wert wählen' };
    }
    return { valid: true };
}

function calculatePipeVolume(inputs) {
    const litersPerMeter = getPipeVolumeFactor(inputs.dn);
    return { volume: inputs.length * litersPerMeter, litersPerMeter, dn: inputs.dn };
}

function formatPipeVolumeResult(result) {
    return `Rohrinhalt: ${result.volume.toFixed(2)} Liter\n` +
           `(DN ${result.dn}: ca. ${result.litersPerMeter} l/m)\n\n` +
           'Hinweis: Wichtig für Spülvolumen & Fülldruck';
}

/**
 * Wasserinhalt einer Leitung nach Nennweite
 */
function calcPipeVol() {
    runCalculator({
        name: 'calcPipeVol',
        resultId: 'res_pipevol',
        readInputs: readPipeVolumeInputs,
        validate: validatePipeVolumeInputs,
        calculate: calculatePipeVolume,
        format: formatPipeVolumeResult
    });
}

// ========== FLIESSGESCHWINDIGKEIT ==========

function readFlowSpeedInputs() {
    return {
        volume: parseFloat(document.getElementById('flow_vol').value),
        unit: document.getElementById('flow_unit').value,
        dn: parseFloat(document.getElementById('flow_dn').value)
    };
}

function validateFlowSpeedInputs(inputs) {
    if (isNaN(inputs.volume) || inputs.volume <= 0) {
        return { valid: false, error: 'Bitte gültigen Durchfluss eingeben' };
    }
    if (isNaN(inputs.dn) || inputs.dn <= 0) {
        return { valid: false, error: 'Bitte gültigen DN-Wert wählen' };
    }
    return { valid: true };
}

function convertToCubicMetersPerSecond(volume, unit) {
    const converted = {
        'l_h': volume / 1000 / 3600,
        'l_min': volume / 1000 / 60,
        'm3_h': volume / 3600
    };
    return converted[unit] || 0;
}

function calculateFlowSpeed(volume, unit, dn) {
    const cubicMetersPerSecond = convertToCubicMetersPerSecond(volume, unit);
    const radiusMeters = (dn / 1000) / 2;
    const area = Math.PI * radiusMeters * radiusMeters;
    return cubicMetersPerSecond / area;
}

/**
 * Prueft die Geschwindigkeit gegen die Grenzwerte des jeweiligen Mediums
 */
function getSpeedWarning(speed, unit) {
    const limits = {
        'l_h': { limit: 1.0, reason: 'Geräuschgefahr Heizung!' },
        'l_min': { limit: 2.0, reason: 'Druckschlag/Korrosion!' },
        'm3_h': { limit: 5.0, reason: 'Luftkanal laut!' }
    };
    const check = limits[unit];
    if (check && speed > check.limit) {
        return { isCritical: true, note: `\n[ACHTUNG] > ${check.limit} m/s (${check.reason})` };
    }
    return { isCritical: false, note: '' };
}

function calculateFlowSpeedResult(inputs) {
    const speed = calculateFlowSpeed(inputs.volume, inputs.unit, inputs.dn);
    return { speed, ...getSpeedWarning(speed, inputs.unit) };
}

function formatFlowSpeedResult(result) {
    return `Geschwindigkeit: ${result.speed.toFixed(2)} m/s${result.note}`;
}

/**
 * Fliessgeschwindigkeit im Rohr
 * Formel: v = V̇ / A
 * @see VDI 2035
 */
function calcFlowSpeed() {
    runCalculator({
        name: 'calcFlowSpeed',
        resultId: 'res_flow',
        readInputs: readFlowSpeedInputs,
        validate: validateFlowSpeedInputs,
        calculate: calculateFlowSpeedResult,
        format: formatFlowSpeedResult,
        warn: result => result.isCritical
    });
}
