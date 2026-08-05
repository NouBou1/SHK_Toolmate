# Sicherheit

## Wie die App mit Daten umgeht

Alle Daten bleiben auf dem Gerät. Projekte, Materiallisten, Fotos, Unterschriften,
Notizen, Inventar und Favoriten liegen im `localStorage` des Browsers. Es gibt
keinen Server, kein Benutzerkonto, keine Cookies und kein Tracking.

Fotos werden vor dem Speichern als JPEG mit 70 % Qualität komprimiert
([photos.js](js/modules/photos.js)). Überschreitet der Projektspeicher 4 MB,
erscheint eine Warnung in der Konsole; ist der Speicher voll, meldet die App das
und bittet darum, alte Projekte zu löschen — automatisch aufgeräumt wird **nicht**
([projects-storage.js](js/modules/projects-storage.js)).

Die einzige Verbindung nach außen ist **jsPDF**, nachgeladen von jsDelivr und erst
dann, wenn der PDF-Export benutzt wird. Vorher fragt die App und weist darauf hin,
dass dabei die IP-Adresse an den Anbieter übertragen wird
([external-scripts.js](js/core/external-scripts.js)). Wer kein PDF exportiert,
lädt nichts nach.

Die vollständige Datenschutzerklärung steht in [privacy.html](privacy.html).

## Was die App nicht leistet

- **Der `localStorage` ist unverschlüsselt.** Wer Zugriff auf das entsperrte Gerät
  hat, kann die Daten lesen. Für Kundendaten auf dem Diensthandy heißt das:
  Gerätesperre benutzen.
- **Es gibt keinen Passwortschutz** in der App selbst.
- **Kein Backup.** Browserdaten löschen entfernt alle Projekte. Der PDF-Export ist
  derzeit der einzige Weg, etwas aus der App herauszubekommen.

## Keystores gehören nicht ins Repository

Zum Signieren der Android-App gehören `shk-mate.jks` und
`shkMate-release.keystore`. Beide sind **Zugangsdaten**: Wer sie samt Passwort hat,
kann Updates veröffentlichen, die für Google Play echt aussehen.

- Nicht committen. `.gitignore` sperrt `*.jks`, `*.keystore` und
  `keystore.properties` — verlass dich trotzdem nicht darauf, sondern prüfe
  `git status` vor jedem Commit.
- Passwörter nicht in `build.gradle` oder `capacitor.config.json` schreiben.
- Ein verlorener Keystore lässt sich nicht ersetzen. Ohne ihn kann die App im Play
  Store nie wieder aktualisiert werden — nur unter neuer `appId` neu eingereicht.
  Eine Sicherungskopie außerhalb des Projektordners aufbewahren.

## Eine Lücke melden

Per Mail an **n.boussaada92@gmail.com** oder über die
[GitHub Issues](https://github.com/NouBou1/SHK_Mate/issues). Bei etwas, das
Nutzerdaten betrifft, bitte zuerst per Mail statt öffentlich.

Dies ist ein privates Lern- und Portfolioprojekt ohne Servicezusage — eine feste
Reaktionszeit kann ich nicht versprechen.
