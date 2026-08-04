import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadCalculators, runCalculatorWith } from '../helpers/load-app.js';

const app = loadCalculators();
const nahe = (ist, soll, toleranz = 1e-9) => assert.ok(
    Math.abs(ist - soll) < toleranz,
    `${ist} weicht von ${soll} ab`
);

describe('Wasserhaerte', () => {
    test('Grad dH nach mmol/l', () => {
        const result = app.calculateHardness({ value: 14, mode: 'dh_to_mmol' });
        nahe(result.converted, 2.4962, 1e-9);
        assert.equal(result.toMmol, true);
    });

    test('mmol/l nach Grad dH', () => {
        const result = app.calculateHardness({ value: 2.5, mode: 'mmol_to_dh' });
        nahe(result.converted, 14.02, 1e-9);
        assert.equal(result.toMmol, false);
    });

    test('Hin- und Rueckrechnung trifft sich wieder', () => {
        const hin = app.calculateHardness({ value: 14, mode: 'dh_to_mmol' }).converted;
        const zurueck = app.calculateHardness({ value: hin, mode: 'mmol_to_dh' }).converted;
        nahe(zurueck, 14, 0.01);
    });

    test('Wert 0 wird abgewiesen', () => {
        assert.equal(app.validateHardnessInputs({ value: 0 }).valid, false);
    });
});

describe('Mischwasser', () => {
    test('Ertrag bei 38 Grad Zieltemperatur', () => {
        // 200 l bei 60 Grad, 10 Grad kalt: 200 * 50 / 28 = 357,14 l
        const result = app.calculateMixWater({ hotTemp: 60, hotVolume: 200, coldTemp: 10 });
        nahe(result.mixedVolume, 357.142857142857, 1e-9);
        assert.equal(result.factor, '1.8');
    });

    test('Speichertemperatur gleich Ziel ergibt Faktor 1', () => {
        const result = app.calculateMixWater({ hotTemp: 38, hotVolume: 200, coldTemp: 10 });
        nahe(result.mixedVolume, 200, 1e-9);
    });

    test('Kaltwasser waermer als 38 Grad wird abgewiesen', () => {
        assert.equal(
            app.validateMixWaterInputs({ hotTemp: 60, hotVolume: 200, coldTemp: 40 }).valid,
            false
        );
    });
});

describe('Aufheizzeit', () => {
    test('t = V x c x dT / P', () => {
        // 300 l von 10 auf 60 Grad mit 24 kW: 17445 Wh -> 43,6 min
        const result = app.calculateHeatUpTime({ volume: 300, startTemp: 10, targetTemp: 60, power: 24 });
        nahe(result.energyWh, 17445, 1e-9);
        assert.equal(result.minutes, 44);
        assert.equal(result.hours, 0);
        assert.equal(result.restMinutes, 44);
    });

    test('teilt lange Dauern in Stunden und Minuten', () => {
        const result = app.calculateHeatUpTime({ volume: 300, startTemp: 10, targetTemp: 60, power: 6 });
        assert.equal(result.minutes, 174);
        assert.equal(result.hours, 2);
        assert.equal(result.restMinutes, 54);
    });

    test('Zieltemperatur unter Starttemperatur wird abgewiesen', () => {
        assert.equal(
            app.validateHeatUpTimeInputs({ volume: 300, startTemp: 60, targetTemp: 10, power: 24 }).valid,
            false
        );
    });
});

describe('Zirkulation (DVGW W 551)', () => {
    test('unter 3 Liter ist keine Zirkulation noetig', () => {
        const result = app.calculateCirculationVolume({ length: 10, litersPerMeter: 0.2 });
        assert.equal(result.volume, 2);
        assert.equal(result.isCritical, false);
    });

    test('ueber 3 Liter wird die Zirkulation zur Pflicht', () => {
        const result = app.calculateCirculationVolume({ length: 20, litersPerMeter: 0.2 });
        assert.equal(result.volume, 4);
        assert.equal(result.isCritical, true);
    });

    test('genau 3 Liter gilt noch als unkritisch', () => {
        assert.equal(app.calculateCirculationVolume({ length: 15, litersPerMeter: 0.2 }).isCritical, false);
    });

    test('kritisches Ergebnis wird als Warnung angezeigt', () => {
        const result = runCalculatorWith('calcZirkulation', { zirk_m: '20', zirk_dn: '0.2' });
        assert.equal(result.elementId, 'res_zirk');
        assert.equal(result.isError, true, 'kritischer Inhalt muss hervorgehoben werden');
        assert.match(result.text, /PFLICHT/);
    });

    test('unkritisches Ergebnis wird normal angezeigt', () => {
        const result = runCalculatorWith('calcZirkulation', { zirk_m: '10', zirk_dn: '0.2' });
        assert.equal(result.isError, false);
    });
});
