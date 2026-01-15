# 🔍 RECHNER BEREICH - GRÜNDLICHES DEBUGGING BERICHT

**Datum:** 4. Januar 2026  
**Fokus:** Keyboard & Input-Focus Probleme im "Rechner"-Tab

---

## 1️⃣ HTML STRUKTUR ANALYSE

### Container-Element
```html
<div id="view-rechner" class="container active">
```
- ✅ **ID:** Eindeutig und korrekt
- ✅ **Klasse:** `container active` - wird angezeigt
- ⚠️ **Nested structure:** 1 Suchfeld + 25+ Cards mit jeweils mehreren Input-Feldern

### Input-Felder im Rechner (Übersicht):
| Card | Input-Typ | Count | Problem? |
|------|-----------|-------|----------|
| Gas-Zähler | number, select | 2 | ❓ |
| Heizlast | number, select | 2 | ❓ |
| MAG Vordruck | number | 1 | ❓ |
| HK-Leistung | 2x select, number | 3 | ❓ |
| Leistung-Check | number (3x) | 3 | ❓ |
| Hydraulischer Abgleich | number (3x) | 3 | ⚠️ Besonders tief im Scroll |
| **... weitere 19 Cards** | mixed | ~40+ | ⚠️ **Sehr lange Liste** |

**Fazit:** Der Rechner-Bereich hat **eine extrem lange Scrollable Liste** mit 25+ Cards. Inputs am unteren Ende (z.B. ab Card #15) sind besonders anfällig für Keyboard-Overlap.

---

## 2️⃣ CSS STRUKTUR ANALYSE

### `.container` CSS
```css
.container {
    position: fixed;
    top: calc(65px + var(--status-bar-height, 25px));
    left: 0;
    right: 0;
    bottom: 60px;  /* ⚠️ HARDCODED - wird beim Keyboard-Öffnen nicht automatisch angepasst */
    overflow-y: auto;
    overflow-x: hidden;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
    z-index: 50;
}
```

**Probleme identifiziert:**
1. ❌ `bottom: 60px` ist **statisch in CSS** - unser JavaScript `setupKeyboardHandling()` muss dies mit `!important` überschreiben
2. ❌ `overflow-y: auto` auf `position: fixed` Element - kann zu komplexen Scroll-Verhalten führen
3. ❌ `overscroll-behavior: contain` - könnte den Fokus-Scroll stören

### `.card` CSS
```css
.card {
    width: 100%;
    background-color: var(--surface);
    padding: 16px;
    margin-bottom: 16px;
    position: relative;  /* ✅ OK */
    z-index: auto;       /* ✅ OK */
}
```
**Status:** ✅ Keine Probleme erkannt

### `input, select, textarea` CSS
```css
input, select {
    width: 100%;
    padding: 13px 14px;
    margin-bottom: 12px;
    background-color: var(--input-bg);
    border: 1.5px solid var(--border-color);
    font-size: 16px;        /* ✅ Verhindert iOS Auto-Zoom */
    -webkit-appearance: none;  /* ✅ Entfernt Browser-Default */
    touch-action: auto;        /* ✅ Erlaubt Touch */
    -webkit-tap-highlight-color: transparent;  /* ✅ OK */
}

input:focus,
select:focus {
    outline: none;
    border-color: var(--primary);
    box-shadow: 0 0 0 4px rgba(0, 86, 179, 0.15);  /* ✅ Subtil */
}
```
**Status:** ✅ Input-Styling ist korrekt

---

## 3️⃣ JAVASCRIPT PROBLEM ANALYSE

### `setupKeyboardHandling()` Funktion
```javascript
function setupKeyboardHandling() {
    if (!window.visualViewport) {
        console.log("visualViewport API nicht verfügbar (Desktop OK)");
        return;
    }

    const handleKeyboardResize = () => {
        const containers = document.querySelectorAll('.container');
        
        const viewportHeight = window.visualViewport.height;
        const screenHeight = window.innerHeight;
        const keyboardHeight = Math.max(0, screenHeight - viewportHeight);
        
        if (keyboardHeight > 80) {
            // Tastatur ist offen
            const newBottom = 60 + keyboardHeight;
            containers.forEach(container => {
                container.style.bottom = newBottom + 'px';
                container.style.bottom = newBottom + 'px !important';  /* ⚠️ Redundant */
            });
            
            // Scrolle zum fokussierten Element
            const focused = document.activeElement;
            if (focused && (focused.tagName === 'INPUT' || focused.tagName === 'TEXTAREA' || focused.tagName === 'SELECT')) {
                setTimeout(() => {
                    focused.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 100);
            }
        } else {
            // Tastatur geschlossen
            containers.forEach(container => {
                container.style.bottom = '60px';
            });
        }
    };
    
    window.visualViewport.addEventListener('resize', handleKeyboardResize);
    window.addEventListener('focusin', handleKeyboardResize);
    
    console.log("✅ Keyboard handling initialized");
}
```

**Potential Issues:**

| Issue | Severity | Analyse |
|-------|----------|---------|
| **Double CSS assignment** | 🟡 Medium | `container.style.bottom = newBottom + 'px'` wird zweimal gesetzt (redundant) |
| **Treshold bei 80px** | 🔴 **HIGH** | Manche Keyboards sind kleiner/größer - nicht universal |
| **scrollIntoView() mit 100ms delay** | 🔴 **HIGH** | Der Scroll passiert zu spät - Keyboard überlagert schon |
| **Alle `.container` werden geändert** | 🟡 Medium | Funktioniert, aber weniger präzise - sollte nur aktiven Container ändern |
| **focusin Event ohne Debounce** | 🟡 Medium | Könnte zu oft triggern bei vielen Inputs |
| **Keine Prüfung auf tatsächliche Tastatur-Öffnung** | 🔴 **HIGH** | `visualViewport` ist nicht zuverlässig auf allen Android-Versionen |

---

## 4️⃣ SPEZIFISCHE PROBLEME IM RECHNER-BEREICH

### Problem A: Inputs am unteren Ende sind nicht erreichbar
**Symptom:** Wenn man auf die Inputs am Ende des Rechners tippt (z.B. "Etagen-Sprung"), öffnet sich die Tastatur und verdeckt das fokussierte Feld.

**Root Cause:**
1. Der `.container` hat `bottom: 60px` (für Nav-Höhe)
2. `visualViewport` API erkennt Keyboard-Öffnung
3. `setupKeyboardHandling()` setzt `bottom` zu spät oder mit falscher Höhe
4. `scrollIntoView()` wird zu spät aufgerufen (100ms Delay)

**Fix-Strategie:**
```javascript
// 1. Tastatur-Höhe genauer berechnen
const keyboardHeight = Math.max(0, window.innerHeight - window.visualViewport.height);

// 2. Immediater Scroll (kein Delay)
focused.scrollIntoView({ behavior: 'auto', block: 'center' });

// 3. Nur aktiven Container anpassen
const activeContainer = document.querySelector('.container.active');
if (activeContainer) {
    activeContainer.style.bottom = (60 + keyboardHeight) + 'px';
}

// 4. Bei jedem Focus + Resize reagieren
```

### Problem B: Kein Smooth-Scroll bei vielen Inputs
**Symptom:** Beim Scrollen in der langen Rechner-Liste ist das Scroll-Verhalten ruckelig.

**Root Cause:**
- `-webkit-overflow-scrolling: touch` auf fixiertem Element kann Probleme verursachen
- Zu viele `.card` Elemente mit Box-Shadows und Transitions

**Fix-Strategie:**
```css
.container {
    /* -webkit-overflow-scrolling: touch entfernen oder anpassen */
    will-change: scroll-position;  /* Hint für Browser */
}
```

### Problem C: Flex-Layouts bei HK-Leistung Card
```html
<div style="display:flex; gap:10px;">
    <div style="flex:1">
        <select id="hk_typ">...</select>
    </div>
    <div style="flex:1">
        <select id="hk_height">...</select>
    </div>
</div>
```

**Potential Issue:** Inline-Flex mit Inputs könnte bei Tastatur-Öffnung zu Layout-Shifts führen.

**Fix:** Media-Query für Keyboard-Situation prüfen.

---

## 5️⃣ DEBUGGING CHECKLISTE

### ✅ Was funktioniert:
- [x] Input-Styling ist konsistent (font-size 16px)
- [x] Touch-Action ist auf `auto`
- [x] Tap-Highlight ist deaktiviert
- [x] Focus-Ring ist sichtbar und aussagekräftig
- [x] Alle Rechner-Funktionen sind vorhanden

### ❌ Was zu prüfen ist:
- [ ] **Keyboard-Höhe auf echtem Device:** Console.log zeigt echte Werte?
- [ ] **visualViewport API Unterstützung:** Welche Android-Version?
- [ ] **Fokus-Scroll-Timing:** Ist 100ms zu lange?
- [ ] **CSS Cascade:** Wird `!important` wirklich angewendet?
- [ ] **Event-Listener Reihenfolge:** `focusin` vs `visualViewport.resize`?
- [ ] **Scroll-Position nach Keyboard-Close:** Springt der Inhalt zurück?

---

## 6️⃣ EMPFEHLUNGEN

### Sofort-Fix (Priorität 🔴):
```javascript
function setupKeyboardHandling() {
    if (!window.visualViewport) return;

    const handleKeyboardResize = () => {
        const activeContainer = document.querySelector('.container.active');
        if (!activeContainer) return;

        const keyboardHeight = Math.max(0, window.innerHeight - window.visualViewport.height);
        
        console.log("⌨️ Keyboard Height: " + keyboardHeight + "px");

        if (keyboardHeight > 100) {
            // Tastatur ist offen
            const newBottom = 60 + keyboardHeight;
            activeContainer.style.bottom = newBottom + 'px';
            activeContainer.style.bottom = newBottom + 'px !important';

            // Sofort scrollen (kein Delay!)
            const focused = document.activeElement;
            if (focused && ['INPUT', 'TEXTAREA', 'SELECT'].includes(focused.tagName)) {
                focused.scrollIntoView({ behavior: 'auto', block: 'center' });
                console.log("📍 Scrolled to: " + focused.id);
            }
        } else {
            // Tastatur geschlossen
            activeContainer.style.bottom = '60px';
        }
    };

    // Listeners mit Debounce
    let resizeTimer;
    const debouncedResize = () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(handleKeyboardResize, 50);
    };

    window.visualViewport?.addEventListener('resize', debouncedResize);
    document.addEventListener('focusin', handleKeyboardResize);
    
    console.log("✅ Keyboard handling ready");
}
```

### Mittelfristig-Fixes (Priorität 🟡):
1. **CSS Optimization:** `-webkit-overflow-scrolling: touch` überprüfen
2. **Rechner-Struktur:** Sehr lange Liste - evtl. in Kategorien aufteilen?
3. **Input-Priorität:** Am häufigsten genutzte Rechner oben platzieren

### Langfristig (Priorität 🟢):
1. Virtual Scrolling für die lange Rechner-Liste implementieren
2. PWA-Keyboard-Handling standardisieren
3. Browser-Testing auf verschiedenen Android-Versionen

---

## 7️⃣ TESTING STRATEGIEN

### Mobile-Test auf echtem Device:
1. F12 DevTools öffnen (Remote Debugging)
2. In Rechner-Tab gehen
3. Auf Input am Ende (z.B. "Etagen-Sprung") tippen
4. Console beobachten:
   ```
   🔍 Viewport: 1080px, Screen: 1920px, Keyboard-Höhe: XXXpx
   ⌨️ Keyboard offen: XXXpx - Container bottom: XXXpx
   📍 Scrolled to focused element: offset_cm
   ```

### Desktop-Test (mit Mobile-Emulation):
```javascript
// In Browser-Console simulieren:
window.innerHeight = 400;  // Mit Keyboard
window.screen.height = 800;  // Echte Bildschirmhöhe
// visualViewport.height = 400
// → keyboardHeight = 400px
```

---

## 8️⃣ ZUSAMMENFASSUNG

### Kritische Findings:
1. **Keyboard-Timing:** scrollIntoView() ist zu langsam (100ms Delay)
2. **Threshold:** 80px ist nicht universell - sollte 100px+ sein
3. **Container-Selektor:** Alle `.container` werden geändert, nicht nur aktive
4. **visualViewport Unterstützung:** Nicht auf allen Android-Geräten gleich

### Nächste Schritte:
1. Sofort-Fix oben implementieren (ohne Delay, bessere Schwellwerte)
2. Test auf echtem Android-Gerät durchführen
3. Console-Logs prüfen, ob Keyboard erkannt wird
4. Ggfs. fallback für Geräte ohne visualViewport API hinzufügen

---

**Status:** 🔴 **AKTIV - Debugging notwendig**  
**Ziel:** Inputs im Rechner-Bereich sollen 100% anklickbar und fokussierbar sein, auch wenn Tastatur offen ist.
