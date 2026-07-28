# Google Play Store Release - Schritt-für-Schritt

## Ihre aktuellen Fehler - Was sie bedeuten:

[FEHLER] **Fehler 1**: "Diese Version kann nicht eingeführt werden, da vorhandene Nutzer kein Upgrade auf die neu hinzugefügten App Bundles durchführen können."

[FEHLER] **Fehler 2**: "Bei diesem Release werden keine App Bundles hinzugefügt oder entfernt"

**Ursache**: Sie haben noch kein gültiges Android App Bundle (.aab) hochgeladen oder die Versionsnummer ist falsch.

---

## Lösung - Nach Android Studio Installation:

### Schritt 1: Node.js und npm im Terminal verfügbar machen

```powershell
# Prüfen Sie, ob Node.js installiert ist:
node --version
npm --version

# Falls nicht, installieren Sie Node.js von:
# https://nodejs.org/ (LTS Version empfohlen)
```

### Schritt 2: Capacitor-Abhängigkeiten installieren

```powershell
cd "d:\dev\ki-projekte\SHK_Mate\SHK_Mate"
npm install @capacitor/core @capacitor/cli @capacitor/android --save
```

### Schritt 3: Android-Projekt generieren

```powershell
# Android-Plattform hinzufügen
npx cap add android

# Web-Assets ins Android-Projekt kopieren
npx cap sync android

# Öffne das Projekt in Android Studio
npx cap open android
```

### Schritt 4: Version erhöhen (WICHTIG!)

Sie müssen die Versionsnummer **höher** setzen als die letzte Version, die Sie hochgeladen haben.

**Option A - Über Android Studio:**
1. Öffne `android/app/build.gradle`
2. Finde diese Zeilen:
   ```gradle
   versionCode 2          // Erhöhe diese Nummer! (war 1, jetzt 2)
   versionName "1.0.1"    // Neue Version (war "1.0.0", jetzt "1.0.1")
   ```
3. Speichern

**Option B - Wenn build.gradle noch nicht existiert:**
- Warten Sie bis Schritt 3 abgeschlossen ist
- Dann die Datei `android/app/build.gradle` bearbeiten

### Schritt 5: Release-Build erstellen (Signiert)

**In Android Studio:**

1. **Build > Generate Signed Bundle / APK**
2. Wähle **Android App Bundle**
3. Klicke **Next**
4. **Key store path**: Wähle `d:\dev\ki-projekte\SHK_Mate\SHK_Mate\shk-mate.jks`
5. **Key store password**: [Ihr Passwort vom Keystore]
6. **Key alias**: `shk-mate-key`
7. **Key password**: [Ihr Passwort]
8. Klicke **Next**
9. Wähle **release** Build Variant
10. Klicke **Finish**

**Die .aab Datei wird erstellt unter:**
```
android/app/release/app-release.aab
```

### Schritt 6: .aab in Google Play Console hochladen

1. Gehe zurück zur Google Play Console
2. **Produktion > Neuer Release**
3. **App-Bundles hochladen**
4. Ziehe die `app-release.aab` Datei in den Upload-Bereich
5. **Versionshinweise** hinzufügen:
   ```
   Erste Version der SHK-ToolMate App
   - Material- und Normenrechner
   - Fotodokumentation
   - PDF-Berichte
   ```
6. Klicke **Prüfen**
7. Dann **Release starten**

---

## 🔧 Häufige Probleme und Lösungen:

### Problem: "npx: Befehl nicht gefunden"
**Lösung**: Node.js wurde nicht installiert oder ist nicht im PATH
```powershell
# Prüfen:
$env:Path -split ';' | Select-String -Pattern 'nodejs'

# Wenn leer, Node.js neu installieren und PowerShell neu starten
```

### Problem: "Version code has already been used"
**Lösung**: `versionCode` in `build.gradle` muss höher sein als die vorherige Version
```gradle
// Alt:
versionCode 1

// Neu:
versionCode 2  // Immer um 1 erhöhen!
```

### Problem: "Keystore password incorrect"
**Lösung**: Keystore-Passwort ist falsch gespeichert
- Wenn Sie das Passwort vergessen haben, müssen Sie einen neuen Keystore erstellen
- **ACHTUNG**: Ein neuer Keystore bedeutet eine komplett neue App (kann nicht als Update hochgeladen werden)

### Problem: Android Studio kann Projekt nicht öffnen
**Lösung**: 
1. File > Invalidate Caches / Restart
2. Oder: Build > Clean Project
3. Oder: Gradle Sync erzwingen (Elephant-Icon in der Toolbar)

---

## 📝 Checkliste vor dem Upload:

- [ ] ✅ `capacitor.config.json` erstellt
- [ ] ✅ Android-Projekt generiert (`npx cap add android`)
- [ ] ✅ Web-Assets synchronisiert (`npx cap sync`)
- [ ] ✅ `versionCode` erhöht (z.B. von 1 auf 2)
- [ ] ✅ `versionName` aktualisiert (z.B. "1.0.1")
- [ ] ✅ Signiertes Bundle erstellt (`app-release.aab`)
- [ ] ✅ Bundle hochgeladen (Google Play Console)
- [ ] ✅ Versionshinweise hinzugefügt
- [ ] ✅ Release geprüft und gestartet

---

## ⚡ Schnellanleitung (wenn alles bereits konfiguriert ist):

```powershell
# 1. Version erhöhen
# Bearbeite: android/app/build.gradle
# versionCode 2
# versionName "1.0.1"

# 2. Web-Assets aktualisieren
npx cap sync android

# 3. Build erstellen
# In Android Studio: Build > Generate Signed Bundle
# Oder via Gradle:
cd android
./gradlew bundleRelease

# 4. Upload
# Die .aab Datei aus android/app/release/app-release.aab
# in Google Play Console hochladen
```

---

## 🎯 Nächste Schritte FÜR SIE:

1. **Warten** bis Android Studio fertig installiert ist
2. **Starten** Sie Android Studio einmal (SDK wird eingerichtet)
3. **Führen Sie Schritt 1-3 aus** (Node.js prüfen, npm install, Android-Projekt generieren)
4. **Ich helfe Ihnen** dann bei Schritt 4-6!

Sobald Android Studio fertig ist, geben Sie mir Bescheid! 🚀
