// Prüft den gemeinsamen Ablauf aller Rechner (runCalculator).
// Die Rechner-Definition wird hier künstlich gebaut, damit der Ablauf
// unabhängig von einer konkreten Formel getestet werden kann.

import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { loadCalculators } from '../helpers/load-app.js';

function baueSchritte(protokoll) {
    const merke = (name, ergebnis) => (...args) => {
        protokoll.push(name);
        return ergebnis(...args);
    };
    return {
        readInputs: merke('readInputs', () => ({ wert: 2 })),
        validate: merke('validate', () => ({ valid: true })),
        calculate: merke('calculate', inputs => ({ ergebnis: inputs.wert * 3 })),
        format: merke('format', result => `Ergebnis: ${result.ergebnis}`)
    };
}

function baueRechner(app, ueberschreibungen = {}) {
    const protokoll = [];
    const rechner = {
        name: 'testRechner',
        resultId: 'res_test',
        ...baueSchritte(protokoll),
        ...ueberschreibungen
    };
    return { rechner, protokoll, run: () => app.runCalculator(rechner) };
}

describe('runCalculator', () => {
    test('durchlaeuft die Schritte in fester Reihenfolge', () => {
        const app = loadCalculators();
        const { protokoll, run } = baueRechner(app);
        run();
        assert.deepEqual(protokoll, ['readInputs', 'validate', 'calculate', 'format']);
    });

    test('zeigt den formatierten Text im Ergebnisfeld', () => {
        const app = loadCalculators();
        const { run } = baueRechner(app);
        run();
        assert.deepEqual(app.results.at(-1), {
            elementId: 'res_test',
            text: 'Ergebnis: 6',
            isError: false
        });
    });

    test('bricht bei ungueltiger Eingabe vor der Berechnung ab', () => {
        const app = loadCalculators();
        const { protokoll, run } = baueRechner(app, {
            validate: () => ({ valid: false, error: 'Bitte Wert eingeben' })
        });
        run();
        assert.deepEqual(protokoll, ['readInputs']);
        assert.deepEqual(app.results.at(-1), {
            elementId: 'res_test',
            text: 'Bitte Wert eingeben',
            isError: true
        });
    });

    test('warn markiert das Feld als Warnung', () => {
        const app = loadCalculators();
        const { run } = baueRechner(app, { warn: result => result.ergebnis > 5 });
        run();
        assert.equal(app.results.at(-1).isError, true);
    });

    test('warn laesst unkritische Ergebnisse normal', () => {
        const app = loadCalculators();
        const { run } = baueRechner(app, { warn: result => result.ergebnis > 100 });
        run();
        assert.equal(app.results.at(-1).isError, false);
    });

    test('ohne warn ist das Ergebnis nie eine Warnung', () => {
        const app = loadCalculators();
        const { run } = baueRechner(app);
        run();
        assert.equal(app.results.at(-1).isError, false);
    });

    test('update wird vor der Ausgabe mit dem Ergebnis aufgerufen', () => {
        const app = loadCalculators();
        const gesehen = [];
        const { protokoll, run } = baueRechner(app, {
            update: result => {
                gesehen.push(result.ergebnis);
                protokoll.push('update');
            }
        });
        run();
        assert.deepEqual(gesehen, [6]);
        assert.deepEqual(protokoll, ['readInputs', 'validate', 'calculate', 'update', 'format']);
    });

    test('faengt Fehler ab und meldet sie im Ergebnisfeld', () => {
        const app = loadCalculators();
        const { run } = baueRechner(app, {
            calculate: () => {
                throw new Error('Absicht');
            }
        });
        run();
        assert.deepEqual(app.results.at(-1), {
            elementId: 'res_test',
            text: 'Fehler bei der Berechnung',
            isError: true
        });
    });

    test('ein Fehler im Formatieren reisst die App nicht mit', () => {
        const app = loadCalculators();
        const { run } = baueRechner(app, {
            format: () => {
                throw new Error('Absicht');
            }
        });
        assert.doesNotThrow(run);
        assert.equal(app.results.at(-1).isError, true);
    });
});

describe('Alle Rechner sind vollstaendig verdrahtet', () => {
    const EINSTIEGSPUNKTE = [
        'calcHeizlast', 'calcRadiator', 'calcRealPower', 'calcCondensate', 'calcGasPower',
        'calcVolumenstrom', 'calcKvValue', 'calcMAG', 'calcTank', 'calcHardness',
        'calcMixWater', 'calcHeatUpTime', 'calcZirkulation', 'calcPipeVol', 'calcFlowSpeed',
        'calcAirExchange', 'calcOffset', 'calcSlope', 'calcCoreDrill', 'calcClipDist'
    ];

    test('20 Rechner sind vorhanden', () => {
        const app = loadCalculators();
        const fehlend = EINSTIEGSPUNKTE.filter(name => typeof app[name] !== 'function');
        assert.deepEqual(fehlend, [], 'nicht definierte Rechner');
        assert.equal(EINSTIEGSPUNKTE.length, 20);
    });

    test('jeder Rechner meldet bei leeren Eingaben einen Fehler statt zu schweigen', () => {
        for (const name of EINSTIEGSPUNKTE) {
            const app = loadCalculators();
            app[name]();
            const letztes = app.results.at(-1);
            assert.ok(letztes, `${name} hat gar nichts angezeigt`);
            assert.equal(letztes.isError, true, `${name} meldet keinen Fehler`);
        }
    });

    test('jeder Rechner schreibt in ein Feld mit dem Praefix res_', () => {
        for (const name of EINSTIEGSPUNKTE) {
            const app = loadCalculators();
            app[name]();
            assert.match(app.results.at(-1).elementId, /^res_/, `${name} nutzt ein fremdes Feld`);
        }
    });
});
