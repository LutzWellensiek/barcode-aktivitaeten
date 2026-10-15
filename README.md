# Draußen · Freebie Tracker

Die Funktionen der bisherigen Google-Sheets-App im neuen Draußen-Design, ergänzt um I25-Barcodescanner, Duplikatsperre, lokale PWA und CSV.

## Enthalten

- Name auf dem Gerät merken; Datum beim Öffnen, Zurückkehren und Tageswechsel auf heute setzen. Bekannte Personen auswählen; Besuchsdatum bei Tickets prüfen.
- Karren 16,50 €, Stadtbad 9,40 €, Freibier 4,50 €, Apfel 0,45 € als Schnellbuchung; eigene Ersparnis mit Beschreibung und Betrag.
- I25 über Kamera, Foto oder Eingabe. Karren experimentell; Stadtbad wahrscheinlich mit Mod10. Barcode stets eindeutig, manuelle Schnellbuchungen separat mehrfach möglich.
- Gemeinsame und persönliche Ersparnis, sieben Kategorien inklusive alter Archivdaten, Rangliste, Personen-Details, Überholhinweis, 1.000-€-Meilensteine.
- Zwölf Erfolge inklusive Secret/Legende. Spardorf und Feature-Abstimmungen sind aus der Oberfläche entfernt; frühere Daten bleiben unberührt.
- Kumulativer Spar-Verlauf pro Person mit ein-/ausblendbaren Linien, zugänglicher Datentabelle und großer Ansicht mit Pinch-Zoom, Mausrad-Zoom und verschiebbarer Grafik.
- Kompakter einklappbarer Ticketscanner, Rangliste direkt nach der Eingabe. Einklappbarer Verlauf ganz unten mit Such-/Personen-/Typfilter; Historie in Zehnerschritten, CSV aller Einträge, Einzel-Löschen und bestätigter Reset.
- Neue Druckaufträge und Druck-Erfolg sind auf Wunsch entfernt. Vorhandene Druckwerte bleiben in Historie und Gesamtersparnis erhalten.

## Bestehender App-Link und Google Sheets

Die vorhandene Apps-Script-Bereitstellung wird aktualisiert, keine neue Bereitstellung mit neuer URL angelegt. Das bestehende Blatt **Fahrten** und seine ersten vier Spalten bleiben erhalten, einschließlich deutscher Überschriften. Spalten E:H ergänzen stabile IDs, Barcode als Text, Aktivitätsdatum und Decodierung. Belegte fremde Zusatzspalten werden nicht überschrieben. Vorhandene Abstimmungs- und Dorf-Daten bleiben gespeichert, werden in der Oberfläche jedoch nicht mehr angeboten.

**apps-script/Code.gs** ist der fertige Backendcode, generiert aus dem gemeinsamen geprüften Datenmodell. **apps-script/Index.html** ist die kleine Oberfläche der bestehenden Google-App: Sie lädt HTML/CSS/JavaScript aus derselben GitHub-Pages-App und verwendet in Google automatisch google.script.run. Konten und Zugriffseinstellungen der vorhandenen Bereitstellung bleiben erhalten.

Wichtig beim Aktualisieren: Bereitstellen → Bereitstellungen verwalten → vorhandene aktive Bereitstellung bearbeiten → neue Version wählen → Bereitstellen. **Nicht „Neue Bereitstellung“ verwenden**, wenn die bisherige URL bleiben soll. Die vorherige Version kann über die Versionsauswahl wiederhergestellt werden.

Google sperrt Kamera im äußeren Apps-Script-Rahmen. Der Kameraknopf öffnet daher ein separates Scannerfenster auf GitHub Pages. Dieses gibt ausschließlich den Barcode mit einer einmaligen Sitzungskennung per postMessage an die ursprüngliche App zurück. Herkunft und Kennung werden geprüft. Erst dort werden Person, Datum und Betrag bestätigt und in Sheets gespeichert. Die Google-App-Adresse bleibt bestehen. Bei Popup-Sperre gibt es einen sichtbaren Scanner-Link; Foto und manuelle Eingabe bleiben direkt nutzbar.

Für Google-Datenzugriff sind nur die bereits genutzten Tabellenrechte erforderlich; die statischen Dateien werden vom Browser geladen, nicht über zusätzliche UrlFetch-Berechtigungen.

## GitHub Pages und lokaler Modus

[Statische App](https://lutzwellensiek.github.io/barcode-aktivitaeten/) · [Repository](https://github.com/LutzWellensiek/barcode-aktivitaeten)

Außerhalb der Google-App arbeitet die PWA standardmäßig lokal. IndexedDB-Version 2 übernimmt vorhandene Barcode-Einträge verlustfrei. Bislang namenlose Einträge bleiben ausdrücklich unzugeordnet und können einer Person zugeordnet werden. Die Standardwerte für Karren/Stadtbad werden ergänzt. Daten eines Geräts werden nicht automatisch in die gemeinsame Gruppe hochgeladen.

Optional kann eine externe Gruppenverbindung eingerichtet werden. Diese ist im Backend standardmäßig deaktiviert. Dazu muss der Betreiber in den Skripteigenschaften GROUP_ACCESS_KEY (mindestens 16 zufällige Zeichen) und gegebenenfalls ALLOWED_ORIGINS konfigurieren. Der Benutzer trägt Web-App-Adresse und Schlüssel in der PWA unter „Gemeinsame Gruppe & Verbindung“ ein. Der Schlüssel wird lokal auf dem Gerät gespeichert und nur im POST-Body an das gewählte Google-Endpoint gesendet; keine Zugangsdaten im Repository oder URL. Ohne Antwort wird ein Fehler angezeigt. Ein zuletzt geladener Gruppenstand ist lokal zwischengespeichert; Änderungen an der Gruppe benötigen Internet. Die bestehende Google-App benötigt diesen zusätzlichen Schlüssel nicht.

Namen sind Zuordnungen innerhalb einer vertrauensvollen Gruppe, keine persönlichen Benutzerkonten. Wie bisher kann jemand einen anderen Namen eingeben. Im Gruppenmodus werden in der Oberfläche nur Einträge des ausgewählten Namens gelöscht und ein Reset betrifft nur diesen Namen. Lokaler Reset leert die lokale Sammlung.

## Kamera, Datenschutz und Export

Beim Antippen wird die Kamera direkt per getUserMedia angefragt, ohne Audio. Eine dauerhaft gespeicherte Sperre muss im Browser auf Fragen/Zulassen geändert werden; die App kann sie nicht umgehen. HTTPS ist erforderlich, localhost ist zum Entwickeln zulässig. Kamera stoppt nach erfolgreichem Scan sowie beim Verlassen der Seite; zwei gleiche Lesungen bestätigen einen Kamerascan.

Fotos und Kamerabilder werden auf dem Gerät verarbeitet. Gespeichert werden Aktivitäten, Werte, Namen und gegebenenfalls der Barcode; keine Bilder. Keine Telemetrie oder externen Fonts. CSV ist UTF-8 mit BOM und Semikolon. Die Barcode-Spalte beim Excel-Import als Text behandeln, damit lange Zahlen und führende Nullen unverändert bleiben. Namen/Beschreibungen werden vor Tabellen-/CSV-Formelinjektion geschützt.

Die Barcode-Erkennung ist keine offizielle Spezifikation oder Gültigkeitsprüfung: Stadtbad = 22 Ziffern mit Mod10; Karren = experimentelle 80-Bit-Aufteilung 9/7/40/14/10. Tag = oberste 9 Bit minus 210; Monat = (nächste 7 Bit + 9)/8. Bekannte Produkte 292A8BA1F7 und 1FAAABA1F7. Jahr und letzte zehn Bit unbekannt. Datum stets prüfen.

## Entwicklung und Tests

Node.js 24 empfohlen.

    npm ci
    npm test
    npm run build
    npm start

Dann http://127.0.0.1:4173 öffnen. Build erzeugt dist/ sowie apps-script/Code.gs. Versionierte Assets und Service Worker verhindern alte Cache-Versionen. PWA auf iPhone in Safari über Teilen → Zum Home-Bildschirm installieren.

    npx playwright install chromium webkit
    npm run test:e2e

Die Browserprüfungen laufen mit Chromium-Mobilprofil und WebKit-iPhone-Profil. Windows-WebKit besitzt keine Canvas-Kamerastreams; Playwright-WebKit scheitert bei Offline-Neuladen mit Service Worker. Diese jeweiligen Tests sind ausdrücklich übersprungen, Chromium prüft die Pfade. Ein physischer iPhone-Test bleibt erforderlich. Echte Gruppendaten werden nicht für automatisierte Testbuchungen verwendet.

Struktur: src/core.js (Barcode), freebies.js (Preise/Erfolge/Statistik), db.js (atomare lokale Speicherung/Migration), store.js + group-bridge.js (gemeinsame Daten), camera-ui.js (Kamera und Rückgabe), dashboard.js (Gruppenansichten), app.js (Ablauf), apps-script/ (Google-Anbindung), tests/ (Kernlogik, simuliertes Backend, Browser).

[Google: HTML-Service und Serverkommunikation](https://developers.google.com/apps-script/guides/html/communication) · [Google: Web-Apps](https://developers.google.com/apps-script/guides/web) · [ZXing](https://github.com/zxing-js/browser). Lizenzen siehe THIRD_PARTY_NOTICES.md und dist/licenses/.
