// --- Game Variables ---
let secret_number;
let lower_bound;
let upper_bound;
let max_attempts;
let attempts_taken = 0;
let gameOver = false;
let hintUsed = false; // New: Track if hint has been used
let bestScore = localStorage.getItem('bestGuessingScore') ? parseInt(localStorage.getItem('bestGuessingScore')) : null;

// --- DOM Elements ---
const guessInput = document.getElementById('guessInput');
const checkButton = document.getElementById('checkButton');
const messageDisplay = document.getElementById('message');
const resetButton = document.getElementById('resetButton');
const attemptsLeftDisplay = document.getElementById('attemptsLeft');
const lowerBoundDisplay = document.getElementById('lowerBound');
const upperBoundDisplay = document.getElementById('upperBound');
const guessList = document.getElementById('guessList');
const difficultySelect = document.getElementById('difficulty'); // New: Difficulty selector
const hintButton = document.getElementById('hintButton'); // New: Hint button
const bestScoreDisplay = document.getElementById('bestScore'); // New: Best score display

// Confetti elements (New)
const confettiCanvas = document.getElementById('confetti-canvas');
const confettiCtx = confettiCanvas.getContext('2d');
let confettiParticles = [];
let animationFrameId;

// --- Difficulty Settings (New) ---
const difficultySettings = {
    easy: { range: 50, attempts: 12, lower: 1, upper: 50 },
    medium: { range: 100, attempts: 10, lower: 1, upper: 100 },
    hard: { range: 200, attempts: 8, lower: 1, upper: 200 }
};

// --- Functions ---

/**
 * Applies CSS class for input border feedback.
 * @param {string} type - 'too-low', 'too-high', 'correct', or 'reset'.
 */
function setInputBorderFeedback(type) {
    guessInput.classList.remove('too-low-border', 'too-high-border', 'correct-border');
    if (type !== 'reset') {
        guessInput.classList.add(`${type}-border`);
    }
}

/**
 * Initializes the game: sets up a new secret number, resets attempts, and updates display.
 */
function initializeGame() {
    gameOver = false;
    attempts_taken = 0;
    hintUsed = false; // Reset hint usage

    // Apply difficulty settings
    const selectedDifficulty = difficultySelect.value;
    lower_bound = difficultySettings[selectedDifficulty].lower;
    upper_bound = difficultySettings[selectedDifficulty].upper;
    max_attempts = difficultySettings[selectedDifficulty].attempts;

    secret_number = Math.floor(Math.random() * (upper_bound - lower_bound + 1)) + lower_bound;

    // Reset UI elements
    messageDisplay.textContent = ''; // Clear message
    messageDisplay.className = 'message'; // Remove any previous color classes
    guessInput.value = ''; // Clear input field
    guessInput.disabled = false; // Enable input
    checkButton.disabled = false; // Enable check button
    resetButton.classList.add('hidden'); // Hide reset button
    hintButton.disabled = false; // Enable hint button
    guessList.innerHTML = ''; // Clear guess history
    setInputBorderFeedback('reset'); // Reset input border

    // Update dynamic text
    lowerBoundDisplay.textContent = lower_bound;
    upperBoundDisplay.textContent = upper_bound;
    attemptsLeftDisplay.textContent = max_attempts;
    updateBestScoreDisplay(); // Update best score display on init

    // Stop and hide confetti if active
    stopConfetti();

    console.log("New game started. Secret number:", secret_number); // For debugging
}

/**
 * Handles the player's guess.
 */
function handleGuess() {
    if (gameOver) {
        return;
    }

    let player_guess = parseInt(guessInput.value);

    if (isNaN(player_guess) || player_guess < lower_bound || player_guess > upper_bound) {
        messageDisplay.textContent = `Please enter a valid number between ${lower_bound} and ${upper_bound}.`;
        messageDisplay.className = 'message too-low'; // Use a warning color
        setInputBorderFeedback('reset'); // No feedback on invalid input
        return;
    }

    attempts_taken++;
    attemptsLeftDisplay.textContent = max_attempts - attempts_taken;

    // Add guess to history list
    const listItem = document.createElement('li');
    listItem.innerHTML = `Attempt ${attempts_taken}: Your guess was <span>${player_guess}</span>`;
    guessList.prepend(listItem); // Add to the top of the list

    if (player_guess < secret_number) {
        messageDisplay.textContent = "Too low! Try again.";
        messageDisplay.className = 'message too-low';
        listItem.classList.add('too-low');
        setInputBorderFeedback('too-low');
    } else if (player_guess > secret_number) {
        messageDisplay.textContent = "Too high! Try again.";
        messageDisplay.className = 'message too-high';
        listItem.classList.add('too-high');
        setInputBorderFeedback('too-high');
    } else {
        messageDisplay.textContent = `🥳 Congratulations! You guessed the number ${secret_number} in ${attempts_taken} attempts!`;
        messageDisplay.className = 'message correct';
        listItem.classList.add('correct');
        setInputBorderFeedback('correct');
        endGame(true); // Player won
        return;
    }

    // Check if attempts are exhausted
    if (attempts_taken >= max_attempts) {
        messageDisplay.textContent = `😞 Game Over! You ran out of attempts. The secret number was ${secret_number}.`;
        messageDisplay.className = 'message too-high'; // Use a final "lost" color
        endGame(false); // Player lost
    }
    
    // Clear input after each guess for convenience
    guessInput.value = '';
}

/**
 * Ends the current game round.
 * @param {boolean} won - True if the player won, false otherwise.
 */
function endGame(won) {
    gameOver = true;
    guessInput.disabled = true;
    checkButton.disabled = true;
    hintButton.disabled = true; // Disable hint button when game ends
    resetButton.classList.remove('hidden'); // Show reset button
    difficultySelect.disabled = false; // Re-enable difficulty selection

    if (won) {
        // Update best score
        if (bestScore === null || attempts_taken < bestScore) {
            bestScore = attempts_taken;
            localStorage.setItem('bestGuessingScore', bestScore);
            updateBestScoreDisplay();
        }
        startConfetti(); // Start confetti animation
    }
}

/**
 * Updates the best score display from localStorage.
 */
function updateBestScoreDisplay() {
    if (bestScore !== null) {
        bestScoreDisplay.textContent = `${bestScore}`;
    } else {
        bestScoreDisplay.textContent = `N/A`;
    }
}

/**
 * Provides a hint to the player.
 */
function getHint() {
    if (gameOver || hintUsed) {
        return;
    }

    let hintMessage = "";
    if (secret_number % 2 === 0) {
        hintMessage = "The secret number is **EVEN**.";
    } else {
        hintMessage = "The secret number is **ODD**.";
    }

    messageDisplay.innerHTML = `<span style="color: #17a2b8;">Hint: ${hintMessage}</span>`;
    messageDisplay.className = 'message'; // Reset class for hint color
    hintUsed = true;
    hintButton.disabled = true; // Disable hint button after use
}


// --- Confetti Animation (New) ---
// Simplified confetti logic for demonstration.
// For more advanced confetti, consider a library like confetti.js
class ConfettiParticle {
    constructor(x, y, radius, color, velocityX, velocityY) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.color = color;
        this.velocityX = velocityX;
        this.velocityY = velocityY;
        this.alpha = 1;
        this.gravity = 0.1;
        this.friction = 0.99;
    }

    draw() {
        confettiCtx.save();
        confettiCtx.globalAlpha = this.alpha;
        confettiCtx.beginPath();
        confettiCtx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        confettiCtx.fillStyle = this.color;
        confettiCtx.fill();
        confettiCtx.restore();
    }

    update() {
        this.velocityY += this.gravity;
        this.velocityX *= this.friction;
        this.velocityY *= this.friction;
        this.x += this.velocityX;
        this.y += this.velocityY;
        this.alpha -= 0.005; // Fade out slowly
        if (this.alpha < 0) this.alpha = 0; // Ensure alpha doesn't go negative
        this.draw();
    }
}

function createConfettiParticles(count) {
    const colors = ['#f0f2f5', '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8']; // Theme colors
    const startX = confettiCanvas.width / 2;
    const startY = confettiCanvas.height / 2;

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 10 + 5; // Initial speed
        const velocityX = Math.cos(angle) * velocity;
        const velocityY = Math.sin(angle) * velocity - 5; // Slightly upward initial velocity

        confettiParticles.push(new ConfettiParticle(
            startX,
            startY,
            Math.random() * 5 + 2, // Radius between 2 and 7
            colors[Math.floor(Math.random() * colors.length)],
            velocityX,
            velocityY
        ));
    }
}

function animateConfetti() {
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    confettiParticles = confettiParticles.filter(particle => particle.alpha > 0 && particle.y < confettiCanvas.height + particle.radius);

    confettiParticles.forEach(particle => particle.update());

    if (confettiParticles.length > 0) {
        animationFrameId = requestAnimationFrame(animateConfetti);
    } else {
        stopConfetti();
    }
}

function startConfetti() {
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
    confettiCanvas.classList.add('active'); // Show canvas with fade-in
    confettiParticles = []; // Clear any existing particles
    createConfettiParticles(100); // Generate 100 particles
    cancelAnimationFrame(animationFrameId); // Stop any previous animation loop
    animateConfetti(); // Start animation loop
}

function stopConfetti() {
    cancelAnimationFrame(animationFrameId);
    confettiCanvas.classList.remove('active'); // Hide canvas with fade-out
    confettiParticles = []; // Clear particles
    confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
}


// --- Event Listeners ---
checkButton.addEventListener('click', handleGuess);

// Allow pressing Enter key to submit guess
guessInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        handleGuess();
    }
});

resetButton.addEventListener('click', initializeGame);
difficultySelect.addEventListener('change', initializeGame); // New: Restart game on difficulty change
hintButton.addEventListener('click', getHint); // New: Hint button listener

// --- Initial Game Start ---
initializeGame();