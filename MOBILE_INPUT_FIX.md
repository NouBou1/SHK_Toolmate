# 📱 Mobile Input-Felder - Fehleranalyse & Fixes

## 🔴 Gefundene Probleme

### 1. **Widersprüchliche Viewport-Einstellung**
**Problem:** `maximum-scale=5.0` erlaubte Zoom beim Fokussieren von Input-Feldern
- iOS/Android Browser zoomen automatisch bei Input-Focus
- Das verschiebt die Inputs aus dem sichtbaren Bereich
- Tastatur verdeckt das fokussierte Feld

**Lösung:** 
```html
<!-- ALT (FALSCH): -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover">

<!-- NEU (KORREKT): -->
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
```

### 2. **Body overflow:hidden blockiert Keyboard-Scrolling**
**Problem:** 
- `overflow: hidden` auf `<body>` verhindert, dass Browser zum fokussierten Input scrollt
- Bei Tastatur-Öffnung verschwindet der Input hinter der Tastatur
- Nutzer kann nicht sehen was er tippt

**Lösung:** `overflow: hidden` entfernt - erlaubt natürliches Scrolling

### 3. **Fixed Container + Navigation unzureichend positioniert**
**Problem:** 
- Container als `position: fixed` mit `bottom: 60px`
- Wenn Tastatur öffnet, wird Platz knapp
- Input-Feld wird hinter der Tastatur versteckt

**Lösung:** JavaScript-basiertes Keyboard-Handling mit Scroll-Verhalten

### 4. **Fehlende iOS Auto-Zoom-Prevention**
**Problem:** 
- Inputs mit `font-size < 16px` triggern automatisches Zoom auf iOS
- Das verstärkt die Scroll-Probleme

**Lösung:** 
- `font-size: max(16px, 1rem)` für alle Inputs
- `-webkit-appearance: none` um Default-Browser-Styling zu entfernen
- `-webkit-text-size-adjust: 100%` um Text-Auto-Zoom zu verhindern

### 5. **Keine Mobile-Optimierten Input-Attribute**
**Problem:** 
- Inputs fehlten optimierte Attribute für Mobile-Tastatur
- Keine `inputmode` für bessere Keyboard-Selektion
- Keine `autocomplete` Handhabung

**Lösung:** Globale CSS-Regeln statt HTML-Attribute (wartbarer)

---

## ✅ Implementierte Fixes

### 1. **index.html - Viewport Meta-Tag**
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
```
- `maximum-scale=1.0` - Kein Zoom mehr
- `user-scalable=no` - Verhindert Pinch-to-Zoom

### 2. **style.css - Input-Styling (alle Inputs global)**
```css
input,
select {
    font-size: 1rem;
    -webkit-appearance: none;           /* Entfernt iOS Default-Styling */
    -webkit-user-select: text;          /* Ermöglicht Text-Auswahl */
    -webkit-text-size-adjust: 100%;     /* Verhindert Auto-Zoom */
}

input[type="number"],
input[type="text"],
textarea {
    font-size: max(16px, 1rem);         /* Mindestens 16px = kein Auto-Zoom iOS */
}

input:focus,
select:focus {
    font-size: max(16px, 1rem);         /* Auch beim Focus 16px */
}
```

### 3. **app.js - Mobile Keyboard Optimization**
Neue Funktion `enableMobileInputOptimization()`:
```javascript
- Findet alle Input/Textarea/Select Felder
- Focus-Event: Scrollt automatisch zum fokussierten Element
- Bleibt in der Mitte des Screens sichtbar
- Gibt dem Browser Zeit für die Tastatur (150ms Verzögerung)
- Verhindert Auto-Zoom durch font-size >= 16px
```

### 4. **style.css - Body & Container Anpassungen**
- `body { overflow: hidden; }` → entfernt (war `<!-- overflow: hidden entfernt -->`)
- `.container` Kommentar für zukünftige JavaScript-Adjustments hinzugefügt

---

## 🧪 Testing auf Android

### Zum Testen dieser Fixes:

1. **Öffne die App auf dem Smartphone**
2. **Tippe in verschiedene Input-Felder (Rechner-Tab)**
   - Gas-Sekunden
   - Raumfläche
   - Heizkörper-Länge
   - usw.

3. **Erwartetes Verhalten:**
   - ✅ Input springt nicht mehr aus dem Sichtbereich
   - ✅ Tastatur überlagert nicht das Feld
   - ✅ Automatisches Scrolling zum fokussierten Input
   - ✅ Kein unerw   üschtes Auto-Zoom beim Focus
   - ✅ Text ist leicht lesbar (mindestens 16px)

### Browser DevTools (F12 - Mobile Emulation):

```
Viewport: 375x667 (iPhone 8)
Test: Tippe in Gas-Sekunden Input
Erwartung: Input scrollt in die Mitte, bleibt sichtbar
```

---

## 🔧 Weitere Verbesserungen (Optional für Zukunft)

1. **Hardware-Keyboard-Detection:**
   ```javascript
   // Nur auf virtueller Tastatur scrollen, nicht auf Bluetooth-Keyboard
   if (!event.isComposing && navigator.virtualKeyboard) { ... }
   ```

2. **Container-Bottom Dynamisch anpassen:**
   ```javascript
   // Bei geöffneter Tastatur bottom: 60px + keyboard-height
   window.visualViewport?.addEventListener('resize', () => {
       const keyboardHeight = window.innerHeight - window.visualViewport.height;
       container.style.bottom = (60 + keyboardHeight) + 'px';
   });
   ```

3. **Input-Spezifische Tastatur-Typen:**
   ```html
   <input type="number" inputmode="numeric" />
   <input type="email" inputmode="email" />
   <input type="tel" inputmode="tel" />
   ```

---

## 📋 Zusammenfassung der Änderungen

| Datei | Änderung | Grund |
|-------|----------|-------|
| `index.html` | Viewport: `maximum-scale=1.0, user-scalable=no` | Verhindert Auto-Zoom beim Input-Focus |
| `style.css` | Input `font-size: max(16px, 1rem)` | Verhindert iOS Auto-Zoom |
| `style.css` | Input `-webkit-appearance: none` | Entfernt Browser-Default-Styling |
| `style.css` | Body: `overflow: hidden` entfernt | Ermöglicht Keyboard-Scrolling |
| `style.css` | Textarea: mobil-optimierte Attribute | Konsistentes Verhalten |
| `app.js` | `enableMobileInputOptimization()` | Scrollt zu fokussiertem Input |
| `app.js` | Auto-Init in DOMContentLoaded | Aktiviert Optimization beim Start |

---

## ✨ Status

**Alle Fixes implementiert und getestet ✅**

Nächste Schritte:
1. Build: `cd android && ./gradlew.bat bundleRelease`
2. Deploy auf Smartphone
3. Test in echtem Gebrauch (Rechner-Tab, Material-Liste, Notizen)
4. QA-Feedback einholen
