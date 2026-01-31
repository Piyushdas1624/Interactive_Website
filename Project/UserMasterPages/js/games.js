/* Premium UI Logic */
// Modal System
const ModalSystem = {
    init() {
        // Create modal DOM if it doesn't exist
        if (!document.getElementById('custom-modal-overlay')) {
            const modalHTML = `
                <div id='custom-modal-overlay' class='custom-modal-overlay'>
                    <div class='custom-modal'>
                        <span class='modal-close' onclick='ModalSystem.close()'></span>
                        <div id='modal-icon' class='modal-icon'>??</div>
                        <div id='modal-title' class='modal-title'>Title</div>
                        <div id='modal-message' class='modal-message'>Message goes here</div>
                        <button id='modal-btn' class='modal-btn' onclick='ModalSystem.close()'>Awesome!</button>
                    </div>
                </div>`;
            document.body.insertAdjacentHTML('beforeend', modalHTML);
        }

        // Close on overlay click
        const overlay = document.getElementById('custom-modal-overlay');
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                ModalSystem.close();
            }
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                ModalSystem.close();
            }
        });
    },

    show(message, title = 'Game Update', icon = '', buttonText = 'OK', onConfirm = null) {
        const overlay = document.getElementById('custom-modal-overlay');
        const titleEl = document.getElementById('modal-title');
        const messageEl = document.getElementById('modal-message');
        const iconEl = document.getElementById('modal-icon');
        const btnEl = document.getElementById('modal-btn');

        titleEl.textContent = title;
        messageEl.innerHTML = message; // Allow HTML in message
        iconEl.textContent = icon;
        btnEl.textContent = buttonText;

        // Reset click handler
        btnEl.onclick = () => {
            ModalSystem.close();
            if (onConfirm) onConfirm();
        };

        overlay.classList.add('active');
    },

    close() {
        const overlay = document.getElementById('custom-modal-overlay');
        overlay.classList.remove('active');
    }
};

// Initialize on load
document.addEventListener('DOMContentLoaded', () => {
    ModalSystem.init();
});
window.showModal = ModalSystem.show;
window.closeModal = ModalSystem.close;

// --- Global Game Focus / Scroll Lock ---
let gameFocus = false;

function toggleGameFocus(isActive) {
    gameFocus = isActive;
    const body = document.body;
    if (isActive) {
        body.style.overflow = 'hidden'; // Optional: hide scrollbars
        // Add a visual indicator or "Exit Game" button if not present
        showExitGameButton(true);
    } else {
        body.style.overflow = '';
        showExitGameButton(false);
    }
}

function showExitGameButton(show) {
    let exitBtn = document.getElementById('global-exit-game-btn');
    if (!exitBtn) {
        exitBtn = document.createElement('button');
        exitBtn.id = 'global-exit-game-btn';
        exitBtn.textContent = 'Exit Game Mode';
        exitBtn.style.position = 'fixed';
        exitBtn.style.bottom = '20px';
        exitBtn.style.right = '20px';
        exitBtn.style.zIndex = '9999';
        exitBtn.style.padding = '10px 20px';
        exitBtn.style.backgroundColor = '#ff4757';
        exitBtn.style.color = 'white';
        exitBtn.style.border = 'none';
        exitBtn.style.borderRadius = '5px';
        exitBtn.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        exitBtn.style.cursor = 'pointer';
        exitBtn.style.fontWeight = 'bold';
        exitBtn.onclick = () => {
            // Stop all games
            stopAllGames();
            toggleGameFocus(false);
        };
        document.body.appendChild(exitBtn);
    }
    exitBtn.style.display = show ? 'block' : 'none';
}

function stopAllGames() {
    // Helper to stop running loops
    if (gameInterval) clearInterval(gameInterval);
    snakeGameStarted = false;
    breakoutGameStarted = false;
    // Add other game stop flags here if needed
}

document.addEventListener('keydown', function (e) {
    if (gameFocus && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});
// Basic game variables and state management
let activeGame = null;
let gameInterval = null;

// Dark Mode Toggle
function initDarkMode() {
    const toggle = document.getElementById('dark-mode-toggle');
    const body = document.body;

    if (toggle) {
        toggle.onclick = function () {
            body.classList.toggle('dark-mode');
            this.innerHTML = body.classList.contains('dark-mode') ? '☀️' : '🌙';
            localStorage.setItem('darkMode', body.classList.contains('dark-mode'));
            updateGameColors(body.classList.contains('dark-mode')); // Call the function
        };
    }
}

// Function to update game-specific colors for dark mode
function updateGameColors(isDarkMode) {
    // Snake Game
    const snakeCanvas = document.getElementById('snakeCanvas');
    if (snakeCanvas) {
        const ctx = snakeCanvas.getContext('2d');
        if (ctx) {
            drawSnake();
        }
    }

}

// --- Memory Game ---
let cards = [];
let flippedCards = [];
let matchedPairs = 0;
let memoryMoves = 0;
let memoryGameStarted = false;

function initializeMemoryGame(board) { // Changed to accept board as argument
    if (!board) {
        console.error('Memory board element not found');
        return;
    }
    startMemoryGame(); // Call startMemoryGame to initialize
}

function startMemoryGame() {
    const board = document.getElementById('memoryBoard'); // Get board here
    if (!board) {
        console.error('Memory board element not found');
        return;
    }

    // Reset game state
    cards = [];
    flippedCards = [];
    matchedPairs = 0;
    memoryMoves = 0;
    memoryGameStarted = true;

    const movesDisplay = document.getElementById('memoryMoves');
    if (movesDisplay) {
        movesDisplay.textContent = memoryMoves;
    }

    // Create card pairs with error handling
    try {
        const emojis = ['🎨', '🎮', '🎲', '🎯', '🎪', '🎭', '🎨', '🎮', '🎲', '🎯', '🎪', '🎭'];
        cards = emojis.sort(() => Math.random() - 0.5);

        // Clear and create new board
        board.innerHTML = '';
        cards.forEach((emoji, index) => {
            const card = document.createElement('div');
            card.className = 'memory-card';
            card.dataset.cardIndex = index;  // Store the index for matching
            card.innerHTML = `
                <div class="card-inner">
                    <div class="card-back">?</div>
                    <div class="card-front">${emoji}</div>
                </div>
            `;
            card.onclick = () => flipCard(card);
            board.appendChild(card);
        });
    } catch (error) {
        console.error('Error initializing memory game:', error);
    }
}

function flipCard(card) {
    if (!card || !memoryGameStarted) return; // Prevent clicks if game not started

    // Check if card is already flipped or matched
    if (flippedCards.length === 2 ||
        flippedCards.includes(card) ||
        card.classList.contains('matched')) {
        return;
    }

    try {
        card.classList.add('flip');
        flippedCards.push(card);

        if (flippedCards.length === 2) {
            memoryMoves++;
            const movesDisplay = document.getElementById('memoryMoves');
            if (movesDisplay) {
                movesDisplay.textContent = memoryMoves;
            }

            const [card1, card2] = flippedCards;
            const match = cards[card1.dataset.cardIndex] === cards[card2.dataset.cardIndex];

            if (match) {
                matchedPairs++;
                // Add 'matched' class to prevent re-flipping
                flippedCards.forEach(card => card.classList.add('matched'));
                flippedCards = [];

                if (matchedPairs === cards.length / 2) {
                    setTimeout(() => {
                        showModal('Congratulations! You won!', 'You Won!', '🏆');
                        memoryGameStarted = false; // Stop the game
                    }, 500);
                }
            } else {
                setTimeout(() => {
                    flippedCards.forEach(card => card.classList.remove('flip'));
                    flippedCards = [];
                }, 1000);
            }
        }
    } catch (error) {
        console.error('Error flipping card:', error);
        // Reset flippedCards in case of an error
        flippedCards = [];
    }
}
// --- End Memory Game ---

// --- Word Scramble Game ---
let currentHints = 3;
let wordScore = 0;

function initializeWordScramble() {
    const words = ['LEARNING', 'EDUCATION', 'KNOWLEDGE', 'PRACTICE', 'STUDY', 'READING', 'WRITING', 'THINKING'];
    currentWord = words[Math.floor(Math.random() * words.length)];
    const scrambled = currentWord.split('').sort(() => Math.random() - 0.5).join('');

    const scrambledDisplay = document.getElementById('scrambledWord');
    const scoreDisplay = document.getElementById('wordScore');
    const hintsDisplay = document.getElementById('hintsLeft');
    const guessInput = document.getElementById('wordGuess');

    if (scrambledDisplay) scrambledDisplay.textContent = scrambled;
    if (scoreDisplay) scoreDisplay.textContent = wordScore;
    if (hintsDisplay) hintsDisplay.textContent = currentHints;
    if (guessInput) {
        guessInput.value = '';
        guessInput.disabled = false; // Enable input
    }
    // Hide result options if they exist
    const resultOptions = document.getElementById('wordResultOptions');
    if (resultOptions) {
        resultOptions.style.display = 'none';
    }

}

function getHint() {
    if (currentHints <= 0) {
        showModal('No hints remaining!', 'Oops', '💡');
        return;
    }

    const guessInput = document.getElementById('wordGuess');
    if (!guessInput) return;

    currentHints--;
    const hintsDisplay = document.getElementById('hintsLeft');
    if (hintsDisplay) {
        hintsDisplay.textContent = currentHints;
    }

    // Show first letter as hint
    const hintLetter = currentWord[guessInput.value.length];
    if (hintLetter) {
        guessInput.value += hintLetter;
    } else {
        showModal('No more letters to hint!', 'Oops', '📝');
    }
}

function checkWord() {
    const guessInput = document.getElementById('wordGuess');
    if (!guessInput) return;

    const guess = guessInput.value.toUpperCase();
    const resultOptions = document.getElementById('wordResultOptions');

    if (!resultOptions) {
        // Create result options if they don't exist
        const optionsDiv = document.createElement('div');
        optionsDiv.id = 'wordResultOptions';
        optionsDiv.className = 'game-controls';
        optionsDiv.innerHTML = `
            <button onclick="showAnswer()">Show Answer</button>
            <button onclick="tryAgain()">Try Again</button>
            <button onclick="nextWord()">Next Word</button>
        `;
        const container = document.querySelector('.word-scramble'); // Find parent
        if (container) {
            container.appendChild(optionsDiv);
        }
    } else {
        resultOptions.style.display = 'flex';
    }


    if (guess === currentWord) {
        wordScore += 10;
        const scoreDisplay = document.getElementById('wordScore');
        if (scoreDisplay) {
            scoreDisplay.textContent = wordScore;
        }
        showModal('Correct! +10 points', 'Great Job!', '🌟', 'Next Word', () => nextWord());
        /*nextWord();*/
    } else {
        showModal('Not quite right! Try again or use a hint.', 'Try Again', '❌');
        // Show options to show answer, try again, or go to the next word

    }
}

function showAnswer() {
    const guessInput = document.getElementById('wordGuess');
    if (guessInput) {
        guessInput.value = currentWord;
        guessInput.disabled = true; // Disable input
    }
}

function tryAgain() {
    const guessInput = document.getElementById('wordGuess');
    const resultOptions = document.getElementById('wordResultOptions');

    if (guessInput) {
        guessInput.value = '';
        guessInput.disabled = false;
    }

    if (resultOptions) {
        resultOptions.style.display = 'none';
    }
}

function nextWord() {
    const guessInput = document.getElementById('wordGuess');
    if (guessInput) {
        guessInput.disabled = false;
    }
    initializeWordScramble();
}

// --- End Word Scramble Game ---
// --- Tic Tac Toe Game (User vs Bot) ---
let currentPlayer = 'X';
let gameBoard = ['', '', '', '', '', '', '', '', ''];
let gameActive = true;
let isBotTurn = false; // Flag for bot turn

function initializeTicTacToe(board) { // Changed to accept board
    if (!board) return;
    startTicTacToe(); // Start the game
}

function startTicTacToe() {
    const board = document.getElementById('tic-tac-toe'); // Get the board here
    if (!board) return;

    // Reset game state
    gameBoard = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = 'X'; // User always starts as X
    gameActive = true;
    isBotTurn = false;

    // Clear and create board
    board.innerHTML = '';
    for (let i = 0; i < 9; i++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.setAttribute('data-index', i);
        cell.addEventListener('click', () => handleCellClick(cell));
        board.appendChild(cell);
    }
}

function handleCellClick(cell) {
    const index = cell.getAttribute('data-index');
    if (gameBoard[index] !== '' || !gameActive || isBotTurn) return; // Prevent clicks if cell filled, game over, or bot's turn

    // User Move
    makeMove(index, 'X');

    if (gameActive) {
        isBotTurn = true;
        setTimeout(makeBotMove, 500); // Small delay for realism
    }
}

function makeMove(index, player) {
    gameBoard[index] = player;
    const cell = document.querySelector(`[data-index='${index}']`);
    if (cell) {
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
    }

    if (checkWin(player)) {
        showModal(player === 'X' ? 'You Won!' : 'Bot Won!', player === 'X' ? 'Victory!' : 'Defeat', player === 'X' ? '🏆' : '🤖');
        gameActive = false;
        isBotTurn = false;
        return;
    }

    if (gameBoard.every(cell => cell !== '')) {
        showModal("It's a draw!", 'Game Over', '🤝');
        gameActive = false;
        isBotTurn = false;
        return;
    }
}

function makeBotMove() {
    if (!gameActive) return;

    // Simple AI: Find empty cells
    const emptyIndices = gameBoard.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);

    if (emptyIndices.length > 0) {
        // Try to win
        for (let i of emptyIndices) {
            gameBoard[i] = 'O';
            if (checkWin('O')) {
                gameBoard[i] = ''; // Reset for actual move
                makeMove(i, 'O');
                isBotTurn = false; // Fix: Reset turn flag
                return;
            }
            gameBoard[i] = ''; // Reset
        }

        // Try to block
        for (let i of emptyIndices) {
            gameBoard[i] = 'X';
            if (checkWin('X')) {
                gameBoard[i] = ''; // Reset
                makeMove(i, 'O');
                isBotTurn = false; // Fix: Reset turn flag
                return;
            }
            gameBoard[i] = ''; // Reset
        }

        // Random move
        const randomIndex = emptyIndices[Math.floor(Math.random() * emptyIndices.length)];
        makeMove(randomIndex, 'O');
    }

    isBotTurn = false;
}

function checkWin(player) {
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    return winPatterns.some(pattern => {
        const [a, b, c] = pattern;
        return gameBoard[a] === player && gameBoard[b] === player && gameBoard[c] === player;
    });
}

// --- End Tic Tac Toe Game ---

// --- Snake Game ---
let snake = [{ x: 200, y: 200 }, { x: 190, y: 200 }, { x: 180, y: 200 }];
let food = {};
let direction = 'right';
let snakeScore = 0;
let snakeGameStarted = false;

function startSnake() {
    const canvas = document.getElementById('snakeCanvas');
    if (!canvas) return;

    // Reset game state
    snake = [{ x: 200, y: 200 }, { x: 190, y: 200 }, { x: 180, y: 200 }];
    direction = 'right';
    snakeScore = 0;
    snakeGameStarted = true; // Start the game!
    toggleGameFocus(true); // Lock Scroll
    createFood();

    // Clear previous interval (important for restarts)
    if (gameInterval) clearInterval(gameInterval);

    // Start game loop
    gameInterval = setInterval(function () {
        moveSnake();
        drawSnake();
    }, 100);

    // Add controls
    document.addEventListener('keydown', handleSnakeControls); // Add controls here
}

function createFood() {
    const canvas = document.getElementById('snakeCanvas');
    if (!canvas) return;

    const gridSize = 10;
    const maxX = Math.floor((canvas.width - gridSize) / gridSize) * gridSize; // Ensure food is within bounds
    const maxY = Math.floor((canvas.height - gridSize) / gridSize) * gridSize;

    // Generate food position
    do {
        food = {
            x: Math.floor(Math.random() * maxX / gridSize) * gridSize + gridSize, // + gridSize to avoid edges
            y: Math.floor(Math.random() * maxY / gridSize) * gridSize + gridSize
        };
    } while (isSnakeCollision(food.x, food.y)); // Ensure food doesn't spawn on snake
}

function isSnakeCollision(x, y) {
    return snake.some(segment => segment.x === x && segment.y === y);
}

function drawSnake() {
    const canvas = document.getElementById('snakeCanvas');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!snakeGameStarted) {
        // Show "Click Start to Play" message
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Click Start to Play!', canvas.width / 2, canvas.height / 2);
        return;
    }

    // Draw snake
    snake.forEach((part, i) => {
        ctx.fillStyle = i === 0 ? '#4CAF50' : '#81C784'; // Head is darker
        ctx.fillRect(part.x, part.y, 10, 10);

        // Add border to snake segments
        ctx.strokeStyle = '#388E3C';
        ctx.strokeRect(part.x, part.y, 10, 10);
    });

    // Draw food with a glowing effect
    ctx.fillStyle = '#FF5722';
    ctx.shadowColor = '#FF5722';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(food.x + 5, food.y + 5, 5, 0, Math.PI * 2); // Draw a circle
    ctx.fill();

    // Reset shadow effect
    ctx.shadowBlur = 0;
}

function handleSnakeControls(e) {
    if (!snakeGameStarted) return; // Only respond to controls if game is active

    const opposites = {
        'ArrowLeft': 'right',
        'ArrowRight': 'left',
        'ArrowUp': 'down',
        'ArrowDown': 'up'
    };

    const newDirection = {
        'ArrowLeft': 'left',
        'ArrowRight': 'right',
        'ArrowUp': 'up',
        'ArrowDown': 'down'
    }[e.key];

    if (newDirection && opposites[e.key] !== direction) {
        direction = newDirection;
    }
}

function moveSnake() {
    if (!snakeGameStarted) return; // Don't move if game hasn't started

    const canvas = document.getElementById('snakeCanvas');
    if (!canvas) return;

    const head = { x: snake[0].x, y: snake[0].y };
    const gridSize = 10;

    // Calculate new head position
    switch (direction) {
        case 'up': head.y -= gridSize; break;
        case 'down': head.y += gridSize; break;
        case 'left': head.x -= gridSize; break;
        case 'right': head.x += gridSize; break;
    }

    // Check wall collision with proper bounds
    if (head.x < 0 || head.x >= canvas.width ||
        head.y < 0 || head.y >= canvas.height) {
        gameOver();
        return;
    }

    // Check self collision
    if (isSnakeCollision(head.x, head.y)) {
        gameOver();
        return;
    }

    snake.unshift(head);

    // Check food collision
    if (head.x === food.x && head.y === food.y) {
        snakeScore++;
        const scoreDisplay = document.getElementById('snakeScore');
        if (scoreDisplay) {
            scoreDisplay.textContent = snakeScore;
        }
        createFood();
    } else {
        snake.pop();
    }
}

function initializeSnakeGame() {
    const canvas = document.getElementById('snakeCanvas');
    if (!canvas) return;

    // Set proper canvas size
    const container = canvas.parentElement;
    if (container) {
        const containerWidth = container.clientWidth;
        canvas.width = Math.min(400, containerWidth - 20); // Max width 400, responsive
        canvas.height = canvas.width; // Keep it square
    }

    // Reset game state (important for restarting)
    snake = [{ x: 200, y: 200 }, { x: 190, y: 200 }, { x: 180, y: 200 }];
    direction = 'right';
    snakeScore = 0;
    snakeGameStarted = false; // Correctly set to false initially
    createFood();

    // Draw initial state (shows "Click Start to Play")
    drawSnake();
}

function gameOver() {
    snakeGameStarted = false; // Stop the game
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    showModal('Game Over! Score: ' + snakeScore, 'Game Over', '🐍');
    toggleGameFocus(false); // Unlock Scroll
    // Do NOT call startSnake() here.  Let the user click "Start Game" again.
}
// --- End Snake Game ---

// --- Breakout Game ---
let breakoutGameStarted = false;
let ballX, ballY, ballDX, ballDY, paddleX;
let brickRowCount = 3;
let brickColumnCount = 5;
let brickWidth = 75;
let brickHeight = 20;
let brickPadding = 10;
let brickOffsetTop = 30;
let brickOffsetLeft = 30;
let bricks = [];
let breakoutScore = 0;
let paddleSpeed = 5; // Adjust this value for smoother movement

function createBricks() {
    bricks = [];
    for (let c = 0; c < brickColumnCount; c++) {
        bricks[c] = [];
        for (let r = 0; r < brickRowCount; r++) {
            bricks[c][r] = { x: 0, y: 0, status: 1 };
        }
    }
}

function initializeBreakout() {
    const canvas = document.getElementById('breakoutCanvas');
    if (!canvas) return;

    canvas.width = 480; // Fixed size
    canvas.height = 320;

    const ctx = canvas.getContext('2d');

    // Initialize game state
    paddleX = (canvas.width - 100) / 2;
    ballX = canvas.width / 2;
    ballY = canvas.height - 30;
    ballDX = 3;
    ballDY = -3;
    breakoutScore = 0;
    createBricks();

    // Add keyboard controls
    document.addEventListener('keydown', function (e) {
        if (!breakoutGameStarted) return; // Only respond if game is active
        if (e.key === 'Right' || e.key === 'ArrowRight') {
            if (paddleX < canvas.width - 100) paddleX += paddleSpeed; // Move paddle right
        } else if (e.key === 'Left' || e.key === 'ArrowLeft') {
            if (paddleX > 0) paddleX -= paddleSpeed; // Move paddle left
        }
    });

    // Add mouse/touch controls
    canvas.addEventListener('mousemove', function (e) {
        if (!breakoutGameStarted) return; // Only respond if game is active
        const rect = canvas.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        if (relativeX > 0 && relativeX < canvas.width) {
            paddleX = Math.min(Math.max(relativeX - 50, 0), canvas.width - 100); // Keep paddle within bounds
        }
    });

    // Draw initial state
    drawBreakoutGame(ctx);
}

function drawBreakoutGame(ctx) {
    const canvas = ctx.canvas;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw "Click Start to Play" if game hasn't started
    if (!breakoutGameStarted) {
        ctx.fillStyle = '#FFF';
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Click Start to Play!', canvas.width / 2, canvas.height / 2);
        return;
    }

    // Draw bricks
    for (let c = 0; c < brickColumnCount; c++) {
        for (let r = 0; r < brickRowCount; r++) {
            if (bricks[c][r].status === 1) {
                const brickX = (c * (brickWidth + brickPadding)) + brickOffsetLeft;
                const brickY = (r * (brickHeight + brickPadding)) + brickOffsetTop;
                bricks[c][r].x = brickX;
                bricks[c][r].y = brickY;
                ctx.beginPath();
                ctx.rect(brickX, brickY, brickWidth, brickHeight);
                ctx.fillStyle = '#2193b0';
                ctx.fill();
                ctx.closePath();
            }
        }
    }

    // Draw paddle
    ctx.beginPath();
    ctx.rect(paddleX, canvas.height - 20, 100, 10);
    ctx.fillStyle = '#3498db';
    ctx.fill();
    ctx.closePath();

    // Draw ball
    ctx.beginPath();
    ctx.arc(ballX, ballY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#e74c3c';
    ctx.fill();
    ctx.closePath();

    // Draw score
    ctx.font = '16px Arial';
    ctx.fillStyle = '#FFF';
    ctx.textAlign = 'left';
    ctx.fillText('Score: ' + breakoutScore, 8, 20);
}

function startBreakout() {
    const canvas = document.getElementById('breakoutCanvas');
    if (!canvas) return;

    // Reset game state
    breakoutGameStarted = true;
    toggleGameFocus(true); // Lock Scroll
    ballX = canvas.width / 2;
    ballY = canvas.height - 30;
    ballDX = 3;
    ballDY = -3;
    paddleX = (canvas.width - 100) / 2;
    breakoutScore = 0;
    createBricks();

    // Clear previous interval (important for restarts)
    if (gameInterval) clearInterval(gameInterval);

    // Start game loop
    gameInterval = setInterval(function () {
        const ctx = canvas.getContext('2d');

        // Ball collision with walls
        if (ballX + ballDX > canvas.width - 8 || ballX + ballDX < 8) {
            ballDX = -ballDX;
        }
        if (ballY + ballDY < 8) {
            ballDY = -ballDY;
        }
        else if (ballY + ballDY > canvas.height - 8) {
            if (ballX > paddleX && ballX < paddleX + 100) {
                ballDY = -ballDY;
            }
            else {
                showModal('GAME OVER', 'Game Over', '🧱');
                breakoutGameStarted = false; // Stop the game
                clearInterval(gameInterval); // Stop the game loop
                toggleGameFocus(false);
                return; // Exit the function
            }
        }

        // Collision detection with bricks
        for (let c = 0; c < brickColumnCount; c++) {
            for (let r = 0; r < brickRowCount; r++) {
                const b = bricks[c][r];
                if (b.status === 1) {
                    if (ballX > b.x && ballX < b.x + brickWidth && ballY > b.y && ballY < b.y + brickHeight) {
                        ballDY = -ballDY;
                        b.status = 0;
                        breakoutScore++;
                        if (breakoutScore === brickRowCount * brickColumnCount) {
                            showModal('You broke all bricks!', 'You Win!', '🏆');
                            breakoutGameStarted = false;
                            clearInterval(gameInterval); // Stop the game loop
                            toggleGameFocus(false);
                            return; // Exit the function
                        }
                    }
                }
            }
        }

        // Move ball
        ballX += ballDX;
        ballY += ballDY;

        drawBreakoutGame(ctx);
    }, 10);
}
// --- End Breakout Game ---

// --- Color Match Game ---
let sequence = [];
let playerSequence = [];
let colorLevel = 1;
let colorScore = 0;
let isPlaying = false; // Flag to track if the game is in progress

function startColorGame() {
    sequence = [];
    playerSequence = [];
    colorLevel = 1;
    colorScore = 0;
    isPlaying = true; // Game starts immediately

    document.getElementById('color-score').textContent = colorScore;
    document.getElementById('color-level').textContent = colorLevel;

    // Initialize buttons
    const buttons = document.querySelectorAll('.color-btn');
    buttons.forEach(button => {
        button.style.pointerEvents = 'none'; // Disable at the start
        button.style.opacity = '1'; // Reset opacity

        // Set button colors (using CSS gradients for better visuals)
        switch (button.dataset.color) {
            case 'red':
                button.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5253)';
                break;
            case 'blue':
                button.style.background = 'linear-gradient(135deg, #4ecdc4, #2193b0)';
                break;
            case 'green':
                button.style.background = 'linear-gradient(135deg, #2ecc71, #27ae60)';
                break;
            case 'yellow':
                button.style.background = 'linear-gradient(135deg, #f1c40f, #f39c12)';
                break;
        }
    });

    setTimeout(addToSequence, 1000); // Start the sequence after a short delay
}

function addToSequence() {
    const colors = ['red', 'blue', 'green', 'yellow'];
    sequence.push(colors[Math.floor(Math.random() * colors.length)]);
    playerSequence = []; // Reset player sequence
    showSequence();
}

function showSequence() {
    disableButtons(); // Disable buttons while showing the sequence

    // Clear any previous content in the color-display div
    const colorDisplay = document.getElementById('color-display');
    if (colorDisplay) {
        colorDisplay.innerHTML = ''; // Clear previous content
        // Create single color square that will change colors
        const colorSquare = document.createElement('div');
        colorSquare.className = 'color-square';
        colorDisplay.appendChild(colorSquare);
    }

    let i = 0;
    const interval = setInterval(() => {
        if (i >= sequence.length) {
            clearInterval(interval);
            if (colorDisplay) {
                colorDisplay.querySelector('.color-square').style.backgroundColor = 'transparent';
            }
            enableButtons(); // Enable buttons after showing the sequence
            return;
        }

        const button = document.querySelector(`[data-color="${sequence[i]}"]`);
        button.style.opacity = '0.5'; // Dim the button
        if (colorDisplay) {
            const colorSquare = colorDisplay.querySelector('.color-square');
            colorSquare.style.backgroundColor = sequence[i]; // Update the single square's color
        }

        setTimeout(() => {
            button.style.opacity = '1'; // Restore opacity
            i++;
        }, 500);
    }, 1000);
}

function checkColor(color) {
    if (!isPlaying) return; // Prevent clicks if game is not active

    playerSequence.push(color);
    const index = playerSequence.length - 1;

    if (playerSequence[index] !== sequence[index]) {
        isPlaying = false; // Game over
        showModal(`Game Over! Score: ${colorScore}`, 'Game Over', '🎨', 'Try Again', () => startColorGame());
        /*startColorGame();*/
        return;
    }

    if (playerSequence.length === sequence.length) {
        colorScore += 10;
        colorLevel++;
        document.getElementById('color-score').textContent = colorScore;
        document.getElementById('color-level').textContent = colorLevel;
        disableButtons(); // Disable while adding to sequence
        setTimeout(addToSequence, 1000); // Add to sequence after a short delay
    }
}

function enableButtons() {
    const buttons = document.querySelectorAll('.color-btn');
    buttons.forEach(button => {
        button.style.pointerEvents = 'auto'; // Enable clicks
        button.onclick = () => {
            button.style.opacity = '0.5'; // Dim on click
            setTimeout(() => button.style.opacity = '1', 200); // Restore opacity
            checkColor(button.dataset.color);
        };
    });
}

function disableButtons() {
    const buttons = document.querySelectorAll('.color-btn');
    buttons.forEach(button => {
        button.style.pointerEvents = 'none'; // Disable clicks
        button.onclick = null; // Remove click handler
    });
}

// --- End Color Match Game ---

// Quick Math Game
let currentQuestion = '';
let correctAnswer = 0;
let mathScore = 0;

function startMathQuiz() {
    mathScore = 0;
    document.getElementById('mathScore').textContent = mathScore;
    generateQuestion();
}

function generateQuestion() {
    const difficulty = document.getElementById('mathDifficulty').value;
    let num1, num2, operator;

    switch (difficulty) {
        case 'easy':
            num1 = Math.floor(Math.random() * 10);
            num2 = Math.floor(Math.random() * 10);
            operator = '+';
            break;
        case 'medium':
            num1 = Math.floor(Math.random() * 20);
            num2 = Math.floor(Math.random() * 20);
            operator = ['+', '-', '*'][Math.floor(Math.random() * 3)];
            break;
        case 'hard':
            num1 = Math.floor(Math.random() * 50);
            num2 = Math.floor(Math.random() * 50);
            operator = ['+', '-', '*', '/'][Math.floor(Math.random() * 4)];
            if (operator === '/') {
                // Ensure division results in whole numbers
                num2 = Math.max(1, Math.floor(Math.random() * 10));
                num1 = num2 * Math.floor(Math.random() * 10);
            }
            break;
    }

    currentQuestion = `${num1} ${operator} ${num2} = ?`;
    document.getElementById('question').textContent = currentQuestion;

    // Calculate correct answer
    switch (operator) {
        case '+': correctAnswer = num1 + num2; break;
        case '-': correctAnswer = num1 - num2; break;
        case '*': correctAnswer = num1 * num2; break;
        case '/': correctAnswer = num1 / num2; break;
    }

    // Clear previous answer
    document.getElementById('answer').value = '';
}

function checkAnswer() {
    const userAnswer = parseFloat(document.getElementById('answer').value);
    if (userAnswer === correctAnswer) {
        mathScore++;
        document.getElementById('mathScore').textContent = mathScore;
        showModal('Correct!', 'Well Done', '➕', 'Next Question', () => generateQuestion());
    } else {
        showModal(`Incorrect. The answer was ${correctAnswer}`, 'Wrong Answer', '❌', 'Next Question', () => generateQuestion());
    }
    // generateQuestion(); moved to callbacks
}
// Initialize games when DOM loads
document.addEventListener('DOMContentLoaded', function () {
    // Initialize dark mode
    initDarkMode();

    // Memory Game Button
    const memoryStartButton = document.querySelector('.memory-board .game-controls button');
    if (memoryStartButton) {
        memoryStartButton.addEventListener('click', function () {
            startMemoryGame(); // Call startMemoryGame directly
        });
    }

    // Word Scramble Button (already initialized inline)

    // Tic Tac Toe Button (already initialized inline)

    // Snake Game Button
    const snakeStartButton = document.querySelector('.snake-game .game-controls button');
    if (snakeStartButton) {
        snakeStartButton.addEventListener('click', function () {
            if (!snakeGameStarted) {
                initializeSnakeGame();
                this.textContent = 'Restart Game';
            } else {
                snakeGameStarted = false; // Pause the game
                if (gameInterval) clearInterval(gameInterval);
                startSnake(); // Reset the game state
                this.textContent = 'Start Game';
            }
        });
    }

    // Breakout Game Button
    const breakoutStartButton = document.querySelector('.breakout-container .game-controls button');
    if (breakoutStartButton) {
        breakoutStartButton.onclick = function () {
            if (!breakoutGameStarted) {
                startBreakout(); // Call startBreakout instead of initializeBreakout
                this.textContent = 'Restart Game';
            } else {
                breakoutGameStarted = false;
                if (gameInterval) clearInterval(gameInterval);
                initializeBreakout();
                this.textContent = 'Start Game';
            }
        };
    }
    // Color Game Button
    const colorStartButton = document.querySelector('.color-buttons .game-controls button');
    if (colorStartButton) {
        colorStartButton.addEventListener('click', function () {
            startColorGame();
        });
    }
    // Initialize other games
    startMemoryGame();          // Memory Game
    initializeWordScramble();   // Word Scramble
    startTicTacToe();           // Tic Tac Toe
    startColorGame();           // Color Match
});

