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
