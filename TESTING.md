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

## Vereinfachte Oberfläche, 15.10.2026

- Verbindungsstatus aus der Kopfzeile entfernt. Name wird in localStorage und zusätzlich in IndexedDB gespeichert; Datum wird beim Öffnen, Zurückkehren und Tageswechsel auf heute gesetzt. Das Besuchsdatum eines gescannten Tickets bleibt prüfbar.
- Ticketscanner zunächst kompakt/eingeklappt. Verlauf steht ganz unten und ist zunächst geschlossen. Beim Tippen außerhalb klappen ungenutzte Bereiche zu; eine laufende Ticketprüfung bleibt offen. Kamera stoppt beim Einklappen.
- Rangliste folgt unmittelbar auf die Eingabe. Spardorf und Feature-Abstimmungen sind aus der Oberfläche entfernt; bestehende Daten werden nicht gelöscht.
- Große Diagrammansicht: responsives Diagramm, Zwei-Finger-Zoom, Verschieben, Zoomknöpfe und Zurücksetzen, Mausrad und Tastatur. Personen lassen sich auch in der großen Ansicht ein-/ausblenden.
- Lokal: 43 Browserprüfungen bestanden, 3 bekannte Windows-WebKit-Einschränkungen übersprungen. Namens-Rückkehr, Ausweichspeicher, Mitternacht, Einklappen und Diagrammgesten sind in Chromium und WebKit geprüft. Synthetische Touch-Pointer prüfen die Pinch-Handler; echte Papierkamera und physisches iPhone bleiben Gerätetests.
- Bei 320 / 390 / 768 / 1280 Pixel: kein seitliches Überlaufen, keine JavaScript-Fehler, große Diagrammansicht ohne verdeckte Bedienelemente. Visuelle Prüfung mit isolierten Beispieldaten.

Abschlussstand 78e215d: Linux-CI erfolgreich mit 18 Logik-/Backendprüfungen und 45 Browserprüfungen, 1 bekannte WebKit-Offline-Einschränkung übersprungen. Nach Veröffentlichung sind alle 10 neuen Oberflächen-/Namens-/Datums-/Diagramm-/Scanner-Prüfungen auf der öffentlichen Seite bestanden; nach einer Korrektur der Safari-Fehlerweitergabe zusätzlich 4 wiederholte tabübergreifende Duplikatprüfungen bestanden. Lokal wurde dieser Duplikatfall zuvor 10-mal erfolgreich wiederholt. Der Barcode bleibt durch den eindeutigen Datenbankindex einmalig; der ConstraintError wird nun erst beim endgültigen Transaktionsabbruch weitergereicht, damit auch Safari die Meldung und Zähler korrekt aktualisiert.

In der echten Google-App unter unverändertem Link geprüft: Name nach Neuladen erhalten, heutiges Datum, Kopfzeile ohne Verbindungsanzeige, beide Bereiche zunächst geschlossen, automatisches Zuklappen beim Wechsel zur Eingabe, entfernte Dorf-/Abstimmungsbereiche und große Diagrammansicht samt Vergrößern/Schließen/erneutem Antippen. Keine Testbuchungen oder Löschungen in der Gruppentabelle. Zusätzlicher Chromium-Touchtest mit zwei tatsächlichen Browser-Touchpunkten: 300-%-Zoom, keine JavaScript-Fehler. Darstellung auch bei 320×568, 844×390 und 1280×390 ohne Überlauf oder abgeschnittene Bedienelemente geprüft. Ein physischer iPhone-Test bleibt weiterhin offen.

[Erfolgreiche endgültige Veröffentlichung](https://github.com/LutzWellensiek/barcode-aktivitaeten/actions/runs/38731849406)

## Persönliche Zähler und vereinfachte Navigation, 16.10.2026

- Obere vier Zähler zeigen ausschließlich die gewählte Person; leerer oder unbekannter Name ergibt null. Zuordnung ignoriert Groß-/Kleinschreibung und äußere Leerzeichen. Unter dem gemeinsamen Sparziel stehen die vier Gruppenzähler einschließlich aktuellem Monat.
- Logo ist eine Schaltfläche zum Scrollen an den Anfang. Dadurch kann Googles base target=_top keine interne Rahmenadresse mehr als ganze Seite öffnen. Die drei Sprunglinks sind entfernt.
- Personen-Kurztext neben dem gemeinsamen Betrag sowie Verbindungs- und Info-Aufklappbereiche entfernt. Native Google-Verbindung bleibt automatisch; bereits eingerichtete externe Verbindungen bleiben intern nutzbar.
- Datum und Namensfeld haben gleiche Höhe und begrenzte Breite. Bis 400 px stehen beide untereinander; WebKit-Datumsunterelemente sind links ausgerichtet.
- Lokal: 18 Logik-/Backendprüfungen und 49 Browserprüfungen bestanden, 3 bekannte Windows-WebKit-Einschränkungen übersprungen. Neue Fälle: persönliche und gemeinsame Zähler bei Personen-/Monatswechsel, leere Namen, Logo im simulierten Google-Basiskontext sowie Datumsbreiten bei 320/375/390/430/768 px.
- Visuelle Prüfung in Chromium und WebKit bei 320/375/390/430/768/1280 px: kein seitliches Überlaufen und keine JavaScript-Fehler, persönliche und gemeinsame Beispielzähler korrekt getrennt. Ein physisches iPhone wurde nicht verwendet.

Nach der Live-Prüfung: Gleichbleibende Daten führen beim Fensterfokus nicht mehr zu einem Neuaufbau der Rangliste. Das Datum setzt sich bei Rückkehr weiterhin auf heute, rendert bei bereits aktuellem Datum aber nicht erneut. So bleiben angeklickte Elemente erhalten. Dazu 10 gezielte Chromium-/WebKit-Prüfungen für Rückkehr, Datum, neue Zähler, Logo und Feldmaße bestanden. Die sechs neuen Oberflächenprüfungen waren zuvor auch nach Veröffentlichung erfolgreich. In der echten Google-App wurde der persönliche Zählerstand mit den Personen-Details abgeglichen; der Logo-Klick lässt die bestehende App-URL unverändert.

Endstand fe1c022: Veröffentlichung erfolgreich, 18 Logik-/Backendprüfungen und 53 Browserprüfungen bestanden, 1 bekannter WebKit-Offline-Test übersprungen. Nach Veröffentlichung sind 6 gezielte Zähler-/Logo-/Datumsprüfungen und 2 Prüfungen der stabilen Rückkehr bestanden. In der echten Google-App: Logo-Klick bleibt unter derselben URL, der erste Klick auf Personen-Details funktioniert, obere Zahlen entsprechen den Details der ausgewählten Person, die Gruppenzähler bleiben separat korrekt. Beide Eingabefelder messen 48 px Höhe; entfernte Bereiche sind nicht mehr im Dokument vorhanden. Keine Testbuchungen oder Löschungen in der Gruppentabelle vorgenommen.

[Erfolgreiche Veröffentlichung der persönlichen Zähler und vereinfachten Oberfläche](https://github.com/LutzWellensiek/barcode-aktivitaeten/actions/runs/38860215930)

## Kompakter Einstieg, 16.10.2026

Dein Freebie Tracker steht klein rechts neben dem Logo. Großer Einleitungstext, die beiden Überschriften vor den Schnellbuchungen und der Google-Sheets-Hinweis in der Rangliste sind entfernt. Die Eingabe beginnt in den geprüften Handybreiten bereits 91 px unter dem oberen Seitenrand. Sechs bestehende Bedien-/Datums-/Zählerprüfungen bestanden. Darstellung bei 320/390/430/1280 px in Chromium und WebKit geprüft: kein Überlaufen, keine JavaScript-Fehler. Keine Änderungen an Gruppendaten oder bestehender Bereitstellungsadresse.

Veröffentlichung 2ff3614 erfolgreich. Nach Veröffentlichung in der echten Google-App geprüft: Tracker-Beschriftung in der Kopfzeile, alle genannten Textbereiche entfernt, Eingabe direkt unter dem Kopfbereich, gespeicherter Name und vorhandene Gruppendaten geladen. [Erfolgreicher Test- und Deployment-Lauf](https://github.com/LutzWellensiek/barcode-aktivitaeten/actions/runs/38861093497).

## Namensbezogene Farbstile, 16.10.2026

Einstellungsrad rechts oben mit Wald & Salbei, Lavendel, Ozean, Abendrot, Rosenquarz und Mitternacht. Vollständige Paletten für Flächen, Text, Eingaben, Zähler, Buttons und Diagramme. Gemeinsam gespart steht als erster sichtbarer Bereich unter der Kopfzeile. Auswahl ist an den normalisierten Namen gebunden: im lokalen Modus IndexedDB plus Browsercache; in der Google-App gemeinsame Skripteigenschaft APP_THEMES über die bestehende Anbindung. Aktivitäten und Tabellenwerte bleiben davon getrennt. Ohne Namen kann nicht gespeichert werden; bei fehlgeschlagener Speicherung bleibt der bisherige Stil aktiv. Für Änderungen im Gruppenmodus ist eine Verbindung nötig.

20 Logik-/Backendprüfungen bestanden, einschließlich erlaubter Stile, normalisierter Namen, unveränderter Aktivitätsdaten und lesbarer Text-/Buttonkontraste. Lokal 59 Browserprüfungen bestanden, 3 bekannte Windows-WebKit-Einschränkungen übersprungen. Neue Fälle: Auswahl pro Person, Neuladen, Namenswechsel, zweites unabhängiges Testgerät, blockierter Speicher im Google-Rahmen, fehlgeschlagene Speicherung und Diagramme im dunklen Stil. Alle sechs Paletten bei 320/390/1280 px in Chromium und WebKit visuell geprüft, ohne seitliches Überlaufen oder JavaScript-Fehler; Einstellungsfenster auch bei 320×568 px erreichbar.

Veröffentlichung de569e6 erfolgreich. Die bestehende Google-Bereitstellung wurde ohne Änderung der URL oder Berechtigungen auf Version 30 aktualisiert. In der echten App wurde Lavendel für den bereits gewählten Namen gespeichert und nach Neuladen als ausgewählter Stil wiederhergestellt; die Oberfläche einschließlich Google-Rahmen zeigt die lila Palette. Gemeinsam gespart ist der erste sichtbare Inhaltsbereich. Keine Testbuchungen oder Löschungen in den Gruppendaten vorgenommen.

Nach Veröffentlichung sind alle acht neuen Farbstil-Prüfungen in mobilem Chromium und iPhone-WebKit bestanden. Mobile Vorschau mit isolierten Beispieldaten erneut aufgenommen. Ein physisches iPhone wurde nicht verwendet; die Geräteprüfung bleibt ein manueller Test.

[Erfolgreicher Test- und Veröffentlichungsablauf](https://github.com/LutzWellensiek/barcode-aktivitaeten/actions/runs/38881606981)


## Soundeffekte, 16.10.2026

Eigene, kurze Web-Audio-Klänge für die vier Schnellbuchungen, erfolgreiche Speicherung, Scan, Duplikate, Fehler, Öffnen/Schließen und weitere Buttons. Buchungstöne werden erst nach erfolgreicher Speicherung abgespielt. Audio wird im direkten Benutzerklick freigeschaltet und beim Verlassen/Verbergen pausiert; keine automatische Wiedergabe beim Laden. Stummschaltung stoppt laufende und geplante Töne. Fehlende oder blockierte Audioausgabe beeinträchtigt Buchungen nicht. An/Aus wird pro normalisiertem Namen lokal gespeichert bzw. in der Google-App über APP_SOUNDS gemeinsam gespeichert; Farbstile und Aktivitätsdaten bleiben getrennt.

21 Logik-/Backendprüfungen und lokal 68 Browserprüfungen bestanden. Vier Windows-WebKit-Einschränkungen übersprungen: drei bereits bekannte Kamera-/Offline-Fälle und die dort vollständig fehlende Web-Audio-API. Die Ton-Auswahl, Namenswechsel, Neuladen, zweite unabhängige Browser-Sitzung, fehlgeschlagene Speicherung und fehlende Audioausgabe werden in beiden Browsern geprüft. Chromium prüft tatsächlich gestartete Web-Audio-Oszillatoren, unterschiedliche Aktivitätsklänge, keine Audioinitialisierung ohne Berührung, stumme Buchungen und Fehlerklang statt falschem Buchungserfolg. Mobile Darstellung bei 320×568, 390×844 und 1280×844 in Chromium und WebKit ohne Überlauf oder JavaScript-Fehler geprüft; Toneinstellungen und alle Paletten bleiben erreichbar. Ein physisches iPhone wurde nicht verwendet.

Veröffentlichung ae6a669 erfolgreich. Die bestehende Google-Bereitstellung wurde mit unveränderter URL und unveränderten Zugriffsrechten auf Version 31 aktualisiert. In der echten App: vier Hörproben geöffnet, Ton für den ausgewählten Namen ausgeschaltet, nach Neuladen weiterhin aus, anschließend wieder eingeschaltet und erfolgreich gespeichert. Der aktuelle Farbstil blieb erhalten. Keine Testbuchungen oder Löschungen in der gemeinsamen Tabelle vorgenommen.

Nach Veröffentlichung: neun gezielte Sound-Browserprüfungen bestanden; die tatsächlich fehlende Audio-API des Windows-WebKit-Testbrowsers bleibt explizit übersprungen. Die veröffentlichte Darstellung wurde erneut bei 320/390/1280 px in beiden Browsern geprüft, ohne Überlauf oder JavaScript-Fehler.

[Erfolgreiche Tests und Veröffentlichung der Soundeffekte](https://github.com/LutzWellensiek/barcode-aktivitaeten/actions/runs/38886596345)


## Zahnrad, Datum und Home-Bildschirm-Name, 16.10.2026

Symmetrisches eigenes Zahnrad ohne einseitige Transformation; Kreis und Zahnkontur haben dieselbe Mitte. Datum und Kalendersymbol sind in einer gemeinsamen 48-px-Einfassung mittig ausgerichtet, während der native Date-Input und der Systemkalender zugänglich bleiben. Beide Datumsfelder aktualisieren die sichtbare deutsche Datumsanzeige bei Auswahl, Ticketprüfung und Tageswechsel.

Zusätzliche Wiederherstellung des Namens aus einem persönlichen URL-Fragment über Googles offizielle History-/URL-API. Name bleibt lokal bevorzugt; verspätete Antworten dürfen aktuelle Eingaben einschließlich bewussten Leerens nicht überschreiben. Change/Blur lösen bei bereits verarbeiteter Eingabe keinen weiteren Aufbau der Rangliste aus. In Einstellungen ist der persönliche Startlink mit Öffnen/Kopieren und manueller Ausweichanzeige verfügbar. Bei bestehendem Home-Bildschirm-Symbol mit namenloser Startadresse ist einmalige Neuanlage durch den Nutzer erforderlich. Ohne Speicher und ohne persönlichen Startlink ist eine automatische Gerätezuordnung nicht möglich; Sensoren/Fingerprinting werden nicht verwendet.

Lokal 76 Browserprüfungen bestanden, vier bekannte Windows-WebKit-Einschränkungen übersprungen. Neue Fälle in beiden Browsern: vollständig gesperrter Browser-Speicher, neue unabhängige Sitzung mit persönlichem Startlink, Vorrang des vorhandenen Gerätenamens, verspätete URL-Antwort, bewusstes Leeren sowie SVG-Mittelpunkte und Feldausrichtung bei 320/375/390/430/768/1280 px. Bisherige Namens-, Tageswechsel-, Schnellbuchungs- und Fokusprüfungen bleiben erfolgreich. Ein physisches iPhone/Home-Bildschirm-Symbol ist kein automatisierter Gerätetest.
