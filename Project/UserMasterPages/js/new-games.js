// New Games - Added separately without modifying existing code

// Checkers Game
const checkers = {
    board: [],
    currentPlayer: 'red',
    selectedPiece: null,

    init: function () {
        const board = document.getElementById('checkers-board');
        if (!board) return;

        this.board = [];
        this.currentPlayer = 'red';
        this.selectedPiece = null;
        board.innerHTML = '';

        // Create board
        for (let row = 0; row < 8; row++) {
            this.board[row] = [];
            for (let col = 0; col < 8; col++) {
                const cell = document.createElement('div');
                cell.className = `checkers-cell ${(row + col) % 2 === 0 ? 'light' : 'dark'}`;

                if ((row + col) % 2 === 1) {
                    if (row < 3) {
                        cell.innerHTML = '<div class="checker black"></div>';
                        this.board[row][col] = 'black';
                    } else if (row > 4) {
                        cell.innerHTML = '<div class="checker red"></div>';
                        this.board[row][col] = 'red';
                    } else {
                        this.board[row][col] = null;
                    }
                }

                cell.dataset.row = row;
                cell.dataset.col = col;
                cell.onclick = () => this.handleClick(cell);
                board.appendChild(cell);
            }
        }

        document.getElementById('checkersPlayer').textContent = this.currentPlayer.toUpperCase();
    },

    handleClick: function (cell) {
        const row = parseInt(cell.dataset.row);
        const col = parseInt(cell.dataset.col);

        if (this.selectedPiece) {
            if (this.isValidMove(this.selectedPiece, cell)) {
                this.movePiece(this.selectedPiece, cell);
                this.selectedPiece.classList.remove('selected');
                this.selectedPiece = null;
                this.currentPlayer = this.currentPlayer === 'red' ? 'black' : 'red';
                document.getElementById('checkersPlayer').textContent = this.currentPlayer.toUpperCase();
                if (this.checkWin()) {
                    setTimeout(() => {
                        showModal(`Player ${this.currentPlayer.toUpperCase()} wins!`, 'Checkers Champion', '♛');
                    }, 100);
                }
            } else {
                this.selectedPiece.classList.remove('selected');
                this.selectedPiece = null;
            }
        } else {
            const piece = cell.querySelector('.checker');
            if (piece && piece.classList.contains(this.currentPlayer)) {
                this.selectedPiece = cell;
                cell.classList.add('selected');
            }
        }
    },

    isValidMove: function (from, to) {
        const fromRow = parseInt(from.dataset.row);
        const fromCol = parseInt(from.dataset.col);
        const toRow = parseInt(to.dataset.row);
        const toCol = parseInt(to.dataset.col);

        if (this.board[toRow][toCol]) return false;

        const rowDiff = toRow - fromRow;
        const colDiff = Math.abs(toCol - fromCol);

        if (this.currentPlayer === 'red' && rowDiff > 0) return false;
        if (this.currentPlayer === 'black' && rowDiff < 0) return false;

        if (Math.abs(rowDiff) === 1 && colDiff === 1) return true;

        if (Math.abs(rowDiff) === 2 && colDiff === 2) {
            const jumpedRow = (fromRow + toRow) / 2;
            const jumpedCol = (fromCol + toCol) / 2;
            return this.board[jumpedRow][jumpedCol] &&
                this.board[jumpedRow][jumpedCol] !== this.currentPlayer;
        }

        return false;
    },

    movePiece: function (from, to) {
        const fromRow = parseInt(from.dataset.row);
        const fromCol = parseInt(from.dataset.col);
        const toRow = parseInt(to.dataset.row);
        const toCol = parseInt(to.dataset.col);

        to.innerHTML = from.innerHTML;
        from.innerHTML = '';
        this.board[toRow][toCol] = this.board[fromRow][fromCol];
        this.board[fromRow][fromCol] = null;

        if (Math.abs(toRow - fromRow) === 2) {
            const jumpedRow = (fromRow + toRow) / 2;
            const jumpedCol = (fromCol + toCol) / 2;
            const jumpedCell = document.querySelector(`[data-row="${jumpedRow}"][data-col="${jumpedCol}"]`);
            jumpedCell.innerHTML = '';
            this.board[jumpedRow][jumpedCol] = null;
        }

        const piece = to.querySelector('.checker');
        if ((this.currentPlayer === 'red' && toRow === 0) ||
            (this.currentPlayer === 'black' && toRow === 7)) {
            piece.classList.add('king');
        }
    },

    checkWin: function () {
        let redPieces = 0;
        let blackPieces = 0;
        for (let row = 0; row < 8; row++) {
            for (let col = 0; col < 8; col++) {
                if (this.board[row][col] === 'red') {
                    redPieces++;
                } else if (this.board[row][col] === 'black') {
                    blackPieces++;
                }
            }
        }
        return redPieces === 0 || blackPieces === 0;
    }
};

// 15 Puzzle Game
const puzzle = {
    board: [],
    moves: 0,

    init: function () {
        const board = document.getElementById('puzzle-board');
        if (!board) return;

        this.board = [];
        this.moves = 0;
        board.innerHTML = '';
        document.getElementById('puzzleMoves').textContent = this.moves;

        // Create shuffled numbers
        const numbers = Array.from({ length: 15 }, (_, i) => i + 1);
        numbers.push(null);
        this.shuffleArray(numbers);

        // Create board
        numbers.forEach((num, i) => {
            const tile = document.createElement('div');
            tile.className = `puzzle-tile ${!num ? 'empty' : ''}`;
            tile.textContent = num || '';
            tile.onclick = () => this.handleClick(i);
            board.appendChild(tile);
            this.board[i] = num;
        });
    },

    handleClick: function (index) {
        const emptyIndex = this.board.indexOf(null);
        if (!this.isAdjacent(index, emptyIndex)) return;

        // Swap tiles
        const tiles = document.querySelectorAll('.puzzle-tile');
        tiles[emptyIndex].textContent = tiles[index].textContent;
        tiles[emptyIndex].classList.remove('empty');
        tiles[index].textContent = '';
        tiles[index].classList.add('empty');

        // Update board state
        this.board[emptyIndex] = this.board[index];
        this.board[index] = null;

        // Update moves
        this.moves++;
        document.getElementById('puzzleMoves').textContent = this.moves;

        // Check win
        if (this.checkWin()) {
            setTimeout(() => {
                showModal(`You solved the puzzle in ${this.moves} moves!`, 'Puzzle Solved!', '🧩');
            }, 300);
        }
    },

    isAdjacent: function (index1, index2) {
        const row1 = Math.floor(index1 / 4);
        const col1 = index1 % 4;
        const row2 = Math.floor(index2 / 4);
        const col2 = index2 % 4;

        return Math.abs(row1 - row2) + Math.abs(col1 - col2) === 1;
    },

    checkWin: function () {
        return this.board.every((num, index) =>
            index === 15 ? num === null : num === index + 1
        );
    },

    shuffleArray: function (array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
};

// Hangman Game
const hangman = {
    words: ['javascript', 'programming', 'hangman', 'challenge', 'developer', 'mathematics', 'python', 'learning', 'computer'],
    currentWord: '',
    remainingGuesses: 6,
    guessedLetters: new Set(),
    isActive: false,

    start: function () {
        if (this.isActive) return;

        this.isActive = true;
        this.currentWord = this.words[Math.floor(Math.random() * this.words.length)];
        this.remainingGuesses = 6;
        this.guessedLetters.clear();

        document.getElementById('guessesLeft').textContent = this.remainingGuesses;
        this.updateWordDisplay();
        this.drawHangman();
        this.setupLetterButtons();
    },

    updateWordDisplay: function () {
        const display = this.currentWord
            .split('')
            .map(letter => this.guessedLetters.has(letter) ? letter : '_')
            .join(' ');
        document.getElementById('word-display').textContent = display;
    },

    setupLetterButtons: function () {
        const letterButtons = document.getElementById('letter-buttons');
        letterButtons.innerHTML = '';

        'abcdefghijklmnopqrstuvwxyz'.split('').forEach(letter => {
            const button = document.createElement('button');
            button.textContent = letter;
            button.className = 'letter-btn';
            button.onclick = () => this.guessLetter(letter, button);
            letterButtons.appendChild(button);
        });
    },

    guessLetter: function (letter, button) {
        if (!this.isActive || this.guessedLetters.has(letter)) return;

        this.guessedLetters.add(letter);
        button.classList.add('used');
        button.disabled = true;

        if (!this.currentWord.includes(letter)) {
            this.remainingGuesses--;
            document.getElementById('guessesLeft').textContent = this.remainingGuesses;
            this.drawHangman();

            if (this.remainingGuesses <= 0) {
                this.isActive = false;
                setTimeout(() => {
                    showModal(`Game Over! The word was: ${this.currentWord}`, 'Hangman', '😵');
                    this.isActive = false;
                }, 500);
                return;
            }
        }

        this.updateWordDisplay();

        // Check for win
        if (!this.currentWord.split('').some(l => !this.guessedLetters.has(l))) {
            this.isActive = false;
            setTimeout(() => {
                showModal('Congratulations! You guessed the word!', 'You Won!', '🎉');
                this.isActive = false;
            }, 500);
        }
    },

    drawHangman: function () {
        const canvas = document.getElementById('hangmanCanvas');
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        // Draw gallows
        ctx.beginPath();
        ctx.moveTo(20, 180);
        ctx.lineTo(180, 180);
        ctx.moveTo(60, 180);
        ctx.lineTo(60, 20);
        ctx.lineTo(140, 20);
        ctx.lineTo(140, 40);
        ctx.stroke();

        const parts = [
            // Head
            () => {
                ctx.beginPath();
                ctx.arc(140, 55, 15, 0, Math.PI * 2);
                ctx.stroke();
            },
            // Body
            () => {
                ctx.beginPath();
                ctx.moveTo(140, 70);
                ctx.lineTo(140, 120);
                ctx.stroke();
            },
            // Left arm
            () => {
                ctx.beginPath();
                ctx.moveTo(140, 85);
                ctx.lineTo(110, 100);
                ctx.stroke();
            },
            // Right arm
            () => {
                ctx.beginPath();
                ctx.moveTo(140, 85);
                ctx.lineTo(170, 100);
                ctx.stroke();
            },
            // Left leg
            () => {
                ctx.beginPath();
                ctx.moveTo(140, 120);
                ctx.lineTo(110, 150);
                ctx.stroke();
            },
            // Right leg
            () => {
                ctx.beginPath();
                ctx.moveTo(140, 120);
                ctx.lineTo(170, 150);
                ctx.stroke();
            }
        ];

        // Draw parts based on remaining guesses
        for (let i = 0; i < 6 - this.remainingGuesses; i++) {
            parts[i]();
        }
    }
};

// Bubble Pop Game
const bubblePop = {
    bubbles: [],
    score: 0,
    level: 1,
    gameStarted: false,
    animationId: null,
    timer: 15, // Timer starts at 15 seconds

    init: function () {
        const canvas = document.getElementById('bubbleCanvas');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        canvas.width = 320;
        canvas.height = 480;

        this.bubbles = [];
        this.score = 0;
        this.level = 1; // Initialize level
        this.gameStarted = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        const scoreDisplay = document.getElementById('bubbleScore');
        const levelDisplay = document.getElementById('bubbleLevel'); // Get level display
        if (scoreDisplay) {
            scoreDisplay.textContent = this.score;
        }
        if (levelDisplay) {
            levelDisplay.textContent = this.level; // Initialize level display
        }

        // Draw initial "Click Start to Play" message
        this.drawMessage(ctx, 'Click Start to Play!');
    },

    start: function () {
        this.gameStarted = true;
        this.score = 0;
        this.level = 1; // Reset level
        this.bubbles = [];
        this.timer = 15; // Reset timer
        const scoreDisplay = document.getElementById('bubbleScore');
        const levelDisplay = document.getElementById('bubbleLevel'); // Get level display
        if (scoreDisplay) {
            scoreDisplay.textContent = this.score;
        }
        if (levelDisplay) {
            levelDisplay.textContent = this.level; // Initialize level display
        }
        this.update();
        this.startTimer(); // Start the timer
    },

    startTimer: function () {
        const timerDisplay = document.getElementById('bubbleTimer'); // Get timer display
        const timerInterval = setInterval(() => {
            if (this.timer > 0) {
                this.timer--;
                if (timerDisplay) {
                    timerDisplay.textContent = `Time: ${this.timer}s`; // Update timer display
                }
            } else {
                clearInterval(timerInterval); // Stop the timer
                showModal(`Time's up! Final Score: ${this.score}, Level: ${this.level}`, 'Game Over', '🫧', 'Play Again', () => bubblePop.init());
                this.gameStarted = false; // Stop the game
                this.bubbles = []; // Clear bubbles
                this.init(); // Reset the game
            }
        }, 1000);
    },

    drawMessage: function (ctx, message) {
        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(message, ctx.canvas.width / 2, ctx.canvas.height / 2);
    },

    update: function () {
        const canvas = document.getElementById('bubbleCanvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Add new bubbles based on level
        if (Math.random() < (0.03 + (this.level - 1) * 0.01)) { // Increase frequency with level
            this.bubbles.push(this.createBubble());
        }

        // Update and draw bubbles
        this.bubbles = this.bubbles.filter(bubble => {
            bubble.y -= bubble.speed;

            // Draw bubble with glow effect
            ctx.shadowColor = bubble.glowColor;
            ctx.shadowBlur = 15;
            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, bubble.radius, 0, Math.PI * 2);
            ctx.fillStyle = bubble.color;
            ctx.fill();
            ctx.strokeStyle = 'white'; // Add a white outline
            ctx.lineWidth = 2;
            ctx.stroke();

            // Reset shadow
            ctx.shadowBlur = 0;

            return bubble.y + bubble.radius > 0; // Remove if off-screen
        });

        // Draw score and level
        ctx.fillStyle = 'white';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Score: ${this.score}`, 10, 30);
        ctx.fillText(`Level: ${this.level}`, 10, 60); // Display level

        // Level up logic
        if (this.score >= this.level * 10) { // Increase level every 10 points
            this.level++;
            const levelDisplay = document.getElementById('bubbleLevel'); // Get level display
            if (levelDisplay) {
                levelDisplay.textContent = this.level; // Update level display
            }

            // Adjust bubble speed based on level
            this.bubbles.forEach(bubble => {
                bubble.speed += 2; // Increase bubble speed by 2 for each level
            });
        }

        // End game logic
        if (this.score >= 100) { // End game at score 100
            showModal('Maximum Level Reached!', 'Incredible!', '🏆', 'Play Again', () => bubblePop.init());
            this.gameStarted = false; // Stop the game
            this.bubbles = []; // Clear bubbles
            this.init(); // Reset the game
            return;
        }

        this.animationId = requestAnimationFrame(this.update.bind(this)); // Request next frame
    },

    createBubble: function () {
        return {
            x: Math.random() * 320,
            y: 480, // Start from the bottom
            radius: 20 + Math.random() * 20, // Random radius
            speed: 4,   // Start speed at 4
            color: `hsl(${Math.random() * 360}, 70%, 50%)`, // Random color
            glowColor: `hsl(${Math.random() * 360}, 80%, 60%)` // Random glow color
        };
    }
};

// Add this function to handle bubble clicks
function handleBubbleClick(e) {
    const canvas = document.getElementById('bubbleCanvas');
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    this.bubbles = this.bubbles.filter(bubble => {
        const distance = Math.hypot(bubble.x - x, bubble.y - y);
        if (distance <= bubble.radius) {
            // Random score between 1 and 5 for each pop
            const popScore = Math.floor(Math.random() * 5) + 1;
            this.score += popScore;
            const scoreDisplay = document.getElementById('bubbleScore');
            if (scoreDisplay) {
                scoreDisplay.textContent = this.score;
            }
            return false; // Remove bubble
        }
        return true; // Keep bubble
    });
}

// Simon Says Game
const simonSays = {
    sequence: [],
    playerSequence: [],
    score: 0,
    gameStarted: false,
    colors: ['red', 'blue', 'green', 'yellow'],

    start: function () {
        this.score = 0;
        this.sequence = [];
        this.playerSequence = [];
        this.gameStarted = true;
        this.addToSequence();
    },

    addToSequence: function () {
        this.sequence.push(this.colors[Math.floor(Math.random() * this.colors.length)]);
        this.showSequence();
    },

    showSequence: function () {
        const simonDisplay = document.getElementById('simon-display');
        simonDisplay.innerHTML = ''; // Clear previous display
        let i = 0;

        const interval = setInterval(() => {
            if (i >= this.sequence.length) {
                clearInterval(interval);
                this.enableButtons(); // Enable buttons after showing the sequence
                return;
            }

            const color = this.sequence[i];
            const button = document.querySelector(`[data-color="${color}"]`);
            button.style.opacity = '0.5'; // Dim the button
            setTimeout(() => {
                button.style.opacity = '1'; // Restore opacity
            }, 500);
            simonDisplay.innerHTML += `<div class="color-square" style="background-color: ${color};"></div>`; // Show color square
            i++;
        }, 1000);
    },

    checkColor: function (color) {
        if (!this.gameStarted) return; // Prevent clicks if game is not active

        this.playerSequence.push(color);
        const index = this.playerSequence.length - 1;

        if (this.playerSequence[index] !== this.sequence[index]) {
            showModal(`Game Over! Final Score: ${this.score}`, 'Simon Says', '🔴');
            this.gameStarted = false; // Stop the game
            return;
        }

        if (this.playerSequence.length === this.sequence.length) {
            this.score++;
            document.getElementById('simonScore').textContent = this.score; // Update score
            this.playerSequence = []; // Reset player sequence
            this.addToSequence(); // Add to sequence
        }
    },

    enableButtons: function () {
        const buttons = document.querySelectorAll('.color-btn');
        buttons.forEach(button => {
            button.style.pointerEvents = 'auto'; // Enable clicks
            button.onclick = () => {
                button.style.opacity = '0.5'; // Dim on click
                setTimeout(() => button.style.opacity = '1', 200); // Restore opacity
                this.checkColor(button.dataset.color);
            };
        });
    }
};

// Export functions for use in HTML
window.startCheckers = () => checkers.init();
window.startPuzzle = () => puzzle.init();
window.startHangman = () => hangman.start();
window.startBubblePop = function () {
    if (!bubblePop.gameStarted) {
        bubblePop.start();
    } else {
        bubblePop.init(); // Reset the game
    }
};

// Initialize bubble pop when the page loads
document.addEventListener('DOMContentLoaded', function () {
    bubblePop.init();
});

// Add the click event listener to the canvas
document.getElementById('bubbleCanvas').addEventListener('click', handleBubbleClick.bind(bubblePop));

// Export function for use in HTML
window.startSimonSays = function () {
    simonSays.start();
};

// Rock, Paper, Scissors Game
// Rock, Paper, Scissors Game (Enhanced)
let rpsState = 'idle'; // idle, counting, finished
let rpsUserChoice = null;
let rpsTimerInterval;

window.startRPS = function () {
    rpsState = 'counting';
    rpsUserChoice = null;
    let timeLeft = 3;

    const resultEl = document.getElementById('rpsResult');
    document.getElementById('playerChoice').textContent = '-';
    document.getElementById('computerChoice').textContent = '-';

    // Disable buttons? No, enable them for selection
    updateRPSButtonsUI();

    resultEl.textContent = `Make your choice: ${timeLeft}...`;

    clearInterval(rpsTimerInterval);
    rpsTimerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft > 0) {
            resultEl.textContent = `Make your choice: ${timeLeft}...`;
        } else {
            clearInterval(rpsTimerInterval);
            finishRPSRound();
        }
    }, 1000);
};

window.playRPS = function (choice) {
    if (rpsState !== 'counting') {
        if (rpsState === 'idle') {
            showModal("Click 'Start Round' to begin!", 'Ready?', '🎮');
        }
        return;
    }

    rpsUserChoice = choice;
    document.getElementById('playerChoice').textContent = getEmojiForchoice(choice);
    // Highlight button visual
    updateRPSButtonsUI();
};

function finishRPSRound() {
    rpsState = 'finished';
    const resultEl = document.getElementById('rpsResult');

    if (!rpsUserChoice) {
        resultEl.textContent = "Time's up! You didn't choose!";
        return;
    }

    const choices = ['rock', 'paper', 'scissors'];
    const computerChoice = choices[Math.floor(Math.random() * choices.length)];
    document.getElementById('computerChoice').textContent = getEmojiForchoice(computerChoice);

    let result;
    if (rpsUserChoice === computerChoice) {
        result = "It's a tie!";
    } else if (
        (rpsUserChoice === 'rock' && computerChoice === 'scissors') ||
        (rpsUserChoice === 'paper' && computerChoice === 'rock') ||
        (rpsUserChoice === 'scissors' && computerChoice === 'paper')
    ) {
        result = "You win! 🎉";
    } else {
        result = "You lose! 🤖";
    }

    resultEl.textContent = result;
}

function getEmojiForchoice(choice) {
    if (choice === 'rock') return 'Rock 🪨';
    if (choice === 'paper') return 'Paper 📄';
    return 'Scissors ✂️';
}

function updateRPSButtonsUI() {
    // Optional: add visual styling to selected button
}

// 2048 Game
let game2048 = {
    grid: [],
    score: 0,
    gameStarted: false,

    start: function () {
        this.gameStarted = true;
        toggleGameFocus(true); // Lock Scroll
        this.grid = this.createEmptyGrid();
        this.addRandomTile();
        this.addRandomTile();
        this.updateGrid();
        this.addKeyboardControls();
    },

    createEmptyGrid: function () {
        return Array.from({ length: 4 }, () => Array(4).fill(0));
    },

    addRandomTile: function () {
        const emptyTiles = [];
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.grid[r][c] === 0) {
                    emptyTiles.push({ r, c });
                }
            }
        }
        if (emptyTiles.length > 0) {
            const { r, c } = emptyTiles[Math.floor(Math.random() * emptyTiles.length)];
            this.grid[r][c] = Math.random() < 0.9 ? 2 : 4; // 90% chance for 2, 10% for 4
        }
    },

    updateGrid: function () {
        const gridElement = document.getElementById('game2048-grid');
        gridElement.innerHTML = ''; // Clear previous grid
        this.grid.forEach(row => {
            row.forEach(value => {
                const cell = document.createElement('div');
                cell.className = 'game2048-cell';
                cell.textContent = value !== 0 ? value : '';
                gridElement.appendChild(cell);
            });
        });
        document.getElementById('game2048-score').textContent = this.score;
    },

    addKeyboardControls: function () {
        // Only add listener once
        if (this.keyboardHandler) return;

        this.keyboardHandler = (event) => {
            if (this.gameStarted) {
                switch (event.key) {
                    case 'ArrowUp':
                        event.preventDefault();
                        this.moveUp();
                        break;
                    case 'ArrowDown':
                        event.preventDefault();
                        this.moveDown();
                        break;
                    case 'ArrowLeft':
                        event.preventDefault();
                        this.moveLeft();
                        break;
                    case 'ArrowRight':
                        event.preventDefault();
                        this.moveRight();
                        break;
                }
            }
        };
        document.addEventListener('keydown', this.keyboardHandler);
    },

    moveUp: function () {
        let moved = false;
        for (let c = 0; c < 4; c++) {
            for (let r = 1; r < 4; r++) {
                if (this.grid[r][c] !== 0) {
                    let row = r;
                    while (row > 0 && (this.grid[row - 1][c] === 0 || this.grid[row - 1][c] === this.grid[row][c])) {
                        if (this.grid[row - 1][c] === this.grid[row][c]) {
                            this.grid[row - 1][c] *= 2;
                            this.score += this.grid[row - 1][c];
                            this.grid[row][c] = 0;
                            moved = true;
                            break;
                        } else if (this.grid[row - 1][c] === 0) {
                            this.grid[row - 1][c] = this.grid[row][c];
                            this.grid[row][c] = 0;
                            moved = true;
                            row--;
                        }
                    }
                }
            }
        }
        if (moved) {
            this.addRandomTile();
            this.updateGrid();
            this.checkGameOver();
        }
    },

    moveDown: function () {
        let moved = false;
        for (let c = 0; c < 4; c++) {
            for (let r = 2; r >= 0; r--) {
                if (this.grid[r][c] !== 0) {
                    let row = r;
                    while (row < 3 && (this.grid[row + 1][c] === 0 || this.grid[row + 1][c] === this.grid[row][c])) {
                        if (this.grid[row + 1][c] === this.grid[row][c]) {
                            this.grid[row + 1][c] *= 2;
                            this.score += this.grid[row + 1][c];
                            this.grid[row][c] = 0;
                            moved = true;
                            break;
                        } else if (this.grid[row + 1][c] === 0) {
                            this.grid[row + 1][c] = this.grid[row][c];
                            this.grid[row][c] = 0;
                            moved = true;
                            row++;
                        }
                    }
                }
            }
        }
        if (moved) {
            this.addRandomTile();
            this.updateGrid();
            this.checkGameOver();
        }
    },

    moveLeft: function () {
        let moved = false;
        for (let r = 0; r < 4; r++) {
            for (let c = 1; c < 4; c++) {
                if (this.grid[r][c] !== 0) {
                    let col = c;
                    while (col > 0 && (this.grid[r][col - 1] === 0 || this.grid[r][col - 1] === this.grid[r][col])) {
                        if (this.grid[r][col - 1] === this.grid[r][col]) {
                            this.grid[r][col - 1] *= 2;
                            this.score += this.grid[r][col - 1];
                            this.grid[r][col] = 0;
                            moved = true;
                            break;
                        } else if (this.grid[r][col - 1] === 0) {
                            this.grid[r][col - 1] = this.grid[r][col];
                            this.grid[r][col] = 0;
                            moved = true;
                            col--;
                        }
                    }
                }
            }
        }
        if (moved) {
            this.addRandomTile();
            this.updateGrid();
            this.checkGameOver();
        }
    },

    moveRight: function () {
        let moved = false;
        for (let r = 0; r < 4; r++) {
            for (let c = 2; c >= 0; c--) {
                if (this.grid[r][c] !== 0) {
                    let col = c;
                    while (col < 3 && (this.grid[r][col + 1] === 0 || this.grid[r][col + 1] === this.grid[r][col])) {
                        if (this.grid[r][col + 1] === this.grid[r][col]) {
                            this.grid[r][col + 1] *= 2;
                            this.score += this.grid[r][col + 1];
                            this.grid[r][col] = 0;
                            moved = true;
                            break;
                        } else if (this.grid[r][col + 1] === 0) {
                            this.grid[r][col + 1] = this.grid[r][col];
                            this.grid[r][col] = 0;
                            moved = true;
                            col++;
                        }
                    }
                }
            }
        }
        if (moved) {
            this.addRandomTile();
            this.updateGrid();
            this.checkGameOver();
        }
    },

    checkGameOver: function () {
        // Check if any moves are possible
        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                if (this.grid[r][c] === 0) return false; // Empty cell exists
                if (this.grid[r][c] === 2048) {
                    showModal('Congratulations! You reached 2048!', '2048 Master', '🏆');
                    this.gameStarted = false; // Stop responding to keys
                    toggleGameFocus(false);
                    return true;
                }
                // Check adjacent cells
                if (r < 3 && this.grid[r][c] === this.grid[r + 1][c]) return false;
                if (c < 3 && this.grid[r][c] === this.grid[r][c + 1]) return false;
            }
        }
        showModal('No more moves possible.', 'Game Over', '🔢');
        this.gameStarted = false; // Stop responding to keys
        toggleGameFocus(false); // Unlock Scroll
        return true;
    }
};

// Start the game when the button is clicked
function start2048() {
    game2048.start();
}

// Stop 2048 game (call when exiting/clicking elsewhere)
function stop2048() {
    game2048.gameStarted = false;
    toggleGameFocus(false);
}

// Auto-pause 2048 when clicking outside its container
document.addEventListener('click', function (e) {
    const game2048Container = document.getElementById('game2048-grid');
    if (game2048Container && game2048.gameStarted) {
        if (!game2048Container.closest('.modern-game-card').contains(e.target)) {
            stop2048();
        }
    }
});

// Whack-a-Mole Game
const whackAMole = {
    score: 0,
    timer: 30,
    gameStarted: false,
    moleInterval: null,

    start: function () {
        this.score = 0;
        this.timer = 30;
        this.gameStarted = true;
        this.updateScore();
        this.startTimer();
        this.showMole();
    },

    showMole: function () {
        const moleGrid = document.getElementById('whack-a-mole-grid');
        moleGrid.innerHTML = ''; // Clear previous moles
        const moleIndex = Math.floor(Math.random() * 9); // Random index for 3x3 grid
        for (let i = 0; i < 9; i++) {
            const moleHole = document.createElement('div');
            moleHole.className = 'mole-hole';
            if (i === moleIndex) {
                const mole = document.createElement('div');
                mole.className = 'mole';
                mole.onclick = (e) => this.whackMole(e); // Pass event
                moleHole.appendChild(mole);
            }
            moleGrid.appendChild(moleHole);
        }

        if (this.gameStarted) {
            this.moleInterval = setTimeout(() => this.showMole(), 1000); // Show new mole every second
        }
    },

    whackMole: function (e) {
        if (!this.gameStarted) return;
        this.score++;
        this.updateScore();

        // Visual Feedback
        const mole = e.target;
        const rect = mole.getBoundingClientRect();
        const feedback = document.createElement('div');
        feedback.textContent = '✨ Hit!';
        feedback.style.position = 'fixed';
        feedback.style.left = `${rect.left + 20}px`;
        feedback.style.top = `${rect.top}px`;
        feedback.style.color = '#FFD700';
        feedback.style.fontWeight = 'bold';
        feedback.style.fontSize = '20px';
        feedback.style.pointerEvents = 'none';
        feedback.style.zIndex = '1000';
        feedback.style.animation = 'floatUp 1s ease-out forwards';

        // Add animation keyframes if not exists
        if (!document.getElementById('feedback-animation-style')) {
            const style = document.createElement('style');
            style.id = 'feedback-animation-style';
            style.textContent = `
                @keyframes floatUp {
                    0% { transform: translateY(0); opacity: 1; }
                    100% { transform: translateY(-50px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(feedback);
        setTimeout(() => feedback.remove(), 1000);
    },

    updateScore: function () {
        document.getElementById('mole-score').textContent = this.score;
    },

    startTimer: function () {
        const timerDisplay = document.getElementById('mole-timer');
        const timerInterval = setInterval(() => {
            if (this.timer > 0) {
                this.timer--;
                timerDisplay.textContent = this.timer;
            } else {
                clearInterval(timerInterval);
                this.endGame();
            }
        }, 1000);
    },

    endGame: function () {
        this.gameStarted = false;
        clearTimeout(this.moleInterval);
        showModal(`Time's up! Your score: ${this.score}`, 'Whack-a-Mole', '🔨', 'Play Again', () => this.resetGame());
        this.resetGame();
    },

    resetGame: function () {
        this.score = 0;
        this.timer = 30;
        this.updateScore();
        const moleGrid = document.getElementById('whack-a-mole-grid');
        moleGrid.innerHTML = ''; // Clear the grid
    }
};

// Start the game when the button is clicked
function startWhackAMole() {
    whackAMole.start();
}

// Sudoku Game
let sudokuTimer = null;
let sudokuTime = 0;

function startSudoku() {
    // 1. Reset Logic
    if (sudokuTimer) clearInterval(sudokuTimer);
    sudokuTime = 0;

    // 2. Clear Board & Timer Display
    const container = document.getElementById('sudoku-container');
    const board = document.getElementById('sudoku-board');
    if (!board || !container) return; // Safety

    board.innerHTML = '';

    // Remove old timer div if it exists to strictly prevent duplication
    const oldTimer = document.getElementById('sudoku-timer');
    if (oldTimer) oldTimer.remove();

    // 3. Generate New Board
    // Logic: Create solved board, then remove numbers
    const solvedGrid = generateRandomSudokuBoard();
    const puzzleGrid = removeNumbers(JSON.parse(JSON.stringify(solvedGrid)), 40); // Standard remove 40

    // 4. Render Grid - Using flat structure for new CSS grid alignment
    // We will still treat it as 9x9 but flat div sequence is fine with grid layout
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            const cell = document.createElement('input');
            cell.type = 'text'; // Better than number for disabling spinners
            cell.inputMode = 'numeric';
            cell.maxLength = 1;
            cell.className = 'sudoku-cell';
            cell.dataset.row = r;
            cell.dataset.col = c;

            const val = puzzleGrid[r][c];
            if (val !== 0) {
                cell.value = val;
                cell.readOnly = true;
                cell.setAttribute('readonly', 'true');
            } else {
                cell.addEventListener('input', (e) => {
                    // Filter non-numeric
                    const v = e.target.value.replace(/[^1-9]/g, '');
                    e.target.value = v;
                    if (v) checkSudokuCompletion();
                });
            }
            board.appendChild(cell);
        }
    }

    // 5. Setup Timer
    const timerDiv = document.createElement('div');
    timerDiv.id = 'sudoku-timer';
    timerDiv.className = 'sudoku-timer';
    timerDiv.textContent = "Time: 0:00";
    container.insertBefore(timerDiv, board);

    // 6. Start Interval
    sudokuTimer = setInterval(() => {
        sudokuTime++;
        const minutes = Math.floor(sudokuTime / 60);
        const seconds = sudokuTime % 60;
        timerDiv.textContent = `Time: ${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// Helper to remove numbers for puzzle generation
function removeNumbers(grid, count) {
    let attempts = count;
    while (attempts > 0) {
        let row = Math.floor(Math.random() * 9);
        let col = Math.floor(Math.random() * 9);
        while (grid[row][col] === 0) {
            row = Math.floor(Math.random() * 9);
            col = Math.floor(Math.random() * 9);
        }
        grid[row][col] = 0;
        attempts--;
    }
    return grid;
}

function checkSudokuCompletion() {
    const board = document.getElementById('sudoku-board');
    const cells = board.getElementsByClassName('sudoku-cell');
    let isComplete = true;
    let currentBoard = Array(9).fill().map(() => Array(9).fill(0));

    // Fill currentBoard with values
    for (let i = 0; i < cells.length; i++) {
        const row = Math.floor(i / 9);
        const col = i % 9;
        const value = cells[i].value;

        // Check if all cells are filled
        if (!value) {
            return; // Exit if any cell is empty
        }
        currentBoard[row][col] = parseInt(value);
    }

    // Check rows
    for (let row = 0; row < 9; row++) {
        const rowNums = new Set();
        for (let col = 0; col < 9; col++) {
            const num = currentBoard[row][col];
            if (rowNums.has(num)) {
                return; // Invalid row
            }
            rowNums.add(num);
        }
    }

    // Check columns
    for (let col = 0; col < 9; col++) {
        const colNums = new Set();
        for (let row = 0; row < 9; row++) {
            const num = currentBoard[row][col];
            if (colNums.has(num)) {
                return; // Invalid column
            }
            colNums.add(num);
        }
    }

    // Check 3x3 boxes
    for (let boxRow = 0; boxRow < 9; boxRow += 3) {
        for (let boxCol = 0; boxCol < 9; boxCol += 3) {
            const boxNums = new Set();
            for (let i = 0; i < 3; i++) {
                for (let j = 0; j < 3; j++) {
                    const num = currentBoard[boxRow + i][boxCol + j];
                    if (boxNums.has(num)) {
                        return; // Invalid box
                    }
                    boxNums.add(num);
                }
            }
        }
    }

    // If we get here, the solution is valid
    // Stop timer
    clearInterval(sudokuTimer);
    const minutes = Math.floor(sudokuTime / 60);
    const seconds = sudokuTime % 60;

    // Show completion message
    const completionMessage = document.createElement('div');
    completionMessage.className = 'sudoku-completion';
    completionMessage.innerHTML = `
        <h3>Congratulations! 🎉</h3>
        <p>You solved the Sudoku puzzle correctly in ${minutes}:${seconds.toString().padStart(2, '0')}!</p>
    `;

    const container = document.getElementById('sudoku-container');
    container.appendChild(completionMessage);
}

// Sudoku Actions
window.resetSudoku = function () {
    if (sudokuTimer) clearTimeout(sudokuTimer);
    startSudoku();
};

window.getSudokuHint = function () {
    const board = document.getElementById('sudoku-board');
    if (!board) return;

    // Get current grid state
    const currentGrid = [];
    const cells = board.getElementsByClassName('sudoku-cell');
    let emptyCells = [];

    for (let i = 0; i < 81; i++) {
        const row = Math.floor(i / 9);
        if (!currentGrid[row]) currentGrid[row] = [];
        const val = cells[i].value ? parseInt(cells[i].value) : 0;
        currentGrid[row].push(val);
        if (val === 0) emptyCells.push({ r: row, c: i % 9, index: i });
    }

    if (emptyCells.length === 0) return;

    // Try to solve (simple backtracking)
    if (solveSudoku(currentGrid)) {
        // Pick a random empty cell to reveal
        const randomEmpty = emptyCells[Math.floor(Math.random() * emptyCells.length)];
        const correctVal = currentGrid[randomEmpty.r][randomEmpty.c];

        // Fill it
        cells[randomEmpty.index].value = correctVal;
        cells[randomEmpty.index].style.color = 'blue'; // Mark as hint
        cells[randomEmpty.index].readOnly = true; // Lock it

        checkSudokuCompletion(); // Check if this wins
    } else {
        showModal('No valid solution found for current board state!', 'Error', '⚠️');
    }
};

function solveSudoku(grid) {
    for (let r = 0; r < 9; r++) {
        for (let c = 0; c < 9; c++) {
            if (grid[r][c] === 0) {
                for (let num = 1; num <= 9; num++) {
                    if (isValidPlacement(grid, r, c, num)) {
                        grid[r][c] = num;
                        if (solveSudoku(grid)) return true;
                        grid[r][c] = 0;
                    }
                }
                return false;
            }
        }
    }
    return true;
}

// Function to generate a random Sudoku board (Full Solution)
function generateRandomSudokuBoard() {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));

    // 1. Fill Diagonal 3x3 Matrices (Independent)
    for (let i = 0; i < 9; i += 3) {
        fillDiagonalBox(board, i, i);
    }

    // 2. Solve the rest
    solveSudoku(board);

    return board;
}

function fillDiagonalBox(board, rowStart, colStart) {
    let num;
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            do {
                num = Math.floor(Math.random() * 9) + 1;
            } while (!isSafeBox(board, rowStart, colStart, num));
            board[rowStart + i][colStart + j] = num;
        }
    }
}

function isSafeBox(board, rowStart, colStart, num) {
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[rowStart + i][colStart + j] === num) return false;
        }
    }
    return true;
}

// Helper function to check if a number placement is valid
function isValidPlacement(board, row, col, num) {
    // Check row
    for (let x = 0; x < 9; x++) {
        if (board[row][x] === num) return false;
    }

    // Check column
    for (let x = 0; x < 9; x++) {
        if (board[x][col] === num) return false;
    }

    // Check 3x3 box
    let startRow = row - row % 3;
    let startCol = col - col % 3;

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (board[i + startRow][j + startCol] === num) return false;
        }
    }

    return true;
}

// Typing Speed Game
// Advanced Speed Typer Game
let typingState = {
    startTime: null,
    timerInterval: null,
    timeLeft: 60,
    fullText: "",
    charIndex: 0,
    mistakes: 0,
    isTyping: false
};

const typingTexts = [
    "The creativity of the brain is capable of generating ideas that are far beyond the current reality.",
    "Technology is best when it brings people together and helps them communicate efficiently.",
    "Success is not final, failure is not fatal: it is the courage to continue that counts.",
    "Web development is an ever-changing field where learning never stops and innovation is key.",
    "Artificial intelligence will shape the future of humanity in ways we can only begin to imagine."
];

function startTypingGame() {
    const input = document.getElementById('typing-input');
    const textDisplay = document.getElementById('typing-text-display');
    const restartBtn = document.getElementById('typing-restart-btn');

    // Reset State
    typingState = {
        startTime: null,
        timerInterval: null,
        timeLeft: 60,
        fullText: typingTexts[Math.floor(Math.random() * typingTexts.length)],
        charIndex: 0,
        mistakes: 0,
        isTyping: false
    };

    // UI Reset
    input.disabled = false;
    input.value = "";
    input.focus();
    textDisplay.innerHTML = "";
    restartBtn.style.display = "none";
    document.getElementById('typing-wpm').innerText = 0;
    document.getElementById('typing-accuracy').innerText = "100%";
    document.getElementById('typing-timer').innerText = "60s";

    // Setup Text Display (span for each char)
    typingState.fullText.split('').forEach(char => {
        let span = document.createElement('span');
        span.innerText = char;
        textDisplay.appendChild(span);
    });

    // Activate First Char
    textDisplay.querySelectorAll('span')[0].classList.add('active');

    // Clear old interval if exists
    if (typingState.timerInterval) clearInterval(typingState.timerInterval);
}

function restartTypingGame() {
    startTypingGame();
}

function initTypingListeners() {
    const input = document.getElementById('typing-input');
    if (!input) return;

    input.addEventListener('input', function () {
        if (!typingState.isTyping && this.value.length > 0) {
            typingState.isTyping = true;
            typingState.startTime = new Date();
            startTypingTimer();
        }

        const typedChar = this.value.split('')[typingState.charIndex];
        const textDisplay = document.getElementById('typing-text-display');
        const chars = textDisplay.querySelectorAll('span');

        if (typedChar == null) { // Backspace
            typingState.charIndex--;
            if (chars[typingState.charIndex]) {
                chars[typingState.charIndex].classList.remove('correct', 'incorrect');
                chars[typingState.charIndex].classList.add('active');
                if (chars[typingState.charIndex + 1]) chars[typingState.charIndex + 1].classList.remove('active');
            }
        } else {
            if (chars[typingState.charIndex]) {
                if (chars[typingState.charIndex].innerText === typedChar) {
                    chars[typingState.charIndex].classList.add('correct');
                } else {
                    chars[typingState.charIndex].classList.add('incorrect');
                    typingState.mistakes++;
                }
                chars[typingState.charIndex].classList.remove('active');
            }

            typingState.charIndex++;

            if (chars[typingState.charIndex]) {
                chars[typingState.charIndex].classList.add('active');
            } else {
                // Game Finished (Sentence Completed)
                endTypingGame(true);
            }
        }

        updateTypingStats();
    });
}

function startTypingTimer() {
    typingState.timerInterval = setInterval(() => {
        if (typingState.timeLeft > 0) {
            typingState.timeLeft--;
            document.getElementById('typing-timer').innerText = typingState.timeLeft + "s";
            updateTypingStats(); // Update WPM dynamically
        } else {
            endTypingGame(false);
        }
    }, 1000);
}

function updateTypingStats() {
    const timeElapsed = (60 - typingState.timeLeft) || 1; // Avoid div by 0
    const correctChars = Math.max(0, typingState.charIndex - typingState.mistakes);

    // Calculate WPM: (correct chars / 5) / minutes elapsed
    let wpm = 0;
    if (timeElapsed > 0 && correctChars > 0) {
        wpm = Math.round((correctChars / 5) / (timeElapsed / 60));
    }

    // Calculate Accuracy: avoid division by zero when no chars typed yet
    let accuracy = 100;
    if (typingState.charIndex > 0) {
        accuracy = Math.round((correctChars / typingState.charIndex) * 100);
        accuracy = Math.max(0, accuracy); // Ensure never negative
    }

    document.getElementById('typing-wpm').innerText = wpm;
    document.getElementById('typing-accuracy').innerText = accuracy + "%";
}

function endTypingGame(completed) {
    clearInterval(typingState.timerInterval);
    document.getElementById('typing-input').disabled = true;
    document.getElementById('typing-restart-btn').style.display = "inline-block";

    let msg = completed ? "Test Completed!" : "Time's Up!";
    let wpm = document.getElementById('typing-wpm').innerText;
    let acc = document.getElementById('typing-accuracy').innerText;

    showModal(`${msg}<br>WPM: ${wpm}<br>Accuracy: ${acc}`, 'Result', '⌨️');
}

// Init listeners on load
document.addEventListener('DOMContentLoaded', initTypingListeners);

// Minesweeper Game
const minesweeper = {
    board: [],
    rows: 10,
    cols: 10,
    mines: 10,
    gameStarted: false,

    start: function () {
        this.board = this.createBoard();
        this.placeMines();
        this.calculateAdjacentMines();
        this.updateBoard();
        this.gameStarted = true;
    },

    createBoard: function () {
        // Create new objects for each cell instead of using fill
        return Array.from({ length: this.rows }, () =>
            Array.from({ length: this.cols }, () => ({
                mine: false,
                revealed: false,
                adjacent: 0
            }))
        );
    },

    placeMines: function () {
        let placedMines = 0;
        while (placedMines < this.mines) {
            const row = Math.floor(Math.random() * this.rows);
            const col = Math.floor(Math.random() * this.cols);
            if (!this.board[row][col].mine) {
                this.board[row][col].mine = true;
                placedMines++;
            }
        }
    },

    calculateAdjacentMines: function () {
        for (let r = 0; r < this.rows; r++) {
            for (let c = 0; c < this.cols; c++) {
                if (this.board[r][c].mine) {
                    // Increment adjacent mine count for surrounding cells
                    for (let i = -1; i <= 1; i++) {
                        for (let j = -1; j <= 1; j++) {
                            const newRow = r + i;
                            const newCol = c + j;
                            if (newRow >= 0 && newRow < this.rows &&
                                newCol >= 0 && newCol < this.cols &&
                                !this.board[newRow][newCol].mine) {
                                this.board[newRow][newCol].adjacent++;
                            }
                        }
                    }
                }
            }
        }
    },

    updateBoard: function () {
        const boardElement = document.getElementById('minesweeper-board');
        boardElement.innerHTML = '';
        this.board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                const cellDiv = document.createElement('div');
                cellDiv.className = 'minesweeper-cell';
                cellDiv.onclick = () => this.revealCell(rowIndex, colIndex);
                boardElement.appendChild(cellDiv);
            });
        });
    },

    revealCell: function (row, col) {
        if (!this.gameStarted || this.board[row][col].revealed) return;

        this.board[row][col].revealed = true;
        const cellDiv = document.getElementsByClassName('minesweeper-cell')[row * this.cols + col];

        if (this.board[row][col].mine) {
            cellDiv.textContent = '💣';
            cellDiv.classList.add('mine');
            showModal('You hit a mine!', 'BOOM!', '💣', 'Try Again', () => startMinesweeper());
            this.revealAllMines();
            this.gameStarted = false;
        } else {
            if (this.board[row][col].adjacent > 0) {
                cellDiv.textContent = this.board[row][col].adjacent;
                cellDiv.classList.add(`adjacent-${this.board[row][col].adjacent}`);
            } else {
                // If no adjacent mines, reveal surrounding cells
                this.revealSurroundingCells(row, col);
            }
            cellDiv.classList.add('revealed');
        }
    },

    revealSurroundingCells: function (row, col) {
        for (let i = -1; i <= 1; i++) {
            for (let j = -1; j <= 1; j++) {
                const newRow = row + i;
                const newCol = col + j;
                if (newRow >= 0 && newRow < this.rows &&
                    newCol >= 0 && newCol < this.cols &&
                    !this.board[newRow][newCol].revealed) {
                    this.revealCell(newRow, newCol);
                }
            }
        }
    },

    revealAllMines: function () {
        this.board.forEach((row, rowIndex) => {
            row.forEach((cell, colIndex) => {
                if (cell.mine) {
                    const cellDiv = document.getElementsByClassName('minesweeper-cell')[rowIndex * this.cols + colIndex];
                    cellDiv.textContent = '💣';
                    cellDiv.classList.add('mine');
                }
            });
        });
    }
};

// Start the game when the button is clicked
function startMinesweeper() {
    minesweeper.start();
} 