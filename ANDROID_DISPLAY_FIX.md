# Android Display - Statusleiste & Navigationsleiste Fix

## Problem
Die App wurde von der Android Statusleiste (oben) und Navigationsleiste (unten) überdeckt.

## Lösung implementiert

### 1. **HTML Viewport Anpassung** (`index.html`)
- Hinzufügen von `viewport-fit=cover` für korrekte Handhabung von Notched Displays (Displayausschnitt)
- Viewport-Meta-Tag aktualisiert:
```html
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
```

### 2. **CSS Safe Area Insets** (`style.css`)

#### Body Element:
- `padding-top: env(safe-area-inset-top)` - Reserviert Platz für Statusleiste
- `padding-bottom: calc(70px + env(safe-area-inset-bottom))` - Reserviert Platz für Navigationsleiste + safe area

#### Navigationsleiste (`nav`):
- `padding-bottom: max(0px, env(safe-area-inset-bottom))` - Passt sich an der Navigationsleisten-Höhe an
- `position: fixed` - Bleibt immer am unteren Rand sichtbar
- `z-index: 1000` - Bleib über anderen Elementen

#### Container:
- `padding-bottom: 20px` reduziert (war 150px) - Body hat bereits 70px padding-bottom

### 3. **Capacitor Konfiguration** (`capacitor.config.json`)
```json
{
  "plugins": {
    "StatusBar": {
      "style": "DARK",
      "backgroundColor": "#0056b3",
      "overlaysWebView": false
    },
    "NavigationBar": {
      "backgroundColor": "#1e1e1e",
      "color": "#ffffff"
    }
  }
}
```

### 4. **JavaScript Initialisierung** (`app.js`)
- `initializeAndroidBars()` Funktion - Konfiguriert Status- und Navigationsleiste beim App-Start
- Nutzt Capacitor APIs um Farben und Verhalten zu setzen
- Fallback für Desktop (keine Fehler wenn APIs nicht verfügbar)

## Ergebnis
✅ Statusleiste überdeckt die App nicht mehr  
✅ Navigationsleiste überdeckt die App nicht mehr  
✅ App-Inhalt passen sich richtig an  
✅ Navigationsleiste bleibt immer sichtbar  
✅ Funktioniert auf Geräten mit und ohne Notch  
✅ Funktioniert auch auf Desktop/Browser (fallback)

## Technische Details

### Safe Area Insets
CSS `env(safe-area-inset-*)` ist ein Standard für:
- Geräte mit Notch/Displayausschnitt (iPhone notches)
- Android Statusleiste (oben)
- Android Navigationsleiste (unten)
- Tablet-Bildschirme mit System-UI

### Viewport-fit=cover
Ermöglicht der App den vollen Bildschirm zu nutzen und Safe Area Insets anzuwenden.

## Testing auf Android
1. Build: `capacitor build android`
2. Run: `capacitor run android --target=<device_id>`
3. Prüfe ob:
   - Header nicht von Statusleiste überdeckt wird
   - Navigation am unteren Rand sichtbar ist
   - Inhalt scrollbar ist ohne Navigation zu verdecken
