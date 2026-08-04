// ==========================================
// SHK-MATE - Rechner: Trinkwasser
// ==========================================
// Wasserhaerte, Mischwassermenge, Aufheizzeit
// und Zirkulationspflicht.
// ==========================================

import { runCalculator } from './common.js';
import { WATER_HEAT_CAPACITY, CIRCULATION_LIMIT_LITERS } from '../core/constants.js';

export const MIXED_WATER_TARGET_TEMP = 38; // °C Zieltemperatur Dusche/Wanne

// ========== WASSERHÄRTE ==========

export function readHardnessInputs() {
    return {
        value: parseFloat(document.getElementById('hard_val').value),
        mode: document.getElementById('hard_mode').value
    };
}

export function validateHardnessInputs(inputs) {
    if (isNaN(inputs.value) || inputs.value <= 0) {
        return { valid: false, error: 'Bitte gültigen Wert eingeben' };
    }
    return { valid: true };
}

export function calculateHardness(inputs) {
    const DEGREE_DH_TO_MMOL = 0.1783;
    const MMOL_TO_DEGREE_DH = 5.608;
    const toMmol = inputs.mode === 'dh_to_mmol';
    const converted = inputs.value * (toMmol ? DEGREE_DH_TO_MMOL : MMOL_TO_DEGREE_DH);
    return { value: inputs.value, converted, toMmol };
}

export function formatHardnessResult(result) {
    if (result.toMmol) {
        return `${result.value} °dH = ${result.converted.toFixed(2)} mmol/l`;
    }
    return `${result.value} mmol/l = ${result.converted.toFixed(1)} °dH`;
}

/**
 * Rechnet die Wasserhaerte zwischen °dH und mmol/l um
 */
export function calcHardness() {
    runCalculator({
        name: 'calcHardness',
        resultId: 'res_hard',
        readInputs: readHardnessInputs,
        validate: validateHardnessInputs,
        calculate: calculateHardness,
        format: formatHardnessResult
    });
}

// ========== MISCHWASSER ==========

export function readMixWaterInputs() {
    return {
        hotTemp: parseFloat(document.getElementById('mix_t_hot').value),
        hotVolume: parseFloat(document.getElementById('mix_vol').value),
        coldTemp: parseFloat(document.getElementById('mix_t_cold').value)
    };
}

export function validateMixWaterInputs(inputs) {
    if (isNaN(inputs.hotTemp) || isNaN(inputs.hotVolume)) {
        return { valid: false, error: 'Bitte Temperatur und Volumen eingeben' };
    }
    if (inputs.coldTemp >= MIXED_WATER_TARGET_TEMP) {
        return { valid: false, error: 'Kaltwasser wärmer als Ziel (38°C)!' };
    }
    return { valid: true };
}

export function calculateMixWater(inputs) {
    const temperatureLift = inputs.hotTemp - inputs.coldTemp;
    const usableLift = MIXED_WATER_TARGET_TEMP - inputs.coldTemp;
    const mixedVolume = (inputs.hotVolume * temperatureLift) / usableLift;
    return { mixedVolume, factor: (mixedVolume / inputs.hotVolume).toFixed(1) };
}

export function formatMixWaterResult(result) {
    return `Ertrag bei 38°C: ca. ${Math.round(result.mixedVolume)} Liter\n` +
           `(Faktor ${result.factor}x des Speichervolumens)`;
}

/**
 * Mischwassermenge bei 38°C aus einem Speichervolumen
 */
export function calcMixWater() {
    runCalculator({
        name: 'calcMixWater',
        resultId: 'res_mix',
        readInputs: readMixWaterInputs,
        validate: validateMixWaterInputs,
        calculate: calculateMixWater,
        format: formatMixWaterResult
    });
}

// ========== AUFHEIZZEIT ==========

export function readHeatUpTimeInputs() {
    return {
        volume: parseFloat(document.getElementById('heatup_vol').value),
        startTemp: parseFloat(document.getElementById('heatup_t1').value),
        targetTemp: parseFloat(document.getElementById('heatup_t2').value),
        power: parseFloat(document.getElementById('heatup_kw').value)
    };
}

export function validateHeatUpTimeInputs(inputs) {
    if (isNaN(inputs.volume) || inputs.volume <= 0) {
        return { valid: false, error: 'Bitte gültiges Volumen eingeben' };
    }
    if (isNaN(inputs.power) || inputs.power <= 0) {
        return { valid: false, error: 'Bitte gültige Leistung eingeben' };
    }
    if (inputs.startTemp >= inputs.targetTemp) {
        return { valid: false, error: 'Start-Temperatur muss kleiner als Ziel sein' };
    }
    return { valid: true };
}

export function calculateHeatUpTime(inputs) {
    const spread = inputs.targetTemp - inputs.startTemp;
    const energyWh = inputs.volume * WATER_HEAT_CAPACITY * spread;
    const minutes = Math.round((energyWh / (inputs.power * 1000)) * 60);
    return { energyWh, minutes, hours: Math.floor(minutes / 60), restMinutes: minutes % 60 };
}

export function formatHeatUpTimeResult(result) {
    return `Benötigte Energie: ${(result.energyWh / 1000).toFixed(1)} kWh\n` +
           `Dauer: ca. ${result.minutes} Min\n` +
           `(${result.hours} Std. ${result.restMinutes} Min.)`;
}

/**
 * Aufheizzeit eines Speichers
 * Formel: t = (V × c × ΔT) / P
 */
export function calcHeatUpTime() {
    runCalculator({
        name: 'calcHeatUpTime',
        resultId: 'res_heatup',
        readInputs: readHeatUpTimeInputs,
        validate: validateHeatUpTimeInputs,
        calculate: calculateHeatUpTime,
        format: formatHeatUpTimeResult
    });
}

// ========== ZIRKULATION ==========

export function readZirkulationInputs() {
    return {
        length: parseFloat(document.getElementById('zirk_m').value),
        litersPerMeter: parseFloat(document.getElementById('zirk_dn').value)
    };
}

export function validateZirkulationInputs(inputs) {
    if (isNaN(inputs.length) || inputs.length <= 0) {
        return { valid: false, error: 'Bitte gültige Länge eingeben' };
    }
    if (inputs.length > 1000) {
        return { valid: false, error: 'Warnung: Sehr lange Leitung!' };
    }
    if (isNaN(inputs.litersPerMeter) || inputs.litersPerMeter <= 0) {
        return { valid: false, error: 'Bitte gültigen DN-Wert wählen' };
    }
    return { valid: true };
}

export function calculateCirculationVolume(inputs) {
    const volume = inputs.length * inputs.litersPerMeter;
    return { volume, isCritical: volume > CIRCULATION_LIMIT_LITERS };
}

export function formatZirkulationResult(result) {
    const header = `Inhalt: ${result.volume.toFixed(2)} Liter\n\n`;
    if (result.isCritical) {
        return header + `[ACHTUNG] > ${CIRCULATION_LIMIT_LITERS} Liter!\nZirkulation PFLICHT (DVGW W 551)`;
    }
    return header + `[OK] Keine Zirkulation nötig\n(< ${CIRCULATION_LIMIT_LITERS} Liter Inhalt)`;
}

/**
 * Prueft, ob eine Zirkulationsleitung erforderlich ist
 * @see DVGW W 551 (Trinkwasserhygiene)
 */
export function calcZirkulation() {
    runCalculator({
        name: 'calcZirkulation',
        resultId: 'res_zirk',
        readInputs: readZirkulationInputs,
        validate: validateZirkulationInputs,
        calculate: calculateCirculationVolume,
        format: formatZirkulationResult,
        warn: result => result.isCritical
    });
}
