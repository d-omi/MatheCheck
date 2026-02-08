/**
 * Spiellogik fuer MatheCheck.
 */
const Game = (() => {
    const TASKS_PER_ROUND = 30;

    let currentLevel = 1;
    let currentTask = 0;
    let score = 0;
    let num1 = 0;
    let num2 = 0;
    let correctAnswer = 0;

    /** Erzeugt eine neue Aufgabe basierend auf dem Level. */
    function generateTask() {
        if (currentLevel === 1) {
            // Addition bis 20
            num1 = Math.floor(Math.random() * 20) + 1;
            num2 = Math.floor(Math.random() * (20 - num1)) + 1;
            correctAnswer = num1 + num2;
        }
        return { num1, num2, op: '+', answer: correctAnswer };
    }

    /** Startet eine neue Runde. */
    function startRound(level) {
        currentLevel = level;
        currentTask = 0;
        score = 0;
    }

    /** Prueft die Antwort und gibt Ergebnis zurueck. */
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
