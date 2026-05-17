// Project Registry
// Each project's HTML and logic lives in its own file under js/projects/

function getProjectHTML(projectName) {
    const projects = {
        'tic-tac-toe': getTicTacToeHTML(),
        'rock-paper-scissor': getRockPaperScissorHTML(),
        'dice-rolling': getDiceRollingHTML(),
        'coin-flip': getCoinFlipHTML(),
        'number-guessing': getNumberGuessingHTML(),
        'hangman': getHangmanHTML(),
        'word-scramble': getWordScrambleHTML(),
        'flames': getFlamesHTML(),
        'dots-boxes': getDotsBoxesHTML(),
        'emoji-memory': getEmojiMemoryGameHTML(),
        'fibonacci': getFibonacciHTML(),
        'progression-recognizer': getProgressionRecognizerHTML(),
        'pascal-triangle': getPascalTriangleHTML(),
        'armstrong': getArmstrongHTML(),
        'calculator': getCalculatorHTML(),
        'collatz': getCollatzHTML(),
        'prime-analyzer': getPrimeAnalyzerHTML(),
        'projectile-motion': getProjectileMotionHTML(),
        'coordinate-polar-transform': getCoordinatePolarTransformHTML(),
        'derivative-calculator': getDerivativeCalculatorHTML(),
        'morse-code': getMorseCodeHTML(),
        'tower-of-hanoi': getTowerOfHanoiHTML(),
        'number-converter': getNumberConverterHTML(),
        'typing-speed-tester': getTypingSpeedTesterHTML(),
        'snake-game': getsnakeGameHTML(),
        'password-forge': getPasswordForgeHTML(),
        'tic-tac-toe': getTicTacToeHTML(),
        'math-quiz': getMathQuizHTML(),
        'whack-a-mole': getWhackaMoleHTML(),  
        'simon-says': getSimonSaysHTML(),
        'spot-the-difference': getSpotTheDifferenceHTML(),
        'flappy-game': getFlappyGameHTML(),
        '2048-game': get2048GameHTML(),
    };

    return projects[projectName] || '<h2>Project Coming Soon!</h2>';
}

function getTicTacToeHTML() {
    return `
        <style>
            .tic-tac-toe-container {
                text-align: center;
                padding: 20px;
            }

            .board {
                display: grid;
                grid-template-columns: repeat(3, 100px);
                gap: 10px;
                justify-content: center;
                margin: 20px auto;
            }

            .cell {
                width: 100px;
                height: 100px;
                font-size: 2rem;
                font-weight: bold;
                border: 2px solid #333;
                background: white;
                cursor: pointer;
                border-radius: 10px;
            }

            .cell:hover {
                background-color: #f0f0f0;
            }

            #status {
                font-size: 1.2rem;
                margin: 15px 0;
                font-weight: bold;
            }

            .restart-btn {
                padding: 10px 20px;
                border: none;
                background: #4CAF50;
                color: white;
                border-radius: 8px;
                cursor: pointer;
                font-size: 1rem;
            }

            .restart-btn:hover {
                background: #45a049;
            }
        </style>

        <div class="tic-tac-toe-container">
            <h2>Tic Tac Toe</h2>

            <div class="board">
                <button class="cell" onclick="makeMove(0)"></button>
                <button class="cell" onclick="makeMove(1)"></button>
                <button class="cell" onclick="makeMove(2)"></button>

                <button class="cell" onclick="makeMove(3)"></button>
                <button class="cell" onclick="makeMove(4)"></button>
                <button class="cell" onclick="makeMove(5)"></button>

                <button class="cell" onclick="makeMove(6)"></button>
                <button class="cell" onclick="makeMove(7)"></button>
                <button class="cell" onclick="makeMove(8)"></button>
            </div>

            <p id="status">Player X's Turn</p>

            <button class="restart-btn" onclick="resetGame()">
                Restart Game
            </button>
        </div>
    `;
}

let currentPlayer = 'X';

let board = [
    '', '', '',
    '', '', '',
    '', '', ''
];

let gameActive = true;

const winningPatterns = [
    [0,1,2],
    [3,4,5],
    [6,7,8],

    [0,3,6],
    [1,4,7],
    [2,5,8],

    [0,4,8],
    [2,4,6]
];

function makeMove(index) {

    if (!gameActive || board[index] !== '') {
        return;
    }

    const cells = document.querySelectorAll('.cell');

    board[index] = currentPlayer;

    cells[index].innerText = currentPlayer;

    if (currentPlayer === 'X') {
        cells[index].style.color = '#ff4d4d';
    } else {
        cells[index].style.color = '#4d79ff';
    }

    // CHECK WINNER FIRST
    if (checkWinner()) {

        document.getElementById('status').innerText =
            `Player ${currentPlayer} Wins!`;

        gameActive = false;
        return;
    }

    // DRAW CONDITION
    const isDraw = board.every(cell => cell !== '');

    if (isDraw) {

        document.getElementById('status').innerText =
            "It's a Draw!";

        gameActive = false;
        return;
    }

    // SWITCH PLAYER
    currentPlayer = currentPlayer === 'X' ? 'O' : 'X';

    document.getElementById('status').innerText =
        `Player ${currentPlayer}'s Turn`;
}


function checkWinner() {

    return winningPatterns.some(pattern => {

        return pattern.every(index => {
            return board[index] === currentPlayer;
        });

    });
}

function resetGame() {

    board = [
        '', '', '',
        '', '', '',
        '', '', ''
    ];

    currentPlayer = 'X';

    gameActive = true;

    const cells = document.querySelectorAll('.cell');

    cells.forEach(cell => {
        cell.textContent = '';
    });

    document.getElementById('status').textContent =
        "Player X's Turn";
}


function initializeProject(projectName) {
    const initializers = {
        'tic-tac-toe': initTicTacToe,
        'rock-paper-scissor': initRockPaperScissor,
        'dice-rolling': initDiceRolling,
        'coin-flip': initCoinFlip,
        'number-guessing': initNumberGuessing,
        'hangman': initHangman,
        'word-scramble': initWordScramble,
        'flames': initFlames,
        'dots-boxes': initDotsBoxes,
        'emoji-memory': initEmojiMemoryGame,
        'fibonacci': initFibonacci,
        'progression-recognizer': initProgressionRecognizer,
        'pascal-triangle': initPascalTriangle,
        'armstrong': initArmstrong,
        'calculator': initCalculator,
        'collatz': initCollatz,
        'prime-analyzer': initPrimeAnalyzer,
        'projectile-motion': initProjectileMotion,
        'coordinate-polar-transform': initCoordinatePolarTransform,
        'derivative-calculator': initDerivativeCalculator,
        'morse-code': initMorseCode,
        'tower-of-hanoi': initTowerOfHanoi,
        'number-converter': initNumberConverter,
        'typing-speed-tester': initTypingSpeedTester,
        'snake-game': initSnakeGame,
        'password-forge': initPasswordForge, // Register Password Forge initializer
        'spot-the-difference': initSpotTheDifference,
        'whack-a-mole': initWhackaMole,
        'flappy-game': initFlappyGame,
        'simon-says': initSimonSays,
        '2048-game': init2048Game,
        'math-quiz': initMathQuiz,
    };
    
    if (initializers[projectName]) {
        initializers[projectName]();
    }
}

//Removed Redundant game and project Logics and seperated them to different individual files located at (web-app/js/projects/)

// ============================================================================
// ARCHITECTURAL NOTE: INDIVIDUAL PROJECT MODULES
// ============================================================================
// All specific HTML templates, inline CSS styles, and interactive game/tool 
// logic have been extracted from this registry file to enforce a clean, 
// modular design patterns.
//
// If you are looking to modify, fix, or understand how a specific project works:
// 1. Do NOT add game logics, event listeners, or variables to this file.
// 2. Open the dedicated script file under the 'js/projects/' directory.
//    - e.g., For Rock Paper Scissors, see: js/projects/rock-paper-scissor.js
//    - e.g., For FLAMES, see: js/projects/flames.js
//    - e.g., For the Calculator, see: js/projects/calculator.js
//
// Each individual script file globally registers exactly two hooks:
//    - get[ProjectName]HTML() : Returns the structural layout and specific styles.
//    - init[ProjectName]()    : Sets up localized states, scopes, and event listeners.
// ============================================================================

