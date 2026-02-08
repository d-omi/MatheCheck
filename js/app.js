/**
 * MatheCheck - Haupt-App-Logik.
 * Verbindet Screens, Game-Engine, Storage und UI.
 */
const App = (() => {
    // DOM-Elemente
    const screens = {
        welcome: document.getElementById('screen-welcome'),
        levels: document.getElementById('screen-levels'),
        game: document.getElementById('screen-game'),
        result: document.getElementById('screen-result')
    };

    const els = {
        playerName: document.getElementById('player-name'),
        btnStart: document.getElementById('btn-start'),
        btnLogout: document.getElementById('btn-logout'),
        displayName: document.getElementById('display-name'),
        starsLevel1: document.getElementById('stars-level-1'),
        statRounds: document.getElementById('stat-rounds'),
        statBest: document.getElementById('stat-best'),
        taskNum1: document.getElementById('task-num1'),
        taskOp: document.getElementById('task-op'),
        taskNum2: document.getElementById('task-num2'),
        taskDisplay: document.getElementById('task-display'),
        answerInput: document.getElementById('answer-input'),
        btnCheck: document.getElementById('btn-check'),
        feedback: document.getElementById('feedback'),
        progressFill: document.getElementById('progress-fill'),
        progressText: document.getElementById('progress-text'),
        gameScore: document.getElementById('game-score'),
        resultTitle: document.getElementById('result-title'),
        resultScore: document.getElementById('result-score'),
        resultStars: document.getElementById('result-stars'),
        resultMessage: document.getElementById('result-message'),
        jokeText: document.getElementById('joke-text'),
        btnRetry: document.getElementById('btn-retry'),
        btnBackLevels: document.getElementById('btn-back-levels'),
        confettiCanvas: document.getElementById('confetti-canvas')
    };

    let feedbackTimeout = null;

    // ===== Screen Navigation =====
    function showScreen(name) {
        Object.values(screens).forEach(s => s.classList.remove('active'));
        screens[name].classList.add('active');
    }

    // ===== Willkommen =====
    function initWelcome() {
        const savedName = Storage.getPlayerName();
        if (savedName) {
            els.playerName.value = savedName;
            els.btnStart.disabled = false;
        }

        els.playerName.addEventListener('input', () => {
            els.btnStart.disabled = els.playerName.value.trim().length === 0;
        });

        els.playerName.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !els.btnStart.disabled) {
                goToLevels();
            }
        });

        els.btnStart.addEventListener('click', () => {
            Sounds.click();
            goToLevels();
        });
    }

    function goToLevels() {
        const name = els.playerName.value.trim();
        if (!name) return;
        Storage.setPlayerName(name);
        showLevelScreen(name);
    }

    // ===== Level-Auswahl =====
    function showLevelScreen(name) {
        els.displayName.textContent = name;
        updateStats();
        showScreen('levels');
    }

    function updateStats() {
        const stats = Storage.getLevelStats(1);
        els.statRounds.textContent = stats.roundsPlayed;
        els.statBest.textContent = stats.bestScore + ' / ' + Game.getTotalTasks();
        els.starsLevel1.textContent = getStarsForScore(stats.bestScore);
    }

    function getStarsForScore(score) {
        const total = Game.getTotalTasks();
        const pct = score / total;
        if (pct >= 1) return '⭐⭐⭐';
        if (pct >= 0.8) return '⭐⭐';
        if (pct >= 0.5) return '⭐';
        if (score > 0) return '☆';
        return '';
    }

    function initLevels() {
        els.btnLogout.addEventListener('click', () => {
            Storage.clearPlayerName();
            els.playerName.value = '';
            els.btnStart.disabled = true;
            showScreen('welcome');
        });

        document.querySelector('[data-level="1"]').addEventListener('click', () => {
            Sounds.click();
            startGame(1);
        });
    }

    // ===== Spiel =====
    function startGame(level) {
        Game.startRound(level);
        showScreen('game');
        nextTask();
    }

    function nextTask() {
        const task = Game.generateTask();
        const progress = Game.getProgress();

        els.taskNum1.textContent = task.num1;
        els.taskOp.textContent = task.op;
        els.taskNum2.textContent = task.num2;

        els.answerInput.value = '';
        els.answerInput.focus();
        els.feedback.classList.add('hidden');

        updateProgress(progress);
        els.taskDisplay.classList.remove('shake', 'pop');
        void els.taskDisplay.offsetWidth; // reflow
        els.taskDisplay.classList.add('pop');
    }

    function updateProgress(progress) {
        const pct = (progress.currentTask / progress.totalTasks) * 100;
        els.progressFill.style.width = pct + '%';
        els.progressText.textContent = (progress.currentTask + 1) + ' / ' + progress.totalTasks;
        els.gameScore.textContent = '✅ ' + progress.score;
    }

    function handleAnswer() {
        const value = els.answerInput.value.trim();
        if (value === '') return;

        const result = Game.checkAnswer(value);

        // Feedback anzeigen
        if (feedbackTimeout) clearTimeout(feedbackTimeout);
        els.feedback.classList.remove('hidden', 'correct', 'wrong');

        if (result.isCorrect) {
            els.feedback.classList.add('correct');
            els.feedback.textContent = randomPraise();
            Sounds.correct();
        } else {
            els.feedback.classList.add('wrong');
            els.feedback.textContent = 'Die Antwort ist ' + result.correctAnswer + '!';
            els.taskDisplay.classList.add('shake');
            Sounds.wrong();
        }

        if (result.isRoundOver) {
            // Kurz warten, dann Ergebnis zeigen
            setTimeout(() => {
                Sounds.roundComplete();
                showResult(result.score);
            }, 1200);
        } else {
            feedbackTimeout = setTimeout(() => {
                nextTask();
            }, 1000);
        }
    }

    function randomPraise() {
        const praises = [
            'Super! 🎉', 'Richtig! ✨', 'Genau! 👏', 'Toll! 🌟',
            'Perfekt! 💪', 'Klasse! 🏆', 'Wow! 🚀', 'Spitze! ⭐'
        ];
        return praises[Math.floor(Math.random() * praises.length)];
    }

    function initGame() {
        els.btnCheck.addEventListener('click', handleAnswer);
        els.answerInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') handleAnswer();
        });
    }

    // ===== Ergebnis =====
    function showResult(score) {
        const total = Game.getTotalTasks();
        const pct = score / total;

        Storage.saveRoundResult(1, score);

        els.resultScore.textContent = score;
        els.resultStars.textContent = getStarsForScore(score);

        if (pct >= 1) {
            els.resultTitle.textContent = 'Perfekt! 🏆';
            els.resultMessage.textContent = 'Alle richtig – du bist ein Mathe-Genie!';
            launchConfetti();
        } else if (pct >= 0.8) {
            els.resultTitle.textContent = 'Großartig! 🎉';
            els.resultMessage.textContent = 'Fast alles richtig – super gemacht!';
            launchConfetti();
        } else if (pct >= 0.5) {
            els.resultTitle.textContent = 'Gut gemacht! 👍';
            els.resultMessage.textContent = 'Übe weiter, du wirst immer besser!';
        } else {
            els.resultTitle.textContent = 'Weiter üben! 💪';
            els.resultMessage.textContent = 'Übung macht den Meister – versuch es nochmal!';
        }

        els.jokeText.textContent = Jokes.getRandom();
        showScreen('result');
    }

    function initResult() {
        els.btnRetry.addEventListener('click', () => {
            Sounds.click();
            startGame(1);
        });
        els.btnBackLevels.addEventListener('click', () => {
            Sounds.click();
            showLevelScreen(Storage.getPlayerName());
        });
    }

    // ===== Konfetti =====
    function launchConfetti() {
        const canvas = els.confettiCanvas;
        const ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        const pieces = [];
        const colors = ['#6C63FF', '#FF5252', '#4CAF50', '#FF9800', '#E91E63', '#00BCD4'];

        for (let i = 0; i < 120; i++) {
            pieces.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                w: Math.random() * 10 + 5,
                h: Math.random() * 6 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 3 + 2,
                angle: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 0.2
            });
        }

        let frame = 0;
        const maxFrames = 180;

        function animate() {
            if (frame >= maxFrames) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            pieces.forEach(p => {
                p.y += p.speed;
                p.angle += p.spin;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.fillStyle = p.color;
                ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
                ctx.restore();
            });
            frame++;
            requestAnimationFrame(animate);
        }

        animate();
    }

    // ===== Init =====
    function init() {
        initWelcome();
        initLevels();
        initGame();
        initResult();

        // Auto-Login wenn Name gespeichert
        const savedName = Storage.getPlayerName();
        if (savedName) {
            showLevelScreen(savedName);
        }
    }

    // App starten
    init();
})();
