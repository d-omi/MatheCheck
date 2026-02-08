/**
 * Sound- und Sprach-Modul: Sprachausgabe via Web Speech API
 * plus dezente Töne via Web Audio API für Effekte.
 */
const Sounds = (() => {
    let audioCtx = null;
    let speechSupported = 'speechSynthesis' in window;
    let germanVoice = null;

    function _getAudioCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
    }

    /** Sucht die beste deutsche Stimme (natürlicher als Default). */
    function _findGermanVoice() {
        if (germanVoice) return germanVoice;
        const voices = speechSynthesis.getVoices();
        // Bevorzugt natürliche/premium Stimmen
        germanVoice = voices.find(v => v.lang.startsWith('de') && v.name.toLowerCase().includes('natural'))
            || voices.find(v => v.lang.startsWith('de') && !v.name.includes('Google'))
            || voices.find(v => v.lang.startsWith('de'))
            || null;
        return germanVoice;
    }

    // Stimmen laden (manche Browser laden async)
    if (speechSupported) {
        speechSynthesis.onvoiceschanged = _findGermanVoice;
        _findGermanVoice();
    }

    function _playTone(freq, type, duration, volume) {
        try {
            const ac = _getAudioCtx();
            const osc = ac.createOscillator();
            const gain = ac.createGain();
            osc.type = type;
            osc.frequency.value = freq;
            gain.gain.setValueAtTime(0, ac.currentTime);
            gain.gain.linearRampToValueAtTime(volume, ac.currentTime + 0.03);
            gain.gain.linearRampToValueAtTime(0, ac.currentTime + duration);
            osc.connect(gain);
            gain.connect(ac.destination);
            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + duration);
        } catch {
            // Audio nicht verfügbar
        }
    }

    function _speak(text, rate, pitch) {
        if (!speechSupported) return;
        try {
            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'de-DE';
            utterance.rate = rate || 0.95;
            utterance.pitch = pitch || 1.0;
            utterance.volume = 0.8;
            const voice = _findGermanVoice();
            if (voice) utterance.voice = voice;
            speechSynthesis.cancel();
            speechSynthesis.speak(utterance);
        } catch {
            // Speech nicht verfügbar
        }
    }

    function _randomFrom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /** Richtige Antwort: Ding + kurzes Lob */
    function correct() {
        _playTone(880, 'sine', 0.12, 0.10);
        setTimeout(() => _playTone(1108, 'sine', 0.15, 0.08), 70);
        const praise = _randomFrom([
            'Super!', 'Toll gemacht!', 'Genau richtig!', 'Ja, stimmt!',
            'Sehr gut!', 'Perfekt!', 'Klasse!', 'Na klar!', 'Bravo!'
        ]);
        _speak(praise, 0.95, 1.05);
    }

    /** Falsche Antwort: sanfter Ton + ermutigende Korrektur */
    function wrong(correctAnswer) {
        _playTone(280, 'sine', 0.2, 0.08);
        setTimeout(() => _playTone(220, 'sine', 0.25, 0.06), 100);
        const phrase = _randomFrom([
            'Hmm, das wär ' + correctAnswer + ' gewesen.',
            'Knapp! Es war die ' + correctAnswer + '.',
            'Fast! Richtig wär ' + correctAnswer + '.',
            'Nee, ' + correctAnswer + '. Nächstes Mal!'
        ]);
        setTimeout(() => _speak(phrase, 0.9, 1.0), 300);
    }

    /** Streak! Begeistertes Lob */
    function streak(count) {
        _playTone(523, 'sine', 0.1, 0.08);
        _playTone(659, 'sine', 0.1, 0.08);
        setTimeout(() => _playTone(784, 'sine', 0.15, 0.10), 80);
        const phrase = _randomFrom([
            'Wow, schon ' + count + ' richtig hintereinander!',
            count + ' in Folge, läuft bei dir!',
            'Boah, ' + count + 'er Serie! Weiter so!',
            'Nicht zu stoppen! Schon ' + count + ' am Stück!'
        ]);
        _speak(phrase, 0.95, 1.05);
    }

    /** Runde geschafft: Melodie + Ergebnis */
    function roundComplete(score, total) {
        _playTone(523, 'sine', 0.12, 0.08);
        setTimeout(() => _playTone(659, 'sine', 0.12, 0.08), 100);
        setTimeout(() => _playTone(784, 'sine', 0.12, 0.08), 200);
        setTimeout(() => _playTone(1047, 'sine', 0.25, 0.10), 300);

        let phrase;
        const pct = score / total;
        if (pct >= 1) {
            phrase = 'Wahnsinn, alles richtig! Du bist ein echtes Mathe-Genie!';
        } else if (pct >= 0.8) {
            phrase = score + ' von ' + total + ' richtig. Das war richtig stark!';
        } else if (pct >= 0.5) {
            phrase = score + ' von ' + total + '. Gar nicht schlecht, das wird noch besser!';
        } else {
            phrase = score + ' von ' + total + '. Macht nix, Übung macht den Meister!';
        }
        setTimeout(() => _speak(phrase, 0.9, 1.0), 600);
    }

    /** Willkommensgruß */
    function welcome(name) {
        const phrase = _randomFrom([
            'Hey ' + name + ', schön dich zu sehen!',
            'Hallo ' + name + '! Na, bereit zum Rechnen?',
            'Hey ' + name + ', willkommen zurück!'
        ]);
        setTimeout(() => _speak(phrase, 0.9, 1.0), 300);
    }

    /** Countdown: nur Töne, kein Sprechen (wirkt natürlicher) */
    function countdown(number) {
        _playTone(440 + (3 - number) * 200, 'sine', 0.15, 0.08);
        if (number === 0) {
            _speak('Los gehts!', 1.0, 1.05);
        }
    }

    /** Button-Klick */
    function click() {
        _playTone(600, 'sine', 0.05, 0.05);
    }

    return { correct, wrong, streak, roundComplete, welcome, countdown, click };
})();
