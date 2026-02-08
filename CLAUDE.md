# MatheCheck

Mathe-Lernspiel für Kinder. Läuft als statische Website auf GitHub Pages.

## Technik

- Vanilla HTML / CSS / JavaScript (kein Build-System, kein Framework)
- Daten werden im `localStorage` des Browsers gespeichert
- Single-Page-App mit Screen-basierter Navigation (CSS-Klasse `active`)

## Dateistruktur

```
index.html          - Alle Screens (Welcome, Levels, Game, Result)
css/style.css       - Gesamtes Styling
js/storage.js       - localStorage Wrapper (Spielername, Level-Stats)
js/jokes.js         - Kinderwitze-Sammlung
js/sounds.js        - Dezente Sound-Effekte via Web Audio API
js/game.js          - Spiellogik (Aufgaben generieren, Antworten prüfen)
js/app.js           - Hauptlogik (Screen-Navigation, Event-Handler, UI-Updates)
```

## Architektur

Jedes JS-Modul ist ein IIFE das ein globales Objekt exponiert:
- `Storage` - liest/schreibt localStorage
- `Jokes` - liefert zufällige Witze
- `Sounds` - dezente Audio-Effekte (Web Audio API, keine Dateien)
- `Game` - Spielzustand und Logik
- `App` - initialisiert alles, verbindet UI mit Logik

## Levels

Aktuell nur **Level 1**: Addition bis 20, 30 Aufgaben pro Runde.
Neue Levels in `game.js` (`generateTask`) und `index.html` (Level-Grid) ergänzen.

## Konventionen

- Deutsche Umlaute (ä, ö, ü, ß) in Strings und Kommentaren verwenden
- Kinderfreundliche Sprache und Design
- Kein externes CDN oder Abhängigkeiten - alles self-contained
- Responsive Design (Mobile-first, Kinder nutzen oft Tablets)

## Deployment

Push nach `main` → GitHub Pages liefert `index.html` aus.
