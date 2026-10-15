# Testbericht · 15.10.2026

Getesteter App-Stand: 72c5a1cc19c8fe01711096b6b80fd2877adb414f.

## Ergebnisse

| Prüfung | Ergebnis |
| --- | --- |
| Kernlogik, bekannte Beispiele, Mod10, Datum, BigInt/Nullen, Statistik, CSV | 7/7 bestanden |
| Lokale Windows-Browser: Chromium mobil + WebKit iPhone | 17 bestanden, 3 ausdrücklich übersprungen |
| GitHub Linux CI: Chromium mobil + WebKit iPhone | 19 bestanden, 1 ausdrücklich übersprungen |
| Öffentliche HTTPS-Seite, frische Windows-Testbrowser | 17 bestanden, 3 ausdrücklich übersprungen |
| Öffentliche Seite bei 320 / 390 / 768 / 1280 px, leer / Prüfung / gespeichert | Kein seitliches Überlaufen, keine JavaScript-Fehler |
| HTTP → HTTPS | 301 zur HTTPS-App |
| HTTPS-HTML, PWA-Manifest, Service Worker | HTTP 200, passende Inhaltstypen |
| GitHub Pages | Erfolgreich veröffentlicht, build_type workflow, HTTPS aktiviert |

[Erfolgreiche CI und Veröffentlichung](https://github.com/LutzWellensiek/barcode-aktivitaeten/actions/runs/38719263643)

[Öffentliche App](https://lutzwellensiek.github.io/barcode-aktivitaeten/)

## Geprüftes Verhalten

- I25 mit 22 und 24 Ziffern durch den echten ZXing-Decoder aus synthetischen Testbildern gelesen; keine echten Ticketfotos hochgeladen.
- Ein Videostream mit I25-Testbild wird nach stabilen Lesungen zur Prüfung angezeigt, noch nicht gezählt; Kameratracks werden danach beendet. Chromium und Linux-WebKit bestanden.
- Kamerazugriff verlangt sicheren Kontext, bevorzugt Rückkamera; simulierter NotAllowedError zeigt Anleitung und nutzbaren manuellen Fallback. Dies prüft die Anwendung, nicht den physischen iOS-Berechtigungsdialog.
- Speichern und Browser-Neuladen, Stadtbad/Karren/unbekannt, manuelle Zuordnung und editierbares Datum.
- Wiederholte Eingabe inklusive Leerzeichen wird nicht doppelt gezählt; gleichzeitiges Speichern desselben Barcodes in zwei Tabs ergibt genau einen Eintrag.
- Typfilter, Suche, UTF-8-CSV aller Einträge mit ungekürzten Barcode-Ziffern.
- Einzel-Löschen und Reset respektieren Abbrechen und Bestätigen; bestätigte Löschung bleibt nach Neuladen erhalten.
- Chromium: vollständiges Neuladen ohne Netzwerk, vorhandene Einträge bleiben erhalten, weitere Einträge lassen sich offline speichern.
- Karren ist sichtbar experimentell. Jahr bleibt eine Eingabe/Vorbelegung; unbekannte Produkte werden ausdrücklich unsicher dargestellt.

## Offen am physischen iPhone

WebKit-Emulation ersetzt kein iPhone. Windows-WebKit besitzt keine Canvas-Medienstreams, deshalb sind dort zwei Streamtests übersprungen. Playwright-WebKit meldet unter Windows und Linux beim vollständigen Offline-Neuladen mit Service Worker einen internen Navigationsfehler; dieser eine Test ist für WebKit übersprungen und läuft vollständig in Chromium. Alle übrigen Tests bleiben verpflichtend.

Am Gerät noch prüfen:

1. App in Safari öffnen, Kamera starten, Berechtigung erlauben; Papierbarcode bei normalem Licht fokussieren und lesen.
2. Typ und Datum prüfen, speichern, denselben Barcode erneut scannen: „Bereits erfasst“, Zähler unverändert.
3. Safari-Teilen-Menü → Zum Home-Bildschirm; nach vollständigem Erstladen im Flugmodus öffnen.
4. CSV einmal am iPhone exportieren und sichern. Bei Excel-Import Barcode-Spalte als Text behandeln.

Alle Testeinträge wurden in isolierten Testbrowsern gespeichert, nicht in der Sammlung des Benutzers. Keine Ticketdaten werden an GitHub oder einen Anwendungsserver gesendet.

## Nachtrag: Kameraberechtigung

App-Stand af849fcdd7ec81d342a4c8e201ae1407b1e33870, veröffentlicht am 15.10.2026.

- Die Kamera wird direkt im Klickhandler per getUserMedia angefragt, Audio bleibt aus. Der Scanner verwendet erst danach den freigegebenen Stream.
- Bei verweigerter Berechtigung erscheinen Chrome-/Edge- und Safari-Hinweise sowie eine Schaltfläche für eine neue Anfrage. Eine dauerhaft gespeicherte Browser-Sperre muss der Benutzer selbst zurücksetzen.
- Verspätet erteilte Berechtigung nach Abbrechen gibt den erhaltenen Stream wieder frei.
- JavaScript und CSS verwenden versionierte URLs; der neue Service Worker wird ohne Cache-Verzögerung aktualisiert.
- Lokal: 21 Browserprüfungen bestanden, 3 WebKit-Einschränkungen übersprungen.
- Linux-CI: 23 Browserprüfungen und 7 Logiktests bestanden, 1 WebKit-Offline-Test übersprungen.
- Nach Veröffentlichung: 9 gezielte Kamera-/Berechtigungs-/Offline-Prüfungen bestanden, 3 WebKit-Einschränkungen übersprungen.
- Berechtigungsfehler und Anfragen werden automatisiert simuliert; ein echter iPhone-Berechtigungsdialog bleibt ein Gerätetest.

[Erfolgreicher Test- und Deployment-Lauf](https://github.com/LutzWellensiek/barcode-aktivitaeten/actions/runs/38721864745)

## Draußen / Google-Sheets-Integration, 15.10.2026

Stand 482b556. Der bisherige Apps-Script-Link wurde als bestehende Bereitstellung auf Version 29 aktualisiert. Der App-Name lautet Draußen. Neue Druckbuchungen und der Druck-Erfolg sind entfernt; historische Daten bleiben lesbar.

- Gemeinsame Bestandsdaten nach Bereitstellung in der echten Google-App geprüft: Anzahl, Gesamtersparnis und alle vier Aktivitätszähler stimmen mit dem vor der Umstellung erfassten Stand überein. Keine Testbuchungen oder Testlöschungen in der echten Tabelle vorgenommen.
- Scannerfenster aus der echten Google-App geöffnet; manueller Testbarcode kam zur Prüfung zurück. Prüfung verworfen, Zähler unverändert. Die Kamera läuft in einem eigenen HTTPS-Fenster, weil Googles eingebettete Oberfläche keinen Kamerazugriff freigibt.
- 18 Logik- und Backendprüfungen bestanden; erfolgreiche Linux-CI samt Veröffentlichung. Getestet werden unter anderem eindeutige Barcodes, wiederholte Schreibanfragen, bestehende Tabellenzeilen und Gruppeneinstellungen.
- Nach Veröffentlichung: 35 Browserprüfungen bestanden, 3 bekannte Windows-WebKit-Einschränkungen übersprungen. Enthalten sind doppelte Eingaben über zwei Tabs, lokale Migration, native Google-RPC-Anbindung mit Testdaten, blockierter Browserspeicher im Google-Modus und Scanner-Rückgabe.
- Darstellung bei 320, 390, 768 und 1280 Pixel geprüft: kein seitliches Überlaufen, keine JavaScript-Fehler.
- Die frühere Aussage über rein lokale Daten gilt für den lokalen PWA-Modus. Im gemeinsamen Google-Modus werden Einträge ausdrücklich im vorhandenen Google Sheet gespeichert. Gruppenschreibvorgänge benötigen eine Verbindung; Rangliste, Erfolge, Dorf, Abstimmungen und Verlauf nutzen diesen Gruppenstand.
- Physische iPhone-Kamera, tatsächlicher Safari-Berechtigungsdialog und Fokus auf gedruckten Tickets bleiben Gerätetests. Automatisierte Kamera- und Berechtigungstests verwenden simulierte Streams und isolierte Daten.

[Erfolgreiche CI und Veröffentlichung der integrierten App](https://github.com/LutzWellensiek/barcode-aktivitaeten/actions/runs/38728059388)
