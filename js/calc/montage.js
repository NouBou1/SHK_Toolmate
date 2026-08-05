// ==========================================
// SHK-ToolMate - Rechner: Montage
// ==========================================
// Versatzbogen, Gefaelle, Kernbohrung und
// Rohrschellen-Abstand.
// ==========================================

// ========== VERSATZBOGEN 45° ==========

import { runCalculator } from './common.js';

export function readOffsetInputs() {
    return {
        offset: parseFloat(document.getElementById('offset_cm').value)
    };
}

export function validateOffsetInputs(inputs) {
    if (isNaN(inputs.offset) || inputs.offset <= 0) {
        return { valid: false, error: 'Bitte gültigen Versatz eingeben' };
    }
    return { valid: true };
}

export function calculateOffset(inputs) {
    const SQRT_2 = 1.4142;
    return { pipeLength: inputs.offset * SQRT_2 };
}

export function formatOffsetResult(result) {
    return `Rohrlänge (Mitte-Mitte): ${result.pipeLength.toFixed(1)} cm\n` +
           '\n[ACHTUNG] Einstecktiefe der Fittings noch abziehen!';
}

/**
 * Rohrlaenge im 45°-Versatzbogen (Hypotenuse)
 */
export function calcOffset() {
    runCalculator({
        name: 'calcOffset',
        resultId: 'res_offset',
        readInputs: readOffsetInputs,
        validate: validateOffsetInputs,
        calculate: calculateOffset,
        format: formatOffsetResult
    });
}

// ========== GEFÄLLE ==========

export function readSlopeInputs() {
    return {
        length: parseFloat(document.getElementById('slope_len').value),
        percent: parseFloat(document.getElementById('slope_perc').value)
    };
}

export function validateSlopeInputs(inputs) {
    if (isNaN(inputs.length) || inputs.length <= 0) {
        return { valid: false, error: 'Bitte gültige Länge eingeben' };
    }
    if (isNaN(inputs.percent) || inputs.percent <= 0) {
        return { valid: false, error: 'Bitte gültiges Gefälle eingeben' };
    }
    return { valid: true };
}

export function calculateSlope(inputs) {
    const dropCm = inputs.length * inputs.percent;
    return { dropCm, dropMm: dropCm * 10 };
}

export function formatSlopeResult(result) {
    return `Höhenunterschied: ${result.dropCm.toFixed(1)} cm\n` +
           `(${result.dropMm} mm am Zollstock)`;
}

/**
 * Hoehenunterschied einer Leitung bei vorgegebenem Gefaelle
 */
export function calcSlope() {
    runCalculator({
        name: 'calcSlope',
        resultId: 'res_slope',
        readInputs: readSlopeInputs,
        validate: validateSlopeInputs,
        calculate: calculateSlope,
        format: formatSlopeResult
    });
}

// ========== KERNBOHRUNG ==========

export function readCoreDrillInputs() {
    return {
        dn: parseFloat(document.getElementById('kb_dn').value),
        insulation: parseFloat(document.getElementById('kb_iso').value)
    };
}

export function validateCoreDrillInputs(inputs) {
    if (isNaN(inputs.dn) || inputs.dn <= 0) {
        return { valid: false, error: 'Bitte gültigen DN-Wert wählen' };
    }
    if (isNaN(inputs.insulation) || inputs.insulation < 0) {
        return { valid: false, error: 'Bitte Dämmstärke wählen' };
    }
    return { valid: true };
}

export function calculateCoreDrill(inputs) {
    const CLEARANCE_MM = 30;
    const outerDiameter = inputs.dn + (2 * inputs.insulation);
    const requiredHole = outerDiameter + CLEARANCE_MM;
    return { outerDiameter, recommendation: Math.ceil(requiredHole / 10) * 10 };
}

export function formatCoreDrillResult(result) {
    return `Rohr + Dämmung: ${result.outerDiameter} mm\n` +
           `Empfohlene Kernbohrung: ∅ ${result.recommendation} mm\n` +
           '(inkl. Montagespielraum)';
}

/**
 * Durchmesser der Kernbohrung inkl. Daemmung und Montagespiel
 */
export function calcCoreDrill() {
    runCalculator({
        name: 'calcCoreDrill',
        resultId: 'res_kb',
        readInputs: readCoreDrillInputs,
        validate: validateCoreDrillInputs,
        calculate: calculateCoreDrill,
        format: formatCoreDrillResult
    });
}

// ========== ROHRSCHELLEN-ABSTAND ==========

// Maximale Abstaende in Metern, aufsteigend nach Nennweite
export const CLIP_DISTANCES = {
    plastic: [0.80, 1.00, 1.25, 1.50, 1.75, 2.00],
    cu: [1.25, 1.50, 1.75, 2.00, 2.25, 2.75],
    steel: [1.50, 2.00, 2.25, 2.75, 3.00, 3.25]
};

// Obergrenzen der Nennweiten-Klassen; groessere DN nutzen den letzten Wert
export const CLIP_DN_THRESHOLDS = [15, 20, 28, 35, 42];

export function readClipDistanceInputs() {
    return {
        material: document.getElementById('clip_mat').value,
        dn: parseInt(document.getElementById('clip_dn').value, 10)
    };
}

export function validateClipDistanceInputs(inputs) {
    if (isNaN(inputs.dn) || inputs.dn <= 0) {
        return { valid: false, error: 'Bitte gültigen DN-Wert wählen' };
    }
    return { valid: true };
}

export function calculateClipDistance(inputs) {
    const distances = CLIP_DISTANCES[inputs.material] || CLIP_DISTANCES.cu;
    const classIndex = CLIP_DN_THRESHOLDS.findIndex(threshold => inputs.dn <= threshold);
    const distance = classIndex === -1 ? distances[distances.length - 1] : distances[classIndex];
    return { distance };
}

export function formatClipDistanceResult(result) {
    return `Max. Abstand: ${result.distance.toFixed(2)} Meter\n` +
           '(Empfehlung für waagerechte Montage)';
}

/**
 * Maximaler Rohrschellen-Abstand nach Material und Nennweite
 */
export function calcClipDist() {
    runCalculator({
        name: 'calcClipDist',
        resultId: 'res_clip',
        readInputs: readClipDistanceInputs,
        validate: validateClipDistanceInputs,
        calculate: calculateClipDistance,
        format: formatClipDistanceResult
    });
}
