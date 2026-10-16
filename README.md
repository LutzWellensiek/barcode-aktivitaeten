# Draußen · Freebie Tracker

Die Funktionen der bisherigen Google-Sheets-App im neuen Draußen-Design mit vereinfachter Oberfläche, ergänzt um I25-Barcodescanner, Duplikatsperre, lokale PWA und CSV.

## Enthalten

- Zwei Ansichten: bisheriges Draußen und ein Foto-Feed. Schwebende Liquid-Glass-Leiste oder Links-/Rechts-Wischen wechseln die Ansicht; im Feed normal vertikal scrollen, neueste Uploads zuerst. Diagramm-, Formular- und Dialoggesten bleiben separat.
- Nach jeder neuen Buchung freiwillige Fotoabfrage mit nativer Handy-Kamera über Dateiauswahl (capture=environment), Bildauswahl oder Überspringen. Die Buchung ist bereits gespeichert. Fotos können im Verlauf ergänzt werden.
- Ein Foto pro Aktivität mit Person, Aktivitätssymbol und Besuchsdatum. Uploadzeit bestimmt die Reihenfolge. Kleine Vorschaubilder, zehn Einträge pro Seite, Nachladen beim Scrollen, große Bildansicht und bestätigtes Entfernen. Uploadwiederholung zählt keine zweite Aktivität.

- Sechs Farbstile über das Einstellungsrad: Wald & Salbei, Lavendel, Ozean, Abendrot, Rosenquarz und Mitternacht. Pro normalisiertem Namen gespeichert; in der Google-App geräteübergreifend über die bestehende Gruppenanbindung, im lokalen Modus in diesem Browser. Gemeinsam gespart steht direkt unter der Kopfzeile.
- Kurze, eigene Soundeffekte: Gipfel-Arpeggio für Karren, Wassertropfen für Stadtbad, Glas-Anstoßen für Freibier, Plopp für Apfel sowie Scan-, Erfolgs-, Duplikat- und Bedientöne. Im Einstellungsrad anhören oder stummschalten; An/Aus je Namen gespeichert, in der Google-App geräteübergreifend. Erst nach einer Berührung aktiv; Buchungston erst bei erfolgreichem Speichern. Keine Audiodateien, Downloads, Mikrofonrechte oder Hintergrundmusik.
- Name auf dem Gerät merken; Datum beim Öffnen, Zurückkehren und Tageswechsel auf heute setzen. Bekannte Personen auswählen; Besuchsdatum bei Tickets prüfen.
- Karren 16,50 €, Stadtbad 9,40 €, Freibier 4,50 €, Apfel 0,45 € als Schnellbuchung; eigene Ersparnis mit Beschreibung und Betrag.
- I25 über Kamera, Foto oder Eingabe. Karren experimentell; Stadtbad wahrscheinlich mit Mod10. Barcode stets eindeutig, manuelle Schnellbuchungen separat mehrfach möglich.
- Persönliche Aktivitätszähler oben, Gruppenzähler am gemeinsamen Sparziel. Gemeinsame und persönliche Ersparnis, sieben Kategorien inklusive alter Archivdaten, Rangliste, Personen-Details, Überholhinweis, 1.000-€-Meilensteine.
- Zwölf Erfolge inklusive Secret/Legende. Spardorf und Feature-Abstimmungen sind aus der Oberfläche entfernt; frühere Daten bleiben unberührt.
- Kumulativer Spar-Verlauf pro Person mit ein-/ausblendbaren Linien, zugänglicher Datentabelle und großer Ansicht mit Pinch-Zoom, Mausrad-Zoom und verschiebbarer Grafik.
- Kompakter einklappbarer Ticketscanner, Rangliste direkt nach der Eingabe. Einklappbarer Verlauf ganz unten mit Such-/Personen-/Typfilter; Historie in Zehnerschritten, CSV aller Einträge, Einzel-Löschen und bestätigter Reset.
- Neue Druckaufträge und Druck-Erfolg sind auf Wunsch entfernt. Vorhandene Druckwerte bleiben in Historie und Gesamtersparnis erhalten.

## Bestehender App-Link und Google Sheets

Die vorhandene Apps-Script-Bereitstellung wird aktualisiert, keine neue Bereitstellung mit neuer URL angelegt. Das bestehende Blatt **Fahrten** und seine ersten vier Spalten bleiben erhalten, einschließlich deutscher Überschriften. Spalten E:H ergänzen stabile IDs, Barcode als Text, Aktivitätsdatum und Decodierung. Belegte fremde Zusatzspalten werden nicht überschrieben. Vorhandene Abstimmungs- und Dorf-Daten bleiben gespeichert, werden in der Oberfläche jedoch nicht mehr angeboten.

**apps-script/Code.gs** ist der fertige Backendcode, generiert aus dem gemeinsamen geprüften Datenmodell. **apps-script/Index.html** ist die kleine Oberfläche der bestehenden Google-App: Sie lädt HTML/CSS/JavaScript aus derselben GitHub-Pages-App und verwendet in Google automatisch google.script.run. Konten und Zugriffseinstellungen der vorhandenen Bereitstellung bleiben erhalten. Farbstile werden getrennt von Aktivitäten in der Skripteigenschaft APP_THEMES und die Ton-Einstellung in APP_SOUNDS gespeichert. Dafür ist bei dieser Erweiterung auch Code.gs in derselben bestehenden Apps-Script-Bereitstellung zu aktualisieren; reine Oberflächenänderungen benötigen diesen Schritt nicht.

Wichtig beim Aktualisieren: Bereitstellen → Bereitstellungen verwalten → vorhandene aktive Bereitstellung bearbeiten → neue Version wählen → Bereitstellen. **Nicht „Neue Bereitstellung“ verwenden**, wenn die bisherige URL bleiben soll. Die vorherige Version kann über die Versionsauswahl wiederhergestellt werden.

Google sperrt Kamera im äußeren Apps-Script-Rahmen. Der Kameraknopf öffnet daher ein separates Scannerfenster auf GitHub Pages. Dieses gibt ausschließlich den Barcode mit einer einmaligen Sitzungskennung per postMessage an die ursprüngliche App zurück. Herkunft und Kennung werden geprüft. Erst dort werden Person, Datum und Betrag bestätigt und in Sheets gespeichert. Die Google-App-Adresse bleibt bestehen. Bei Popup-Sperre gibt es einen sichtbaren Scanner-Link; Foto und manuelle Eingabe bleiben direkt nutzbar.

Die Oberfläche wird vom Browser geladen. Die Fotoerweiterung benötigt zusätzlich zu den Tabellenrechten Zugriff auf von der App angelegte Drive-Dateien und Serververbindungen zum Abrufen dieser Bilder; siehe Foto-Speicher und Freigabe.

## GitHub Pages und lokaler Modus

[Statische App](https://lutzwellensiek.github.io/barcode-aktivitaeten/) · [Repository](https://github.com/LutzWellensiek/barcode-aktivitaeten)

Außerhalb der Google-App arbeitet die PWA standardmäßig lokal. IndexedDB-Version 3 übernimmt vorhandene Barcode-Einträge verlustfrei. Bislang namenlose Einträge bleiben ausdrücklich unzugeordnet und können einer Person zugeordnet werden. Die Standardwerte für Karren/Stadtbad werden ergänzt. Daten eines Geräts werden nicht automatisch in die gemeinsame Gruppe hochgeladen.

Optional kann eine externe Gruppenverbindung eingerichtet werden. Diese ist im Backend standardmäßig deaktiviert. Dazu muss der Betreiber in den Skripteigenschaften GROUP_ACCESS_KEY (mindestens 16 zufällige Zeichen) und gegebenenfalls ALLOWED_ORIGINS konfigurieren. Die Verbindungsoberfläche wurde auf Wunsch entfernt; die bestehende Google-App verbindet sich weiterhin automatisch. Bereits gespeicherte externe Konfigurationen bleiben nutzbar. Der Schlüssel wird lokal auf dem Gerät gespeichert und nur im POST-Body an das gewählte Google-Endpoint gesendet; keine Zugangsdaten im Repository oder URL. Ohne Antwort wird ein Fehler angezeigt. Ein zuletzt geladener Gruppenstand ist lokal zwischengespeichert; Änderungen an der Gruppe benötigen Internet. Die bestehende Google-App benötigt diesen zusätzlichen Schlüssel nicht.

Namen sind Zuordnungen innerhalb einer vertrauensvollen Gruppe, keine persönlichen Benutzerkonten. Wie bisher kann jemand einen anderen Namen eingeben. Im Gruppenmodus werden in der Oberfläche nur Einträge des ausgewählten Namens gelöscht und ein Reset betrifft nur diesen Namen. Lokaler Reset leert die lokale Sammlung.

## Likes, Kommentare, Downloads und Aktualisieren

Im Foto-Feed lässt sich ein Herz pro normalisiertem Namen setzen und zurücknehmen. Kommentare zeigen Namen und Uhrzeit, sind auf 500 Zeichen begrenzt und werden als reiner Text angezeigt. Eigene Kommentare können nach Bestätigung entfernt werden. Wiederholte Speicherversuche verwenden dieselbe Kommentar-ID und erzeugen keinen zweiten Kommentar. Gemeinsam gespeichert in den separaten Blättern **DraussenLikes** und **DraussenKommentare**; bestehende Finanzdaten werden nicht verändert. Es gelten dieselben freien Namenszuordnungen wie in der restlichen App.

**Foto herunterladen** lädt die gespeicherte große JPG-Version mit lesbarem Dateinamen. Zusätzlich bleibt ein ausdrücklicher **Bild speichern**-Link sichtbar, falls der Browser den automatisch begonnenen Download nicht ausführt. Auf dem iPhone entscheidet Safari über den Download-/Speicherdialog; die Foto-Mediathek wird nicht still beschrieben. Drive-Dateien bleiben privat, der Download erfolgt über dieselbe Foto-Anbindung. Im lokalen Modus bleiben Likes und Kommentare im Browser bei den zugehörigen Fotos; gleichzeitige Aktionen laufen in einer atomaren Transaktion.

Am oberen Rand in Draußen oder Fotos nach unten ziehen und loslassen, um die Gruppenwerte und den aktuell sichtbaren Foto-Feed zu aktualisieren. Kurzes Ziehen, waagerechte Gesten, Scrollen weiter unten, geöffnete Dialoge und Formulare lösen keine Aktualisierung aus. Eingaben bleiben erhalten. Browser-Scrollverkettung wird im eigenen Dokument begrenzt. Ein physisches iPhone und Googles äußerer Rahmen müssen weiterhin am Gerät geprüft werden. Antippen des Logos dreht das Symbol und lässt das Logo kurz wackeln; die bestehende Funktion zum Anfang bleibt erhalten. Bei reduzierter Bewegung entfällt die Animation.

Technische Grundlagen: [Google: erlaubte Downloads im HTML-Service](https://developers.google.com/apps-script/guides/html/restrictions) und [MDN: Scrollverkettung und eingebettete Dokumente](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/overscroll-behavior).

## Foto-Speicher und Freigabe

Im Google-Modus liegen verkleinerte JPG-Dateien samt Vorschau im von der App angelegten Drive-Ordner **Draußen Fotos**. Das neue Blatt **DraussenFotos** enthält nur IDs und Metadaten. Die ersten vier Spalten von Fahrten bleiben unverändert. Bilder werden über die bestehende Apps-Script-Verbindung geladen; keine öffentlichen Drive-Freigabelinks und keine Nutzerdaten im Git-Repository.

Auf ausdrücklichen Wunsch sind Fotos für **jeden mit dem App-Link** sichtbar und hochladbar. Darauf weist die Fotoabfrage vor dem Hochladen hin. Namen sind weiterhin freie Zuordnungen, keine authentifizierten Konten; die Namensprüfung bei Foto-Löschungen ist keine sichere Identitätsprüfung. Drive selbst wird nicht pauschal öffentlich freigegeben. Nur Foto-IDs zu noch vorhandenen Aktivitäten lassen sich über die Foto-API abrufen; beliebige Drive-Datei-IDs werden nicht akzeptiert.

Einrichtung: Code.gs und appsscript.json in derselben bestehenden Bereitstellung aktualisieren. Das Manifest bewahrt Europe/Vienna und die bisherige Zugriffsart und ergänzt den erweiterten Drive-v3-Dienst sowie die Scopes drive.file und script.external_request. Bestehende Tabellenrechte bleiben erforderlich. Die zusätzliche Google-Freigabe muss der Kontoinhaber prüfen und bestätigen. Der Scope drive.file ist auf mit dieser App angelegte/geöffnete Dateien begrenzt; der OAuth-Token bleibt ausschließlich auf dem Server.

Für die einmalige Einrichtung im Editor vorübergehend `function SetupFotos(){return initializePhotoStorage_();}` ergänzen, speichern und **SetupFotos** ausführen: erzeugt den privaten App-Ordner und den Foto-Index und setzt PHOTO_FOLDER_ID sowie PHOTO_ACCESS_MODE=link. Die Funktion ist durch ihren Unterstrich nicht über google.script.run aufrufbar. Analog führt ein vorübergehender Editor-Wrapper `function TestFotos(){return verifyPhotoStorage_();}` den Speichertest aus. **verifyPhotoStorage_** prüft Schreiben/Lesen mit einer privaten temporären Binärdatei und verschiebt sie anschließend in den Papierkorb; dabei entstehen keine Feed-Bilder oder Aktivitätsbuchungen. Beide öffentlichen Editor-Wrapper anschließend wieder entfernen, speichern und erst danach die bestehende Bereitstellung aktualisieren. Sie dürfen nicht in der veröffentlichten Web-App verbleiben.

Fotos werden auf dem Gerät durch Canvas neu als JPG codiert (maximal 1600 px längste Seite, Vorschau 480 px, begrenzte Uploadgröße); ursprüngliche EXIF-Metadaten werden nicht übernommen. Native Datei-Kamera und tatsächlicher iPhone/Home-Bildschirm-Dialog müssen am Gerät geprüft werden. Falls die Kameraauswahl nicht öffnet, bleibt die Bildauswahl verfügbar; eine externe Foto-Kamera wurde in diesem ersten Versuch bewusst noch nicht ergänzt. Der Barcode-Scanner nutzt weiterhin sein separates Fenster.

Foto-Entfernen verschiebt Drive-Dateien samt Vorschau in den Papierkorb und lässt die finanzielle Aktivität erhalten. Beim Löschen einer Aktivität werden zugehörige Fotos ebenfalls entfernt. Fehlgeschlagene Uploads lassen die Buchung bestehen. Ein erneuter erfolgreicher Upload pro Aktivität ist idempotent; teilweise erzeugte Dateien werden bei Fehlern bereinigt. Im lokalen PWA-Modus liegen Bilder getrennt von Metadaten in IndexedDB 3; gemeinsame Foto-Uploads erfolgen dort nur bei einer explizit eingerichteten Gruppenverbindung.

## Name auf dem Home-Bildschirm

Die lokale Namensspeicherung verwendet weiterhin localStorage und IndexedDB. Falls die Google-Einbettung im Home-Bildschirm-Modus beides blockiert, kann die App ohne Gerätekennung keinen Namen aus Sensoren erkennen. Sie sichert den ausgewählten Namen zusätzlich im URL-Fragment der bestehenden Google-App über google.script.history/URL; der bestehende /exec-Endpunkt bleibt gleich. Gespeicherte lokale Namen haben Vorrang vor einem fremden Startlink; eine verspätete Wiederherstellung überschreibt keine neue Eingabe.

Einmal oben den Namen eingeben, dann im Einstellungsrad bei **Name auf diesem Gerät** den **Startlink öffnen**. In Safari über **Teilen → Zum Home-Bildschirm** ein neues Symbol anlegen und das alte ersetzen. Der persönliche Link enthält den gewählten Namen; beim Öffnen wird er auch mit gesperrtem Browserspeicher ausgefüllt. Ein altes Symbol mit der namenlosen Startadresse kann die App nicht automatisch umschreiben. Das Öffnen des allgemeinen Links auf einem Gerät ohne verfügbaren Speicher erfordert weiterhin eine Auswahl. Kein Fingerprinting, keine Sensor- oder neuen Kontoberechtigungen.

[Google: Browserhistorie in HTML-Web-Apps](https://developers.google.com/apps-script/guides/html/reference/history) und [URL-Fragment auslesen](https://developers.google.com/apps-script/guides/html/reference/url). Die Namenskorrektur allein benötigt nur eine neue statische Oberfläche. Die spätere Fotoerweiterung aktualisiert zusätzlich dieselbe Google-Bereitstellung.

## Kamera, Datenschutz und Export

Beim Antippen wird die Kamera direkt per getUserMedia angefragt, ohne Audio. Eine dauerhaft gespeicherte Sperre muss im Browser auf Fragen/Zulassen geändert werden; die App kann sie nicht umgehen. HTTPS ist erforderlich, localhost ist zum Entwickeln zulässig. Kamera stoppt nach erfolgreichem Scan sowie beim Verlassen der Seite; zwei gleiche Lesungen bestätigen einen Kamerascan.

Barcode-Kamerabilder werden nur auf dem Gerät verarbeitet und nicht gespeichert. Freiwillig bestätigte Aktivitätsfotos werden verkleinert und anschließend im gemeinsamen Drive-Speicher beziehungsweise im lokalen PWA-Modus auf diesem Gerät gespeichert. Dazu kommen Aktivitäten, Werte, Namen und gegebenenfalls der Barcode. Keine Telemetrie oder externen Fonts. CSV ist UTF-8 mit BOM und Semikolon. Die Barcode-Spalte beim Excel-Import als Text behandeln, damit lange Zahlen und führende Nullen unverändert bleiben. Namen/Beschreibungen werden vor Tabellen-/CSV-Formelinjektion geschützt.

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

Die Browserprüfungen laufen mit Chromium-Mobilprofil und WebKit-iPhone-Profil. Windows-WebKit besitzt weder Canvas-Kamerastreams noch eine Web-Audio-API; Playwright-WebKit scheitert bei Offline-Neuladen mit Service Worker. Diese jeweiligen Tests sind ausdrücklich übersprungen, Chromium prüft die Pfade. Ton-Schalter, Namensspeicherung und Fehlerfälle werden auch in WebKit geprüft; tatsächliche Klangausgabe wird nur bei vorhandener Audio-API geprüft. Ein physischer iPhone-Test bleibt erforderlich. Echte Gruppendaten werden nicht für automatisierte Testbuchungen verwendet.

Struktur: src/photo-social.js (Likes, Kommentare und Downloads), src/refresh-ui.js (Aktualisierungsgeste und Logoanimation), src/photo-ui.js (Fotoabfrage, Feed und Navigation), photo-processing.js (JPG-Aufbereitung), photo-store.js (Drive/Browser-Anbindung), apps-script/Photos.backend.gs (Foto-API und Drive-Einrichtung), src/core.js (Barcode), freebies.js (Preise/Erfolge/Statistik), db.js (atomare lokale Speicherung/Migration), store.js + group-bridge.js (gemeinsame Daten), camera-ui.js (Kamera und Rückgabe), dashboard.js (Gruppenansichten), chart-view.js (große interaktive Diagrammansicht), identity.js (Name, persönlicher Startlink und heutiges Datum), date-fields.js (einheitliche Anzeige mit nativer Datumsauswahl), sounds.js + sound-ui.js (eigene Klänge und Namenseinstellung), app.js (Ablauf), apps-script/ (Google-Anbindung), tests/ (Kernlogik, simuliertes Backend, Browser).

[Google: HTML-Service und Serverkommunikation](https://developers.google.com/apps-script/guides/html/communication) · [Google: Web-Apps](https://developers.google.com/apps-script/guides/web) · [ZXing](https://github.com/zxing-js/browser). Lizenzen siehe THIRD_PARTY_NOTICES.md und dist/licenses/.
