/**
 * Sound-Modul: Dezente Töne via Web Audio API.
 * Keine externen Dateien nötig.
 */
const Sounds = (() => {
    let ctx = null;

    function _getCtx() {
        if (!ctx) {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        return ctx;
    }

    function _play(freq, type, duration, volume) {
        try {
            const ac = _getCtx();
            const osc = ac.createOscillator();
            const gain = ac.createGain();

            osc.type = type;
            osc.frequency.value = freq;

            // Sanftes Ein-/Ausblenden
            gain.gain.setValueAtTime(0, ac.currentTime);
            gain.gain.linearRampToValueAtTime(volume, ac.currentTime + 0.03);
            gain.gain.linearRampToValueAtTime(0, ac.currentTime + duration);

            osc.connect(gain);
            gain.connect(ac.destination);
            osc.start(ac.currentTime);
            osc.stop(ac.currentTime + duration);
        } catch {
            // Audio nicht verfügbar - kein Problem
        }
    }

    /** Richtige Antwort: freundliches kurzes "Ding" */
    function correct() {
        _play(880, 'sine', 0.15, 0.12);
        setTimeout(() => _play(1108, 'sine', 0.18, 0.10), 80);
    }

    /** Falsche Antwort: sanfter tiefer Ton */
    function wrong() {
        _play(280, 'sine', 0.25, 0.10);
        setTimeout(() => _play(220, 'sine', 0.3, 0.08), 120);
    }

    /** Streak: aufsteigendes Arpeggio */
    function streak() {
        _play(523, 'sine', 0.1, 0.10);
        setTimeout(() => _play(659, 'sine', 0.1, 0.10), 60);
        setTimeout(() => _play(784, 'sine', 0.1, 0.10), 120);
        setTimeout(() => _play(1047, 'sine', 0.15, 0.12), 180);
    }

    /** Runde geschafft: kleine aufsteigende Melodie */
    function roundComplete() {
        _play(523, 'sine', 0.15, 0.10);
        setTimeout(() => _play(659, 'sine', 0.15, 0.10), 120);
        setTimeout(() => _play(784, 'sine', 0.15, 0.10), 240);
        setTimeout(() => _play(1047, 'sine', 0.3, 0.12), 360);
    }

    /** Countdown-Tick */
    function countdown(number) {
        _play(440 + (3 - number) * 200, 'sine', 0.15, 0.08);
    }

    /** Button-Klick: subtiler Tick */
    function click() {
        _play(600, 'sine', 0.06, 0.06);
    }

    return { correct, wrong, streak, roundComplete, countdown, click };
})();
