// ==========================================
// SHK-MATE - Berechnungsfunktionen
// ==========================================
// Alle Rechner-Funktionen mit Fehlerbehandlung
// und Input-Validierung
//
// Verwendet:
// - constants.js: Alle Konstanten und Grenzwerte
// - validation.js: Input-Validierung
// - utils.js: showResult, formatNumber etc.
// ==========================================

// Konstanten importieren (wenn als Module geladen)
// Falls nicht als Module: Konstanten sind global verfügbar

// ========== GENERISCHE HELPER ==========

function handleCalculationError(fnName, error, resultId) {
    console.error(`Error in ${fnName}:`, error);
    showResult(resultId, 'Fehler bei der Berechnung', true);
}

// ========== HEIZLAST ==========

function getHeizlastInputs() {
    return {
        area: parseFloat(document.getElementById('hl_flaeche').value),
        factor: parseFloat(document.getElementById('hl_typ').value)
    };
}

function validateHeizlastInputs(area, factor) {
    if (isNaN(area) || area <= 0) {
        return { valid: false, error: 'Bitte gültige Fläche eingeben (> 0)' };
    }
    if (area > 10000) {
        return { valid: false, error: 'Warnung: Sehr große Fläche!' };
    }
    if (isNaN(factor) || factor <= 0) {
        return { valid: false, error: 'Bitte gültigen Gebäudetyp wählen' };
    }
    return { valid: true };
}

function calculateHeatLoad(area, factor) {
    const watt = Math.round(area * factor);
    const kw = (watt / 1000).toFixed(2);
    return { watt, kw };
}

function formatHeizlastResult(watt, kw) {
    return `Bedarf: ca. ${watt.toLocaleString('de-DE')} Watt (${kw} kW)\n` +
           `\nHinweis: Überschlägswert nach DIN EN 12831`;
}

/**
 * Berechnet die Heizlast eines Raumes (Überschlägswert)
 * 
 * Formel: P = A × q
 * - A: Raumfläche in m²
 * - q: Spezifische Heizlast in W/m² (nach Gebäudestandard)
 * 
 * @returns {void}
 * 
 * @see DIN EN 12831 - Heizlastberechnung
 */
function calcHeizlast() {
    try {
        const inputs = getHeizlastInputs();
        const validation = validateHeizlastInputs(inputs.area, inputs.factor);
        if (!validation.valid) {
            showResult('res_heizlast', validation.error, true);
            return;
        }
        const result = calculateHeatLoad(inputs.area, inputs.factor);
        const message = formatHeizlastResult(result.watt, result.kw);
        showResult('res_heizlast', message);
    } catch (error) {
        handleCalculationError('calcHeizlast', error, 'res_heizlast');
    }
}

// ========== VOLUMENSTROM ==========

function getVolumenstromInputs() {
    return {
        power: parseFloat(document.getElementById('vs_kw').value),
        delta: parseFloat(document.getElementById('vs_dt').value)
    };
}

function validateVolumenstromInputs(power, delta) {
    if (isNaN(power) || power <= 0) {
        return { valid: false, error: 'Bitte gültige Leistung eingeben' };
    }
    if (isNaN(delta) || delta <= 0) {
        return { valid: false, error: 'Bitte gültige Spreizung eingeben' };
    }
    if (delta < 5) {
        return { valid: false, error: 'Warnung: Sehr geringe Spreizung!' };
    }
    return { valid: true };
}

function calculateFlowRate(power, delta) {
    const WATER_HEAT_CAPACITY = 1.163;
    return Math.round((power * 1000) / (WATER_HEAT_CAPACITY * delta));
}

function formatVolumenstromResult(flowRate) {
    return `Volumenstrom: ${flowRate.toLocaleString('de-DE')} l/h\n` +
           `(= ${(flowRate / 1000).toFixed(2)} m³/h)`;
}

/**
 * Berechnet den Volumenstrom einer Heizungsanlage
 * Formel: V̇ = Q / (c × ΔT)
 * @see DIN EN 12831
 */
function calcVolumenstrom() {
    try {
        const inputs = getVolumenstromInputs();
        const validation = validateVolumenstromInputs(inputs.power, inputs.delta);
        if (!validation.valid) {
            showResult('res_volumen', validation.error, true);
            return;
        }
        const flowRate = calculateFlowRate(inputs.power, inputs.delta);
        const message = formatVolumenstromResult(flowRate);
        showResult('res_volumen', message);
    } catch (error) {
        handleCalculationError('calcVolumenstrom', error, 'res_volumen');
    }
}

// ========== ZIRKULATION ==========

function getZirkulationInputs() {
    return {
        length: parseFloat(document.getElementById('zirk_m').value),
        contentPerMeter: parseFloat(document.getElementById('zirk_dn').value)
    };
}

function validateZirkulationInputs(length, contentPerMeter) {
    if (isNaN(length) || length <= 0) {
        return { valid: false, error: 'Bitte gültige Länge eingeben' };
    }
    if (length > 1000) {
        return { valid: false, error: 'Warnung: Sehr lange Leitung!' };
    }
    if (isNaN(contentPerMeter) || contentPerMeter <= 0) {
        return { valid: false, error: 'Bitte gültigen DN-Wert wählen' };
    }
    return { valid: true };
}

function calculateCirculationVolume(length, contentPerMeter) {
    const volume = length * contentPerMeter;
    const isCritical = volume > 3;
    return { volume, isCritical };
}

function formatZirkulationResult(volume, isCritical) {
    const baseMsg = `Inhalt: ${volume.toFixed(2)} Liter\n\n`;
    if (isCritical) {
        return baseMsg + '[ACHTUNG] > 3 Liter!\nZirkulation PFLICHT (DVGW W 551)';
    }
    return baseMsg + '[OK] Keine Zirkulation nötig\n(< 3 Liter Inhalt)';
}

/**
 * Prüft ob Zirkulation erforderlich ist (Trinkwasserhygiene)
 * @see DVGW W 551
 */
function calcZirkulation() {
    try {
        const inputs = getZirkulationInputs();
        const validation = validateZirkulationInputs(inputs.length, inputs.contentPerMeter);
        if (!validation.valid) {
            showResult('res_zirk', validation.error, true);
            return;
        }
        const result = calculateCirculationVolume(inputs.length, inputs.contentPerMeter);
        const message = formatZirkulationResult(result.volume, result.isCritical);
        showResult('res_zirk', message, result.isCritical);
    } catch (error) {
        handleCalculationError('calcZirkulation', error, 'res_zirk');
    }
}

// ========== MAG (Membran-Ausdehnungsgefäss) ==========

function getMAGInputs() {
    return {
        height: parseFloat(document.getElementById('mag_hoehe').value)
    };
}

function validateMAGInputs(height) {
    if (isNaN(height) || height <= 0) {
        return { valid: false, error: 'Bitte gültige Höhe eingeben (> 0 m)' };
    }
    if (height > 200) {
        return { valid: false, error: 'Warnung: Sehr hohe Anlage (> 200m)!' };
    }
    return { valid: true };
}

function calculateMAGPressure(height) {
    const METERS_TO_BAR = 10;
    const SAFETY_OFFSET = 0.3;
    const FILL_OFFSET = 0.3;
    
    const p0 = Math.round(((height / METERS_TO_BAR) + SAFETY_OFFSET) * 10) / 10;
    const pFill = p0 + FILL_OFFSET;
    
    return { p0, pFill };
}

function formatMAGResult(p0, pFill) {
    return `Vordruck (P0): ${p0} bar\n` +
           `Anlagen-Fülldruck: ca. ${pFill.toFixed(1)} bar\n\n` +
           `Hinweis: P0 vor Montage kalt einstellen! (VDI 4708)`;
}

/**
 * Berechnet den MAG-Vordruck (Membran-Ausdehnungsgefäß)
 * Formel: P0 = (h / 10) + 0.3 bar
 * @see VDI 4708
 */
function calcMAG() {
    try {
        const inputs = getMAGInputs();
        const validation = validateMAGInputs(inputs.height);
        if (!validation.valid) {
            showResult('res_mag', validation.error, true);
            return;
        }
        const result = calculateMAGPressure(inputs.height);
        const message = formatMAGResult(result.p0, result.pFill);
        showResult('res_mag', message);
    } catch (error) {
        handleCalculationError('calcMAG', error, 'res_mag');
    }
}

// ========== ROHRINHALT ==========

function getPipeVolInputs() {
    return {
        length: parseFloat(document.getElementById('vol_len').value),
        dn: parseFloat(document.getElementById('vol_dim').value)
    };
}

function validatePipeVolInputs(length, dn) {
    if (isNaN(length) || length <= 0) {
        return { valid: false, error: 'Bitte gültige Länge eingeben' };
    }
    if (length > 10000) {
        return { valid: false, error: 'Warnung: Sehr lange Leitung!' };
    }
    return { valid: true };
}

function getPipeVolumeFactor(dn) {
    const factors = {
        12: 0.13, 15: 0.20, 20: 0.31, 25: 0.53,
        32: 0.85, 40: 1.25, 50: 2.04
    };
    return factors[dn] || null;
}

function calculatePipeVolume(length, dn) {
    const factor = getPipeVolumeFactor(dn);
    if (!factor) {
        return { error: 'Bitte gültigen DN-Wert wählen' };
    }
    return { volume: length * factor, factor, dn };
}

function formatPipeVolResult(volume, factor, dn) {
    return `Rohrinhalt: ${volume.toFixed(2)} Liter\n` +
           `(DN ${dn}: ca. ${factor} l/m)\n\n` +
           `Hinweis: Wichtig für Spülvolumen & Fülldruck`;
}

/**
 * Berechnet den Rohrinhalt einer Leitung
 */
function calcPipeVol() {
    try {
        const inputs = getPipeVolInputs();
        const validation = validatePipeVolInputs(inputs.length, inputs.dn);
        if (!validation.valid) {
            showResult('res_pipevol', validation.error, true);
            return;
        }
        const result = calculatePipeVolume(inputs.length, inputs.dn);
        if (result.error) {
            showResult('res_pipevol', result.error, true);
            return;
        }
        const message = formatPipeVolResult(result.volume, result.factor, result.dn);
        showResult('res_pipevol', message);
    } catch (error) {
        handleCalculationError('calcPipeVol', error, 'res_pipevol');
    }
}


// ========== WASSERHÄRTE ==========

function getHardnessInputs() {
    return {
        value: parseFloat(document.getElementById('hard_val').value),
        mode: document.getElementById('hard_mode').value
    };
}

function validateHardnessInputs(value) {
    if (isNaN(value) || value <= 0) {
        return { valid: false, error: 'Bitte gültigen Wert eingeben' };
    }
    return { valid: true };
}

function calculateHardness(value, mode) {
    const DH_TO_MMOL = 0.1783;
    const MMOL_TO_DH = 5.608;
    return mode === 'dh_to_mmol' ? value * DH_TO_MMOL : value * MMOL_TO_DH;
}

function formatHardnessResult(value, result, mode) {
    if (mode === 'dh_to_mmol') {
        return `${value} °dH = ${result.toFixed(2)} mmol/l`;
    }
    return `${value} mmol/l = ${result.toFixed(1)} °dH`;
}

function calcHardness() {
    try {
        const inputs = getHardnessInputs();
        const validation = validateHardnessInputs(inputs.value);
        if (!validation.valid) {
            showResult('res_hard', validation.error, true);
            return;
        }
        const result = calculateHardness(inputs.value, inputs.mode);
        const message = formatHardnessResult(inputs.value, result, inputs.mode);
        showResult('res_hard', message);
    } catch (error) {
        handleCalculationError('calcHardness', error, 'res_hard');
    }
}

// ========== MISCHWASSER ==========

function getMixWaterInputs() {
    return {
        tHot: parseFloat(document.getElementById('mix_t_hot').value),
        volHot: parseFloat(document.getElementById('mix_vol').value),
        tCold: parseFloat(document.getElementById('mix_t_cold').value)
    };
}

function validateMixWaterInputs(tHot, volHot, tCold) {
    if (isNaN(tHot) || isNaN(volHot)) {
        return { valid: false, error: 'Bitte Temperatur und Volumen eingeben' };
    }
    const tTarget = 38;
    if (tCold >= tTarget) {
        return { valid: false, error: 'Kaltwasser wärmer als Ziel (38°C)!' };
    }
    return { valid: true };
}

function calculateMixWater(tHot, volHot, tCold) {
    const tTarget = 38;
    const vMix = (volHot * (tHot - tCold)) / (tTarget - tCold);
    const factor = (vMix / volHot).toFixed(1);
    return { vMix, factor };
}

function formatMixWaterResult(vMix, factor) {
    return `Ertrag bei 38°C: ca. ${Math.round(vMix)} Liter\n` +
           `(Faktor ${factor}x des Speichervolumens)`;
}

function calcMixWater() {
    try {
        const inputs = getMixWaterInputs();
        const validation = validateMixWaterInputs(inputs.tHot, inputs.volHot, inputs.tCold);
        if (!validation.valid) {
            showResult('res_mix', validation.error, true);
            return;
        }
        const result = calculateMixWater(inputs.tHot, inputs.volHot, inputs.tCold);
        const message = formatMixWaterResult(result.vMix, result.factor);
        showResult('res_mix', message);
    } catch (error) {
        handleCalculationError('calcMixWater', error, 'res_mix');
    }
}

// ========== VERSATZBOGEN 45° ==========

function getOffsetInputs() {
    return {
        offset: parseFloat(document.getElementById('offset_cm').value)
    };
}

function validateOffsetInputs(offset) {
    if (isNaN(offset) || offset <= 0) {
        return { valid: false, error: 'Bitte gültigen Versatz eingeben' };
    }
    return { valid: true };
}

function calculateOffset(offset) {
    const SQRT_2 = 1.4142;
    return offset * SQRT_2;
}

function formatOffsetResult(diag) {
    return `Rohrlänge (Mitte-Mitte): ${diag.toFixed(1)} cm\n` +
           `\n[ACHTUNG] Einstecktiefe der Fittings noch abziehen!`;
}

function calcOffset() {
    try {
        const inputs = getOffsetInputs();
        const validation = validateOffsetInputs(inputs.offset);
        if (!validation.valid) {
            showResult('res_offset', validation.error, true);
            return;
        }
        const result = calculateOffset(inputs.offset);
        const message = formatOffsetResult(result);
        showResult('res_offset', message);
    } catch (error) {
        handleCalculationError('calcOffset', error, 'res_offset');
    }
}

// ========== GEFÄLLE ==========

function getSlopeInputs() {
    return {
        length: parseFloat(document.getElementById('slope_len').value),
        percent: parseFloat(document.getElementById('slope_perc').value)
    };
}

function validateSlopeInputs(length, percent) {
    if (isNaN(length) || length <= 0) {
        return { valid: false, error: 'Bitte gültige Länge eingeben' };
    }
    if (isNaN(percent) || percent <= 0) {
        return { valid: false, error: 'Bitte gültiges Gefälle eingeben' };
    }
    return { valid: true };
}

function calculateSlope(length, percent) {
    const diff = length * percent;
    const mm = diff * 10;
    return { diff, mm };
}

function formatSlopeResult(diff, mm) {
    return `Höhenunterschied: ${diff.toFixed(1)} cm\n` +
           `(${mm} mm am Zollstock)`;
}

function calcSlope() {
    try {
        const inputs = getSlopeInputs();
        const validation = validateSlopeInputs(inputs.length, inputs.percent);
        if (!validation.valid) {
            showResult('res_slope', validation.error, true);
            return;
        }
        const result = calculateSlope(inputs.length, inputs.percent);
        const message = formatSlopeResult(result.diff, result.mm);
        showResult('res_slope', message);
    } catch (error) {
        handleCalculationError('calcSlope', error, 'res_slope');
    }
}

// ========== KERNBOHRUNG ==========

function getCoreDrillInputs() {
    return {
        dn: parseFloat(document.getElementById('kb_dn').value),
        iso: parseFloat(document.getElementById('kb_iso').value)
    };
}

function validateCoreDrillInputs(dn, iso) {
    if (isNaN(dn) || dn <= 0) {
        return { valid: false, error: 'Bitte gültigen DN-Wert wählen' };
    }
    if (isNaN(iso) || iso < 0) {
        return { valid: false, error: 'Bitte Dämmstärke wählen' };
    }
    return { valid: true };
}

function calculateCoreDrill(dn, iso) {
    const CLEARANCE = 30;
    const totalDiameter = dn + (2 * iso);
    const drillHole = totalDiameter + CLEARANCE;
    const recommendation = Math.ceil(drillHole / 10) * 10;
    return { totalDiameter, recommendation };
}

function formatCoreDrillResult(totalDiameter, recommendation) {
    return `Rohr + Dämmung: ${totalDiameter} mm\n` +
           `Empfohlene Kernbohrung: ∅ ${recommendation} mm\n` +
           `(inkl. Montagespielraum)`;
}

function calcCoreDrill() {
    try {
        const inputs = getCoreDrillInputs();
        const validation = validateCoreDrillInputs(inputs.dn, inputs.iso);
        if (!validation.valid) {
            showResult('res_kb', validation.error, true);
            return;
        }
        const result = calculateCoreDrill(inputs.dn, inputs.iso);
        const message = formatCoreDrillResult(result.totalDiameter, result.recommendation);
        showResult('res_kb', message);
    } catch (error) {
        handleCalculationError('calcCoreDrill', error, 'res_kb');
    }
}

// ========== HEIZKÖRPER ==========

function getRadiatorInputs() {
    return {
        factorType: parseFloat(document.getElementById('hk_typ').value),
        height: parseFloat(document.getElementById('hk_height').value),
        length: parseFloat(document.getElementById('hk_len').value)
    };
}

function validateRadiatorInputs(length) {
    if (isNaN(length) || length <= 0) {
        return { valid: false, error: 'Bitte gültige Länge eingeben' };
    }
    return { valid: true };
}

function getHeightCorrection(height) {
    const corrections = {
        0.3: 0.55, 0.4: 0.70, 0.5: 0.85,
        0.6: 1.00, 0.9: 1.45
    };
    return corrections[height] || 1.0;
}

function calculateRadiator(factorType, height, length) {
    const correction = getHeightCorrection(height);
    const power70 = factorType * correction * (length / 1000);
    const powerWP = power70 * 0.5;
    return { power70, powerWP };
}

function formatRadiatorResult(power70, powerWP) {
    return `Leistung (70/55°C): ca. ${Math.round(power70)} Watt\n` +
           `Leistung (55/45°C): ca. ${Math.round(powerWP)} Watt\n` +
           `(Schätzwert für Altbau-Bestand)`;
}

function calcRadiator() {
    try {
        const inputs = getRadiatorInputs();
        const validation = validateRadiatorInputs(inputs.length);
        if (!validation.valid) {
            showResult('res_hk', validation.error, true);
            return;
        }
        const result = calculateRadiator(inputs.factorType, inputs.height, inputs.length);
        const message = formatRadiatorResult(result.power70, result.powerWP);
        showResult('res_hk', message);
    } catch (error) {
        handleCalculationError('calcRadiator', error, 'res_hk');
    }
}

// ========== LIEGENDER TANK ==========

function getTankInputs() {
    return {
        diameter: parseFloat(document.getElementById('tank_d').value),
        length: parseFloat(document.getElementById('tank_l').value),
        fillHeight: parseFloat(document.getElementById('tank_h').value)
    };
}

function validateTankInputs(d, l, h) {
    if (isNaN(d) || isNaN(l) || isNaN(h) || d <= 0 || l <= 0 || h <= 0) {
        return { valid: false, error: 'Bitte alle Werte eingeben' };
    }
    if (h > d) {
        return { valid: false, error: 'Füllhöhe größer als Durchmesser!' };
    }
    return { valid: true };
}

function calculateTankSegmentArea(r, h) {
    if (h === r * 2) {
        return Math.PI * r * r;
    }
    const x = r - h;
    return (r * r * Math.acos(x / r)) - (x * Math.sqrt(r * r - x * x));
}

function calculateTankVolume(d, l, h) {
    const r = d / 2;
    const area = calculateTankSegmentArea(r, h);
    const volLiters = (area * l) / 1000;
    const totalVol = (Math.PI * r * r * l) / 1000;
    const percent = (volLiters / totalVol) * 100;
    return { volLiters, totalVol, percent };
}

function formatTankResult(vol, total, percent) {
    return `Aktueller Inhalt: ${Math.round(vol)} Liter\n` +
           `Füllstand: ${percent.toFixed(1)} %\n` +
           `(Gesamtkapazität: ${Math.round(total)} Liter)`;
}

function calcTank() {
    try {
        const inputs = getTankInputs();
        const validation = validateTankInputs(inputs.diameter, inputs.length, inputs.fillHeight);
        if (!validation.valid) {
            showResult('res_tank', validation.error, true);
            return;
        }
        const result = calculateTankVolume(inputs.diameter, inputs.length, inputs.fillHeight);
        const message = formatTankResult(result.volLiters, result.totalVol, result.percent);
        showResult('res_tank', message);
    } catch (error) {
        handleCalculationError('calcTank', error, 'res_tank');
    }
}

// ========== FLIESSGESCHWINDIGKEIT ==========

function getFlowSpeedInputs() {
    return {
        volume: parseFloat(document.getElementById('flow_vol').value),
        unit: document.getElementById('flow_unit').value,
        dn: parseFloat(document.getElementById('flow_dn').value)
    };
}

function validateFlowSpeedInputs(vol, dn) {
    if (isNaN(vol) || vol <= 0) {
        return { valid: false, error: 'Bitte gültigen Durchfluss eingeben' };
    }
    if (isNaN(dn) || dn <= 0) {
        return { valid: false, error: 'Bitte gültigen DN-Wert wählen' };
    }
    return { valid: true };
}

function convertToM3s(vol, unit) {
    const conversions = {
        'l_h': vol / 1000 / 3600,
        'l_min': vol / 1000 / 60,
        'm3_h': vol / 3600
    };
    return conversions[unit] || 0;
}

function calculateFlowSpeed(vol, unit, dn) {
    const flowM3s = convertToM3s(vol, unit);
    const rM = (dn / 1000) / 2;
    const area = Math.PI * rM * rM;
    return flowM3s / area;
}

function getSpeedWarning(speed, unit) {
    const limits = {
        'l_h': { limit: 1.0, msg: 'Geräuschgefahr Heizung!' },
        'l_min': { limit: 2.0, msg: 'Druckschlag/Korrosion!' },
        'm3_h': { limit: 5.0, msg: 'Luftkanal laut!' }
    };
    const check = limits[unit];
    if (check && speed > check.limit) {
        return { warning: true, msg: `\n[ACHTUNG] > ${check.limit} m/s (${check.msg})` };
    }
    return { warning: false, msg: '' };
}

function formatFlowSpeedResult(speed, warning) {
    return `Geschwindigkeit: ${speed.toFixed(2)} m/s${warning.msg}`;
}

function calcFlowSpeed() {
    try {
        const inputs = getFlowSpeedInputs();
        const validation = validateFlowSpeedInputs(inputs.volume, inputs.dn);
        if (!validation.valid) {
            showResult('res_flow', validation.error, true);
            return;
        }
        const speed = calculateFlowSpeed(inputs.volume, inputs.unit, inputs.dn);
        const warning = getSpeedWarning(speed, inputs.unit);
        const message = formatFlowSpeedResult(speed, warning);
        showResult('res_flow', message, warning.warning);
    } catch (error) {
        handleCalculationError('calcFlowSpeed', error, 'res_flow');
    }
}

// ========== KONDENSAT ==========

function getCondensateInputs() {
    return {
        power: parseFloat(document.getElementById('cond_kw').value),
        factor: parseFloat(document.getElementById('cond_fuel').value),
        hours: parseFloat(document.getElementById('cond_hours').value)
    };
}

function validateCondensateInputs(power, hours) {
    if (isNaN(power) || power <= 0) {
        return { valid: false, error: 'Bitte gültige Leistung eingeben' };
    }
    if (isNaN(hours) || hours <= 0) {
        return { valid: false, error: 'Bitte gültige Betriebszeit eingeben' };
    }
    return { valid: true };
}

function calculateCondensate(power, factor, hours) {
    const perHour = power * factor;
    const perDay = perHour * hours;
    return { perHour, perDay };
}

function formatCondensateResult(perHour, perDay) {
    return `Kondensat: ca. ${perHour.toFixed(2)} Liter/Stunde\n` +
           `Tagesmenge: ca. ${perDay.toFixed(1)} Liter\n` +
           `(Bei Vollbrennwertnutzung)`;
}

function calcCondensate() {
    try {
        const inputs = getCondensateInputs();
        const validation = validateCondensateInputs(inputs.power, inputs.hours);
        if (!validation.valid) {
            showResult('res_cond', validation.error, true);
            return;
        }
        const result = calculateCondensate(inputs.power, inputs.factor, inputs.hours);
        const message = formatCondensateResult(result.perHour, result.perDay);
        showResult('res_cond', message);
    } catch (error) {
        handleCalculationError('calcCondensate', error, 'res_cond');
    }
}


// ========== KV-WERT (HYDRAULISCHER ABGLEICH) ==========

function getKvInputs() {
    return {
        watt: parseFloat(document.getElementById('kv_watt').value),
        dt: parseFloat(document.getElementById('kv_dt').value),
        dpMbar: parseFloat(document.getElementById('kv_dp').value)
    };
}

function validateKvInputs(watt, dt, dpMbar) {
    if (isNaN(watt) || watt <= 0) {
        return { valid: false, error: 'Bitte gültige Leistung eingeben' };
    }
    if (isNaN(dt) || dt <= 0) {
        return { valid: false, error: 'Bitte gültige Spreizung eingeben' };
    }
    if (isNaN(dpMbar) || dpMbar <= 0) {
        return { valid: false, error: 'Bitte gültigen Differenzdruck eingeben' };
    }
    return { valid: true };
}

function calculateKvValue(watt, dt, dpMbar) {
    const qLh = watt / (1.163 * dt);
    const qM3 = qLh / 1000;
    const dpBar = dpMbar / 1000;
    const kv = qM3 / Math.sqrt(dpBar);
    return { qLh, kv };
}

function getValveSetting(kv) {
    if (kv < 0.13) return "1";
    if (kv < 0.28) return "2";
    if (kv < 0.42) return "3";
    if (kv < 0.56) return "4";
    if (kv < 0.70) return "5";
    if (kv < 0.90) return "6";
    return "Offen (7/N)";
}

function updateValveVisual(setting) {
    const visual = document.getElementById('valve_visual');
    if (visual) {
        visual.innerText = setting;
        visual.style.color = "#ff9900";
    }
}

function formatKvResult(qLh, kv, setting) {
    return `Durchfluss: ${Math.round(qLh)} l/h\n` +
           `Errechneter Kv-Wert: ${kv.toFixed(2)}\n` +
           `Empfohlene Stufe: ca. ${setting}`;
}

function calcKvValue() {
    try {
        const inputs = getKvInputs();
        const validation = validateKvInputs(inputs.watt, inputs.dt, inputs.dpMbar);
        if (!validation.valid) {
            showResult('res_kv', validation.error, true);
            return;
        }
        const result = calculateKvValue(inputs.watt, inputs.dt, inputs.dpMbar);
        const setting = getValveSetting(result.kv);
        updateValveVisual(setting);
        const message = formatKvResult(result.qLh, result.kv, setting);
        showResult('res_kv', message);
    } catch (error) {
        handleCalculationError('calcKvValue', error, 'res_kv');
    }
}

// ========== LUFTWECHSEL ==========

function getAirExchangeInputs() {
    return {
        area: parseFloat(document.getElementById('air_qm').value),
        height: parseFloat(document.getElementById('air_h').value),
        typeVal: parseFloat(document.getElementById('air_type').value)
    };
}

function validateAirExchangeInputs(area, height) {
    if (isNaN(area) || area <= 0) {
        return { valid: false, error: 'Bitte gültige Fläche eingeben' };
    }
    if (isNaN(height) || height <= 0) {
        return { valid: false, error: 'Bitte gültige Höhe eingeben' };
    }
    return { valid: true };
}

function calculateAirExchange(area, height, typeVal) {
    const volume = area * height;
    let result, msg;
    if (typeVal > 10) {
        result = typeVal;
        msg = `Pauschal-Forderung (DIN 18017): ~${result} m³/h`;
    } else {
        result = volume * typeVal;
        msg = `Luftwechsel (${typeVal}x / h): ${result.toFixed(1)} m³/h`;
    }
    return { volume, result, msg };
}

function formatAirExchangeResult(volume, result, msg) {
    return `Raumvolumen: ${volume.toFixed(1)} m³\n${msg}\n(Mindestleistung des Lüfters)`;
}

function calcAirExchange() {
    try {
        const inputs = getAirExchangeInputs();
        const validation = validateAirExchangeInputs(inputs.area, inputs.height);
        if (!validation.valid) {
            showResult('res_air', validation.error, true);
            return;
        }
        const result = calculateAirExchange(inputs.area, inputs.height, inputs.typeVal);
        const message = formatAirExchangeResult(result.volume, result.result, result.msg);
        showResult('res_air', message);
    } catch (error) {
        handleCalculationError('calcAirExchange', error, 'res_air');
    }
}


// ========== AUFHEIZZEIT ==========

function getHeatUpTimeInputs() {
    return {
        volume: parseFloat(document.getElementById('heatup_vol').value),
        tStart: parseFloat(document.getElementById('heatup_t1').value),
        tTarget: parseFloat(document.getElementById('heatup_t2').value),
        power: parseFloat(document.getElementById('heatup_kw').value)
    };
}

function validateHeatUpTimeInputs(vol, t1, t2, power) {
    if (isNaN(vol) || vol <= 0) {
        return { valid: false, error: 'Bitte gültiges Volumen eingeben' };
    }
    if (isNaN(power) || power <= 0) {
        return { valid: false, error: 'Bitte gültige Leistung eingeben' };
    }
    if (t1 >= t2) {
        return { valid: false, error: 'Start-Temperatur muss kleiner als Ziel sein' };
    }
    return { valid: true };
}

function calculateHeatUpTime(vol, t1, t2, power) {
    const WATER_HEAT_CAPACITY = 1.163;
    const deltaT = t2 - t1;
    const energyWh = vol * WATER_HEAT_CAPACITY * deltaT;
    const hours = energyWh / (power * 1000);
    const minutes = Math.round(hours * 60);
    const hDisplay = Math.floor(minutes / 60);
    const mDisplay = minutes % 60;
    return { energyWh, minutes, hDisplay, mDisplay };
}

function formatHeatUpTimeResult(energyWh, minutes, hDisplay, mDisplay) {
    return `Benötigte Energie: ${(energyWh / 1000).toFixed(1)} kWh\n` +
           `Dauer: ca. ${minutes} Min\n` +
           `(${hDisplay} Std. ${mDisplay} Min.)`;
}

function calcHeatUpTime() {
    try {
        const inputs = getHeatUpTimeInputs();
        const validation = validateHeatUpTimeInputs(inputs.volume, inputs.tStart, inputs.tTarget, inputs.power);
        if (!validation.valid) {
            showResult('res_heatup', validation.error, true);
            return;
        }
        const result = calculateHeatUpTime(inputs.volume, inputs.tStart, inputs.tTarget, inputs.power);
        const message = formatHeatUpTimeResult(result.energyWh, result.minutes, result.hDisplay, result.mDisplay);
        showResult('res_heatup', message);
    } catch (error) {
        handleCalculationError('calcHeatUpTime', error, 'res_heatup');
    }
}

// ========== ROHRSCHELLEN-ABSTAND ==========

function getClipDistInputs() {
    return {
        material: document.getElementById('clip_mat').value,
        dn: parseInt(document.getElementById('clip_dn').value)
    };
}

function validateClipDistInputs(dn) {
    if (isNaN(dn) || dn <= 0) {
        return { valid: false, error: 'Bitte gültigen DN-Wert wählen' };
    }
    return { valid: true };
}

function getClipDistance(material, dn) {
    const distances = {
        'plastic': [0.80, 1.00, 1.25, 1.50, 1.75, 2.00],
        'cu': [1.25, 1.50, 1.75, 2.00, 2.25, 2.75],
        'steel': [1.50, 2.00, 2.25, 2.75, 3.00, 3.25]
    };
    const thresholds = [15, 20, 28, 35, 42];
    const dists = distances[material] || distances['cu'];
    for (let i = 0; i < thresholds.length; i++) {
        if (dn <= thresholds[i]) return dists[i];
    }
    return dists[dists.length - 1];
}

function formatClipDistResult(dist) {
    return `Max. Abstand: ${dist.toFixed(2)} Meter\n(Empfehlung für waagerechte Montage)`;
}

function calcClipDist() {
    try {
        const inputs = getClipDistInputs();
        const validation = validateClipDistInputs(inputs.dn);
        if (!validation.valid) {
            showResult('res_clip', validation.error, true);
            return;
        }
        const dist = getClipDistance(inputs.material, inputs.dn);
        const message = formatClipDistResult(dist);
        showResult('res_clip', message);
    } catch (error) {
        handleCalculationError('calcClipDist', error, 'res_clip');
    }
}

// ========== REALE LEISTUNG ==========

function getRealPowerInputs() {
    return {
        flow: parseFloat(document.getElementById('real_flow').value),
        tVorlauf: parseFloat(document.getElementById('real_vl').value),
        tRuecklauf: parseFloat(document.getElementById('real_rl').value)
    };
}

function validateRealPowerInputs(flow, vl, rl) {
    if (isNaN(flow) || flow <= 0) {
        return { valid: false, error: 'Bitte gültigen Durchfluss eingeben' };
    }
    if (isNaN(vl) || isNaN(rl)) {
        return { valid: false, error: 'Bitte Temperaturen eingeben' };
    }
    const dt = vl - rl;
    if (dt <= 0) {
        return { valid: false, error: 'Delta T ist 0 oder negativ!' };
    }
    return { valid: true };
}

function calculateRealPower(flow, vl, rl) {
    const WATER_HEAT_CAPACITY = 1.163;
    const dt = vl - rl;
    const watt = flow * WATER_HEAT_CAPACITY * dt;
    const kw = watt / 1000;
    return { dt, watt, kw };
}

function formatRealPowerResult(dt, kw, watt) {
    return `Spreizung: ${dt.toFixed(1)} K\n` +
           `Leistung: ${kw.toFixed(2)} kW\n` +
           `(${Math.round(watt)} Watt)`;
}

function calcRealPower() {
    try {
        const inputs = getRealPowerInputs();
        const validation = validateRealPowerInputs(inputs.flow, inputs.tVorlauf, inputs.tRuecklauf);
        if (!validation.valid) {
            showResult('res_realpower', validation.error, true);
            return;
        }
        const result = calculateRealPower(inputs.flow, inputs.tVorlauf, inputs.tRuecklauf);
        const message = formatRealPowerResult(result.dt, result.kw, result.watt);
        showResult('res_realpower', message);
    } catch (error) {
        handleCalculationError('calcRealPower', error, 'res_realpower');
    }
}

// ========== GASZÄHLER (AUSLITERN) ==========

function getGasPowerInputs() {
    return {
        seconds: parseFloat(document.getElementById('gas_sec').value),
        volume: parseFloat(document.getElementById('gas_vol').value)
    };
}

function validateGasPowerInputs(seconds, volume) {
    if (isNaN(seconds) || seconds <= 0) {
        return { valid: false, error: 'Bitte gültige Zeit eingeben (> 0 Sekunden)' };
    }
    if (seconds < 5) {
        return { valid: false, error: 'Warnung: Messzeit zu kurz - Ergebnis ungenau!' };
    }
    if (seconds > 3600) {
        return { valid: false, error: 'Bitte Messzeit in Sekunden eingeben (max. 3600)' };
    }
    if (isNaN(volume) || volume <= 0) {
        return { valid: false, error: 'Bitte gültige Menge wählen' };
    }
    return { valid: true };
}

function calculateGasPower(seconds, volume) {
    // Heizwert Hi Erdgas H, Faustformel für die Geräteeinstellung
    const GAS_HEATING_VALUE = 10.0; // kWh/m³
    const flowRate = (volume * 3600) / seconds;
    const load = flowRate * GAS_HEATING_VALUE;
    return { flowRate, load, heatingValue: GAS_HEATING_VALUE };
}

function formatGasPowerResult(flowRate, load, heatingValue) {
    return `Durchsatz: ${flowRate.toFixed(2)} m³/h\n` +
           `Feuerungsleistung: ca. ${load.toFixed(1)} kW\n` +
           `(bei Hi = ${heatingValue} kWh/m³)`;
}

/**
 * Ermittelt die Feuerungsleistung durch Auslitern am Gaszähler
 *
 * Formel: P = (V / t) × 3600 × Hi
 * - V: gezähltes Volumen in m³
 * - t: gestoppte Zeit in Sekunden
 * - Hi: Heizwert in kWh/m³
 */
function calcGasPower() {
    try {
        const inputs = getGasPowerInputs();
        const validation = validateGasPowerInputs(inputs.seconds, inputs.volume);
        if (!validation.valid) {
            showResult('res_gas', validation.error, true);
            return;
        }
        const result = calculateGasPower(inputs.seconds, inputs.volume);
        const message = formatGasPowerResult(result.flowRate, result.load, result.heatingValue);
        showResult('res_gas', message);
    } catch (error) {
        handleCalculationError('calcGasPower', error, 'res_gas');
    }
}
