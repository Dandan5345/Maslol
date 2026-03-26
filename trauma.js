(function () {
    let currentQuestionIndex = 0;
    let score = 0;
    let userAnswers = [];
    let currentMode = '39';
    let activeQuizData = [];

    function shuffle(items) {
        const copy = [...items];
        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }
        return copy;
    }

    function ensure100QuizData() {
        if (typeof quiz100Data === 'undefined' || typeof flashcardsData === 'undefined') {
            return;
        }

        if (quiz100Data.length >= 100) {
            return;
        }

        const startIndex = quiz100Data.length;
        for (let i = startIndex; i < flashcardsData.length && quiz100Data.length < 100; i++) {
            const flashcard = flashcardsData[i];
            const distractors = [];

            while (distractors.length < 3) {
                const randomIndex = Math.floor(Math.random() * flashcardsData.length);
                const candidate = flashcardsData[randomIndex]?.a;
                if (randomIndex !== i && candidate && !distractors.includes(candidate) && candidate !== flashcard.a) {
                    distractors.push(candidate);
                }
            }

            const options = shuffle([...distractors, flashcard.a]);
            quiz100Data.push({
                question: flashcard.q,
                options,
                answers: [options.indexOf(flashcard.a)]
            });
        }
    }

    function initTraumaApp() {
        ensure100QuizData();

        const views = document.querySelectorAll('.view');
        const toastEl = document.getElementById('toast');
        const titleEl = document.getElementById('trauma-view-title');
        const subtitleEl = document.getElementById('trauma-view-subtitle');

        const quizProgress = document.getElementById('quiz-progress');
        const currentQNum = document.getElementById('current-q-num');
        const totalQNum = document.getElementById('total-q-num');
        const questionText = document.getElementById('question-text');
        const optionsContainer = document.getElementById('options-container');
        const btnCheck = document.getElementById('check-btn');
        const btnNext = document.getElementById('next-btn');
        const multiSelectHint = document.getElementById('multi-select-hint');

        const fcProgress = document.getElementById('fc-progress');
        const currentFcNum = document.getElementById('current-fc-num');
        const totalFcNum = document.getElementById('total-fc-num');
        const fcQuestion = document.getElementById('fc-question');
        const fcAnswer = document.getElementById('fc-answer');
        const flashcardElement = document.getElementById('flashcard-element');
        const btnFcPrev = document.getElementById('fc-prev-btn');
        const btnFcNext = document.getElementById('fc-next-btn');

        const scorePercentage = document.getElementById('score-percentage');
        const scoreCirclePath = document.getElementById('score-circle-path');
        const scoreCorrect = document.getElementById('score-correct');
        const scoreTotal = document.getElementById('score-total');
        const btnRestart = document.getElementById('restart-btn');
        const btnFinish = document.getElementById('finish-btn');

        const trauma39Data = quiz100Data.slice(0, 39);
        const homeHref = document.body?.dataset?.homeHref || 'axes.html';

        function updateFloatingNav(viewId = 'subcategory-screen') {
            if (typeof window.setFloatingNavState === 'function') {
                const isHomeView = viewId === 'subcategory-screen';
                window.setFloatingNavState({
                    backAction: () => {
                        if (isHomeView) {
                            window.location.href = homeHref;
                            return;
                        }
                        showView('subcategory-screen');
                    },
                    homeAction: () => {
                        window.location.href = homeHref;
                    }
                });
            }
        }

        function updateHeader(viewId) {
            const titles = {
                'subcategory-screen': ['ציר טראומה', 'בחרו מצב תרגול'],
                'quiz-screen': ['מבחן טראומה', currentMode === '39' ? 'מבחן מסכם קצר וממוקד.' : 'מבחן ענק עם מאה שאלות.'],
                'flashcards-screen': ['כרטיסיות טראומה', 'מעבר מהיר בין מושגים, פרוטוקולים ו-TCCC.'],
                'result-screen': ['סיכום תרגול', 'אפשר להפעיל מבחן נוסף או לחזור למסך הראשי של טראומה.']
            };

            const [title, subtitle] = titles[viewId] || titles['subcategory-screen'];
            if (titleEl) titleEl.textContent = title;
            if (subtitleEl) subtitleEl.textContent = subtitle;
        }

        function showView(viewId) {
            views.forEach((view) => view.classList.remove('active-view'));
            document.getElementById(viewId)?.classList.add('active-view');
            updateHeader(viewId);
            updateFloatingNav(viewId);
        }

        function showToast(message) {
            if (!toastEl) {
                return;
            }
            toastEl.textContent = message;
            toastEl.classList.remove('hidden');
            setTimeout(() => {
                toastEl.classList.add('hidden');
            }, 2600);
        }

        window.startQuiz = function startQuiz(type) {
            currentMode = type;
            activeQuizData = type === '39' ? shuffle(trauma39Data) : shuffle(quiz100Data.slice(0, 100));

            currentQuestionIndex = 0;
            score = 0;
            userAnswers = Array(activeQuizData.length).fill(null).map(() => []);

            totalQNum.textContent = activeQuizData.length;
            showView('quiz-screen');
            loadQuestion();
        };

        window.startFlashcards = function startFlashcards() {
            currentMode = 'fc';
            currentQuestionIndex = 0;
            activeQuizData = flashcardsData;
            totalFcNum.textContent = activeQuizData.length;
            showView('flashcards-screen');
            loadFlashcard();
        };

        window.quitCurrentActivity = function quitCurrentActivity() {
            if (confirm('לצאת מהתרגול ולחזור למסך טראומה הראשי?')) {
                showView('subcategory-screen');
            }
        };

        window.flipFlashcard = function flipFlashcard() {
            flashcardElement.classList.toggle('is-flipped');
        };

        function loadFlashcard() {
            const flashcard = activeQuizData[currentQuestionIndex];
            currentFcNum.textContent = currentQuestionIndex + 1;
            fcQuestion.textContent = flashcard.q;
            fcAnswer.textContent = flashcard.a;
            fcProgress.style.width = `${((currentQuestionIndex + 1) / activeQuizData.length) * 100}%`;
            btnFcPrev.disabled = currentQuestionIndex === 0;
            btnFcNext.textContent = currentQuestionIndex === activeQuizData.length - 1 ? 'סיום' : 'הבאה';
            flashcardElement.classList.remove('is-flipped');
        }

        window.prevFlashcard = function prevFlashcard() {
            if (currentQuestionIndex === 0) {
                return;
            }
            flashcardElement.classList.remove('is-flipped');
            setTimeout(() => {
                currentQuestionIndex -= 1;
                loadFlashcard();
            }, 220);
        };

        window.nextFlashcard = function nextFlashcard() {
            if (currentQuestionIndex < activeQuizData.length - 1) {
                flashcardElement.classList.remove('is-flipped');
                setTimeout(() => {
                    currentQuestionIndex += 1;
                    loadFlashcard();
                }, 220);
                return;
            }

            showToast('הגעת לסוף הכרטיסיות.');
            setTimeout(() => showView('subcategory-screen'), 700);
        };

        function loadQuestion() {
            const question = activeQuizData[currentQuestionIndex];
            currentQNum.textContent = currentQuestionIndex + 1;
            questionText.textContent = question.question;
            quizProgress.style.width = `${(currentQuestionIndex / activeQuizData.length) * 100}%`;
            optionsContainer.innerHTML = '';

            const isMulti = question.answers.length > 1;
            optionsContainer.classList.toggle('multi-select', isMulti);
            multiSelectHint.classList.toggle('hidden', !isMulti);

            question.options.forEach((optionText, index) => {
                const optionDiv = document.createElement('div');
                optionDiv.className = 'option';
                optionDiv.dataset.index = String(index);
                optionDiv.innerHTML = `
                    <div class="checkbox-indicator"></div>
                    <span class="option-text">${optionText}</span>
                `;
                optionDiv.addEventListener('click', () => handleOptionClick(optionDiv, index, isMulti));
                optionsContainer.appendChild(optionDiv);
            });

            btnCheck.disabled = true;
            btnCheck.classList.remove('hidden');
            btnNext.classList.add('hidden');
        }

        function handleOptionClick(optionElement, selectedIndex, isMulti) {
            if (btnCheck.classList.contains('hidden')) {
                return;
            }

            if (isMulti) {
                const selectedAnswers = userAnswers[currentQuestionIndex];
                const optionIndex = selectedAnswers.indexOf(selectedIndex);
                if (optionIndex > -1) {
                    selectedAnswers.splice(optionIndex, 1);
                    optionElement.classList.remove('selected');
                } else {
                    selectedAnswers.push(selectedIndex);
                    optionElement.classList.add('selected');
                }
            } else {
                document.querySelectorAll('.option').forEach((option) => option.classList.remove('selected'));
                optionElement.classList.add('selected');
                userAnswers[currentQuestionIndex] = [selectedIndex];
            }

            btnCheck.disabled = userAnswers[currentQuestionIndex].length === 0;
        }

        btnCheck.addEventListener('click', () => {
            const question = activeQuizData[currentQuestionIndex];
            const selected = userAnswers[currentQuestionIndex];
            const correctAnswers = question.answers;

            const isCorrect = selected.length === correctAnswers.length && selected.every((answer) => correctAnswers.includes(answer));
            if (isCorrect) {
                score += 1;
            }

            optionsContainer.querySelectorAll('.option').forEach((optionElement) => {
                const optionIndex = Number(optionElement.dataset.index);
                if (correctAnswers.includes(optionIndex)) {
                    optionElement.classList.add('correct');
                } else if (selected.includes(optionIndex)) {
                    optionElement.classList.add('incorrect');
                }
                optionElement.style.pointerEvents = 'none';
            });

            btnCheck.classList.add('hidden');
            btnNext.classList.remove('hidden');
        });

        btnNext.addEventListener('click', () => {
            currentQuestionIndex += 1;
            if (currentQuestionIndex < activeQuizData.length) {
                loadQuestion();
                return;
            }
            showResults();
        });

        function showResults() {
            quizProgress.style.width = '100%';
            showView('result-screen');

            scoreTotal.textContent = activeQuizData.length;
            scoreCorrect.textContent = score;

            const percentage = Math.round((score / activeQuizData.length) * 100);
            scoreCirclePath.classList.toggle('good', percentage >= 80);

            setTimeout(() => {
                scoreCirclePath.style.strokeDasharray = `${percentage}, 100`;
                let current = 0;
                const interval = setInterval(() => {
                    current += Math.max(1, Math.ceil(percentage / 15));
                    if (current >= percentage) {
                        current = percentage;
                        clearInterval(interval);
                    }
                    scorePercentage.textContent = `${current}%`;
                }, 36);
            }, 180);
        }

        btnRestart.addEventListener('click', () => {
            if (currentMode === '100' || currentMode === '39') {
                window.startQuiz(currentMode);
            }
        });

        btnFinish.addEventListener('click', () => {
            showView('subcategory-screen');
        });

        showView('subcategory-screen');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initTraumaApp, { once: true });
    } else {
        initTraumaApp();
    }
})();
