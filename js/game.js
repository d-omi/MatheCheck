/**
 * Spiellogik für MatheCheck.
 * Aufgaben werden vorgemischt für gute Verteilung.
 */
const Game = (() => {
    const TASKS_PER_ROUND = 66;

    let currentLevel = 1;
    let currentTask = 0;
    let score = 0;
    let num1 = 0;
    let num2 = 0;
    let correctAnswer = 0;
    let taskPool = [];

    /** Fisher-Yates Shuffle */
    function shuffle(arr) {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    }

    /** Erzeugt einen Pool aller möglichen Aufgaben für das Level. */
    function buildPool(level) {
        const all = [];

        if (level === 1) {
            // Alle Additionen a + b wo a,b >= 1 und a+b <= 20
            for (let a = 1; a <= 19; a++) {
                for (let b = 1; b <= 20 - a; b++) {
                    all.push({ n1: a, n2: b, op: '+', ans: a + b });
                }
            }
        } else if (level === 2) {
            // Alle Subtraktionen a - b wo a 1..10, b 1..a (Ergebnis >= 0)
            for (let a = 1; a <= 10; a++) {
                for (let b = 1; b <= a; b++) {
                    all.push({ n1: a, n2: b, op: '−', ans: a - b });
                }
            }
        }

        // Mischen und auf TASKS_PER_ROUND auffüllen
        shuffle(all);
        const pool = [];
        while (pool.length < TASKS_PER_ROUND) {
            // Pool erschöpft → nochmal mischen und anhängen
            if (pool.length > 0 && pool.length % all.length === 0) {
                shuffle(all);
            }
            pool.push(all[pool.length % all.length]);
        }
        return pool;
    }

    /** Erzeugt die nächste Aufgabe aus dem Pool. */
    function generateTask() {
        const task = taskPool[currentTask];
        num1 = task.n1;
        num2 = task.n2;
        correctAnswer = task.ans;
        return { num1, num2, op: task.op, answer: correctAnswer };
    }

    /** Startet eine neue Runde. */
    function startRound(level) {
        currentLevel = level;
        currentTask = 0;
        score = 0;
        taskPool = buildPool(level);
    }

    /** Prüft die Antwort und gibt Ergebnis zurück. */
    function checkAnswer(playerAnswer) {
        const isCorrect = parseInt(playerAnswer, 10) === correctAnswer;
        if (isCorrect) score++;
        currentTask++;
        return {
            isCorrect,
            correctAnswer,
            currentTask,
            totalTasks: TASKS_PER_ROUND,
            isRoundOver: currentTask >= TASKS_PER_ROUND,
            score
        };
    }

    function getProgress() {
        return {
            currentTask,
            totalTasks: TASKS_PER_ROUND,
            score
        };
    }

    function getScore() {
        return score;
    }

    function getTotalTasks() {
        return TASKS_PER_ROUND;
    }

    return {
        generateTask,
        startRound,
        checkAnswer,
        getProgress,
        getScore,
        getTotalTasks
    };
})();
