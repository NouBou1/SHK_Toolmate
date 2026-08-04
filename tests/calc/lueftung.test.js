import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadCalculators } from '../helpers/load-app.js';

const app = loadCalculators();
const nahe = (ist, soll, toleranz = 1e-9) => assert.ok(
    Math.abs(ist - soll) < toleranz,
    `${ist} weicht von ${soll} ab`
);

describe('Luftwechsel', () => {
    test('Luftwechselrate mal Raumvolumen', () => {
        const result = app.calculateAirExchange({ area: 12, height: 2.5, rate: 2.0 });
        nahe(result.volume, 30, 1e-9);
        nahe(result.airFlow, 60, 1e-9);
        assert.equal(result.isFlatRate, false);
    });

    test('Werte ueber 10 gelten als Pauschalforderung in m3/h', () => {
        const result = app.calculateAirExchange({ area: 12, height: 2.5, rate: 60 });
        assert.equal(result.isFlatRate, true);
        assert.equal(result.airFlow, 60, 'Pauschalwert haengt nicht am Raumvolumen');
    });

    test('Grenze liegt bei 10', () => {
        assert.equal(app.calculateAirExchange({ area: 12, height: 2.5, rate: 10 }).isFlatRate, false);
        assert.equal(app.calculateAirExchange({ area: 12, height: 2.5, rate: 11 }).isFlatRate, true);
    });

    test('Text nennt bei Pauschalforderung die Norm', () => {
        const result = app.calculateAirExchange({ area: 12, height: 2.5, rate: 60 });
        assert.match(app.formatAirFlowLine(result), /DIN 18017/);
    });

    test('Text nennt bei Luftwechselrate den Faktor', () => {
        const result = app.calculateAirExchange({ area: 12, height: 2.5, rate: 2 });
        assert.match(app.formatAirFlowLine(result), /2x \/ h/);
    });

    test('Flaeche und Hoehe muessen groesser 0 sein', () => {
        assert.equal(app.validateAirExchangeInputs({ area: 0, height: 2.5 }).valid, false);
        assert.equal(app.validateAirExchangeInputs({ area: 12, height: 0 }).valid, false);
        assert.equal(app.validateAirExchangeInputs({ area: 12, height: 2.5 }).valid, true);
    });
});
