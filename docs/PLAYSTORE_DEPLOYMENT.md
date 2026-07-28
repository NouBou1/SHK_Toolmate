# 🚀 SHK-ToolMate → Google Play Store Deployment

**Ziel:** App kostenlos hosten (Netlify) und im Play Store veröffentlichen

**Zeitaufwand:** ~2-3 Stunden  
**Kosten:** 25€ (einmalig für Google Play Developer Account)

---

## TEIL 1: App auf Netlify deployen (KOSTENLOS)

### Schritt 1: Netlify Account erstellen

1. Gehe zu [netlify.com](https://www.netlify.com)
2. Klicke "Sign up" → Mit GitHub anmelden
3. Account erstellt ✅

### Schritt 2: Projekt zu GitHub pushen

```bash
cd B:\developer\ki_tests\shk-mate

# Falls noch nicht initialisiert:
git init
git add .
git commit -m "Ready for deployment"

# Neues GitHub Repo erstellen (auf github.com)
# Dann:
git remote add origin https://github.com/DEINNAME/shk-mate.git
git branch -M main
git push -u origin main
```

### Schritt 3: Netlify Deployment

1. Auf Netlify Dashboard → **"Add new site"**
2. Wähle **"Import an existing project"**
3. Wähle **GitHub** → Authorisiere Netlify
4. Wähle dein **shk-mate** Repository
5. **Build settings:**
   ```
   Base directory: (leer lassen)
   Build command: (leer lassen - ist statische Site)
   Publish directory: .
   ```
6. Klicke **"Deploy site"**

**🎉 Deine App ist jetzt online!**

URL wird sein: `https://random-name-123.netlify.app`

### Schritt 4: Custom Domain (Optional)

1. In Netlify → **Domain settings**
2. Klicke **"Add custom domain"**
3. Entweder:
   - Eigene Domain kaufen (z.B. `shk-toolmate.de`)
   - Oder Netlify-Subdomain umbenennen zu `shk-toolmate.netlify.app`

**HTTPS ist automatisch aktiviert! ✅**

---

## TEIL 2: Icons erstellen (Erforderlich)

### Schritt 1: Icon erstellen

**Tool:** [favicon.io](https://favicon.io) oder Photoshop/GIMP

**Benötigte Größen:**
- `192x192px` → icon-192.png
- `512x512px` → icon-512.png

**Design-Tipps:**
- Einfaches Logo/Symbol
- Klare Farben (#0056b3 blau + #ff9900 orange)
- Lesbar auf kleinem Screen
- Transparent oder weißer Hintergrund

### Schritt 2: Icons hochladen

```bash
# Erstelle Icons-Ordner
mkdir -p assets/icons

# Kopiere deine erstellten Icons:
# icon-192.png → assets/icons/icon-192.png
# icon-512.png → assets/icons/icon-512.png
```

### Schritt 3: manifest.json aktualisieren

Öffne `manifest.json` und aktualisiere:

```json
{
  "name": "SHK-ToolMate",
  "short_name": "SHK Tool",
  "description": "Professionelle Handwerker-App für Material, Fotos und Berichte",
  "start_url": "/",
  "scope": "/",
  "display": "standalone",
  "background_color": "#121212",
  "theme_color": "#0056b3",
  "orientation": "portrait-primary",
  "icons": [
    {
      "src": "/assets/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/assets/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ]
}
```

**Pushe zu GitHub:**
```bash
git add .
git commit -m "Add icons for Play Store"
git push
```

**Netlify deployed automatisch! ✅**

---

## TEIL 3: Android App mit Bubblewrap erstellen

### Schritt 1: Node.js installieren (falls nicht vorhanden)

Download: [nodejs.org](https://nodejs.org)

```bash
# Test ob installiert:
node --version
npm --version
```

### Schritt 2: Bubblewrap installieren

```bash
npm install -g @bubblewrap/cli
```

### Schritt 3: Android Studio installieren (erforderlich)

1. Download: [developer.android.com/studio](https://developer.android.com/studio)
2. Installiere Android Studio
3. Öffne Android Studio → **SDK Manager**
4. Installiere:
   - **Android SDK Platform 33** (oder neuer)
   - **Android SDK Build-Tools**
   - **Android SDK Command-line Tools**

### Schritt 4: Java JDK installieren (erforderlich)

Download: [Oracle JDK 17](https://www.oracle.com/java/technologies/downloads/)

Oder mit Chocolatey (Windows):
```bash
choco install openjdk17
```

**Umgebungsvariablen setzen:**
```
JAVA_HOME = C:\Program Files\Java\jdk-17
ANDROID_HOME = C:\Users\DEINNAME\AppData\Local\Android\Sdk
```

### Schritt 5: Bubblewrap Projekt initialisieren

```bash
cd B:\developer\ki_tests\shk-mate

bubblewrap init --manifest="https://shk-toolmate.netlify.app/manifest.json"
```

**Fragen beantworten:**
```
Host: https://shk-toolmate.netlify.app
Manifest URL: https://shk-toolmate.netlify.app/manifest.json
Package ID: de.shkmate.app (oder deine Wahl)
App Name: SHK-ToolMate
Launcher Name: SHK Tool
App Version: 1 (Integer)
App Version Name: 1.0.0
Display Mode: standalone
Orientation: portrait
Icon URL: https://shk-toolmate.netlify.app/assets/icons/icon-512.png
Maskable Icon: (Ja, wenn du maskable hast)
Monochrome Icon: (Optional)
Splash Screen Color: #121212
Background Color: #121212
Theme Color: #0056b3
Navigation Bar Color: #121212
Navigation Divider Color: #000000
Status Bar Color: #000000
Shortcuts: (Nein fürs Erste)
Signing Key: Create new (Bubblewrap erstellt automatisch)
```

**Dies erstellt einen `android/` Ordner!**

### Schritt 6: APK/AAB erstellen

```bash
# Android App Bundle (für Play Store)
bubblewrap build

# Oder nur APK (zum lokalen Testen)
bubblewrap build --skipPwaValidation
```

**Output:**
```
✓ Build successful!
→ android/app/build/outputs/bundle/release/app-release.aab
```

### Schritt 7: APK auf Handy testen (optional)

```bash
# APK erstellen
bubblewrap build --apk

# Installiere auf verbundenem Android-Gerät
adb install android/app/build/outputs/apk/release/app-release.apk
```

---

## TEIL 4: Google Play Store Upload

### Schritt 1: Google Play Developer Account

1. Gehe zu [play.google.com/console](https://play.google.com/console)
2. Klicke **"Get started"**
3. Zahle **25€ einmalige Registrierungsgebühr**
4. Account erstellt ✅

### Schritt 2: Neue App erstellen

1. Im Play Console → **"Create app"**
2. **App Details:**
   ```
   App name: SHK-ToolMate
   Default language: Deutsch
   App or Game: App
   Free or Paid: Paid (oder Free)
   ```
3. **Declarations:**
   - Datenschutzerklärung: (Link zu deiner Privacy Policy)
   - Restricted Content: Nein
4. Klicke **"Create app"**

### Schritt 3: Store Listing erstellen

**App details:**
```
Short description (80 chars):
"Professionelle Handwerker-App für Material, Fotos & Berichte"

Full description (4000 chars):
"SHK-ToolMate ist die ultimative App für SHK-Installateure und Handwerker!

✅ Material-Verwaltung
✅ Projekt-Archivierung
✅ Foto-Dokumentation
✅ Digitale Unterschriften
✅ PDF-Reports
✅ Offline-Modus

Perfekt für unterwegs! Alle Daten lokal gespeichert."
```

**App Icon:** Dein `icon-512.png`

**Screenshots:** (Erforderlich: mind. 2)
- Nimm Screenshots von der App auf Android
- Oder nutze Browser DevTools (F12 → Device Toolbar)
- Größe: 1080x1920 px (Portrait)

**Feature Graphic:** (1024x500 px)
- Banner-Bild mit Logo und Text

**Category:** Productivity (Produktivität)

**Contact details:**
- Email: support@shkmate.de
- Website: https://shk-toolmate.netlify.app
- Phone: (Optional)

### Schritt 4: Content Rating

1. Gehe zu **"Content rating"**
2. Fragebogen ausfüllen:
   ```
   Violence: No
   Sexual Content: No
   User Interaction: No (keine Chat/Social Features)
   Data Sharing: No (alles lokal)
   ```
3. Rating wird automatisch berechnet (wahrscheinlich "Everyone")

### Schritt 5: Privacy Policy

**Erstelle auf Netlify:**

`privacy.html`:
```html
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Datenschutzerklärung - SHK-ToolMate</title>
</head>
<body>
    <h1>Datenschutzerklärung</h1>
    <p>Letzte Aktualisierung: 01.01.2026</p>
    
    <h2>1. Datenerfassung</h2>
    <p>Diese App erfasst KEINE persönlichen Daten. Alle Daten werden lokal auf Ihrem Gerät gespeichert.</p>
    
    <h2>2. Datenverarbeitung</h2>
    <p>Keine Datenübertragung an Server. Keine Weitergabe an Dritte.</p>
    
    <h2>3. Cookies</h2>
    <p>Diese App verwendet keine Cookies.</p>
    
    <h2>4. Kontakt</h2>
    <p>Email: support@shkmate.de</p>
</body>
</html>
```

**Link:** `https://shk-toolmate.netlify.app/privacy.html`

### Schritt 6: Upload AAB

1. Gehe zu **"Release" → "Production"**
2. Klicke **"Create new release"**
3. **Upload:** `android/app/build/outputs/bundle/release/app-release.aab`
4. **Release name:** `1.0.0`
5. **Release notes:**
   ```
   Erste Version:
   - Material-Verwaltung
   - Foto-Upload
   - PDF-Export mit Unterschrift
   - Offline-Funktionalität
   ```
6. Klicke **"Save"** → **"Review release"**

### Schritt 7: App zur Überprüfung senden

1. Überprüfe alle Pflichtfelder (grüne Häkchen)
2. Klicke **"Send for review"**

**Review-Dauer:** 1-3 Tage (meist 24h)

---

## TEIL 5: Nach dem Launch

### App-Updates

```bash
# 1. Code ändern
# 2. Zu GitHub pushen (Netlify deployed automatisch)
# 3. Version erhöhen in manifest.json

# 4. Neue AAB erstellen
cd android
# In app/build.gradle: versionCode erhöhen (z.B. 2)
# versionName erhöhen (z.B. "1.0.1")

cd ..
bubblewrap build

# 5. Zu Play Store hochladen (Production Release)
```

### Monitoring

- **Play Console:** Crash-Reports, User-Ratings
- **Netlify Analytics:** Traffic, Ladezeiten
- **Email:** User-Feedback sammeln

---

## 🎉 FERTIG!

**Zusammenfassung:**
1. ✅ App auf Netlify deployen (kostenlos)
2. ✅ Icons erstellen
3. ✅ Bubblewrap installieren
4. ✅ AAB erstellen
5. ✅ Play Store Account (25€)
6. ✅ App hochladen
7. ✅ Review (1-3 Tage)
8. ✅ LIVE! 🚀

**Geschätzte Kosten:**
- Netlify: **0€** (kostenlos)
- Google Play Developer: **25€** (einmalig)
- Domain (optional): **~10€/Jahr**
- **TOTAL: 25-35€**

**Viel Erfolg! 🎉**

