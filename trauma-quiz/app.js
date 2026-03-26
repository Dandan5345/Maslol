// App State
let currentQuestionIndex = 0;
let score = 0;
let userAnswers = []; // Arrays of selected indices
let currentMode = '39'; // '39', '100', 'fc'
let activeQuizData = [];

// Generate remaining 50 questions for 100-quiz dynamically from flashcardsData 
function ensure100QuizData() {
    if (quiz100Data.length >= 100) return;
    const startIndex = quiz100Data.length;
    for (let i = startIndex; i < flashcardsData.length; i++) {
        const fc = flashcardsData[i];
        
        // Pick 3 random answers from other flashcards to act as distractors
        const distractors = [];
        while (distractors.length < 3) {
            const rIdx = Math.floor(Math.random() * flashcardsData.length);
            if (rIdx !== i && !distractors.includes(flashcardsData[rIdx].a)) {
                distractors.push(flashcardsData[rIdx].a);
            }
        }
        
        const options = [...distractors, fc.a];
        // Shuffle options
        options.sort(() => Math.random() - 0.5);
        const correctIndex = options.indexOf(fc.a);
        
        quiz100Data.push({
            question: fc.q,
            options: options,
            answers: [correctIndex] // Only 1 correct answer for auto-generated ones
        });
    }
}

// Ensure 100 items exist on load
document.addEventListener('DOMContentLoaded', () => {
    ensure100QuizData();
});

// DOM Elements
const views = document.querySelectorAll('.view');
const btnBackDashboard = document.getElementById('back-to-dashboard');

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
const toastEl = document.getElementById('toast');

// Views Navigation
function showView(viewId) {
    views.forEach(view => view.classList.remove('active-view'));
    document.getElementById(viewId).classList.add('active-view');
    
    // Manage Global Top Bar Home Button visibility
    const globalHomeBtn = document.getElementById('global-home-btn');
    if (globalHomeBtn) {
        if (viewId === 'login-screen' || viewId === 'dashboard-screen') {
            globalHomeBtn.classList.add('hidden');
        } else {
            globalHomeBtn.classList.remove('hidden');
        }
    }
}
window.showView = showView;

function showToast(message) {
    toastEl.textContent = message;
    toastEl.classList.remove('hidden');
    setTimeout(() => {
        toastEl.classList.add('hidden');
    }, 3000);
}

// Category Navigation
document.getElementById('axis-trauma').addEventListener('click', () => {
    showView('subcategory-screen');
});

// Remove old back Dashboard logic since it's handled inline
if (btnBackDashboard) {
    btnBackDashboard.addEventListener('click', () => {
        showView('dashboard-screen');
    });
}

// Theme Toggle
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const moonIcon = document.querySelector('.moon-icon');
const sunIcon = document.querySelector('.sun-icon');

const savedTheme = localStorage.getItem('theme') || 'dark';
if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    if (moonIcon && sunIcon) {
        moonIcon.classList.add('hidden');
        sunIcon.classList.remove('hidden');
    }
}

if(themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        localStorage.setItem('theme', isLight ? 'light' : 'dark');
        
        if (isLight) {
            moonIcon.classList.add('hidden');
            sunIcon.classList.remove('hidden');
        } else {
            moonIcon.classList.remove('hidden');
            sunIcon.classList.add('hidden');
        }
    });
}

// Activity Control
window.startQuiz = function(type) {
    currentMode = type;
    activeQuizData = (type === '39') ? quizData : quiz100Data;
    
    // Optionally shuffle the 100 questions so it's fresh each time
    if (type === '100') {
        activeQuizData.sort(() => Math.random() - 0.5);
    }
    
    currentQuestionIndex = 0;
    score = 0;
    userAnswers = Array(activeQuizData.length).fill(null).map(() => []);
    
    totalQNum.textContent = activeQuizData.length;
    showView('quiz-screen');
    loadQuestion();
}

window.startFlashcards = function() {
    currentMode = 'fc';
    currentQuestionIndex = 0;
    activeQuizData = flashcardsData;
    
    totalFcNum.textContent = activeQuizData.length;
    showView('flashcards-screen');
    loadFlashcard();
}

window.quitCurrentActivity = function() {
    if(confirm('האם אתה בטוח שברצונך לצאת? התקדמותך לא תישמר.')) {
        showView('subcategory-screen');
    }
}

// Flashcards Logic
window.flipFlashcard = function() {
    flashcardElement.classList.toggle('is-flipped');
}

window.prevFlashcard = function() {
    if (currentQuestionIndex > 0) {
        flashcardElement.classList.remove('is-flipped');
        setTimeout(() => {
            currentQuestionIndex--;
            loadFlashcard();
        }, 300); // Wait for unflip animation
    }
}

window.nextFlashcard = function() {
    if (currentQuestionIndex < activeQuizData.length - 1) {
        flashcardElement.classList.remove('is-flipped');
        setTimeout(() => {
            currentQuestionIndex++;
            loadFlashcard();
        }, 300);
    } else {
        showToast('סיימת את כל הכרטיסיות!');
        setTimeout(() => showView('subcategory-screen'), 1500);
    }
}

function loadFlashcard() {
    const fc = activeQuizData[currentQuestionIndex];
    currentFcNum.textContent = currentQuestionIndex + 1;
    fcQuestion.textContent = fc.q;
    fcAnswer.textContent = fc.a;
    
    const progress = (currentQuestionIndex / activeQuizData.length) * 100;
    fcProgress.style.width = `${progress}%`;
    
    btnFcPrev.disabled = currentQuestionIndex === 0;
}

// Quiz Logic
function loadQuestion() {
    const q = activeQuizData[currentQuestionIndex];
    currentQNum.textContent = currentQuestionIndex + 1;
    questionText.textContent = q.question || q.q;
    
    const progress = (currentQuestionIndex / activeQuizData.length) * 100;
    quizProgress.style.width = `${progress}%`;
    
    optionsContainer.innerHTML = '';
    
    const isMulti = q.answers.length > 1;
    
    if (isMulti) {
        optionsContainer.classList.add('multi-select');
        multiSelectHint.classList.remove('hidden');
    } else {
        optionsContainer.classList.remove('multi-select');
        multiSelectHint.classList.add('hidden');
    }

    q.options.forEach((optText, index) => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'option';
        optionDiv.dataset.index = index;
        
        optionDiv.innerHTML = `
            <div class="checkbox-indicator"></div>
            <span class="option-text">${optText}</span>
        `;
        
        optionDiv.addEventListener('click', () => handleOptionClick(optionDiv, index, isMulti));
        optionsContainer.appendChild(optionDiv);
    });
    
    btnCheck.disabled = true;
    btnCheck.classList.remove('hidden');
    btnNext.classList.add('hidden');
}

function handleOptionClick(optionElement, selectedIndex, isMulti) {
    if (btnCheck.classList.contains('hidden')) return; 
    
    if (isMulti) {
        const optionIndex = userAnswers[currentQuestionIndex].indexOf(selectedIndex);
        if (optionIndex > -1) {
            userAnswers[currentQuestionIndex].splice(optionIndex, 1);
            optionElement.classList.remove('selected');
        } else {
            userAnswers[currentQuestionIndex].push(selectedIndex);
            optionElement.classList.add('selected');
        }
    } else {
        document.querySelectorAll('.option').forEach(el => el.classList.remove('selected'));
        optionElement.classList.add('selected');
        userAnswers[currentQuestionIndex] = [selectedIndex];
    }
    
    btnCheck.disabled = userAnswers[currentQuestionIndex].length === 0;
}

btnCheck.addEventListener('click', () => {
    const q = activeQuizData[currentQuestionIndex];
    const selected = userAnswers[currentQuestionIndex];
    const correctAnswers = q.answers;
    
    let isCorrect = true;
    
    if (selected.length !== correctAnswers.length) {
        isCorrect = false;
    } else {
        selected.forEach(ans => {
            if (!correctAnswers.includes(ans)) isCorrect = false;
        });
    }

    if (isCorrect) {
        score++;
    }

    const optionElements = optionsContainer.querySelectorAll('.option');
    optionElements.forEach(el => {
        const idx = parseInt(el.dataset.index);
        if (correctAnswers.includes(idx)) {
            el.classList.add('correct');
        } else if (selected.includes(idx)) {
            el.classList.add('incorrect');
        }
        el.style.pointerEvents = 'none';
    });

    btnCheck.classList.add('hidden');
    btnNext.classList.remove('hidden');
});

btnNext.addEventListener('click', () => {
    currentQuestionIndex++;
    if (currentQuestionIndex < activeQuizData.length) {
        loadQuestion();
    } else {
        showResults();
    }
});

function showResults() {
    quizProgress.style.width = '100%';
    showView('result-screen');
    
    scoreTotal.textContent = activeQuizData.length;
    scoreCorrect.textContent = score;
    
    const percentage = Math.round((score / activeQuizData.length) * 100);
    
    setTimeout(() => {
        scoreCirclePath.style.strokeDasharray = `${percentage}, 100`;
        if (percentage >= 80) {
            scoreCirclePath.classList.add('good');
        } else {
            scoreCirclePath.classList.remove('good');
        }
        
        let count = 0;
        const interval = setInterval(() => {
            if(count >= percentage) {
                clearInterval(interval);
                scorePercentage.textContent = `${percentage}%`;
            } else {
                count += Math.ceil(percentage / 15) || 1;
                if(count > percentage) count = Math.round(percentage);
                scorePercentage.textContent = `${count}%`;
            }
        }, 40);
    }, 300);
}

btnRestart.addEventListener('click', () => {
    if (currentMode === 'fc') {
        startFlashcards();
    } else {
        startQuiz(currentMode);
    }
});

btnFinish.addEventListener('click', () => {
    showView('subcategory-screen');
});
