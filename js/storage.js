/**
 * Storage-Modul: Speichert Spielerdaten im localStorage.
 */
const Storage = (() => {
    const STORAGE_KEY = 'mathecheck_data';

    function _loadAll() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch {
            return {};
        }
    }

    function _saveAll(data) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }

    /** Gibt den gespeicherten Spielernamen zurueck oder null. */
    function getPlayerName() {
        return _loadAll().playerName || null;
    }

    /** Speichert den Spielernamen. */
    function setPlayerName(name) {
        const data = _loadAll();
        data.playerName = name.trim();
        _saveAll(data);
    }

    /** Loescht den Spielernamen (Logout). */
    function clearPlayerName() {
        const data = _loadAll();
        delete data.playerName;
        _saveAll(data);
    }

    /** Gibt die Stats fuer ein Level zurueck. */
    function getLevelStats(level) {
        const data = _loadAll();
        const stats = data.levels && data.levels[level];
        return stats || { roundsPlayed: 0, bestScore: 0 };
    }

    /** Aktualisiert die Stats nach einer Runde. */
    function saveRoundResult(level, score) {
        const data = _loadAll();
        if (!data.levels) data.levels = {};
        if (!data.levels[level]) {
            data.levels[level] = { roundsPlayed: 0, bestScore: 0 };
        }
        data.levels[level].roundsPlayed++;
        if (score > data.levels[level].bestScore) {
            data.levels[level].bestScore = score;
        }
        _saveAll(data);
    }

    return {
        getPlayerName,
        setPlayerName,
        clearPlayerName,
        getLevelStats,
        saveRoundResult
    };
})();
