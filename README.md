# Unterwegs · Ticket-Tagebuch

Mobile, vollständig statische PWA zum Scannen und lokalen Loggen von Karren- und Stadtbad-Tickets. Deutsche Oberfläche, keine Anmeldung, kein Backend, keine Telemetrie. Kamera und Bilder werden ausschließlich im Browser verarbeitet.

**App:** https://lutzwellensiek.github.io/barcode-aktivitaeten/ · **Repository:** https://github.com/LutzWellensiek/barcode-aktivitaeten

## Verwenden

1. Die GitHub-Pages-Adresse in Safari auf dem iPhone öffnen.
2. **Kamera starten**, Zugriff erlauben und den vollständigen I25-Barcode waagerecht mit etwas weißem Rand erfassen. Zwei gleiche Lesungen öffnen die Prüfung. Alternativ Ticketfoto wählen oder die Ziffern inklusive führender Nullen eingeben.
3. Erkennung und Besuchsdatum prüfen, gegebenenfalls Aktivität ändern, anschließend **Besuch speichern**.
4. Optional Safari → Teilen → **Zum Home-Bildschirm**. Die App ist nach vollständigem Erstladen offline verfügbar. Bei neuen Versionen alle App-Tabs schließen und erneut öffnen.

Beim Antippen von **Kamera starten** fordert die App unmittelbar per `getUserMedia` die Kameraberechtigung an; Audio bleibt ausgeschaltet. Bei Ablehnung erscheint eine Anleitung für Chrome/Edge und Safari sowie **Kameraberechtigung erneut anfragen**. Bereits dauerhaft verweigerte Berechtigungen muss der Benutzer selbst in den Browser-Einstellungen auf Fragen/Zulassen ändern; die App darf diese Sperre nicht umgehen.

Die Kamera benötigt HTTPS; `http://localhost` ist für lokale Entwicklung ebenfalls zulässig. Eine HTTP-LAN-Adresse auf dem iPhone ist kein Ersatz für HTTPS. Die Rückkamera wird bevorzugt, Kamera läuft nur nach bewusstem Start und stoppt beim Verlassen der Seite. Bei verweigerter Berechtigung Safari-Seitenmenü → Website-Einstellungen → Kamera erlauben; die genaue Bezeichnung hängt von der iOS-Version ab.

## Daten und Zählung

- IndexedDB-Datenbank `barcode-aktivitaeten`, Store `entries`, **Barcode als eindeutiger Primärschlüssel**. `add`, kein überschreibendes `put`: Auch konkurrierende Tabs können kein Duplikat erzeugen. Erfolgreich gespeichert wird erst nach abgeschlossener Transaktion gemeldet.
- Es werden **eindeutige Tickets** gezählt. Zwei verschiedene Tickets am selben Tag zählen zweimal. Nach bewusstem Löschen darf ein Barcode erneut gespeichert werden.
- Gespeichert: exakte Barcode-Zeichenfolge, Besuchsdatum, ausgewählter Typ, Scanzeit, Erkennungsdetails, manuelle oder vorgeschlagene Zuordnung.
- Filter, Suche, Statistik für Gesamt/Karren/Stadtbad/aktuellen Monat, CSV aller Einträge, Einzel-Löschen und Reset mit ausdrücklichem Bestätigungsdialog.
- Daten bleiben pro Browser und Website auf dem Gerät. Browserdaten löschen, Privatmodus oder Speicherbereinigung können Daten entfernen. Keine Synchronisierung und kein automatisches Backup; regelmäßig CSV exportieren. Safari und Home-Bildschirm-App können getrennte Speicher nutzen. Die App besitzt aktuell keinen CSV-Import.
- CSV: UTF-8 mit BOM, Semikolon, ISO-Datum, sämtliche Barcode-Ziffern unverändert. In Excel die Barcode-Spalte beim **Import als Text** behandeln, sonst gehen bei langen Zahlen Genauigkeit/führende Nullen verloren.
- GitHub liefert nur die statische App aus und erhält dabei die üblichen Webanfragen; Ticketdaten, Fotos und Kamerabilder werden nicht übertragen. Keine externen Fonts/CDNs zur Laufzeit.

## Experimentelle Formaterkennung

Die Regeln stammen aus dem bereitgestellten Reverse-Engineering-Chat. Sie sind keine offizielle Spezifikation und keine Ticket-Gültigkeitsprüfung.

### Stadtbad

Genau 22 Dezimalziffern mit gültiger Modulo-10-Prüfziffer: 21 Nutzstellen, Gewichtung von rechts beginnend mit 3, dann 1, wiederholt. Dies bedeutet **wahrscheinlich Stadtbad**, nicht nachgewiesene Herkunft. Das Besuchsdatum ist nicht decodiert und wird mit dem heutigen lokalen Datum vorbelegt.

### Karren

Genau 24 Dezimalziffern als `BigInt`, kleiner als 2^80:

```
9 Bit Tag | 7 Bit Monat | 40 Bit Produkt | 14 Bit Serie | 10 Bit Zusatz
Tag   = ((n >> 71) & 0x1ff) - 210
Monat = (((n >> 64) & 0x7f) + 9) / 8
Produkt = (n >> 24) & ((1 << 40) - 1)
Serie   = (n >> 10) & 0x3fff
Zusatz  = n & 0x3ff
```

Tag und Monat müssen ganzzahlig sein und ein gültiges Kalenderdatum ergeben. Bisher bekannte Produktblöcke: `0x292A8BA1F7` (Berg- & Talfahrt) und `0x1FAAABA1F7` (Abend). Bei unbekannter Produktkennung wird die zusätzliche Unsicherheit angezeigt. Beobachteter Zusammenhang der Serie: `(BSNR-Endnummer & 0x3fff) XOR 0x2000`; daraus lässt sich **nicht** die vollständige aufgedruckte Ticketnummer rekonstruieren.

**Jahr nicht decodiert.** Das aktuelle Jahr wird nur vorgeschlagen und muss beim Speichern geprüft werden. Das Modell wurde vor allem mit September-/Oktober-Beispielen 2026 abgeleitet; insbesondere Monat/Jahreswechsel und weitere Produkte sind nicht bestätigt. Die Bedeutung der letzten 10 Bit ist unbekannt; kein belastbarer Karren-Prüfsummencheck. Frühe Annahmen zum fortlaufenden Tageszähler und konstanten 47-Bit-Block wurden durch die neuere 9/7/40/14/10-Aufteilung ersetzt. Abgeleitete, nicht sicher gelesene Tickets werden nicht als bestätigte Testbeispiele verwendet.

Unpassende Barcodes bleiben unbekannt und können bewusst manuell zugeordnet werden. Karren-Heuristik wird immer als experimentell markiert. Keine Barcode-Erzeugung und keine Prüfung gegen ein Ticketsystem.

## Entwicklung

Node.js **24 oder neuer** empfohlen, passend zur Scannerbibliothek.

```
npm ci
npm test
npm run build
npm start
```

Dann `http://localhost:4173` öffnen. `dist/` enthält die direkt auslieferbare statische App. Alle URLs sind relativ, damit GitHub Pages unter einem Repository-Unterpfad funktioniert.

```
npx playwright install chromium webkit
npm run test:e2e
```

Tests: bekannte Heuristik-Beispiele, Prüfziffern, unplausible Daten, Zifferngenauigkeit, echte I25-Bilddecodierung, Browser-Datenbank und Neuladen, parallele Duplikate, CSV, Filter, Löschen/Reset, Offline-Neuladen, mobile Breite, simulierte Kamera-Berechtigung und Track-Freigabe. Chromium-Mobilprofil sowie WebKit-iPhone-Profil. `BASE_URL=https://…/` führt dieselben Tests gegen das Deployment aus, in isolierten Testbrowsern.

WebKit-Emulation ersetzt **keinen physischen iPhone-Test**: reale Safari-Berechtigungsdialoge, Autofokus, Papierqualität, Reflexionen und die Home-Bildschirm-Installation bleiben am Gerät zu prüfen. Die Kamera-Erfolgs-/Fehlerpfade werden automatisiert mit Test-Medien bzw. simuliertem Berechtigungsfehler geprüft. Windows-WebKit stellt keine Canvas-Kamerastreams bereit. Die Offline-Emulation von Playwright-WebKit scheitert auch unter Linux intern am Neuladen mit Service Worker; diese jeweilige Prüfung wird ausdrücklich übersprungen. Chromium prüft beide Pfade vollständig; die Linux-CI führt die übrigen WebKit-Prüfungen aus, soweit die Testengine die Medienfunktionen unterstützt.

## Struktur

```
src/           App, Formaterkennung, IndexedDB, Scanner
public/        HTML, CSS, Manifest, SVG-Icon
scripts/       Build, PNG-Icons, lokaler statischer Server
tests/         Kernlogik und Browser-Integrationstests
dist/          auslieferbare App inklusive gebündeltem ZXing und Service Worker
.github/       CI: Tests, Build, Chromium/WebKit, GitHub Pages
```

GitHub Pages: Repository → Settings → Pages → Source: **GitHub Actions**. Jeder Push auf `main` testet, baut und veröffentlicht. Die CI nutzt minimale Pages-/OIDC-Rechte und eine Deployment-Umgebung. Der Service Worker speichert nur App-Dateien; Ticketdaten liegen getrennt in IndexedDB.

## Verwendete Quellen

- [ZXing Browser: API und Kamerascanner](https://github.com/zxing-js/browser)
- [ZXing Library: Barcodeformate und ITF](https://github.com/zxing-js/library)
- [MDN: getUserMedia und sichere Kontexte](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia)
- [GitHub: Pages mit einem eigenen Workflow](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages)

ZXing wird unter Apache-2.0 verwendet; Hinweise stehen zusätzlich in `THIRD_PARTY_NOTICES.md` und im Bundle.
