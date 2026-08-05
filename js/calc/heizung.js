// ==========================================
// SHK-ToolMate - Rechner: Heizung / Waermeerzeuger
// ==========================================
// Heizlast, Heizkoerper-Leistung, reale Leistung,
// Kondensatmenge und Feuerungsleistung am Gaszaehler.
// ==========================================

// ========== HEIZLAST ==========

import { runCalculator } from './common.js';
import { INPUT_LIMITS, WATER_HEAT_CAPACITY, GAS_HEATING_VALUES } from '../core/constants.js';

export function readHeizlastInputs() {
    return {
        area: parseFloat(document.getElementById('hl_flaeche').value),
        wattPerSquareMeter: parseFloat(document.getElementById('hl_typ').value)
    };
}

export function validateHeizlastInputs(inputs) {
    if (isNaN(inputs.area) || inputs.area <= 0) {
        return { valid: false, error: 'Bitte gültige Fläche eingeben (> 0)' };
    }
    if (inputs.area > INPUT_LIMITS.FLOOR_AREA_MAX) {
        return { valid: false, error: 'Warnung: Sehr große Fläche!' };
    }
    if (isNaN(inputs.wattPerSquareMeter) || inputs.wattPerSquareMeter <= 0) {
        return { valid: false, error: 'Bitte gültigen Gebäudetyp wählen' };
    }
    return { valid: true };
}

export function calculateHeatLoad(inputs) {
    const watt = Math.round(inputs.area * inputs.wattPerSquareMeter);
    return { watt, kw: (watt / 1000).toFixed(2) };
}

export function formatHeizlastResult(result) {
    return `Bedarf: ca. ${result.watt.toLocaleString('de-DE')} Watt (${result.kw} kW)\n` +
           '\nHinweis: Überschlägswert nach DIN EN 12831';
}

/**
 * Heizlast eines Raumes (Überschlägswert)
 * Formel: P = A × q
 * @see DIN EN 12831
 */
export function calcHeizlast() {
    runCalculator({
        name: 'calcHeizlast',
        resultId: 'res_heizlast',
        readInputs: readHeizlastInputs,
        validate: validateHeizlastInputs,
        calculate: calculateHeatLoad,
        format: formatHeizlastResult
    });
}

// ========== HEIZKÖRPER-LEISTUNG ==========

export function readRadiatorInputs() {
    return {
        wattPerMeter: parseFloat(document.getElementById('hk_typ').value),
        height: parseFloat(document.getElementById('hk_height').value),
        lengthMm: parseFloat(document.getElementById('hk_len').value)
    };
}

export function validateRadiatorInputs(inputs) {
    if (isNaN(inputs.lengthMm) || inputs.lengthMm <= 0) {
        return { valid: false, error: 'Bitte gültige Länge eingeben' };
    }
    return { valid: true };
}

export function getRadiatorHeightCorrection(height) {
    const corrections = {
        0.3: 0.55, 0.4: 0.70, 0.5: 0.85,
        0.6: 1.00, 0.9: 1.45
    };
    return corrections[height] || 1.0;
}

export function calculateRadiatorPower(inputs) {
    const correction = getRadiatorHeightCorrection(inputs.height);
    const powerAt70 = inputs.wattPerMeter * correction * (inputs.lengthMm / 1000);
    return { powerAt70, powerAt55: powerAt70 * 0.5 };
}

export function formatRadiatorResult(result) {
    return `Leistung (70/55°C): ca. ${Math.round(result.powerAt70)} Watt\n` +
           `Leistung (55/45°C): ca. ${Math.round(result.powerAt55)} Watt\n` +
           '(Schätzwert für Altbau-Bestand)';
}

/**
 * Heizkoerper-Leistung nach Faustformel (Plattenheizkoerper)
 */
export function calcRadiator() {
    runCalculator({
        name: 'calcRadiator',
        resultId: 'res_hk',
        readInputs: readRadiatorInputs,
        validate: validateRadiatorInputs,
        calculate: calculateRadiatorPower,
        format: formatRadiatorResult
    });
}

// ========== REALE LEISTUNG (Vor-/Ruecklauf) ==========

export function readRealPowerInputs() {
    return {
        flowRate: parseFloat(document.getElementById('real_flow').value),
        flowTemp: parseFloat(document.getElementById('real_vl').value),
        returnTemp: parseFloat(document.getElementById('real_rl').value)
    };
}

export function validateRealPowerInputs(inputs) {
    if (isNaN(inputs.flowRate) || inputs.flowRate <= 0) {
        return { valid: false, error: 'Bitte gültigen Durchfluss eingeben' };
    }
    if (isNaN(inputs.flowTemp) || isNaN(inputs.returnTemp)) {
        return { valid: false, error: 'Bitte Temperaturen eingeben' };
    }
    if (inputs.flowTemp - inputs.returnTemp <= 0) {
        return { valid: false, error: 'Delta T ist 0 oder negativ!' };
    }
    return { valid: true };
}

export function calculateRealPower(inputs) {
    const spread = inputs.flowTemp - inputs.returnTemp;
    const watt = inputs.flowRate * WATER_HEAT_CAPACITY * spread;
    return { spread, watt, kw: watt / 1000 };
}

export function formatRealPowerResult(result) {
    return `Spreizung: ${result.spread.toFixed(1)} K\n` +
           `Leistung: ${result.kw.toFixed(2)} kW\n` +
           `(${Math.round(result.watt)} Watt)`;
}

/**
 * Tatsaechlich uebertragene Leistung aus Durchfluss und Spreizung
 * Formel: P = V̇ × c × ΔT
 */
export function calcRealPower() {
    runCalculator({
        name: 'calcRealPower',
        resultId: 'res_realpower',
        readInputs: readRealPowerInputs,
        validate: validateRealPowerInputs,
        calculate: calculateRealPower,
        format: formatRealPowerResult
    });
}

// ========== KONDENSAT (Brennwert) ==========

export function readCondensateInputs() {
    return {
        power: parseFloat(document.getElementById('cond_kw').value),
        litersPerKw: parseFloat(document.getElementById('cond_fuel').value),
        hours: parseFloat(document.getElementById('cond_hours').value)
    };
}

export function validateCondensateInputs(inputs) {
    if (isNaN(inputs.power) || inputs.power <= 0) {
        return { valid: false, error: 'Bitte gültige Leistung eingeben' };
    }
    if (isNaN(inputs.hours) || inputs.hours <= 0) {
        return { valid: false, error: 'Bitte gültige Betriebszeit eingeben' };
    }
    return { valid: true };
}

export function calculateCondensate(inputs) {
    const perHour = inputs.power * inputs.litersPerKw;
    return { perHour, perDay: perHour * inputs.hours };
}

export function formatCondensateResult(result) {
    return `Kondensat: ca. ${result.perHour.toFixed(2)} Liter/Stunde\n` +
           `Tagesmenge: ca. ${result.perDay.toFixed(1)} Liter\n` +
           '(Bei Vollbrennwertnutzung)';
}

/**
 * Anfallende Kondensatmenge eines Brennwertgeraetes
 */
export function calcCondensate() {
    runCalculator({
        name: 'calcCondensate',
        resultId: 'res_cond',
        readInputs: readCondensateInputs,
        validate: validateCondensateInputs,
        calculate: calculateCondensate,
        format: formatCondensateResult
    });
}

// ========== GASZÄHLER (AUSLITERN) ==========

export function readGasPowerInputs() {
    return {
        seconds: parseFloat(document.getElementById('gas_sec').value),
        volume: parseFloat(document.getElementById('gas_vol').value)
    };
}

export function validateGasPowerSeconds(seconds) {
    if (isNaN(seconds) || seconds <= 0) {
        return { valid: false, error: 'Bitte gültige Zeit eingeben (> 0 Sekunden)' };
    }
    if (seconds < 5) {
        return { valid: false, error: 'Warnung: Messzeit zu kurz - Ergebnis ungenau!' };
    }
    if (seconds > 3600) {
        return { valid: false, error: 'Bitte Messzeit in Sekunden eingeben (max. 3600)' };
    }
    return { valid: true };
}

export function validateGasPowerInputs(inputs) {
    const secondsCheck = validateGasPowerSeconds(inputs.seconds);
    if (!secondsCheck.valid) {
        return secondsCheck;
    }
    if (isNaN(inputs.volume) || inputs.volume <= 0) {
        return { valid: false, error: 'Bitte gültige Menge wählen' };
    }
    return { valid: true };
}

export function calculateGasPower(inputs) {
    const heatingValue = GAS_HEATING_VALUES.NATURAL_GAS;
    const flowRate = (inputs.volume * 3600) / inputs.seconds;
    return { flowRate, load: flowRate * heatingValue, heatingValue };
}

export function formatGasPowerResult(result) {
    return `Durchsatz: ${result.flowRate.toFixed(2)} m³/h\n` +
           `Feuerungsleistung: ca. ${result.load.toFixed(1)} kW\n` +
           `(bei Hi = ${result.heatingValue} kWh/m³)`;
}

/**
 * Feuerungsleistung durch Auslitern am Gaszaehler
 * Formel: P = (V / t) × 3600 × Hi
 */
export function calcGasPower() {
    runCalculator({
        name: 'calcGasPower',
        resultId: 'res_gas',
        readInputs: readGasPowerInputs,
        validate: validateGasPowerInputs,
        calculate: calculateGasPower,
        format: formatGasPowerResult
    });
}
