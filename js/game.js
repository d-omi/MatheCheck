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

    /** Feste Aufgabenliste für Level 1 (Addition bis 20). */
    const LEVEL1_TASKS = [
        [7,7],[2,1],[1,1],[5,2],[6,6],[0,4],[2,8],[7,3],[4,4],[0,1],
        [4,1],[4,5],[5,5],[1,6],[0,9],[1,4],[8,1],[8,5],[5,7],[3,3],
        [3,7],[6,5],[5,6],[3,1],[1,9],[5,9],[1,2],[5,8],[0,0],[9,5],
        [1,0],[0,10],[10,10],[2,0],[10,0],[10,7],[3,5],[10,1],[1,7],[6,4],
        [5,4],[10,3],[6,1],[8,8],[2,2],[1,8],[5,3],[1,5],[9,10],[6,10],
        [5,1],[10,5],[7,0],[5,10],[8,2],[5,7],[1,10],[9,1],[8,10],[4,6],
        [1,3],[5,0],[0,5],[2,5],[9,9],[7,1]
    ];

    /** Erzeugt einen Pool aller Aufgaben für das Level. */
    function buildPool(level) {
        const all = [];

        if (level === 1) {
            // Feste 66 Additionen, jede Runde gemischt
            for (let i = 0; i < LEVEL1_TASKS.length; i++) {
                const t = LEVEL1_TASKS[i];
                all.push({ n1: t[0], n2: t[1], op: '+', ans: t[0] + t[1] });
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
