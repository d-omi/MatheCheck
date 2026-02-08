/**
 * Sound- und Sprach-Modul: Sprachausgabe via Web Speech API
 * plus dezente Töne via Web Audio API für Effekte.
 */
const Sounds = (() => {
    let audioCtx = null;
    let speechSupported = 'speechSynthesis' in window;

    function _getAudioCtx() {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return audioCtx;
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
            utterance.rate = rate || 1.1;
            utterance.pitch = pitch || 1.2;
            utterance.volume = 0.8;
            speechSynthesis.cancel();
            speechSynthesis.speak(utterance);
        } catch {
            // Speech nicht verfügbar
        }
    }

    const praiseWords = [
        'Super!', 'Toll!', 'Genau!', 'Richtig!', 'Perfekt!',
        'Klasse!', 'Spitze!', 'Wow!', 'Bravo!', 'Ja!'
    ];

    const encourageWords = [
        'Nächstes Mal!', 'Fast!', 'Knapp daneben!', 'Versuchs nochmal!',
        'Weiter so!', 'Nicht schlimm!'
    ];

    const streakWords = [
        'Unglaublich!', 'Du bist on fire!', 'Mathe-Star!',
        'Mega Streak!', 'Unstoppbar!', 'Wahnsinn!'
    ];

    function _randomFrom(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    /** Richtige Antwort: Ding + Lob sprechen */
    function correct() {
        _playTone(880, 'sine', 0.12, 0.10);
        setTimeout(() => _playTone(1108, 'sine', 0.15, 0.08), 70);
        _speak(_randomFrom(praiseWords), 1.2, 1.3);
    }

    /** Falsche Antwort: sanfter Ton + Ermutigung */
    function wrong(correctAnswer) {
        _playTone(280, 'sine', 0.2, 0.08);
        setTimeout(() => _playTone(220, 'sine', 0.25, 0.06), 100);
        setTimeout(() => _speak('Die Antwort ist ' + correctAnswer, 1.0, 1.1), 300);
    }

    /** Streak! Extra Lob */
    function streak(count) {
        _playTone(523, 'sine', 0.1, 0.08);
        _playTone(659, 'sine', 0.1, 0.08);
        setTimeout(() => _playTone(784, 'sine', 0.15, 0.10), 80);
        _speak(count + 'er Streak! ' + _randomFrom(streakWords), 1.1, 1.4);
    }

    /** Runde geschafft: Melodie + Ergebnis vorlesen */
    function roundComplete(score, total) {
        _playTone(523, 'sine', 0.12, 0.08);
        setTimeout(() => _playTone(659, 'sine', 0.12, 0.08), 100);
        setTimeout(() => _playTone(784, 'sine', 0.12, 0.08), 200);
        setTimeout(() => _playTone(1047, 'sine', 0.25, 0.10), 300);
        setTimeout(() => {
            _speak('Runde geschafft! ' + score + ' von ' + total + ' richtig!', 1.0, 1.2);
        }, 500);
    }

    /** Willkommensgruß */
    function welcome(name) {
        setTimeout(() => _speak('Hallo ' + name + '! Schön dass du da bist!', 1.0, 1.2), 300);
    }

    /** Countdown vor Spielstart */
    function countdown(number) {
        _playTone(440 + (3 - number) * 200, 'sine', 0.15, 0.08);
        if (number > 0) {
            _speak('' + number, 1.3, 1.0 + number * 0.1);
        } else {
            _speak('Los!', 1.2, 1.5);
        }
    }

    /** Button-Klick */
    function click() {
        _playTone(600, 'sine', 0.05, 0.05);
    }

    return { correct, wrong, streak, roundComplete, welcome, countdown, click };
})();
