/**
 * MatheCheck - Haupt-App-Logik (Verspielt-Edition).
 * Maskottchen, Streaks, Countdown, Partikel, Sprachausgabe.
 */
const App = (() => {
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
        answerDisplay: document.getElementById('answer-display'),
        numpad: document.querySelector('.numpad'),
        feedback: document.getElementById('feedback'),
        progressFill: document.getElementById('progress-fill'),
        progressText: document.getElementById('progress-text'),
        gameScore: document.getElementById('game-score'),
        mascot: document.getElementById('game-mascot'),
        streakDisplay: document.getElementById('streak-display'),
        countdownOverlay: document.getElementById('countdown-overlay'),
        countdownNumber: document.getElementById('countdown-number'),
        resultTitle: document.getElementById('result-title'),
        resultScore: document.getElementById('result-score'),
        resultStars: document.getElementById('result-stars'),
        resultMessage: document.getElementById('result-message'),
        resultMascot: document.getElementById('result-mascot'),
        jokeText: document.getElementById('joke-text'),
        btnRetry: document.getElementById('btn-retry'),
        btnBackLevels: document.getElementById('btn-back-levels'),
        confettiCanvas: document.getElementById('confetti-canvas'),
        bgParticles: document.getElementById('bg-particles')
    };

    let feedbackTimeout = null;
    let currentStreak = 0;
    let isProcessing = false;
    let currentAnswer = '';

    // ===== Numpad Antwort-Verwaltung =====
    function setAnswer(val) {
        currentAnswer = val;
        els.answerDisplay.textContent = val || '?';
        els.answerDisplay.classList.toggle('has-value', val.length > 0);
    }

    function appendDigit(digit) {
        if (isProcessing) return;
        if (currentAnswer.length >= 3) return; // Max 3 Stellen (Addition bis 20)
        setAnswer(currentAnswer + digit);
    }

    function deleteDigit() {
        if (isProcessing) return;
        setAnswer(currentAnswer.slice(0, -1));
    }

    // ===== Hintergrund-Partikel =====
    function initBgParticles() {
        const symbols = ['➕', '➖', '✖️', '➗', '🔢', '💯', '🧮', '⭐', '🌟', '✨', '💫', '🎯'];
        const container = els.bgParticles;
        if (!container) return;

        for (let i = 0; i < 15; i++) {
            const particle = document.createElement('div');
            particle.className = 'bg-particle';
            particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
            particle.style.left = Math.random() * 100 + '%';
            particle.style.animationDuration = (15 + Math.random() * 20) + 's';
            particle.style.animationDelay = -(Math.random() * 20) + 's';
            particle.style.fontSize = (14 + Math.random() * 20) + 'px';
            particle.style.opacity = 0.15 + Math.random() * 0.15;
            container.appendChild(particle);
        }
    }

    // ===== Maskottchen-Reaktionen =====
    const mascotMoods = {
        idle: '🦊',
        happy: '🥳',
        superHappy: '🤩',
        thinking: '🤔',
        sad: '😅',
        fire: '🔥',
        sleeping: '😴',
        wave: '👋',
        celebrate: '🎉',
        star: '🌟',
        rocket: '🚀'
    };

    function setMascot(mood, el) {
        const target = el || els.mascot;
        if (!target) return;
        target.textContent = mascotMoods[mood] || mascotMoods.idle;
        target.classList.remove('mascot-bounce', 'mascot-spin', 'mascot-shake');
        void target.offsetWidth;
        if (mood === 'happy' || mood === 'superHappy') {
            target.classList.add('mascot-bounce');
        } else if (mood === 'fire' || mood === 'celebrate') {
            target.classList.add('mascot-spin');
        } else if (mood === 'sad') {
            target.classList.add('mascot-shake');
        }
    }

    // ===== Mini-Partikel bei richtiger Antwort =====
    function spawnMiniParticles(emoji, count) {
        const gameArea = document.querySelector('.game-area');
        if (!gameArea) return;
        for (let i = 0; i < count; i++) {
            const p = document.createElement('div');
            p.className = 'mini-particle';
            p.textContent = emoji;
            p.style.left = (30 + Math.random() * 40) + '%';
            p.style.animationDuration = (0.6 + Math.random() * 0.8) + 's';
            p.style.setProperty('--dx', (Math.random() - 0.5) * 120 + 'px');
            gameArea.appendChild(p);
            setTimeout(() => p.remove(), 1500);
        }
    }

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
            startGameWithCountdown(1);
        });
    }

    // ===== Countdown =====
    function startGameWithCountdown(level) {
        Game.startRound(level);
        currentStreak = 0;
        showScreen('game');
        setMascot('thinking');
        updateStreakDisplay();

        if (!els.countdownOverlay) {
            nextTask();
            return;
        }

        els.countdownOverlay.classList.remove('hidden');
        isProcessing = true;

        let count = 3;
        els.countdownNumber.textContent = count;
        els.countdownNumber.className = 'countdown-num countdown-pop';
        Sounds.countdown(count);

        const interval = setInterval(() => {
            count--;
            if (count > 0) {
                els.countdownNumber.textContent = count;
                els.countdownNumber.className = 'countdown-num';
                void els.countdownNumber.offsetWidth;
                els.countdownNumber.className = 'countdown-num countdown-pop';
                Sounds.countdown(count);
            } else if (count === 0) {
                els.countdownNumber.textContent = 'Los!';
                els.countdownNumber.className = 'countdown-num countdown-pop countdown-go';
                Sounds.countdown(0);
            } else {
                clearInterval(interval);
                els.countdownOverlay.classList.add('hidden');
                isProcessing = false;
                setMascot('idle');
                nextTask();
            }
        }, 800);
    }

    // ===== Spiel =====
    function nextTask() {
        const task = Game.generateTask();
        const progress = Game.getProgress();

        els.taskNum1.textContent = task.num1;
        els.taskOp.textContent = task.op;
        els.taskNum2.textContent = task.num2;

        setAnswer('');
        els.feedback.classList.add('hidden');
        isProcessing = false;

        updateProgress(progress);
        els.taskDisplay.classList.remove('shake', 'pop', 'task-correct', 'task-wrong');
        void els.taskDisplay.offsetWidth;
        els.taskDisplay.classList.add('pop');
    }

    function updateProgress(progress) {
        const pct = (progress.currentTask / progress.totalTasks) * 100;
        els.progressFill.style.width = pct + '%';
        els.progressText.textContent = (progress.currentTask + 1) + ' / ' + progress.totalTasks;
        els.gameScore.textContent = '✅ ' + progress.score;
    }

    function updateStreakDisplay() {
        if (!els.streakDisplay) return;
        if (currentStreak >= 3) {
            els.streakDisplay.classList.remove('hidden');
            els.streakDisplay.textContent = '🔥 ' + currentStreak + 'x Streak!';
            els.streakDisplay.classList.remove('streak-pop');
            void els.streakDisplay.offsetWidth;
            els.streakDisplay.classList.add('streak-pop');
        } else {
            els.streakDisplay.classList.add('hidden');
        }
    }

    function handleAnswer() {
        if (isProcessing) return;
        if (currentAnswer === '') return;
        isProcessing = true;

        const result = Game.checkAnswer(currentAnswer);

        if (feedbackTimeout) clearTimeout(feedbackTimeout);
        els.feedback.classList.remove('hidden', 'correct', 'wrong');
        els.taskDisplay.classList.remove('task-correct', 'task-wrong');

        if (result.isCorrect) {
            currentStreak++;
            els.feedback.classList.add('correct');
            els.feedback.textContent = randomPraise();
            els.taskDisplay.classList.add('task-correct');

            if (currentStreak >= 5) {
                setMascot('fire');
                Sounds.streak(currentStreak);
                spawnMiniParticles('🔥', 8);
            } else if (currentStreak >= 3) {
                setMascot('superHappy');
                Sounds.streak(currentStreak);
                spawnMiniParticles('⭐', 5);
            } else {
                setMascot('happy');
                Sounds.correct();
                spawnMiniParticles('✨', 3);
            }
            updateStreakDisplay();
        } else {
            currentStreak = 0;
            els.feedback.classList.add('wrong');
            els.feedback.textContent = 'Die Antwort ist ' + result.correctAnswer + '!';
            els.taskDisplay.classList.add('task-wrong');
            setMascot('sad');
            Sounds.wrong();
            updateStreakDisplay();
        }

        if (result.isRoundOver) {
            setTimeout(() => {
                Sounds.roundComplete();
                showResult(result.score);
            }, 1500);
        } else {
            feedbackTimeout = setTimeout(() => {
                setMascot('idle');
                nextTask();
            }, 1200);
        }
    }

    function randomPraise() {
        const praises = [
            'Super! 🎉', 'Richtig! ✨', 'Genau! 👏', 'Toll! 🌟',
            'Perfekt! 💪', 'Klasse! 🏆', 'Wow! 🚀', 'Spitze! ⭐',
            'Mega! 💥', 'Bingo! 🎯', 'Yeah! 🙌', 'Top! 🏅'
        ];
        return praises[Math.floor(Math.random() * praises.length)];
    }

    function initGame() {
        // Numpad: Ziffern, Löschen, Absenden
        els.numpad.addEventListener('click', (e) => {
            const btn = e.target.closest('.numpad-btn');
            if (!btn) return;
            Sounds.click();

            if (btn.dataset.num !== undefined) {
                appendDigit(btn.dataset.num);
            } else if (btn.dataset.action === 'delete') {
                deleteDigit();
            } else if (btn.dataset.action === 'submit') {
                handleAnswer();
            }
        });

        // Tastatur-Support bleibt für Desktop
        document.addEventListener('keydown', (e) => {
            if (!screens.game.classList.contains('active')) return;
            if (e.key >= '0' && e.key <= '9') {
                appendDigit(e.key);
            } else if (e.key === 'Backspace') {
                deleteDigit();
            } else if (e.key === 'Enter') {
                handleAnswer();
            }
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
            if (els.resultMascot) els.resultMascot.textContent = '🤩';
            launchConfetti();
            launchConfetti(); // doppelt für extra Effekt
        } else if (pct >= 0.8) {
            els.resultTitle.textContent = 'Großartig! 🎉';
            els.resultMessage.textContent = 'Fast alles richtig – super gemacht!';
            if (els.resultMascot) els.resultMascot.textContent = '🥳';
            launchConfetti();
        } else if (pct >= 0.5) {
            els.resultTitle.textContent = 'Gut gemacht! 👍';
            els.resultMessage.textContent = 'Übe weiter, du wirst immer besser!';
            if (els.resultMascot) els.resultMascot.textContent = '😊';
        } else {
            els.resultTitle.textContent = 'Weiter üben! 💪';
            els.resultMessage.textContent = 'Übung macht den Meister – versuch es nochmal!';
            if (els.resultMascot) els.resultMascot.textContent = '🦊';
        }

        els.jokeText.textContent = Jokes.getRandom();
        showScreen('result');
    }

    function initResult() {
        els.btnRetry.addEventListener('click', () => {
            Sounds.click();
            startGameWithCountdown(1);
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
        const colors = ['#6C63FF', '#FF5252', '#4CAF50', '#FF9800', '#E91E63', '#00BCD4', '#FFD700', '#FF69B4'];

        for (let i = 0; i < 150; i++) {
            pieces.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height - canvas.height,
                w: Math.random() * 12 + 4,
                h: Math.random() * 8 + 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                speed: Math.random() * 4 + 2,
                angle: Math.random() * Math.PI * 2,
                spin: (Math.random() - 0.5) * 0.3,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: Math.random() * 0.1 + 0.03
            });
        }

        let frame = 0;
        const maxFrames = 200;

        function animate() {
            if (frame >= maxFrames) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            pieces.forEach(p => {
                p.y += p.speed;
                p.angle += p.spin;
                p.wobble += p.wobbleSpeed;
                p.x += Math.sin(p.wobble) * 1.5;
                ctx.save();
                ctx.translate(p.x, p.y);
                ctx.rotate(p.angle);
                ctx.globalAlpha = frame > maxFrames - 30 ? (maxFrames - frame) / 30 : 1;
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
        initBgParticles();
        initWelcome();
        initLevels();
        initGame();
        initResult();

        const savedName = Storage.getPlayerName();
        if (savedName) {
            showLevelScreen(savedName);
        }
    }

    init();
})();
