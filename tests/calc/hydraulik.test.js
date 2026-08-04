import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadCalculators, runCalculatorWith } from '../helpers/load-app.js';

const app = loadCalculators();
const nahe = (ist, soll, toleranz = 1e-9) => assert.ok(
    Math.abs(ist - soll) < toleranz,
    `${ist} weicht von ${soll} ab`
);

describe('Volumenstrom', () => {
    test('V = Q / (c x dT)', () => {
        // 15 kW bei 20 K: 15000 / (1,163 * 20) = 644,88 -> 645 l/h
        assert.equal(app.calculateVolumeFlow({ power: 15, spread: 20 }).litersPerHour, 645);
    });

    test('halbe Spreizung verdoppelt den Volumenstrom', () => {
        const bei20 = app.calculateVolumeFlow({ power: 15, spread: 20 }).litersPerHour;
        const bei10 = app.calculateVolumeFlow({ power: 15, spread: 10 }).litersPerHour;
        nahe(bei10 / bei20, 2, 0.01);
    });

    test('warnt unter 5 K Spreizung', () => {
        assert.equal(app.validateVolumenstromInputs({ power: 15, spread: 3 }).valid, false);
        assert.equal(app.validateVolumenstromInputs({ power: 15, spread: 5 }).valid, true);
    });
});

describe('Kv-Wert', () => {
    test('Kv = V / Wurzel(dp)', () => {
        // 1000 W bei 15 K -> 57,32 l/h; 100 mbar = 0,1 bar
        const result = app.calculateKv({ watt: 1000, spread: 15, pressureDropMbar: 100 });
        nahe(result.litersPerHour, 57.3229, 1e-3);
        nahe(result.kv, 0.18127, 1e-4);
    });

    test('Ventilstufen decken den Bereich lueckenlos ab', () => {
        assert.equal(app.getValveSetting(0.10), '1');
        assert.equal(app.getValveSetting(0.13), '2');
        assert.equal(app.getValveSetting(0.27), '2');
        assert.equal(app.getValveSetting(0.50), '4');
        assert.equal(app.getValveSetting(0.89), '6');
        assert.equal(app.getValveSetting(0.90), 'Offen (7/N)');
        assert.equal(app.getValveSetting(5), 'Offen (7/N)');
    });

    test('Berechnung liefert die Stufe gleich mit', () => {
        const result = app.calculateValveSetting({ watt: 1000, spread: 15, pressureDropMbar: 100 });
        assert.equal(result.setting, '2');
        assert.ok('kv' in result && 'litersPerHour' in result);
    });

    test('Differenzdruck 0 wird abgewiesen', () => {
        assert.equal(
            app.validateKvInputs({ watt: 1000, spread: 15, pressureDropMbar: 0 }).valid,
            false
        );
    });

    test('schreibt die Stufe in die Ventilanzeige', () => {
        const werte = { kv_watt: '1000', kv_dt: '15', kv_dp: '100' };
        const geladen = loadCalculators(werte);
        geladen.calcKvValue();
        assert.equal(geladen.document.getElementById('valve_visual').innerText, '2');
    });

    test('zeigt das Ergebnis im richtigen Feld', () => {
        const result = runCalculatorWith('calcKvValue', { kv_watt: '1000', kv_dt: '15', kv_dp: '100' });
        assert.equal(result.elementId, 'res_kv');
        assert.equal(result.isError, false);
    });
});
