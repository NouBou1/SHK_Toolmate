import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadCalculators } from '../helpers/load-app.js';

const app = loadCalculators();
const nahe = (ist, soll, toleranz = 1e-9) => assert.ok(
    Math.abs(ist - soll) < toleranz,
    `${ist} weicht von ${soll} ab`
);

describe('Versatzbogen 45 Grad', () => {
    test('Rohrlaenge ist der Versatz mal Wurzel 2', () => {
        nahe(app.calculateOffset({ offset: 30 }).pipeLength, 42.426, 1e-9);
    });

    test('Versatz 0 wird abgewiesen', () => {
        assert.equal(app.validateOffsetInputs({ offset: 0 }).valid, false);
    });
});

describe('Gefaelle', () => {
    test('6 m bei 2 Prozent ergeben 12 cm', () => {
        const result = app.calculateSlope({ length: 6, percent: 2 });
        nahe(result.dropCm, 12, 1e-9);
        nahe(result.dropMm, 120, 1e-9);
    });

    test('Millimeter sind das Zehnfache der Zentimeter', () => {
        const result = app.calculateSlope({ length: 12.5, percent: 1.5 });
        nahe(result.dropMm, result.dropCm * 10, 1e-9);
    });

    test('fehlendes Gefaelle wird abgewiesen', () => {
        assert.equal(app.validateSlopeInputs({ length: 6, percent: NaN }).valid, false);
    });
});

describe('Kernbohrung', () => {
    test('Rohr plus beidseitige Daemmung plus Spielraum', () => {
        // 110 + 2*20 = 150 mm, + 30 mm Spiel = 180, aufgerundet auf 180
        const result = app.calculateCoreDrill({ dn: 110, insulation: 20 });
        assert.equal(result.outerDiameter, 150);
        assert.equal(result.recommendation, 180);
    });

    test('rundet auf volle 10 mm auf', () => {
        // 54 + 0 = 54, + 30 = 84 -> 90
        assert.equal(app.calculateCoreDrill({ dn: 54, insulation: 0 }).recommendation, 90);
    });

    test('Daemmung 0 ist zulaessig, negative nicht', () => {
        assert.equal(app.validateCoreDrillInputs({ dn: 54, insulation: 0 }).valid, true);
        assert.equal(app.validateCoreDrillInputs({ dn: 54, insulation: -5 }).valid, false);
    });
});

describe('Rohrschellen-Abstand', () => {
    test('Kupfer nach Nennweiten-Klasse', () => {
        // Klassen: <=15, <=20, <=28, <=35, <=42, darueber
        assert.equal(app.calculateClipDistance({ material: 'cu', dn: 15 }).distance, 1.25);
        assert.equal(app.calculateClipDistance({ material: 'cu', dn: 22 }).distance, 1.75);
        assert.equal(app.calculateClipDistance({ material: 'cu', dn: 35 }).distance, 2.00);
        assert.equal(app.calculateClipDistance({ material: 'cu', dn: 42 }).distance, 2.25);
    });

    test('Klassengrenze gehoert zur kleineren Klasse', () => {
        assert.equal(app.calculateClipDistance({ material: 'cu', dn: 20 }).distance, 1.50);
        assert.equal(app.calculateClipDistance({ material: 'cu', dn: 21 }).distance, 1.75);
    });

    test('groessere Nennweiten nutzen den letzten Wert', () => {
        assert.equal(app.calculateClipDistance({ material: 'cu', dn: 54 }).distance, 2.75);
        assert.equal(app.calculateClipDistance({ material: 'steel', dn: 100 }).distance, 3.25);
    });

    test('Stahl haelt weiter als Kupfer, Kunststoff am wenigsten', () => {
        const kunststoff = app.calculateClipDistance({ material: 'plastic', dn: 20 }).distance;
        const kupfer = app.calculateClipDistance({ material: 'cu', dn: 20 }).distance;
        const stahl = app.calculateClipDistance({ material: 'steel', dn: 20 }).distance;
        assert.ok(kunststoff < kupfer && kupfer < stahl);
    });

    test('unbekanntes Material faellt auf Kupfer zurueck', () => {
        assert.equal(
            app.calculateClipDistance({ material: 'unbekannt', dn: 22 }).distance,
            app.calculateClipDistance({ material: 'cu', dn: 22 }).distance
        );
    });
});
