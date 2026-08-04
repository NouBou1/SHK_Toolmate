// ==========================================
// SHK-MATE - Rechner: Behaelter
// ==========================================
// Membran-Ausdehnungsgefaess (Vordruck) und
// Fuellstand eines liegenden Tanks.
// ==========================================

// ========== MAG (Membran-Ausdehnungsgefaess) ==========

function readMagInputs() {
    return {
        staticHeight: parseFloat(document.getElementById('mag_hoehe').value)
    };
}

function validateMagInputs(inputs) {
    if (isNaN(inputs.staticHeight) || inputs.staticHeight <= 0) {
        return { valid: false, error: 'Bitte gültige Höhe eingeben (> 0 m)' };
    }
    if (inputs.staticHeight > INPUT_LIMITS.HEIGHT_MAX) {
        return { valid: false, error: 'Warnung: Sehr hohe Anlage (> 200m)!' };
    }
    return { valid: true };
}

function calculateMagPressure(inputs) {
    const staticBar = inputs.staticHeight / MAG_CONFIG.METERS_TO_BAR;
    const preCharge = Math.round((staticBar + MAG_CONFIG.SAFETY_OFFSET_BAR) * 10) / 10;
    return { preCharge, fillPressure: preCharge + MAG_CONFIG.FILL_PRESSURE_OFFSET_BAR };
}

function formatMagResult(result) {
    return `Vordruck (P0): ${result.preCharge} bar\n` +
           `Anlagen-Fülldruck: ca. ${result.fillPressure.toFixed(1)} bar\n\n` +
           'Hinweis: P0 vor Montage kalt einstellen! (VDI 4708)';
}

/**
 * MAG-Vordruck aus der statischen Hoehe
 * Formel: P0 = (h / 10) + 0,3 bar
 * @see VDI 4708
 */
function calcMAG() {
    runCalculator({
        name: 'calcMAG',
        resultId: 'res_mag',
        readInputs: readMagInputs,
        validate: validateMagInputs,
        calculate: calculateMagPressure,
        format: formatMagResult
    });
}

// ========== LIEGENDER TANK ==========

function readTankInputs() {
    return {
        diameter: parseFloat(document.getElementById('tank_d').value),
        length: parseFloat(document.getElementById('tank_l').value),
        fillHeight: parseFloat(document.getElementById('tank_h').value)
    };
}

function validateTankInputs(inputs) {
    const { diameter, length, fillHeight } = inputs;
    if (isNaN(diameter) || isNaN(length) || isNaN(fillHeight)) {
        return { valid: false, error: 'Bitte alle Werte eingeben' };
    }
    if (diameter <= 0 || length <= 0 || fillHeight <= 0) {
        return { valid: false, error: 'Bitte alle Werte eingeben' };
    }
    if (fillHeight > diameter) {
        return { valid: false, error: 'Füllhöhe größer als Durchmesser!' };
    }
    return { valid: true };
}

/**
 * Flaeche des gefuellten Kreisabschnitts (Kreissegment)
 */
function calculateSegmentArea(radius, fillHeight) {
    if (fillHeight === radius * 2) {
        return Math.PI * radius * radius;
    }
    const distanceToChord = radius - fillHeight;
    const circularSector = radius * radius * Math.acos(distanceToChord / radius);
    const triangle = distanceToChord * Math.sqrt(radius * radius - distanceToChord * distanceToChord);
    return circularSector - triangle;
}

function calculateTankVolume(inputs) {
    const radius = inputs.diameter / 2;
    const filledArea = calculateSegmentArea(radius, inputs.fillHeight);
    const liters = (filledArea * inputs.length) / 1000;
    const capacity = (Math.PI * radius * radius * inputs.length) / 1000;
    return { liters, capacity, percent: (liters / capacity) * 100 };
}

function formatTankResult(result) {
    return `Aktueller Inhalt: ${Math.round(result.liters)} Liter\n` +
           `Füllstand: ${result.percent.toFixed(1)} %\n` +
           `(Gesamtkapazität: ${Math.round(result.capacity)} Liter)`;
}

/**
 * Fuellstand eines liegenden zylindrischen Tanks
 */
function calcTank() {
    runCalculator({
        name: 'calcTank',
        resultId: 'res_tank',
        readInputs: readTankInputs,
        validate: validateTankInputs,
        calculate: calculateTankVolume,
        format: formatTankResult
    });
}
