# MatheCheck

Mathe-Lernspiel fuer Kinder. Laeuft als statische Website auf GitHub Pages.

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
js/game.js          - Spiellogik (Aufgaben generieren, Antworten pruefen)
js/app.js           - Hauptlogik (Screen-Navigation, Event-Handler, UI-Updates)
```

## Architektur

Jedes JS-Modul ist ein IIFE das ein globales Objekt exponiert:
- `Storage` - liest/schreibt localStorage
- `Jokes` - liefert zufaellige Witze
- `Sounds` - dezente Audio-Effekte (Web Audio API, keine Dateien)
- `Game` - Spielzustand und Logik
- `App` - initialisiert alles, verbindet UI mit Logik

## Levels

Aktuell nur **Level 1**: Addition bis 20, 30 Aufgaben pro Runde.
Neue Levels in `game.js` (`generateTask`) und `index.html` (Level-Grid) ergaenzen.

## Konventionen

- Keine Umlaute in Code/Strings (ue statt ue, ae statt ae, oe statt oe, ss statt ss) fuer maximale Kompatibilitaet
- Kinderfreundliche Sprache und Design
- Kein externes CDN oder Abhaengigkeiten - alles self-contained
- Responsive Design (Mobile-first, Kinder nutzen oft Tablets)

## Deployment

Push nach `main` → GitHub Pages liefert `index.html` aus.
