// ==========================================
// SHK-ToolMate - Rechner: Gemeinsamer Ablauf
// ==========================================
// Jeder Rechner besteht aus vier Schritten mit je einer Aufgabe:
//
//   readInputs  DOM      -> Eingabewerte
//   validate    Eingaben -> { valid, error }
//   calculate   Eingaben -> Ergebnisobjekt
//   format      Ergebnis -> Anzeigetext
//
// runCalculator() verbindet diese Schritte. Dadurch steht die
// Ablaufsteuerung genau einmal im Projekt statt in jedem Rechner.
//
// Optional:
//   warn        Ergebnis -> true, wenn das Feld als Warnung erscheint
//   update      Ergebnis -> zusaetzliche DOM-Ausgabe neben dem Ergebnisfeld
// ==========================================

import { showResult } from '../core/utils.js';

export function handleCalculationError(calculatorName, error, resultId) {
    console.error(`Fehler in ${calculatorName}:`, error);
    showResult(resultId, 'Fehler bei der Berechnung', true);
}

export function isWarningResult(calculator, result) {
    return calculator.warn ? calculator.warn(result) === true : false;
}

export function renderCalculatorResult(calculator, result) {
    if (calculator.update) {
        calculator.update(result);
    }
    const text = calculator.format(result);
    showResult(calculator.resultId, text, isWarningResult(calculator, result));
}

/**
 * Fuehrt einen Rechner aus: Eingaben lesen, pruefen, rechnen, anzeigen.
 * @param {Object} calculator - Rechner-Definition (siehe Dateikopf)
 */
export function runCalculator(calculator) {
    try {
        const inputs = calculator.readInputs();
        const check = calculator.validate(inputs);
        if (!check.valid) {
            showResult(calculator.resultId, check.error, true);
            return;
        }
        renderCalculatorResult(calculator, calculator.calculate(inputs));
    } catch (error) {
        handleCalculationError(calculator.name, error, calculator.resultId);
    }
}
