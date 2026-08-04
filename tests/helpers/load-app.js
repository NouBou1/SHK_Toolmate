// Ladehilfe für die Tests
//
// Die Rechner werden als ES-Module importiert - genau so, wie der Browser
// sie lädt. Nur das DOM fehlt in Node, deshalb stellt diese Datei ein
// Minimal-DOM bereit und liest daraus zurück, was showResult() angezeigt hat.
//
// Diese Datei ist die EINZIGE Stelle, die vom Ladeverfahren weiß.
// Die Testdateien selbst kennen nur `loadCalculators()`.

import * as common from '../../js/calc/common.js';
import * as heizung from '../../js/calc/heizung.js';
import * as hydraulik from '../../js/calc/hydraulik.js';
import * as behaelter from '../../js/calc/behaelter.js';
import * as wasser from '../../js/calc/wasser.js';
import * as rohrnetz from '../../js/calc/rohrnetz.js';
import * as lueftung from '../../js/calc/lueftung.js';
import * as montage from '../../js/calc/montage.js';

const API = {
    ...common, ...heizung, ...hydraulik, ...behaelter,
    ...wasser, ...rohrnetz, ...lueftung, ...montage
};

const FEHLER_PREFIX = '<strong>[FEHLER]</strong><br>';

/**
 * Liest aus dem geschriebenen HTML zurück, was angezeigt wurde.
 * showResult() legt den Text bei Erfolg in data-result-text ab und
 * stellt ihm im Fehlerfall eine Kennzeichnung voran.
 */
function leseErgebnis(element, html) {
    if (html.startsWith(FEHLER_PREFIX)) {
        return { text: html.slice(FEHLER_PREFIX.length).replaceAll('<br>', '\n'), isError: true };
    }
    return { text: element.getAttribute('data-result-text'), isError: false };
}

function createAttributeStore() {
    return {
        attributes: {},
        setAttribute(name, wert) {
            this.attributes[name] = wert;
        },
        getAttribute(name) {
            return Object.hasOwn(this.attributes, name) ? this.attributes[name] : null;
        }
    };
}

function createElementBase() {
    return {
        ...createAttributeStore(),
        innerText: '',
        textContent: '',
        offsetWidth: 0,
        style: {},
        classList: { add() {}, remove() {}, toggle() {}, contains: () => false }
    };
}

function createElement(id, value, results) {
    let html = '';
    return {
        ...createElementBase(),
        value,
        get innerHTML() {
            return html;
        },
        set innerHTML(neu) {
            html = neu;
            results.push({ elementId: id, ...leseErgebnis(this, neu) });
        }
    };
}

/**
 * Minimal-DOM: liefert für jede ID ein Element mit dem hinterlegten Wert.
 * Nicht belegte Felder verhalten sich wie ein leeres Eingabefeld.
 */
function createFakeDocument(values, results) {
    const elements = new Map();
    return {
        getElementById(id) {
            if (!elements.has(id)) {
                const wert = Object.hasOwn(values, id) ? String(values[id]) : '';
                elements.set(id, createElement(id, wert, results));
            }
            return elements.get(id);
        }
    };
}

/**
 * Stellt ein frisches DOM bereit und gibt alle Rechner-Funktionen zurück.
 *
 * @param {Object} [values] Werte der Eingabefelder, nach Element-ID
 * @returns {Object} alle Funktionen der Rechner sowie `results`:
 *                   die Ausgaben von showResult() in Reihenfolge
 */
export function loadCalculators(values = {}) {
    const results = [];
    const fakeDocument = createFakeDocument(values, results);
    globalThis.document = fakeDocument;

    return { ...API, results, document: fakeDocument };
}

/**
 * Kurzform: einen Rechner mit Eingabewerten ausführen und das
 * angezeigte Ergebnis zurückgeben.
 */
export function runCalculatorWith(calculatorName, values) {
    const app = loadCalculators(values);
    app[calculatorName]();
    return app.results.at(-1);
}
