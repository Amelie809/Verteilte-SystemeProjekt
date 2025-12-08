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
auf der Karte angezeigten Geldautomaten wie Bank, Name und Stadt.
Chatbot: Beantwortet Fragen des Nutzers zu der Webseite.

2. Software-Design

   Designüberlegungen
Modularität: JavaScript-Funktionen für Suche, Filter, Karte und Marker sind getrennt.
Datenorientiert: Filterlogik und Marker-Updates arbeiten direkt auf der Datenbank-Response (API / JSON), sodass UI unabhängig bleibt.
Responsive UX: Buttons, Eingabefelder und Tooltipps passen sich dem Layout an.
Erweiterbarkeit: Neue Filter (z. B. Einzahlfunktion) lassen sich leicht hinzufügen.
Leaflet-Integration: Leaflet für Karte und Marker, um einfache Interaktivität zu gewährleisten.

 Relevante Designentscheidungen
Filter-Logik im Frontend: Alle Filter werden clientseitig angewendet, um schnelle Rückmeldungen ohne ständige Serverabfragen zu ermöglichen.
Separate Eingabefelder statt Dropdowns: Flexiblere Eingabe (z. B. Entfernung in Metern, Uhrzeit) verbessert UX.
Tooltipps für Standort: Zeigt direkt zusätzliche Informationen beim Hover über den Standort-Button.
OpenStreetMap + Leaflet: Open-Source-Lösung für Karten, einfach zu integrieren, leichtgewichtig.

3. Integration

   Zu anderen Komponenten
Suchleiste: Trigger für die searchAtms()-Funktion.
Filterfelder: Bankart, Öffnungszeiten, Entfernung werden in searchAtms() berücksichtigt.
Karten-Komponente: Aktualisiert Marker basierend auf den Filterergebnissen.
Standort-Komponente: Zeigt Benutzerstandort und ermöglicht Filter nach Entfernung.
Chatbot: Beantwortet Fragen des Nutzers.

 Zur Gesamtsoftware
Die Webanwendung kann als Frontend mit einem Backend (Node.js / Express / lokale API) kommunizieren.
API liefert JSON mit Geldautomaten-Daten (Bank, Name, Stadt, Koordinaten, Öffnungszeiten).
Frontend verarbeitet die Daten, wendet Filter an und aktualisiert die Karte sowie die Listenanzeige.

4. Verwendete Technologien

HTML5 / CSS3: Struktur und Layout der Webseite.
JavaScript: Frontend-Logik für Suche, Filter und Kartenintegration.
Leaflet.js: Interaktive Kartenanzeige und Marker-Management.
jQuery & Clockpicker: Eingabe von Uhrzeiten mit interaktivem Widget.
Bootstrap: Modernes Layout, Buttons, Eingabefelder, responsive Gestaltung.
OpenStreetMap Tiles: Kartendaten für Leaflet.
Chatbase: Layout & Logik für den Chatbot.
Backend: Node.js + Express für die Bereitstellung der Geldautomaten-Daten als JSON API.

5. Abweichungen zum ACD

Frontend-Filterlogik: Im ursprünglichen ACD war vorgesehen, dass Filter im Backend verarbeitet werden.
 In der aktuellen Implementierung werden die Filter clientseitig angewendet, um schnelle Interaktivität zu gewährleisten.
Uhrzeitfilter: Das ACD sah nur Text-basierte Öffnungszeiten vor. Jetzt wird eine echte Uhrzeit-Eingabe genutzt,
 die den Status des Geldautomaten prüft.
Entfernungseingabe: Statt Dropdowns für feste Entfernungen kann der Nutzer jetzt beliebige Werte eingeben.
Integration von Clockpicker: Wurde im ACD nicht spezifiziert, ist aber für die UX bei der Zeitangabe notwendig.
Tooltip für Standort: Zusätzliche visuelle Rückmeldung, die im ursprünglichen Design nicht vorgesehen war.
Seitenfenster der angezeigten Geldautomaten:
Bootstrap: Optional eingebunden zur Verbesserung des Layouts und der Konsistenz von Buttons und Eingabefeldern.
