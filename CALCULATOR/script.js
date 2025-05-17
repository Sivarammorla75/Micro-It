let currentOperand = '';
let previousOperand = '';
let operation = null;

const currentOperandDisplay = document.getElementById('current-operand');
const previousOperandDisplay = document.getElementById('previous-operand');

function appendNumber(number) {
    if (number === '.' && currentOperand.includes('.')) return;
    currentOperand += number;
    updateDisplay();
}

function appendOperation(op) {
    if (currentOperand === '') return;
    if (previousOperand !== '') calculate();
    operation = op;
    previousOperand = currentOperand + ' ' + op;
    currentOperand = '';
    updateDisplay();
}

function clearAll() {
    currentOperand = '';
    previousOperand = '';
    operation = null;
    updateDisplay();
}

function backspace() {
    currentOperand = currentOperand.slice(0, -1);
    updateDisplay();
}

function toggleSign() {
    currentOperand = currentOperand.startsWith('-') 
        ? currentOperand.slice(1) 
        : '-' + currentOperand;
    updateDisplay();
}

function calculate() {
    let computation;
    const prev = parseFloat(previousOperand);
    const current = parseFloat(currentOperand);
    
    if (isNaN(prev) || isNaN(current)) return;
    
    switch (operation) {
        case '+':
            computation = prev + current;
            break;
        case '-':
            computation = prev - current;
            break;
        case '×':
            computation = prev * current;
            break;
        case '÷':
            computation = prev / current;
            break;
        case '√(':
            computation = Math.sqrt(current);
            break;
        case '^':
            computation = prev ** current;
            break;
        case '%':
            computation = prev // current;
            break;
        default:
            return;
    }
    
    currentOperand = computation.toString();
    operation = null;
    previousOperand = '';
    updateDisplay();
}

function updateDisplay() {
    currentOperandDisplay.value = currentOperand;
    previousOperandDisplay.textContent = previousOperand;
}

// Keyboard support
document.addEventListener('keydown', (e) => {
    if (/[0-9.]/.test(e.key)) {
        appendNumber(e.key);
    } else if (/[+\-*/]/.test(e.key)) {
        appendOperation(e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key);
    } else if (e.key === 'Enter' || e.key === '=') {
        calculate();
    } else if (e.key === 'Backspace') {
        backspace();
    } else if (e.key === 'Escape') {
        clearAll();
    }
});