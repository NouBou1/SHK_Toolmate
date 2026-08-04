import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadCalculators } from '../helpers/load-app.js';

const app = loadCalculators();
const nahe = (ist, soll, toleranz = 1e-9) => assert.ok(
    Math.abs(ist - soll) < toleranz,
    `${ist} weicht von ${soll} ab`
);

describe('MAG-Vordruck', () => {
    test('P0 = h / 10 + 0,3 bar', () => {
        const result = app.calculateMagPressure({ staticHeight: 7 });
        nahe(result.preCharge, 1.0, 1e-9);
        nahe(result.fillPressure, 1.3, 1e-9);
    });

    test('20 m ergeben 2,3 bar Vordruck', () => {
        const result = app.calculateMagPressure({ staticHeight: 20 });
        nahe(result.preCharge, 2.3, 1e-9);
        nahe(result.fillPressure, 2.6, 1e-9);
    });

    test('rundet den Vordruck auf eine Nachkommastelle', () => {
        const result = app.calculateMagPressure({ staticHeight: 7.77 });
        nahe(result.preCharge, 1.1, 1e-9);
    });

    test('Hoehe 0 und ueber 200 m werden abgewiesen', () => {
        assert.equal(app.validateMagInputs({ staticHeight: 0 }).valid, false);
        assert.equal(app.validateMagInputs({ staticHeight: 250 }).valid, false);
        assert.equal(app.validateMagInputs({ staticHeight: 200 }).valid, true);
    });
});

describe('Liegender Tank', () => {
    test('halb gefuellt sind es 50 Prozent', () => {
        const result = app.calculateTankVolume({ diameter: 150, length: 300, fillHeight: 75 });
        nahe(result.percent, 50, 1e-9);
        nahe(result.liters, result.capacity / 2, 1e-9);
    });

    test('voll gefuellt sind es 100 Prozent', () => {
        const result = app.calculateTankVolume({ diameter: 150, length: 300, fillHeight: 150 });
        nahe(result.percent, 100, 1e-9);
        // Zylindervolumen: pi * r^2 * l / 1000
        nahe(result.liters, (Math.PI * 75 * 75 * 300) / 1000, 1e-6);
    });

    test('Kreissegment: Vollkreis bei voller Fuellhoehe', () => {
        nahe(app.calculateSegmentArea(75, 150), Math.PI * 75 * 75, 1e-9);
    });

    test('Kreissegment: Halbkreis bei halber Fuellhoehe', () => {
        nahe(app.calculateSegmentArea(75, 75), (Math.PI * 75 * 75) / 2, 1e-9);
    });

    test('Fuellhoehe groesser als Durchmesser wird abgewiesen', () => {
        const check = app.validateTankInputs({ diameter: 150, length: 300, fillHeight: 200 });
        assert.equal(check.valid, false);
        assert.match(check.error, /Füllhöhe/);
    });

    test('fehlende Werte werden abgewiesen', () => {
        assert.equal(app.validateTankInputs({ diameter: 150, length: NaN, fillHeight: 75 }).valid, false);
        assert.equal(app.validateTankInputs({ diameter: 0, length: 300, fillHeight: 75 }).valid, false);
    });
});
