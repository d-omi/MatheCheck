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

- **Level 1**: Addition bis 20 – feste Liste von 66 Aufgaben (`LEVEL1_TASKS`), jede Runde gemischt
- **Level 2**: Subtraktion bis 10 – alle Kombinationen a−b mit a∈[1,10], b∈[1,a], auf 66 aufgefüllt
- **Level 3**: Noch gesperrt (Platzhalter in `index.html`)

Jede Runde hat 66 Aufgaben (`TASKS_PER_ROUND` in `game.js`).
Neue Levels in `game.js` (`buildPool`) und `index.html` (Level-Grid) ergänzen.

## Mario-Welt

Der Spiel-Screen zeigt eine side-scrolling Mario-Welt:
- Pixel-Art Charakter (CSS-only, kein Bild) mit Mütze, Schnurrbart, Latzhose
- Frageblöcke (`?`) für jede Aufgabe, werden grün (richtig) oder rot (falsch)
- Dekorative Elemente: Wolken, Hügel, Büsche, Rohre, Fahnenmast
- Viewport-Scrolling via `CSS transform: translateX()`
- Seeded RNG (`mulberry32`) für konsistente Dekorationen

## Navigation im Spiel

- Zurück-Button (✕) im Game-HUD führt zurück zur Level-Auswahl
- Countdown (3-2-1-Los!) vor jeder Runde
- Nach Rundenende: Ergebnis-Screen mit Nochmal/Zurück-Buttons

## Konventionen

- Deutsche Umlaute (ä, ö, ü, ß) in Strings und Kommentaren verwenden
- Kinderfreundliche Sprache und Design
- Kein externes CDN oder Abhängigkeiten - alles self-contained
- Responsive Design (Mobile-first, Kinder nutzen oft Tablets)

## Deployment

Push nach `main` → GitHub Pages liefert `index.html` aus.
