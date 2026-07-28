# SECURITY & DATENSCHUTZ Guide

## Sicherheits-Status der App

### Implementiert

1. **HTTPS-Ready**
   - App funktioniert nur über HTTPS
   - Service Worker benötigt HTTPS

2. **localStorage Sicherheit**
   - Benutzerdaten lokal gespeichert
   - Keine Übertragung an Server
   - Keine Tracking-Cookies

3. **Input Validation**
   - Projekt-Namen: Max 50 Zeichen
   - Material-Namen: Max 100 Zeichen
   - Mengen: 1-999
   - Fotos: Max 5MB, nur Images

4. **Error Handling**
   - Graceful Fallbacks
   - Aussagekräftige Fehlermeldungen
   - Keine sensitiven Daten in Error-Logs

5. **Datenspeicher Limits**
   - localStorage Quota Check
   - Warnung bei >4MB
   - Automatische Cleanup-Mechanismen

### Zu beachten

1. **localStorage ist unverschlüsselt**
   ```
   - Jeder mit Zugriff zum Gerät kann Daten sehen
   - Empfehlung: Nutzer sollte Gerät sperren
   ```

2. **Fotos werden unkomprimiert gespeichert**
   ```
   - Komprimierung auf 70% JPEG-Qualität
   - Große Fotos können localStorage füllen
   - Nutzer sollte regelmäßig alte Projekte löschen
   ```

3. **Kein Passwort-Schutz**
   ```
   - Optional implementierbar für Pro-Version
   - Würde User Experience beeinträchtigen
   ```

---

## Datenschutz (DSGVO)

### Privacy Policy Template

```markdown
# Datenschutzerklärung

## 1. Verantwortlicher
[Deine Informationen einfügen]

## 2. Datenerfassung
Diese App erfasst folgende Daten:
- **Lokal auf Ihrem Gerät:**
  - Projekte und Materiallisten
  - Fotos
  - Unterschriften
  - Schnellnotizen

- **Nicht erfasst:**
  - Persönliche Daten
  - IP-Adresse
  - Nutzungsdaten (kein Tracking)

## 3. Datenverarbeitung
- Alle Daten werden **nur lokal** auf Ihrem Gerät gespeichert
- Keine Datenübertragung an Server
- Keine Weitergabe an Dritte

## 4. Datenscjutzrechte (DSGVO)
Sie haben das Recht auf:
- Auskunft über Ihre Daten
- Berichtigung falscher Daten
- Löschung Ihrer Daten (durch App-Deinstallation)
- Datenportabilität

## 5. Cookies
Diese App verwendet **keine Cookies**.

## 6. Externe Dienste
- **PDF-Export:** jsPDF von jsdelivr (ohne Tracking, nur bei Nutzung des Exports)

## 7. Kontakt
[Email Adresse]
```

### Rechtliche Anforderungen

**Für EU (DSGVO):**
- ✅ Privacy Policy auf Website/App Store
- ✅ Datenschutzerklärung in Nutzungssprache
- ✅ Impressum (falls kommerziell)
- ✅ Benutzerdaten nicht an Dritte weitergeben

**Für Deutschland:**
- ✅ Impressum erforderlich
- ✅ AGB erforderlich
- ✅ Datenschutzerklärung erforderlich

---

## Sicherheits-Best-Practices

### 1. Regelmäßige Updates
```javascript
// In sw.js oder app.js:
const APP_VERSION = "1.0.0";
// Immer erhöhen bei Bugfixes/Security Updates
```

### 2. Fehler-Logging
```javascript
// Fehler protokollieren (ohne sensible Daten)
window.addEventListener('error', function(event) {
    console.error('App Error:', event.message);
    // Optional: An Server senden (mit User-Zustimmung)
});
```

### 3. Storage Limits
```javascript
// Bereits implementiert:
// - localStorage Größen-Check
// - Warnung bei >4MB
// - Automatischer Cleanup
```

### 4. Input Sanitization
```javascript
// Bereits implementiert:
// - XSS-Protection durch innerHTML-Einschränkungen
// - Input Length Limits
// - Dateityp-Validierung
```

---

## Sicherheits-Checkliste vor Release

```
Authentifizierung:
[ ] Keine Authentifizierung erforderlich (lokal)
[ ] Alternativ: PIN/Biometrie für Pro-Version

Verschlüsselung:
[ ] HTTPS erzwungen
[ ] Sensible Daten nicht im localStorage
[ ] Fotos komprimiert

Datenvalidation:
[ ] Input-Längen limitiert
[ ] Dateitypen validiert
[ ] Dateigröße validiert

Fehlerbehandlung:
[ ] Keine Stack-Traces für User
[ ] Aussagekräftige Fehlermeldungen
[ ] Graceful Degradation

Logging:
[ ] Keine sensiblen Daten geloggt
[ ] Logs nicht persistent auf Server
[ ] Developer Console cleansed

Testing:
[ ] Penetration Testing durchgeführt
[ ] XSS-Tests bestanden
[ ] CSRF-Protection überprüft
```

---

## Incident Response Plan

**Falls Sicherheitslücke gefunden:**

1. **Analyse:** Bug reproduzieren und dokumentieren
2. **Fix:** Code-Änderung implementieren
3. **Test:** Sicherheit überprüfen
4. **Release:** Update schnellstmöglich bereitstellen
5. **Kommunikation:** User informieren (falls notwendig)

---

## Support & Reporting

**Sicherheitslücken melden an:**
- ✉️ security@shk-toolmate.de
- Bitte **nicht** öffentlich posten
- Responsible Disclosure erwünscht

