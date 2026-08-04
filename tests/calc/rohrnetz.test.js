import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadCalculators, runCalculatorWith } from '../helpers/load-app.js';

const app = loadCalculators();
const nahe = (ist, soll, toleranz = 1e-9) => assert.ok(
    Math.abs(ist - soll) < toleranz,
    `${ist} weicht von ${soll} ab`
);

describe('Rohrinhalt', () => {
    test('Laenge mal Liter pro Meter', () => {
        const result = app.calculatePipeVolume({ length: 25, dn: 15 });
        assert.equal(result.litersPerMeter, 0.20);
        nahe(result.volume, 5, 1e-9);
        assert.equal(result.dn, 15);
    });

    test('DN 50 fasst gut zehnmal so viel wie DN 12', () => {
        const gross = app.calculatePipeVolume({ length: 1, dn: 50 }).volume;
        const klein = app.calculatePipeVolume({ length: 1, dn: 12 }).volume;
        nahe(gross / klein, 2.04 / 0.13, 1e-9);
    });

    test('unbekannte Nennweite hat keinen Faktor', () => {
        assert.equal(app.getPipeVolumeFactor(99), null);
    });

    test('unbekannte Nennweite wird in der Pruefung abgefangen', () => {
        const check = app.validatePipeVolumeInputs({ length: 25, dn: 99 });
        assert.equal(check.valid, false);
        assert.match(check.error, /DN-Wert/);
    });

    test('Laenge ueber 10000 m wird abgewiesen', () => {
        assert.equal(app.validatePipeVolumeInputs({ length: 20000, dn: 15 }).valid, false);
    });
});

describe('Fliessgeschwindigkeit', () => {
    test('v = V / A', () => {
        // 1000 l/h durch DN 20: 0,000278 m3/s / 0,000314 m2 = 0,884 m/s
        nahe(app.calculateFlowSpeed(1000, 'l_h', 20), 0.8841941282883075, 1e-9);
    });

    test('Einheiten werden korrekt in m3/s umgerechnet', () => {
        nahe(app.convertToCubicMetersPerSecond(3600, 'l_h'), 0.001, 1e-12);
        nahe(app.convertToCubicMetersPerSecond(60, 'l_min'), 0.001, 1e-12);
        nahe(app.convertToCubicMetersPerSecond(3.6, 'm3_h'), 0.001, 1e-12);
    });

    test('unbekannte Einheit ergibt 0', () => {
        assert.equal(app.convertToCubicMetersPerSecond(100, 'unbekannt'), 0);
    });

    test('Grenzwerte je Medium', () => {
        assert.equal(app.getSpeedWarning(0.8, 'l_h').isCritical, false);
        assert.equal(app.getSpeedWarning(1.5, 'l_h').isCritical, true);
        assert.equal(app.getSpeedWarning(1.5, 'l_min').isCritical, false);
        assert.equal(app.getSpeedWarning(2.5, 'l_min').isCritical, true);
        assert.equal(app.getSpeedWarning(6, 'm3_h').isCritical, true);
    });

    test('Warnhinweis nennt Grenzwert und Grund', () => {
        const warnung = app.getSpeedWarning(1.5, 'l_h');
        assert.match(warnung.note, /1 m\/s/);
        assert.match(warnung.note, /Geräusch/);
    });

    test('unkritische Geschwindigkeit haengt keinen Hinweis an', () => {
        assert.equal(app.getSpeedWarning(0.8, 'l_h').note, '');
    });

    test('kritische Geschwindigkeit wird als Warnung angezeigt', () => {
        const result = runCalculatorWith('calcFlowSpeed', {
            flow_vol: '5000', flow_unit: 'l_h', flow_dn: '15'
        });
        assert.equal(result.elementId, 'res_flow');
        assert.equal(result.isError, true);
    });
});
