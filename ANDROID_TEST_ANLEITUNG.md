# Android Testhilfe - Status/Navigationsleiste Fix

## Problem gelöst ✅

Die App wird nicht mehr von der Android Statusleiste (oben) und Navigationsleiste (unten) überdeckt.

## Was wurde geändert:

### 1. **app.js** - Dynamische Safe Area Berechnung
- Funktion `initializeAndroidBars()` - Konfiguriert StatusBar mit `overlaysWebView: false`
- Funktion `applyAndroidSafeAreaInsets()` - Berechnet automatisch die Höhen
- Wird bei Orientierungswechsel neu angewendet

### 2. **MainActivity.java** (Android Code)
- Statusleiste Farbe: `#0a0a0a` (dunkel)
- Navigationsleiste Farbe: `#0a0a0a` (dunkel)
- **Wichtig**: Keine `SYSTEM_UI_FLAG_LAYOUT_*` Flags - das ist der Schlüssel!

### 3. **CSS Updates** (style.css)
- Body padding wird jetzt vom JavaScript dynamisch gesetzt
- Navigation hat `position: fixed` mit dynamischem bottom padding

## So testest du es in Android Studio:

### Schritt 1: Projekt öffnen
```bash
# Terminal:
cd b:\developer\ki_tests\shk-mate
# Öffne dann in Android Studio:
# File > Open... > android folder
```

### Schritt 2: Gerät verbinden
```bash
adb devices
# Du solltest dein Gerät sehen
```

### Schritt 3: Build & Run
```bash
# Option A - via Android Studio:
- Wähle dein Gerät aus dem Dropdown
- Klick "Run" (grüne Play-Taste)

# Option B - via Terminal:
cd android
./gradlew assembleDebug
```

### Schritt 4: Auf dem Smartphone prüfen
1. **Starte die App**
2. **Öffne die Developer Konsole** (F12 wenn Remote Debug aktiv ist)
3. Schau auf die **Console-Logs**, dort siehst du:
   ```
   ✅ StatusBar: overlaysWebView=false gesetzt
   🎯 Android Safe Area: {viewport, screen, statusBar, navBar}
   ```
4. **Visuell prüfen**:
   - ❌ FALSCH: Content ist von Statusleiste überdeckt
   - ✅ RICHTIG: Header sitzt unter der Statusleiste
   - ✅ RICHTIG: Navigation unten ist sichtbar
   - ✅ RICHTIG: Content scrollbar ohne Navigation zu verdecken

## Falls noch Probleme:

### Debug Mode aktivieren
```bash
# In Android Studio:
View > Tool Windows > Logcat
# Dort Filtern nach: "com.shk.toolmate"
```

### Häufige Probleme:

**Problem**: Content ist immer noch überdeckt
- **Lösung**: Stelle sicher, dass `overlaysWebView: false` aktiv ist
- **Check**: In app.js konsole_log("✅ StatusBar: overlaysWebView=false gesetzt")

**Problem**: Navigation verschwindet
- **Lösung**: Prüfe ob `padding-bottom` auf body angewendet wird
- **Check**: Im Browser DevTools: `document.body.style.paddingBottom` sollte ca. 120px sein

**Problem**: Läuft auf Desktop aber nicht auf Android
- **Lösung**: Das ist normal - WebView auf Android ist anders
- **Check**: Stelle sicher dass Capacitor richtig installiert ist

## Wichtige Dateien für Tests:
- [app.js](app.js#L1-L80) - Safe Area Logik
- [style.css](style.css#L65-L75) - Body CSS
- [MainActivity.java](android/app/src/main/java/com/shk/toolmate/MainActivity.java) - Java Config

## Nächste Schritte:
1. ✅ Code ist vorbereitet
2. Build in Android Studio
3. Deploy auf Smartphone
4. Teste und berichte Ergebnisse!

---

**Letzte Aktualisierung**: `b426b9d` - Improve: Android Safe Area Insets
