// DOM Elements
const startScreen = document.getElementById('start-screen');
const quizScreen = document.getElementById('quiz-screen');
const resultsScreen = document.getElementById('results-screen');
const categoriesEl = document.getElementById('categories');
const startBtn = document.getElementById('start-btn');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const feedbackEl = document.getElementById('feedback');
const nextBtn = document.getElementById('next-btn');
const timerEl = document.getElementById('time');
const scoreEl = document.getElementById('score');
const progressEl = document.getElementById('progress');
const finalScoreEl = document.getElementById('final-score');
const totalQuestionsEl = document.getElementById('total-questions');
const correctAnswersEl = document.getElementById('correct-answers');
const wrongAnswersEl = document.getElementById('wrong-answers');
const timeTakenEl = document.getElementById('time-taken');
const restartBtn = document.getElementById('restart-btn');

// Quiz Variables
let selectedCategory = null;
let currentQuestionIndex = 0;
let score = 0;
let timer;
let timeLeft = 30;
let quizQuestions = [];
let correctAnswers = 0;
let wrongAnswers = 0;
let startTime = 0;

// Initialize categories
function initCategories() {
    categoriesEl.innerHTML = '';
    for (const category in quizData) {
        const categoryEl = document.createElement('div');
        categoryEl.classList.add('category');
        categoryEl.textContent = category.charAt(0).toUpperCase() + category.slice(1);
        categoryEl.addEventListener('click', () => selectCategory(category, categoryEl));
        categoriesEl.appendChild(categoryEl);
    }
}

function selectCategory(category, element) {
    // Remove selected class from all categories
    document.querySelectorAll('.category').forEach(el => {
        el.classList.remove('selected');
    });
    
    // Add selected class to clicked category
    element.classList.add('selected');
    selectedCategory = category;
}

function startQuiz() {
    if (!selectedCategory) {
        alert('Please select a category first!');
        return;
    }

    // Reset quiz variables
    currentQuestionIndex = 0;
    score = 0;
    correctAnswers = 0;
    wrongAnswers = 0;
    quizQuestions = [...quizData[selectedCategory]];
    
    // Shuffle questions
    quizQuestions = shuffleArray(quizQuestions);
    
    // Show quiz screen
    startScreen.classList.add('hidden');
    quizScreen.classList.remove('hidden');
    resultsScreen.classList.add('hidden');
    
    // Start timer and display first question
    startTime = Date.now();
    loadQuestion();
}

function loadQuestion() {
    // Reset timer
    resetTimer();
    startTimer();
    
    // Update progress bar
    progressEl.style.width = `${(currentQuestionIndex / quizQuestions.length) * 100}%`;
    
    // Get current question
    const currentQuestion = quizQuestions[currentQuestionIndex];
    questionEl.textContent = currentQuestion.question;
    
    // Clear previous options
    optionsEl.innerHTML = '';
    feedbackEl.textContent = '';
    feedbackEl.className = 'feedback';
    nextBtn.classList.add('hidden');
    
    // Shuffle options
    const shuffledOptions = shuffleArray([...currentQuestion.options]);
    
    // Create option buttons
    shuffledOptions.forEach(option => {
        const button = document.createElement('div');
        button.classList.add('option');
        button.textContent = option;
        button.addEventListener('click', () => selectAnswer(option, button));
        optionsEl.appendChild(button);
    });
    
    // Update score
    scoreEl.textContent = score;
}

function selectAnswer(selectedOption, button) {
    const currentQuestion = quizQuestions[currentQuestionIndex];
    
    // Disable all options
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.add('disabled');
    });
    
    // Check if answer is correct
    if (selectedOption === currentQuestion.answer) {
        button.classList.add('correct');
        feedbackEl.textContent = 'Correct!';
        feedbackEl.classList.add('correct');
        score += 10;
        correctAnswers++;
    } else {
        button.classList.add('wrong');
        feedbackEl.textContent = `Wrong! The correct answer is ${currentQuestion.answer}`;
        feedbackEl.classList.add('wrong');
        wrongAnswers++;
        
        // Highlight correct answer
        document.querySelectorAll('.option').forEach(opt => {
            if (opt.textContent === currentQuestion.answer) {
                opt.classList.add('correct');
            }
        });
    }
    
    // Update score display
    scoreEl.textContent = score;
    
    // Show next button
    nextBtn.classList.remove('hidden');
    
    // Stop timer
    clearInterval(timer);
}

function nextQuestion() {
    currentQuestionIndex++;
    
    if (currentQuestionIndex < quizQuestions.length) {
        loadQuestion();
    } else {
        showResults();
    }
}

function resetTimer() {
    clearInterval(timer);
    timeLeft = 30;
    timerEl.textContent = timeLeft;
}

function startTimer() {
    timer = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            clearInterval(timer);
            timeUp();
        }
    }, 1000);
}

function timeUp() {
    feedbackEl.textContent = "Time's up!";
    feedbackEl.className = 'feedback wrong';
    wrongAnswers++;
    
    // Highlight correct answer
    const currentQuestion = quizQuestions[currentQuestionIndex];
    document.querySelectorAll('.option').forEach(opt => {
        if (opt.textContent === currentQuestion.answer) {
            opt.classList.add('correct');
        }
    });
    
    // Disable all options
    document.querySelectorAll('.option').forEach(opt => {
        opt.classList.add('disabled');
    });
    
    nextBtn.classList.remove('hidden');
}

function showResults() {
    const timeTaken = Math.floor((Date.now() - startTime) / 1000);
    
    quizScreen.classList.add('hidden');
    resultsScreen.classList.remove('hidden');
    
    finalScoreEl.textContent = score;
    totalQuestionsEl.textContent = quizQuestions.length;
    correctAnswersEl.textContent = correctAnswers;
    wrongAnswersEl.textContent = wrongAnswers;
    timeTakenEl.textContent = timeTaken;
}

function shuffleArray(array) {
    return array.sort(() => Math.random() - 0.5);
}

// Event Listeners
startBtn.addEventListener('click', startQuiz);
nextBtn.addEventListener('click', nextQuestion);
restartBtn.addEventListener('click', () => {
    resultsScreen.classList.add('hidden');
    startScreen.classList.remove('hidden');
});

// Initialize the app
initCategories();