// ==========================================
// SHK-MATE - Rechner: Hydraulik
// ==========================================
// Volumenstrom und Kv-Wert / Ventilstufe
// fuer den hydraulischen Abgleich.
// ==========================================

// ========== VOLUMENSTROM ==========

function readVolumenstromInputs() {
    return {
        power: parseFloat(document.getElementById('vs_kw').value),
        spread: parseFloat(document.getElementById('vs_dt').value)
    };
}

function validateVolumenstromInputs(inputs) {
    if (isNaN(inputs.power) || inputs.power <= 0) {
        return { valid: false, error: 'Bitte gültige Leistung eingeben' };
    }
    if (isNaN(inputs.spread) || inputs.spread <= 0) {
        return { valid: false, error: 'Bitte gültige Spreizung eingeben' };
    }
    if (inputs.spread < 5) {
        return { valid: false, error: 'Warnung: Sehr geringe Spreizung!' };
    }
    return { valid: true };
}

function calculateVolumeFlow(inputs) {
    const litersPerHour = (inputs.power * 1000) / (WATER_HEAT_CAPACITY * inputs.spread);
    return { litersPerHour: Math.round(litersPerHour) };
}

function formatVolumenstromResult(result) {
    return `Volumenstrom: ${result.litersPerHour.toLocaleString('de-DE')} l/h\n` +
           `(= ${(result.litersPerHour / 1000).toFixed(2)} m³/h)`;
}

/**
 * Volumenstrom einer Heizungsanlage
 * Formel: V̇ = Q / (c × ΔT)
 * @see DIN EN 12831
 */
function calcVolumenstrom() {
    runCalculator({
        name: 'calcVolumenstrom',
        resultId: 'res_volumen',
        readInputs: readVolumenstromInputs,
        validate: validateVolumenstromInputs,
        calculate: calculateVolumeFlow,
        format: formatVolumenstromResult
    });
}

// ========== KV-WERT / VENTILSTUFE ==========

function readKvInputs() {
    return {
        watt: parseFloat(document.getElementById('kv_watt').value),
        spread: parseFloat(document.getElementById('kv_dt').value),
        pressureDropMbar: parseFloat(document.getElementById('kv_dp').value)
    };
}

function validateKvInputs(inputs) {
    if (isNaN(inputs.watt) || inputs.watt <= 0) {
        return { valid: false, error: 'Bitte gültige Leistung eingeben' };
    }
    if (isNaN(inputs.spread) || inputs.spread <= 0) {
        return { valid: false, error: 'Bitte gültige Spreizung eingeben' };
    }
    if (isNaN(inputs.pressureDropMbar) || inputs.pressureDropMbar <= 0) {
        return { valid: false, error: 'Bitte gültigen Differenzdruck eingeben' };
    }
    return { valid: true };
}

function calculateKv(inputs) {
    const litersPerHour = inputs.watt / (WATER_HEAT_CAPACITY * inputs.spread);
    const cubicMetersPerHour = litersPerHour / 1000;
    const pressureDropBar = inputs.pressureDropMbar / 1000;
    return { litersPerHour, kv: cubicMetersPerHour / Math.sqrt(pressureDropBar) };
}

/**
 * Ordnet einem Kv-Wert die Voreinstellung des Thermostatventils zu
 */
function getValveSetting(kv) {
    const steps = [
        { below: 0.13, setting: '1' },
        { below: 0.28, setting: '2' },
        { below: 0.42, setting: '3' },
        { below: 0.56, setting: '4' },
        { below: 0.70, setting: '5' },
        { below: 0.90, setting: '6' }
    ];
    const match = steps.find(step => kv < step.below);
    return match ? match.setting : 'Offen (7/N)';
}

function calculateValveSetting(inputs) {
    const flow = calculateKv(inputs);
    return { ...flow, setting: getValveSetting(flow.kv) };
}

function updateValveVisual(result) {
    const visual = document.getElementById('valve_visual');
    if (visual) {
        visual.innerText = result.setting;
        visual.style.color = '#ff9900';
    }
}

function formatKvResult(result) {
    return `Durchfluss: ${Math.round(result.litersPerHour)} l/h\n` +
           `Errechneter Kv-Wert: ${result.kv.toFixed(2)}\n` +
           `Empfohlene Stufe: ca. ${result.setting}`;
}

/**
 * Kv-Wert und Ventil-Voreinstellung fuer den hydraulischen Abgleich
 * Formel: Kv = V̇ / √Δp
 */
function calcKvValue() {
    runCalculator({
        name: 'calcKvValue',
        resultId: 'res_kv',
        readInputs: readKvInputs,
        validate: validateKvInputs,
        calculate: calculateValveSetting,
        format: formatKvResult,
        update: updateValveVisual
    });
}
