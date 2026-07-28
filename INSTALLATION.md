# SHK-ToolMate Installation & Deployment Guide

## Installation im App Store

### Vorraussetzungen
- WCAG 2.1 Level AA Compliance
- PWA (Progressive Web App) Support
- Offline-Funktionalität
- Responsives Design
- Fehlerbehandlung implementiert

### Schritt 1: Web App vorbereiten

```bash
# Checklist vor Deployment:
- [ ] Alle kritischen Bugs gefixt
- [ ] TEST_REPORT.md durchgelesen
- [ ] manifest.json korrekt
- [ ] Service Worker (sw.js) aktiv
- [ ] Icons (192x192, 512x512) vorhanden
- [ ] Privacy Policy hinzufügen
- [ ] Terms of Service hinzufügen
```

### Schritt 2: Icons erstellen

Die folgenden Icons sind erforderlich:
```
assets/icons/
├── icon-192x192.png  (PWA, Chrome)
└── icon-512x512.png  (PWA, Android)
```

### Schritt 3: manifest.json validieren

```json
{
  "name": "SHK-ToolMate",
  "short_name": "SHK Tool",
  "description": "Professionelle Handwerkerverwaltungs-App für SHK-Betriebe",
  "start_url": "index.html",
  "display": "standalone",
  "background_color": "#121212",
  "theme_color": "#0056b3",
  "orientation": "portrait-primary",
  "scope": "./",
  "icons": [
    {
      "src": "assets/icons/icon-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "assets/icons/icon-512x512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Schritt 4: Service Worker testen

```bash
# Service Worker im Browser aktivieren:
1. F12 → Application Tab
2. Service Workers prüfen
3. Offline Mode testen
4. Cache prüfen
```

### Schritt 5: iOS App (Apple App Store)

Für iOS kann die Web App als "Installierbare Web App" angeboten werden:

```html
<!-- Bereits in index.html vorhanden: -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
```

### Schritt 6: Android App (Google Play)

Für Android empfiehlt Google die Web App über "Web App Wrapper" zu verpacken:
- Verwendung von **PWA Builder** (pwabuilder.com)
- oder **Bubblewrap** CLI Tool

```bash
npm install -g @bubblewrap/cli

bubblewrap init --manifest=manifest.json
bubblewrap build
```

### Schritt 7: Sicherheit überprüfen

**HTTPS ist Pflicht!**
```
✅ Website muss über HTTPS laufen
✅ Service Worker benötigt HTTPS
✅ localStorage für Datenspeichern
⚠️ Keine sensiblen Daten im localStorage!
```

**Privacy Policy Template hinzufügen:**

```html
<!-- In index.html einfügen -->
<footer style="text-align:center; margin-top:40px; padding:20px; color:#999; font-size:0.9rem;">
    <a href="privacy.html" style="color:#0056b3;">Datenschutz</a> | 
    <a href="terms.html" style="color:#0056b3;">Nutzungsbedingungen</a>
</footer>
```

### Schritt 8: Testing vor Release

```
Browser-Tests:
✓ Chrome (Desktop + Mobile)
✓ Firefox (Desktop + Mobile)
✓ Safari (Desktop + iOS)
✓ Edge (Desktop)

Device-Tests:
✓ iPhone 12/13/14
✓ Samsung S20/S21
✓ iPad
✓ Tablet

Feature-Tests:
✓ Material-Verwaltung
✓ Foto-Upload (alle Größen)
✓ PDF-Export (mit/ohne Unterschrift)
✓ Offline-Modus
✓ localStorage Limit
✓ Fehlerbehandlung
```

### Schritt 9: Performance-Optimierung

Lighthouse Score (Ziel: >90)
```bash
# Chrome DevTools:
1. F12 → Lighthouse
2. "Generate report"
3. Auf Warnings reagieren
```

### Schritt 10: App Store Submission

**Google Play:**
1. Google Play Developer Account erstellen
2. APK/AAB Datei hochladen
3. Privacy Policy hinzufügen
4. Screenshots & Beschreibung
5. Pricing auswählen
6. Review-Prozess (~24h)

**Apple App Store:**
1. Apple Developer Program beitreten
2. App ID erstellen
3. TestFlight Build hochladen
4. Privacy Policy, Screenshots, Beschreibung
5. Review-Prozess (~48h)

---

## 💰 Preisgestaltung für App Store

### Empfohlene Strategien:

**Strategie 1: Kostenlos mit In-App Purchases**
- App ist kostenlos
- Optional: "Pro-Version" für €4,99-€9,99
  - Erweiterte Features
  - Unbegrenzte Projekte
  - Cloud-Backup

**Strategie 2: Kostenpflichtig einmalig**
- Einmalige Gebühr: €2,99-€4,99
- Keine In-App Purchases
- Einfach, transparent

**Empfehlung für SHK-Tools:** 
👉 **€3,99 einmalig** oder **kostenlos mit optionalem €4,99 Pro-Paket**

Handwerker bevorzugen meist Einmalzahlung ohne Abo.

---

## 🐛 Nach dem Release

### Monitoring
```
- User Feedback sammeln (Email, App-Store Reviews)
- Crash-Reports monitoren
- Performance überwachen
- Browser-Kompatibilität testen
```

### Updates
```
- Bug-Fixes: v1.0.1, v1.0.2, etc.
- Features: v1.1, v1.2, etc.
- Major: v2.0
```

---

## 📞 Support

Für User-Support empfohlen:
- FAQ Seite
- Email Support (support@shk-toolmate.de)
- Bug-Report Form

