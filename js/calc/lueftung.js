// ==========================================
// SHK-MATE - Rechner: Lueftung
// ==========================================
// Luftwechsel bzw. Mindestvolumenstrom eines Raumes.
// ==========================================

// Werte oberhalb dieser Grenze sind Pauschalforderungen in m³/h,
// darunter Luftwechselraten pro Stunde.
const FLAT_RATE_THRESHOLD = 10;

function readAirExchangeInputs() {
    return {
        area: parseFloat(document.getElementById('air_qm').value),
        height: parseFloat(document.getElementById('air_h').value),
        rate: parseFloat(document.getElementById('air_type').value)
    };
}

function validateAirExchangeInputs(inputs) {
    if (isNaN(inputs.area) || inputs.area <= 0) {
        return { valid: false, error: 'Bitte gültige Fläche eingeben' };
    }
    if (isNaN(inputs.height) || inputs.height <= 0) {
        return { valid: false, error: 'Bitte gültige Höhe eingeben' };
    }
    return { valid: true };
}

function calculateAirExchange(inputs) {
    const volume = inputs.area * inputs.height;
    const isFlatRate = inputs.rate > FLAT_RATE_THRESHOLD;
    const airFlow = isFlatRate ? inputs.rate : volume * inputs.rate;
    return { volume, airFlow, isFlatRate, rate: inputs.rate };
}

function formatAirFlowLine(result) {
    if (result.isFlatRate) {
        return `Pauschal-Forderung (DIN 18017): ~${result.airFlow} m³/h`;
    }
    return `Luftwechsel (${result.rate}x / h): ${result.airFlow.toFixed(1)} m³/h`;
}

function formatAirExchangeResult(result) {
    return `Raumvolumen: ${result.volume.toFixed(1)} m³\n` +
           `${formatAirFlowLine(result)}\n` +
           '(Mindestleistung des Lüfters)';
}

/**
 * Mindestvolumenstrom eines Raumes
 * @see DIN 1946-6, DIN 18017
 */
function calcAirExchange() {
    runCalculator({
        name: 'calcAirExchange',
        resultId: 'res_air',
        readInputs: readAirExchangeInputs,
        validate: validateAirExchangeInputs,
        calculate: calculateAirExchange,
        format: formatAirExchangeResult
    });
}
