# Android Studio - Bereit zum Testen

## Alle Vorbereitungen abgeschlossen

### Code-Änderungen
- `app.js` - Safe Area Insets & Navigationsleisten-Handling
- `style.css` - Navigation mit flexibler Höhe
- `MainActivity.java` - SYSTEM_UI_FLAG_LAYOUT Flags gesetzt
- `capacitor.config.json` - StatusBar Plugin konfiguriert
- `index.html` - viewport-fit=cover Meta-Tag
- Android Assets synchronisiert (63.4 KB app.js, 21.2 KB style.css)

### Git Status
- 4 Commits für Navigationsleisten-Fix
- Alle Dateien sind committed
- Keine Konflikte

### Build Ready
- `build.gradle` vorhanden
- `settings.gradle` vorhanden
- Gradle Wrapper vorbereitet

---

## Anweisungen für Android Studio

### 1. Projekt öffnen
```
File > Open > b:\developer\ki_tests\shk-mate\android
```

### 2. Gradle Sync
- Warte bis "Gradle sync finished" erscheint
- Falls Fehler: File > Sync Now

### 3. Build & Run
- Smartphone per USB anschließen
- Entwickleroptionen aktivieren (USB Debugging)
- **Run > Run 'app'** (oder Shift+F10)
- Oder **Run > Edit Configurations** für spezifisches Device

---

## Was getestet werden sollte

### Visual Test (Smartphone)
1. **Statusleiste (oben)**
   - Header sollte NICHT unter der Statusleiste versteckt sein
   - Schwarzer Hintergrund (#0a0a0a)

2. **Navigationsleiste (unten) - WICHTIG!**
   - App-Navigation (Rechner, Listen, Lager, etc.) sollte NICHT von der Android-Navigationsleiste überdeckt sein
   - Navigation sollte sichtbar und clickable sein
   - Schwarzer Hintergrund (#0a0a0a)

3. **Scrolling**
   - Inhalt kann nach oben/unten gescrollt werden
   - Navigation bleibt immer am unteren Rand sichtbar
   - Statusleiste wird nicht überdeckt

4. **Orientierungswechsel**
   - Landscape & Portrait Mode funktioniert korrekt
   - Safe Areas werden neu berechnet

### Console Test (F12 DevTools)
Überprüfe folgende Logs beim App-Start:
```
[OK] StatusBar: overlaysWebView=false, color=#0a0a0a
[OK] NavigationBar: color=#0a0a0a
[DEBUG] Body padding applied: top=25px, bottom=...px
[DEBUG] Nav height adjusted: ...px
[DEBUG] Android Safe Area Berechnung: {...}
```

---

## Falls es Probleme gibt

### Problem: Navigation wird immer noch überdeckt
**Lösung:**
1. Stelle sicher dass MainActivity.java mit den Flags aktualisiert wurde
2. Clean & Rebuild:
   - Build > Clean Project
   - Build > Rebuild Project
3. App deinstallieren & neu installieren

### Problem: App crasht beim Start
**Überprüfe:**
1. F12 Console auf Errors
2. Android Studio Logcat (unten rechts) auf Java Exceptions
3. Stelle sicher dass alle npm packages installiert sind: `npm install`

### Problem: Weiße Lücken/Abstände sind falsch
**Das liegt an der Safe Area Berechnung:**
- Die dynamische Höhenberechnung basiert auf `window.innerHeight` vs `window.screen.height`
- Kann je nach Android Version/Gerät variieren
- Ist aber korrekt, wenn Navigation nicht überdeckt wird

---

## Notizen

- Alle Änderungen sind committet (git log zeigt 4 neue Commits)
- Die SYSTEM_UI_FLAG_LAYOUT_* Flags sind die wichtigsten für dieses Problem
- Das JavaScript berechnet die Höhen dynamisch (besser als statische CSS)
- Z-index: 1000 stellt sicher, dass App-Navigation über Android-Navigation liegt

---

## Status: **READY FOR TESTING**

Jetzt in Android Studio öffnen und testen!
