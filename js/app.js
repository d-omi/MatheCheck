/**
 * MatheCheck - Haupt-App-Logik (Mario-Edition).
 * Pixel-Art Charakter läuft durch eine Mario-Welt,
 * springt gegen ?-Blöcke und sammelt Münzen.
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
        starsLevel2: document.getElementById('stars-level-2'),
        statRounds: document.getElementById('stat-rounds'),
        statBest: document.getElementById('stat-best'),
        taskNum1: document.getElementById('task-num1'),
        taskOp: document.getElementById('task-op'),
        taskNum2: document.getElementById('task-num2'),
        taskDisplay: document.getElementById('task-display'),
        answerDisplay: document.getElementById('answer-display'),
        numpad: document.querySelector('.numpad'),
        feedback: document.getElementById('feedback'),
        gameScore: document.getElementById('game-score'),
        streakDisplay: document.getElementById('streak-display'),
        countdownOverlay: document.getElementById('countdown-overlay'),
        countdownNumber: document.getElementById('countdown-number'),
        progressFill: document.getElementById('progress-fill'),
        progressText: document.getElementById('progress-text'),
        resultTitle: document.getElementById('result-title'),
        resultScore: document.getElementById('result-score'),
        resultStars: document.getElementById('result-stars'),
        resultMessage: document.getElementById('result-message'),
        resultMascot: document.getElementById('result-mascot'),
        jokeText: document.getElementById('joke-text'),
        resultTotal: document.getElementById('result-total'),
        btnRetry: document.getElementById('btn-retry'),
        btnBackLevels: document.getElementById('btn-back-levels'),
        confettiCanvas: document.getElementById('confetti-canvas'),
        bgParticles: document.getElementById('bg-particles'),
        gameViewport: document.getElementById('game-viewport'),
        gameWorld: document.getElementById('game-world'),
        btnGameBack: document.getElementById('btn-game-back')
    };

    let feedbackTimeout = null;
    let currentStreak = 0;
    let isProcessing = false;
    let currentAnswer = '';
    let currentBlockIndex = 0;
    let charPos = 0;
    let currentLevel = 1;

    // ===== Welt-Konstanten =====
    const BLOCK_SPACING = 80;
    const WORLD_PADDING_LEFT = 80;
    const WORLD_PADDING_RIGHT = 160;
    const VIEWPORT_WIDTH = 500;

    function getBlockX(index) {
        return WORLD_PADDING_LEFT + index * BLOCK_SPACING;
    }

    function getWorldWidth(numBlocks) {
        return WORLD_PADDING_LEFT + (numBlocks - 1) * BLOCK_SPACING + WORLD_PADDING_RIGHT;
    }

    // ===== Seeded RNG für dekorative Elemente =====
    function mulberry32(a) {
        return function() {
            a |= 0;
            a = a + 0x6D2B79F5 | 0;
            var t = Math.imul(a ^ a >>> 15, 1 | a);
            t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
            return ((t ^ t >>> 14) >>> 0) / 4294967296;
        };
    }

    // ===== Numpad Antwort-Verwaltung =====
    function setAnswer(val) {
        currentAnswer = val;
        els.answerDisplay.textContent = val || '?';
        els.answerDisplay.classList.toggle('has-value', val.length > 0);
    }

    function appendDigit(digit) {
        if (isProcessing) return;
        if (currentAnswer.length >= 3) return;
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

    // ===== Mario-Welt bauen =====
    function buildWorldHTML(numBlocks) {
        const worldW = getWorldWidth(numBlocks);
        const rng = mulberry32(42);
        let html = '';

        // Wolken
        const cloudCount = Math.max(4, Math.floor(worldW / 300));
        for (let i = 0; i < cloudCount; i++) {
            const cx = 60 + rng() * (worldW - 120);
            const cy = 15 + rng() * 55;
            const type = rng() > 0.5 ? 'cloud--1' : 'cloud--2';
            html += '<div class="cloud ' + type + '" style="left:' + cx + 'px;top:' + cy + 'px"></div>';
        }

        // Hügel
        const hillCount = Math.max(3, Math.floor(worldW / 350));
        for (let i = 0; i < hillCount; i++) {
            const hx = rng() * worldW;
            const hw = 120 + rng() * 160;
            const hh = 40 + rng() * 50;
            const isBg = rng() > 0.5;
            html += '<div class="hill' + (isBg ? ' hill--bg' : '') + '" style="left:' + hx + 'px;width:' + hw + 'px;height:' + hh + 'px"></div>';
        }

        // Block-Positionen merken für Kollisions-Check
        const blockPositions = [];
        for (let j = 0; j < numBlocks; j++) {
            blockPositions.push(getBlockX(j));
        }
        const isTooClose = function(x) {
            return blockPositions.some(function(bx) { return Math.abs(bx - x) < 55; });
        };

        // Büsche
        const bushCount = Math.max(3, Math.floor(worldW / 300));
        for (let i = 0; i < bushCount; i++) {
            const bx = 40 + rng() * (worldW - 80);
            if (isTooClose(bx)) continue;
            html += '<div class="bush" style="left:' + bx + 'px"></div>';
        }

        // Rohre
        for (let i = 0; i < numBlocks - 1; i++) {
            if (rng() > 0.65) {
                const px = getBlockX(i) + 60 + rng() * 40;
                const ph = 35 + rng() * 25;
                if (!isTooClose(px)) {
                    html += '<div class="pipe" style="left:' + px + 'px;height:' + ph + 'px"></div>';
                }
            }
        }

        // Frageblöcke
        for (let i = 0; i < numBlocks; i++) {
            const bx = getBlockX(i);
            const state = i === 0 ? 'current' : 'locked';
            html += '<div class="q-block ' + state + '" data-block="' + i + '" style="left:' + bx + 'px">?</div>';
        }

        // Fahnenmast am Ende
        const flagX = getBlockX(numBlocks - 1) + BLOCK_SPACING * 0.7;
        html += '<div class="flag-pole" style="left:' + flagX + 'px"></div>';

        // Boden
        html += '<div class="ground" style="width:' + worldW + 'px"></div>';

        // Charakter
        html += '<div class="character" id="game-char" style="left:' + (getBlockX(0) - 10) + 'px">';
        html += '<div class="char-body">';
        html += '<div class="char-cap"></div>';
        html += '<div class="char-head"><div class="char-eye"></div></div>';
        html += '<div class="char-shirt"></div>';
        html += '<div class="char-legs"></div>';
        html += '<div class="char-shoes"></div>';
        html += '</div></div>';

        return { html: html, worldWidth: worldW };
    }

    // ===== Viewport-Scrolling =====
    function getScrollOffset(charX) {
        var vw = els.gameViewport ? Math.min(VIEWPORT_WIDTH, els.gameViewport.offsetWidth) : VIEWPORT_WIDTH;
        var half = vw / 2;
        var offset = -(charX - half + 17);
        if (offset > 0) offset = 0;
        return offset;
    }

    function scrollWorldTo(charX) {
        if (!els.gameWorld) return;
        var offset = getScrollOffset(charX);
        els.gameWorld.style.transform = 'translateX(' + offset + 'px)';
    }

    // ===== Charakter bewegen =====
    function moveCharTo(targetX) {
        charPos = targetX;
        var charEl = document.getElementById('game-char');
        if (charEl) {
            charEl.classList.add('walking');
            charEl.style.left = targetX + 'px';
            setTimeout(function() { charEl.classList.remove('walking'); }, 600);
        }
        scrollWorldTo(targetX);
    }

    // ===== Charakter-Animationen =====
    function charJump() {
        var charEl = document.getElementById('game-char');
        if (!charEl) return;
        charEl.classList.remove('jumping', 'stumble');
        void charEl.offsetWidth;
        charEl.classList.add('jumping');
        setTimeout(function() { charEl.classList.remove('jumping'); }, 500);
    }

    function charStumble() {
        var charEl = document.getElementById('game-char');
        if (!charEl) return;
        charEl.classList.remove('jumping', 'stumble');
        void charEl.offsetWidth;
        charEl.classList.add('stumble');
        setTimeout(function() { charEl.classList.remove('stumble'); }, 500);
    }

    function charStarPower() {
        var charEl = document.getElementById('game-char');
        if (!charEl) return;
        charEl.classList.add('star-power');
        setTimeout(function() { charEl.classList.remove('star-power'); }, 2000);
    }

    // ===== Münzen-Burst =====
    function spawnCoinBurst(x) {
        if (!els.gameWorld) return;
        var coin = document.createElement('div');
        coin.className = 'coin-burst';
        coin.textContent = '🪙';
        coin.style.left = x + 'px';
        coin.style.bottom = '110px';
        els.gameWorld.appendChild(coin);
        setTimeout(function() { coin.remove(); }, 700);
    }

    // ===== Block aktualisieren =====
    function updateBlock(index, correct) {
        var block = document.querySelector('.q-block[data-block="' + index + '"]');
        if (!block) return;
        block.className = 'q-block ' + (correct ? 'correct' : 'wrong');
        block.textContent = '';
    }

    function activateNextBlock(index) {
        var block = document.querySelector('.q-block[data-block="' + index + '"]');
        if (block) {
            block.className = 'q-block current';
        }
    }

    // ===== HUD aktualisieren =====
    function updateHUD(progress) {
        var pct = Math.round((progress.answered / progress.totalTasks) * 100);
        els.progressFill.style.width = pct + '%';
        els.progressText.textContent = progress.answered + '/' + progress.totalTasks;
        els.gameScore.textContent = '⭐ ' + progress.score + '/' + progress.answered;
    }

    // ===== Mini-Partikel =====
    function spawnMiniParticles(emoji, count) {
        var gameArea = document.querySelector('.game-area');
        if (!gameArea) return;
        for (var i = 0; i < count; i++) {
            var p = document.createElement('div');
            p.className = 'mini-particle';
            p.textContent = emoji;
            p.style.left = (30 + Math.random() * 40) + '%';
            p.style.animationDuration = (0.6 + Math.random() * 0.8) + 's';
            p.style.setProperty('--dx', (Math.random() - 0.5) * 120 + 'px');
            gameArea.appendChild(p);
            setTimeout(function(el) { el.remove(); }, 1500, p);
        }
    }

    // ===== Maskottchen (nur Result-Screen) =====
    const mascotMoods = {
        idle: '🦊', happy: '🥳', superHappy: '🤩',
        thinking: '🤔', sad: '😅', fire: '🔥'
    };

    function setMascot(mood) {
        if (!els.resultMascot) return;
        els.resultMascot.textContent = mascotMoods[mood] || mascotMoods.idle;
    }

    // ===== Screen Navigation =====
    function showScreen(name) {
        Object.values(screens).forEach(function(s) { s.classList.remove('active'); });
        screens[name].classList.add('active');
    }

    // ===== Willkommen =====
    function initWelcome() {
        var savedName = Storage.getPlayerName();
        if (savedName) {
            els.playerName.value = savedName;
            els.btnStart.disabled = false;
        }

        els.playerName.addEventListener('input', function() {
            els.btnStart.disabled = els.playerName.value.trim().length === 0;
        });

        els.playerName.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' && !els.btnStart.disabled) {
                goToLevels();
            }
        });

        els.btnStart.addEventListener('click', function() {
            Sounds.click();
            goToLevels();
        });
    }

    function goToLevels() {
        var name = els.playerName.value.trim();
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
        var stats1 = Storage.getLevelStats(1);
        var stats2 = Storage.getLevelStats(2);
        var totalRounds = stats1.roundsPlayed + stats2.roundsPlayed;
        var bestScore = Math.max(stats1.bestScore, stats2.bestScore);
        els.statRounds.textContent = totalRounds;
        els.statBest.textContent = bestScore + ' / ' + Game.getTotalTasks();
        els.starsLevel1.textContent = getStarsForScore(stats1.bestScore);
        if (els.starsLevel2) els.starsLevel2.textContent = getStarsForScore(stats2.bestScore);
    }

    function getStarsForScore(score) {
        var total = Game.getTotalTasks();
        var pct = score / total;
        if (pct >= 1) return '⭐⭐⭐';
        if (pct >= 0.8) return '⭐⭐';
        if (pct >= 0.5) return '⭐';
        if (score > 0) return '☆';
        return '';
    }

    function initLevels() {
        els.btnLogout.addEventListener('click', function() {
            Storage.clearPlayerName();
            els.playerName.value = '';
            els.btnStart.disabled = true;
            showScreen('welcome');
        });

        document.querySelector('[data-level="1"]').addEventListener('click', function() {
            Sounds.click();
            startGameWithCountdown(1);
        });

        document.querySelector('[data-level="2"]').addEventListener('click', function() {
            Sounds.click();
            startGameWithCountdown(2);
        });
    }

    // ===== Countdown =====
    function startGameWithCountdown(level) {
        Game.startRound(level);
        currentLevel = level;
        currentStreak = 0;
        currentBlockIndex = 0;
        showScreen('game');
        updateStreakDisplay();

        // Mario-Welt aufbauen
        var totalTasks = Game.getTotalTasks();
        var world = buildWorldHTML(totalTasks);
        els.gameWorld.innerHTML = world.html;
        els.gameWorld.style.width = world.worldWidth + 'px';

        // Charakter-Position initialisieren
        charPos = getBlockX(0) - 10;
        scrollWorldTo(charPos);

        // HUD initialisieren
        updateHUD({ answered: 0, totalTasks: totalTasks, score: 0 });

        if (!els.countdownOverlay) {
            nextTask();
            return;
        }

        els.countdownOverlay.classList.remove('hidden');
        isProcessing = true;

        var count = 3;
        els.countdownNumber.textContent = count;
        els.countdownNumber.className = 'countdown-num countdown-pop';
        Sounds.countdown(count);

        var interval = setInterval(function() {
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
                nextTask();
            }
        }, 800);
    }

    // ===== Spiel =====
    function nextTask() {
        var task = Game.generateTask();
        var progress = Game.getProgress();

        els.taskNum1.textContent = task.num1;
        els.taskOp.textContent = task.op;
        els.taskNum2.textContent = task.num2;

        setAnswer('');
        els.feedback.classList.add('hidden');
        isProcessing = false;

        // Mario zum aktuellen Block bewegen
        currentBlockIndex = progress.currentTask;
        var targetX = getBlockX(currentBlockIndex) - 10;
        moveCharTo(targetX);

        els.taskDisplay.classList.remove('shake', 'pop', 'task-correct', 'task-wrong');
        void els.taskDisplay.offsetWidth;
        els.taskDisplay.classList.add('pop');
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

        var result = Game.checkAnswer(currentAnswer);
        var progress = Game.getProgress();

        if (feedbackTimeout) clearTimeout(feedbackTimeout);
        els.feedback.classList.remove('hidden', 'correct', 'wrong');
        els.taskDisplay.classList.remove('task-correct', 'task-wrong');

        // HUD aktualisieren
        updateHUD({
            answered: progress.currentTask + (result.isRoundOver ? 1 : 0),
            totalTasks: progress.totalTasks,
            score: progress.score
        });

        if (result.isCorrect) {
            currentStreak++;
            els.feedback.classList.add('correct');
            els.feedback.textContent = randomPraise();
            els.taskDisplay.classList.add('task-correct');

            // Mario springt, Block wird grün, Münze fliegt
            charJump();
            updateBlock(currentBlockIndex, true);
            spawnCoinBurst(charPos + 17);

            if (currentStreak >= 5) {
                charStarPower();
                Sounds.streak();
                spawnMiniParticles('🔥', 8);
            } else if (currentStreak >= 3) {
                Sounds.streak();
                spawnMiniParticles('⭐', 5);
            } else {
                Sounds.correct();
                spawnMiniParticles('✨', 3);
            }
            updateStreakDisplay();
        } else {
            currentStreak = 0;
            els.feedback.classList.add('wrong');
            els.feedback.textContent = 'Die Antwort ist ' + result.correctAnswer + '!';
            els.taskDisplay.classList.add('task-wrong');

            // Mario stolpert, Block wird rot
            charStumble();
            updateBlock(currentBlockIndex, false);
            Sounds.wrong();
            updateStreakDisplay();
        }

        if (result.isRoundOver) {
            setTimeout(function() {
                // Mario läuft zum Fahnenmast
                var flagX = getBlockX(Game.getTotalTasks() - 1) + BLOCK_SPACING * 0.7 - 10;
                moveCharTo(flagX);
                setTimeout(function() {
                    Sounds.roundComplete();
                    showResult(result.score);
                }, 800);
            }, 1200);
        } else {
            feedbackTimeout = setTimeout(function() {
                // Nächsten Block aktivieren
                activateNextBlock(currentBlockIndex + 1);
                nextTask();
            }, 1200);
        }
    }

    function randomPraise() {
        var praises = [
            'Super! 🎉', 'Richtig! ✨', 'Genau! 👏', 'Toll! 🌟',
            'Perfekt! 💪', 'Klasse! 🏆', 'Wow! 🚀', 'Spitze! ⭐',
            'Mega! 💥', 'Bingo! 🎯', 'Yeah! 🙌', 'Top! 🏅'
        ];
        return praises[Math.floor(Math.random() * praises.length)];
    }

    function initGame() {
        // Zurück-Button: Ergebnis anzeigen oder zurück zur Level-Auswahl
        if (els.btnGameBack) {
            els.btnGameBack.addEventListener('click', function() {
                Sounds.click();
                var progress = Game.getProgress();
                if (progress.currentTask > 0) {
                    showResult(progress.score, progress.currentTask);
                } else {
                    showLevelScreen(Storage.getPlayerName());
                }
            });
        }

        // Numpad: Ziffern, Löschen, Absenden
        els.numpad.addEventListener('click', function(e) {
            var btn = e.target.closest('.numpad-btn');
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

        // Tastatur-Support für Desktop
        document.addEventListener('keydown', function(e) {
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
    function showResult(score, answered) {
        var total = Game.getTotalTasks();
        if (answered === undefined) answered = total;
        var pct = answered > 0 ? score / answered : 0;

        Storage.saveRoundResult(currentLevel, score);

        els.resultScore.textContent = score;
        els.resultTotal.textContent = 'von ' + answered + ' richtig';
        els.resultStars.textContent = getStarsForScore(score);

        if (answered < total) {
            els.resultTitle.textContent = 'Abgebrochen';
            els.resultMessage.textContent = score + ' von ' + answered + ' Aufgaben richtig beantwortet.';
            setMascot('idle');
        } else if (pct >= 1) {
            els.resultTitle.textContent = 'Perfekt! 🏆🎆';
            els.resultMessage.textContent = 'Alle richtig – du bist ein Mathe-Genie!';
            setMascot('superHappy');
            launchFireworks();
        } else if (pct >= 0.8) {
            els.resultTitle.textContent = 'Großartig! 🎉';
            els.resultMessage.textContent = 'Fast alles richtig – super gemacht!';
            setMascot('happy');
            launchConfetti();
        } else if (pct >= 0.5) {
            els.resultTitle.textContent = 'Gut gemacht! 👍';
            els.resultMessage.textContent = 'Übe weiter, du wirst immer besser!';
            setMascot('idle');
        } else {
            els.resultTitle.textContent = 'Weiter üben! 💪';
            els.resultMessage.textContent = 'Übung macht den Meister – versuch es nochmal!';
            setMascot('idle');
        }

        els.jokeText.textContent = Jokes.getRandom();
        showScreen('result');
    }

    function initResult() {
        els.btnRetry.addEventListener('click', function() {
            Sounds.click();
            startGameWithCountdown(currentLevel);
        });
        els.btnBackLevels.addEventListener('click', function() {
            Sounds.click();
            showLevelScreen(Storage.getPlayerName());
        });
    }

    // ===== Konfetti =====
    function launchConfetti() {
        var canvas = els.confettiCanvas;
        var ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        var pieces = [];
        var colors = ['#6C63FF', '#FF5252', '#4CAF50', '#FF9800', '#E91E63', '#00BCD4', '#FFD700', '#FF69B4'];

        for (var i = 0; i < 150; i++) {
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

        var frame = 0;
        var maxFrames = 200;

        function animate() {
            if (frame >= maxFrames) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            pieces.forEach(function(p) {
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

    // ===== Feuerwerk (bei 66/66) =====
    function launchFireworks() {
        var canvas = els.confettiCanvas;
        var ctx = canvas.getContext('2d');
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        var rockets = [];
        var sparks = [];
        var colors = ['#FF5252', '#FFD700', '#4CAF50', '#6C63FF', '#FF69B4', '#00BCD4', '#FF9800', '#E91E63'];
        var frame = 0;
        var maxFrames = 360;
        var nextRocket = 0;

        function spawnRocket() {
            rockets.push({
                x: canvas.width * (0.15 + Math.random() * 0.7),
                y: canvas.height,
                targetY: canvas.height * (0.1 + Math.random() * 0.35),
                speed: 4 + Math.random() * 3,
                color: colors[Math.floor(Math.random() * colors.length)],
                trail: []
            });
        }

        function explode(r) {
            var count = 60 + Math.floor(Math.random() * 40);
            for (var i = 0; i < count; i++) {
                var angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.3;
                var speed = 1.5 + Math.random() * 3.5;
                sparks.push({
                    x: r.x,
                    y: r.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed,
                    color: r.color,
                    life: 1,
                    decay: 0.008 + Math.random() * 0.012,
                    size: 2 + Math.random() * 2
                });
            }
        }

        function animate() {
            if (frame >= maxFrames && sparks.length === 0) {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                return;
            }

            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Neue Raketen starten
            if (frame < maxFrames - 60 && frame >= nextRocket) {
                spawnRocket();
                nextRocket = frame + 20 + Math.floor(Math.random() * 30);
            }

            // Raketen zeichnen und bewegen
            for (var i = rockets.length - 1; i >= 0; i--) {
                var r = rockets[i];
                r.trail.push({ x: r.x, y: r.y });
                if (r.trail.length > 8) r.trail.shift();
                r.y -= r.speed;
                r.x += (Math.random() - 0.5) * 0.8;

                // Schweif zeichnen
                for (var t = 0; t < r.trail.length; t++) {
                    var alpha = t / r.trail.length * 0.6;
                    ctx.beginPath();
                    ctx.arc(r.trail[t].x, r.trail[t].y, 2, 0, Math.PI * 2);
                    ctx.fillStyle = 'rgba(255,255,200,' + alpha + ')';
                    ctx.fill();
                }

                // Rakete selbst
                ctx.beginPath();
                ctx.arc(r.x, r.y, 3, 0, Math.PI * 2);
                ctx.fillStyle = '#fff';
                ctx.fill();

                if (r.y <= r.targetY) {
                    explode(r);
                    Sounds.correct();
                    rockets.splice(i, 1);
                }
            }

            // Funken zeichnen und bewegen
            for (var j = sparks.length - 1; j >= 0; j--) {
                var s = sparks[j];
                s.x += s.vx;
                s.y += s.vy;
                s.vy += 0.04; // Schwerkraft
                s.life -= s.decay;

                if (s.life <= 0) {
                    sparks.splice(j, 1);
                    continue;
                }

                ctx.beginPath();
                ctx.arc(s.x, s.y, s.size * s.life, 0, Math.PI * 2);
                ctx.globalAlpha = s.life;
                ctx.fillStyle = s.color;
                ctx.fill();
                ctx.globalAlpha = 1;
            }

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

        var savedName = Storage.getPlayerName();
        if (savedName) {
            showLevelScreen(savedName);
        }
    }

    init();
})();
