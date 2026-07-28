# 🎓 REFACTORING TEMPLATE

Dieses Template zeigt, wie die restlichen Funktionen in `calc.js` 
nach dem gleichen Muster verbessert werden sollten.

---

## 📋 Schritt-für-Schritt Anleitung

### Schritt 1: Funktion analysieren

**Vorher:**
```javascript
function calcMixWater() {
    const tHot = parseFloat(document.getElementById('mix_t_hot').value);
    const volHot = parseFloat(document.getElementById('mix_vol').value);
    const tCold = parseFloat(document.getElementById('mix_t_cold').value);
    const tTarget = 38;

    if (!tHot || !volHot) return;

    const numerator = volHot * (tHot - tCold);
    const denominator = tTarget - tCold;

    if (denominator <= 0) {
        showResult('res_mix', 'Fehler: Kaltwasser wärmer als Ziel?', true);
        return;
    }

    const vMix = numerator / denominator;
    const factor = (vMix / volHot).toFixed(1);

    showResult('res_mix',
        `Ertrag bei 38°C: ca. ${Math.round(vMix)} Liter\n` +
        `(Faktor ${factor}x des Speichervolumens)`
    );
}
```

---

### Schritt 2: Template anwenden

**Nachher:**
```javascript
/**
 * Berechnet den Mischwasser-Ertrag eines Warmwasserspeichers
 * 
 * Formel: V_mix = V_hot × (T_hot - T_cold) / (T_target - T_cold)
 * 
 * Basiert auf Wärmemengenbilanz:
 * - Wärme aus Speicher = Wärme in Mischwasser
 * - m_hot × c × ΔT_hot = m_mix × c × ΔT_mix
 * 
 * @returns {void}
 * 
 * @see DIN 4708 - Warmwasserspeicher
 */
function calcMixWater() {
    try {
        // === EINGABEN HOLEN ===
        const tHot = parseFloat(document.getElementById('mix_t_hot').value);
        const volHot = parseFloat(document.getElementById('mix_vol').value);
        const tCold = parseFloat(document.getElementById('mix_t_cold').value);
        
        // === KONSTANTEN ===
        const TARGET_TEMP = 38; // Zieltemperatur Badewasser/Dusche (°C)
        const MIN_HOT_TEMP = 50; // Minimale Speichertemperatur
        const MAX_HOT_TEMP = 95; // Maximale Speichertemperatur

        // === VALIDIERUNG ===
        if (isNaN(tHot) || tHot < MIN_HOT_TEMP) {
            showResult('res_mix', 
                `Speichertemperatur muss mindestens ${MIN_HOT_TEMP}°C sein`, 
                true
            );
            return;
        }

        if (tHot > MAX_HOT_TEMP) {
            showResult('res_mix', 
                `Warnung: Sehr hohe Temperatur (> ${MAX_HOT_TEMP}°C) - Verbrühungsgefahr!`, 
                true
            );
            return;
        }

        if (isNaN(volHot) || volHot <= 0) {
            showResult('res_mix', 'Bitte gültiges Speichervolumen eingeben (> 0)', true);
            return;
        }

        if (isNaN(tCold) || tCold < 5 || tCold > 20) {
            showResult('res_mix', 'Kaltwassertemperatur sollte zwischen 5-20°C liegen', true);
            return;
        }

        if (tCold >= TARGET_TEMP) {
            showResult('res_mix', 
                'Fehler: Kaltwasser bereits wärmer als Zieltemperatur!', 
                true
            );
            return;
        }

        // === BERECHNUNG ===
        const numerator = volHot * (tHot - tCold);
        const denominator = TARGET_TEMP - tCold;

        const vMix = numerator / denominator;
        const factor = vMix / volHot;

        // === WARNUNG BEI UNPLAUSIBLEN WERTEN ===
        if (factor > 10) {
            showResult('res_mix', 
                'Warnung: Ergebnis scheint unplausibel. Eingaben prüfen!', 
                true
            );
            return;
        }

        // === ERGEBNIS ANZEIGEN ===
        showResult('res_mix',
            `🚿 Ertrag bei ${TARGET_TEMP}°C: ca. ${Math.round(vMix)} Liter\n` +
            `📊 Faktor: ${factor.toFixed(1)}x des Speichervolumens\n\n` +
            `💡 ${volHot}L Speicher → ${Math.round(vMix)}L Duschwasser\n` +
            `(Bei Kaltwasser ${tCold}°C)`
        );

    } catch (error) {
        console.error('Error in calcMixWater:', error);
        showResult('res_mix', 'Fehler bei der Berechnung', true);
    }
}
```

---

## 🎯 Checkliste für jede Funktion

### ✅ Struktur
- [ ] JSDoc-Kommentar mit Formel
- [ ] try-catch Block
- [ ] Klare Sektionen (Eingaben, Konstanten, Validierung, Berechnung, Ergebnis)

### ✅ Validierung
- [ ] Alle Inputs auf NaN prüfen
- [ ] Grenzwerte prüfen (min/max)
- [ ] Benutzerfreundliche Fehlermeldungen
- [ ] Plausibilitätsprüfung des Ergebnisses

### ✅ Konstanten
- [ ] Magische Zahlen durch benannte Konstanten ersetzen
- [ ] Kommentare für Einheiten
- [ ] Bei globalen Konstanten: In `constants.js` verschieben

### ✅ Dokumentation
- [ ] Formel mit Variablen-Erklärung
- [ ] Quelle (DIN, VDI, DVGW) wenn vorhanden
- [ ] Einheiten in Kommentaren

### ✅ User Experience
- [ ] Emojis für bessere Lesbarkeit
- [ ] Formatierte Zahlen (toLocaleString)
- [ ] Hilfreiche Zusatzinfos

---

## 🔢 Beispiele nach Kategorie

### Beispiel 1: Einfache Berechnung

```javascript
/**
 * Berechnet XYZ
 * 
 * Formel: ...
 * 
 * @returns {void}
 */
function calcSimple() {
    try {
        const value = parseFloat(document.getElementById('input_id').value);

        if (isNaN(value) || value <= 0) {
            showResult('result_id', 'Bitte gültigen Wert eingeben (> 0)', true);
            return;
        }

        const result = value * 2;

        showResult('result_id', `Ergebnis: ${result}`);

    } catch (error) {
        console.error('Error in calcSimple:', error);
        showResult('result_id', 'Fehler bei der Berechnung', true);
    }
}
```

### Beispiel 2: Mit Konstanten aus constants.js

```javascript
/**
 * Berechnet mit globalen Konstanten
 * 
 * @returns {void}
 */
function calcWithConstants() {
    try {
        const value = parseFloat(document.getElementById('input_id').value);

        if (isNaN(value) || value < INPUT_LIMITS.POWER_MIN) {
            showResult('result_id', 
                `Bitte Wert ≥ ${INPUT_LIMITS.POWER_MIN} kW eingeben`, 
                true
            );
            return;
        }

        // Konstante aus constants.js verwenden
        const result = value * WATER_HEAT_CAPACITY;

        showResult('result_id', `Ergebnis: ${result.toFixed(2)}`);

    } catch (error) {
        console.error('Error in calcWithConstants:', error);
        showResult('result_id', 'Fehler bei der Berechnung', true);
    }
}
```

### Beispiel 3: Mit komplexer Validierung

```javascript
/**
 * Berechnet mit mehreren Inputs und Plausibilitätsprüfung
 * 
 * @returns {void}
 */
function calcComplex() {
    try {
        const val1 = parseFloat(document.getElementById('input1').value);
        const val2 = parseFloat(document.getElementById('input2').value);

        // Validierung Input 1
        if (isNaN(val1) || val1 <= 0 || val1 > 1000) {
            showResult('result_id', 'Wert 1: Bitte 0-1000 eingeben', true);
            return;
        }

        // Validierung Input 2
        if (isNaN(val2) || val2 <= 0 || val2 > 100) {
            showResult('result_id', 'Wert 2: Bitte 0-100 eingeben', true);
            return;
        }

        // Logische Validierung
        if (val1 < val2) {
            showResult('result_id', 'Wert 1 muss größer als Wert 2 sein', true);
            return;
        }

        const result = val1 / val2;

        // Plausibilitätsprüfung
        if (result > 50) {
            showResult('result_id', 
                'Warnung: Ungewöhnlich hohes Ergebnis. Eingaben prüfen!', 
                true
            );
            return;
        }

        showResult('result_id', 
            `✅ Ergebnis: ${result.toFixed(2)}\n` +
            `(${val1} ÷ ${val2})`
        );

    } catch (error) {
        console.error('Error in calcComplex:', error);
        showResult('result_id', 'Fehler bei der Berechnung', true);
    }
}
```

---

## 📝 Zu überarbeitende Funktionen in calc.js

### Priorität HOCH:
- [ ] `calcHardness()` - Wasserhärte
- [ ] `calcMixWater()` - Mischwasser
- [ ] `calcTank()` - Tank-Füllstand
- [ ] `calcFlowSpeed()` - Strömungsgeschwindigkeit
- [ ] `calcKvValue()` - Kv-Wert Ventile

### Priorität MITTEL:
- [ ] `calcOffset()` - 45° Offset
- [ ] `calcSlope()` - Gefälle
- [ ] `calcCoreDrill()` - Kernbohrung
- [ ] `calcRadiator()` - Heizkörper
- [ ] `calcCondensate()` - Kondensat

### Priorität NIEDRIG:
- [ ] `calcHeatUpTime()` - Aufheizzeit
- [ ] `calcClipDist()` - Schellen-Abstand
- [ ] `calcRealPower()` - Ist-Leistung
- [ ] `calcAirExchange()` - Luftwechsel

---

## 🚀 Automatisierung

### Suchen & Ersetzen Pattern:

**Pattern 1: Leere Validierung**
```
Suchen:    if (!value) return;
Ersetzen:  if (isNaN(value) || value <= 0) {
               showResult('result_id', 'Bitte gültigen Wert eingeben', true);
               return;
           }
```

**Pattern 2: Magische Zahlen**
```
Suchen:    value * 1.163
Ersetzen:  value * WATER_HEAT_CAPACITY
```

**Pattern 3: Fehlende Fehlerbehandlung**
```
Jede Funktion in try-catch einwickeln:
try {
    // Bestehender Code
} catch (error) {
    console.error('Error in functionName:', error);
    showResult('result_id', 'Fehler bei der Berechnung', true);
}
```

---

## 📚 Weiterführende Ressourcen

- `constants.js` - Alle verfügbaren Konstanten
- `validation.js` - Validierungs-Hilfsfunktionen
- `CODE_IMPROVEMENTS.md` - Übersicht aller Verbesserungen

---

**Happy Refactoring! 🎉**
