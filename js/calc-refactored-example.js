// ==========================================
// BEISPIEL: Clean Code Refactoring
// ==========================================
// Max 14 Zeilen pro Funktion
// 1 Aufgabe pro Funktion (Single Responsibility)
//
// Vorher: 1 große Funktion mit 40+ Zeilen
// Nachher: Mehrere kleine Funktionen mit je 1 Aufgabe
// ==========================================

// ========== ALTE VERSION (NICHT CLEAN) ==========
/*
function calcHeizlast() {
    try {
        const qm = parseFloat(document.getElementById('hl_flaeche').value);
        const factor = parseFloat(document.getElementById('hl_typ').value);

        // Validierung
        if (isNaN(qm) || qm <= 0) {
            showResult('res_heizlast', 'Bitte gültige Fläche eingeben (> 0)', true);
            return;
        }
        if (qm > 10000) {
            showResult('res_heizlast', 'Warnung: Sehr große Fläche! Bitte prüfen.', true);
            return;
        }
        if (isNaN(factor) || factor <= 0) {
            showResult('res_heizlast', 'Bitte gültigen Gebäudetyp wählen', true);
            return;
        }

        // Berechnung
        const watt = Math.round(qm * factor);
        const kw = (watt / 1000).toFixed(2);

        // Ausgabe
        showResult('res_heizlast', 
            `Bedarf: ca. ${watt.toLocaleString('de-DE')} Watt (${kw} kW)\n` +
            `\n💡 Hinweis: Dies ist ein Überschlägswert nach DIN EN 12831`
        );
    } catch (error) {
        console.error('Error in calcHeizlast:', error);
        showResult('res_heizlast', 'Fehler bei der Berechnung', true);
    }
}
*/

// ========== NEUE VERSION (CLEAN CODE) ==========

// --- 1. INPUT HOLEN (1 Aufgabe: Werte aus DOM holen) ---
function getHeizlastInputs() {
    return {
        area: parseFloat(document.getElementById('hl_flaeche').value),
        factor: parseFloat(document.getElementById('hl_typ').value)
    };
}

// --- 2. VALIDIERUNG (1 Aufgabe: Prüfen) ---
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

// --- 3. BERECHNUNG (1 Aufgabe: Heizlast berechnen) ---
function calculateHeatLoad(area, factor) {
    const watt = Math.round(area * factor);
    const kw = (watt / 1000).toFixed(2);
    return { watt, kw };
}

// --- 4. FORMATIERUNG (1 Aufgabe: Ausgabe formatieren) ---
function formatHeizlastResult(watt, kw) {
    return `Bedarf: ca. ${watt.toLocaleString('de-DE')} Watt (${kw} kW)\n` +
           `\n💡 Hinweis: Dies ist ein Überschlägswert nach DIN EN 12831`;
}

// --- 5. ORCHESTRATOR (1 Aufgabe: Ablauf koordinieren) ---
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

// --- GENERISCHE ERROR HANDLER (1 Aufgabe: Fehler behandeln) ---
function handleCalculationError(functionName, error, resultId) {
    console.error(`Error in ${functionName}:`, error);
    showResult(resultId, 'Fehler bei der Berechnung', true);
}

// ========== VORTEILE ==========
/*
✅ Jede Funktion hat max 10-12 Zeilen (statt 40+)
✅ Jede Funktion hat EINE klare Aufgabe
✅ Funktionen sind testbar (Unit Tests möglich)
✅ Funktionen sind wiederverwendbar
✅ Code ist lesbarer (selbstdokumentierend)
✅ Änderungen sind einfacher (nur 1 Funktion ändern)
✅ Bugs sind einfacher zu finden

Beispiel Wiederverwendung:
- validateHeizlastInputs() kann für Tests genutzt werden
- calculateHeatLoad() ist pure function (keine Seiteneffekte)
- formatHeizlastResult() kann für Export genutzt werden
- handleCalculationError() ist für alle Rechner nutzbar
*/

// ========== WEITERE BEISPIELE ==========

// --- VOLUMENSTROM (Clean Version) ---

function getVolumenstromInputs() {
    return {
        power: parseFloat(document.getElementById('vs_kw').value),
        delta: parseFloat(document.getElementById('vs_dt').value)
    };
}

function validateVolumenstromInputs(power, delta) {
    if (isNaN(power) || power <= 0) {
        return { valid: false, error: 'Bitte gültige Leistung eingeben (> 0 kW)' };
    }
    if (isNaN(delta) || delta <= 0) {
        return { valid: false, error: 'Bitte gültige Spreizung eingeben (> 0 K)' };
    }
    if (delta < 5) {
        return { valid: false, error: 'Warnung: Sehr geringe Spreizung (< 5K)!' };
    }
    return { valid: true };
}

function calculateFlowRate(power, delta) {
    const WATER_HEAT_CAPACITY = 1.163;
    const flowRate = (power * 1000) / (WATER_HEAT_CAPACITY * delta);
    return Math.round(flowRate);
}

function formatVolumenstromResult(flowRate) {
    return `Volumenstrom: ${flowRate.toLocaleString('de-DE')} l/h\n` +
           `(= ${(flowRate / 1000).toFixed(2)} m³/h)`;
}

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

// ========== PATTERN / TEMPLATE ==========
/*
Für JEDEN Rechner:

1. getXxxInputs()        - Holt Inputs aus DOM
2. validateXxxInputs()   - Validiert Inputs (return {valid, error})
3. calculateXxx()        - Pure Function: Berechnung
4. formatXxxResult()     - Formatiert Ausgabe
5. calcXxx()             - Orchestrator: Koordiniert 1-4

Jede Funktion:
- Max 10-14 Zeilen Code (ohne Kommentare)
- Eine klare Aufgabe
- Keine Seiteneffekte (außer Orchestrator)
- Testbar & Wiederverwendbar
*/
