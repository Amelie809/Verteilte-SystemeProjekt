1. Beschreibung der Komponente

Diese Webseite ermöglicht es Nutzern, Geldautomaten verschiedener
Banken in Deutschland zu suchen und auf einer interaktiven Karte anzuzeigen.
Die Demodaten sind dabei eingschänkt auf München und Ravensburg.
Die wichtigsten Funktionen sind:

Suchleiste: Nutzer können nach Stadt, Postleitzahl,Name oder Filiale suchen.
Filter: Filter nach Bankart, Öffnungszeiten, Entfernung und Öffnungszeit.
Interaktive Karte: Zeigt gefilterte Geldautomaten mit Leaflet-Kartenintegration.
Standortbestimmung: Nutzer können den eigenen Standort anzeigen lassen.
Anzeige gefundener Geldautomaten: Liste in Form eines Seitenfensters mit Details zu den gerade
 auf der Karte angezeigten Geldautomaten.
Chatbot: Beantwortet Fragen des Nutzers zu der Webseite.

 Beschreibung der SQLite Datenbank
Die Anwendung verwendet eine lokale SQLite-Datenbank, in der alle Geldautomaten gespeichert sind. Die Datenbank wird
vom Backend (node.js/express/lokale API) ausgelesen und als JSON an das Frontend weitergeleitet.

Tabellenstruktur
id  INTEGER (Primary Key)  z.B. 1
name TEXT                  z.B. Geldautomat/Filiale
bank TEXT                  z.B. Sparkasse/Volksbank/...
stadt TEXT                 z.B. Ravensburg/München
breite REAL                z.B. Koordinaten
laenge REAL                z.B. Koordinaten
oeffnungszeiten TEXT       z.B. 09:00 - 16:00/Immer
adresse TEXT               z.B. Marienplatz 28/...
postleitzahl INTEGER       z.B. 88212/...

2. Software-Design

   Designüberlegungen
Modularität: JavaScript-Funktionen für Suche, Filter, Karte und Marker sind getrennt.
Datenorientiert: Filterlogik und Marker-Updates arbeiten direkt auf der Datenbank-Response (API / JSON), sodass UI unabhängig bleibt.
Erweiterbarkeit: Neue Filter (z. B. Einzahlfunktion) lassen sich leicht hinzufügen.
Leaflet-Integration: Leaflet für Karte und Marker, um einfache Interaktivität zu gewährleisten.

 Relevante Designentscheidungen
Filter-Logik im Frontend: Alle Filter werden clientseitig angewendet, um schnelle Rückmeldungen ohne ständige Serverabfragen zu ermöglichen.
Separate Eingabefelder statt Dropdowns: Flexiblere Eingabe (z. B. Entfernung in Metern, Uhrzeit) verbessert UX.
Tooltipps für Standort: Zeigt direkt zusätzliche Informationen beim Hover über den Standort-Button.
OpenStreetMap + Leaflet: Open-Source-Lösung für Karten, einfach zu integrieren, leichtgewichtig.
Chatbot: Verbessert Nutzerfreundlichkeit.

3. Integration

   Zu anderen Komponenten
Suchleiste: Trigger für die searchAtms()-Funktion.
Filterfelder: Bankart, Öffnungszeiten, Entfernung werden in searchAtms() berücksichtigt.
Karten-Komponente: Aktualisiert Marker basierend auf den Filterergebnissen.
Standort-Komponente: Zeigt Benutzerstandort und ermöglicht Filter nach Entfernung.
Chatbot: Beantwortet Fragen des Nutzers.

 Zur Gesamtsoftware
Die Webanwendung kann als Frontend mit einem Backend (Node.js / Express / lokale API) kommunizieren.
API liefert JSON mit Geldautomaten-Daten (Nr,Bank, Name, Stadt, Koordinaten, Öffnungszeiten, Postleitzahl, Adresse).
Frontend verarbeitet die Daten, wendet Filter an und aktualisiert die Karte sowie die Listenanzeige.

4. Verwendete Technologien

HTML / CSS: Struktur und Layout der Webseite.
JavaScript: Frontend-Logik für Suche, Filter und Kartenintegration.
Leaflet.js: Interaktive Kartenanzeige und Marker-Management.
jQuery & Clockpicker: Eingabe von Uhrzeiten mit interaktivem Widget.
Bootstrap: Modernes Layout für das Seitenfenster.
OpenStreetMap Tiles: Kartendaten für Leaflet.
Google Maps: Anzeige der Rote zum Geldautomaten.
Chatbase: Layout & Logik für den Chatbot.
Backend: Node.js + Express für die Bereitstellung der Geldautomaten-Daten als JSON API.

5. Abweichungen zum ACD

Frontend-Filterlogik: Im ursprünglichen ACD war vorgesehen, dass Filter im Backend verarbeitet werden.
 In der aktuellen Implementierung werden die Filter clientseitig angewendet, um schnelle Interaktivität zu gewährleisten.
Öffnungszeitenfilter: Das ACD sah nur Text-basierte Öffnungszeiten vor. Jetzt wird eine echte Uhrzeit-Eingabe genutzt,
 die den Status des Geldautomaten prüft.
Entfernungseingabe: Statt Dropdowns für feste Entfernungen kann der Nutzer jetzt beliebige Werte eingeben.
Integration von Clockpicker: Wurde im ACD nicht spezifiziert, ist aber für die UX bei der Zeitangabe notwendig.
Tooltip für Standort: Zusätzliche visuelle Rückmeldung, die im ursprünglichen Design nicht vorgesehen war.
Seitenfenster der angezeigten Geldautomaten: Ebenfalls eine zusätzliche visuelle Rückmeldung über die gefilterten
 Geldautomaten auf der Karte.
Routenanzeige: Statt die Routenanzeige auf der Karte anzuzeigen, wird nun auf Google Maps verwiesen.
Chatbot: Zusätzliche Funktion um die Nutzerfreundlichkeit zu verbessern.
Bootstrap: Optional eingebunden zur Verbesserung des Layouts beim Seitenfenster.
