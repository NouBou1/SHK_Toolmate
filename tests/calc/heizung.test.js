import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadCalculators, runCalculatorWith } from '../helpers/load-app.js';

const app = loadCalculators();

describe('Heizlast', () => {
    test('P = A x q', () => {
        assert.deepEqual(
            app.calculateHeatLoad({ area: 20, wattPerSquareMeter: 120 }),
            { watt: 2400, kw: '2.40' }
        );
    });

    test('rundet auf volle Watt', () => {
        assert.equal(app.calculateHeatLoad({ area: 12.5, wattPerSquareMeter: 50 }).watt, 625);
    });

    test('weist Flaeche <= 0 zurueck', () => {
        const check = app.validateHeizlastInputs({ area: 0, wattPerSquareMeter: 120 });
        assert.equal(check.valid, false);
    });

    test('warnt ab 10000 m2', () => {
        assert.equal(app.validateHeizlastInputs({ area: 20000, wattPerSquareMeter: 80 }).valid, false);
        assert.equal(app.validateHeizlastInputs({ area: 10000, wattPerSquareMeter: 80 }).valid, true);
    });

    test('zeigt das Ergebnis im richtigen Feld', () => {
        const result = runCalculatorWith('calcHeizlast', { hl_flaeche: '20', hl_typ: '120' });
        assert.equal(result.elementId, 'res_heizlast');
        assert.equal(result.isError, false);
        assert.match(result.text, /2\.400 Watt \(2\.40 kW\)/);
    });
});

describe('Heizkoerper-Leistung', () => {
    test('Bauhoehe 600 mm ist der Bezugswert (Korrektur 1,0)', () => {
        assert.deepEqual(
            app.calculateRadiatorPower({ wattPerMeter: 1500, height: 0.6, lengthMm: 1000 }),
            { powerAt70: 1500, powerAt55: 750 }
        );
    });

    test('Bauhoehe 300 mm korrigiert auf 55 Prozent', () => {
        const result = app.calculateRadiatorPower({ wattPerMeter: 1000, height: 0.3, lengthMm: 1000 });
        assert.equal(result.powerAt70, 550);
    });

    test('unbekannte Bauhoehe faellt auf Faktor 1,0 zurueck', () => {
        assert.equal(app.getRadiatorHeightCorrection(0.75), 1.0);
    });
});

describe('Reale Leistung', () => {
    test('P = V x c x dT', () => {
        const result = app.calculateRealPower({ flowRate: 800, flowTemp: 70, returnTemp: 50 });
        assert.equal(result.spread, 20);
        assert.equal(Math.round(result.watt), 18608);
        assert.ok(Math.abs(result.kw - 18.608) < 1e-9);
    });

    test('weist Spreizung <= 0 zurueck', () => {
        assert.equal(
            app.validateRealPowerInputs({ flowRate: 800, flowTemp: 50, returnTemp: 70 }).valid,
            false
        );
        assert.equal(
            app.validateRealPowerInputs({ flowRate: 800, flowTemp: 50, returnTemp: 50 }).valid,
            false
        );
    });
});

describe('Kondensat', () => {
    test('Menge pro Stunde und Tag', () => {
        const result = app.calculateCondensate({ power: 20, litersPerKw: 0.14, hours: 8 });
        assert.ok(Math.abs(result.perHour - 2.8) < 1e-9);
        assert.ok(Math.abs(result.perDay - 22.4) < 1e-9);
    });
});

describe('Gaszaehler (auslitern)', () => {
    test('0,01 m3 in 30 s ergeben 12 kW', () => {
        const result = app.calculateGasPower({ volume: 0.01, seconds: 30 });
        assert.ok(Math.abs(result.flowRate - 1.2) < 1e-9);
        assert.ok(Math.abs(result.load - 12) < 1e-9);
        assert.equal(result.heatingValue, 10.0);
    });

    test('1 m3 in 60 s ergeben 600 kW', () => {
        assert.ok(Math.abs(app.calculateGasPower({ volume: 1.0, seconds: 60 }).load - 600) < 1e-9);
    });

    test('Messzeit unter 5 s gilt als zu ungenau', () => {
        const check = app.validateGasPowerInputs({ seconds: 2, volume: 0.01 });
        assert.equal(check.valid, false);
        assert.match(check.error, /zu kurz/);
    });

    test('Messzeit ueber 3600 s deutet auf Minuten statt Sekunden hin', () => {
        assert.equal(app.validateGasPowerInputs({ seconds: 5000, volume: 0.01 }).valid, false);
    });

    test('gueltige Messung wird angenommen', () => {
        assert.equal(app.validateGasPowerInputs({ seconds: 30, volume: 0.01 }).valid, true);
    });

    test('Fehlermeldung landet im Ergebnisfeld', () => {
        const result = runCalculatorWith('calcGasPower', { gas_sec: '2', gas_vol: '0.01' });
        assert.equal(result.elementId, 'res_gas');
        assert.equal(result.isError, true);
    });
});
