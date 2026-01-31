/* Extra Games Logic - Enhanced */

// --- Global Variables (for shared state if needed) ---
let mazeProgram = [];
let mazePlayer = { x: 0, y: 0 };

// --- Connect Four ---
let c4Board = [];
let c4CurrentPlayer = 'red';
let c4GameActive = false;
let c4IsBotThinking = false;
const C4_ROWS = 6;
const C4_COLS = 7;

function startConnectFour() {
    c4Board = Array(C4_ROWS).fill(null).map(() => Array(C4_COLS).fill(null));
    c4CurrentPlayer = 'red'; // User is Red
    c4GameActive = true;
    c4IsBotThinking = false;
    renderC4Board();
    updateC4Turn();
}

function renderC4Board() {
    const boardEl = document.getElementById('connect4-board');
    if (!boardEl) return;
    boardEl.innerHTML = '';

    for (let r = 0; r < C4_ROWS; r++) {
        for (let c = 0; c < C4_COLS; c++) {
            const cell = document.createElement('div');
            cell.className = 'c4-cell';
            if (c4Board[r][c]) cell.classList.add(c4Board[r][c]);
            cell.onclick = () => handleC4Click(c);
            boardEl.appendChild(cell);
        }
    }
}

function handleC4Click(col) {
    if (!c4GameActive || c4IsBotThinking) return;

    // Find lowest empty row in col
    let row = -1;
    for (let r = C4_ROWS - 1; r >= 0; r--) {
        if (!c4Board[r][col]) {
            row = r;
            break;
        }
    }

    if (row === -1) return; // Col full

    c4Board[row][col] = c4CurrentPlayer;
    renderC4Board();

    if (checkC4Win(row, col)) {
        showModal(`${c4CurrentPlayer === 'red' ? 'You' : 'CPU'} Wins!`, 'Connect Four', '🏆');
        c4GameActive = false;
        return;
    }

    // Toggle player
    c4CurrentPlayer = c4CurrentPlayer === 'red' ? 'yellow' : 'red';
    updateC4Turn();

    // AI Check
    if (c4CurrentPlayer === 'yellow' && c4GameActive) {
        c4IsBotThinking = true;
        setTimeout(makeC4BotMove, 1000); // Simulated delay
    }
}

function makeC4BotMove() {
    if (!c4GameActive) return;
    // Simple AI
    const validCols = [];
    for (let c = 0; c < C4_COLS; c++) {
        if (!c4Board[0][c]) validCols.push(c);
    }

    if (validCols.length > 0) {
        // Smart Move: Check if can win
        // TODO: Add smart logic later if needed
        const randomCol = validCols[Math.floor(Math.random() * validCols.length)];

        // Manually place for bot to reuse logic
        let row = -1;
        for (let r = C4_ROWS - 1; r >= 0; r--) {
            if (!c4Board[r][randomCol]) {
                row = r;
                break;
            }
        }

        c4Board[row][randomCol] = 'yellow';
        renderC4Board();

        if (checkC4Win(row, randomCol)) {
            showModal('CPU Wins!', 'Connect Four', '🤖');
            c4GameActive = false;
            c4IsBotThinking = false;
            return;
        }

        c4CurrentPlayer = 'red';
        c4IsBotThinking = false;
        updateC4Turn();
    }
}

function updateC4Turn() {
    const turnEl = document.getElementById('c4-turn');
    if (turnEl) {
        const text = c4CurrentPlayer === 'red' ? "Your Turn" : "CPU Thinking...";
        turnEl.textContent = text;
        turnEl.style.color = c4CurrentPlayer === 'red' ? '#ff4757' : '#ffa502';
    }
}

function checkC4Win(row, col) {
    const player = c4Board[row][col];
    const directions = [[0, 1], [1, 0], [1, 1], [1, -1]];

    return directions.some(([dr, dc]) => {
        let count = 1;
        // Check forward
        for (let i = 1; i < 4; i++) {
            const r = row + dr * i;
            const c = col + dc * i;
            if (r >= 0 && r < C4_ROWS && c >= 0 && c < C4_COLS && c4Board[r][c] === player) count++;
            else break;
        }
        // Check backward
        for (let i = 1; i < 4; i++) {
            const r = row - dr * i;
            const c = col - dc * i;
            if (r >= 0 && r < C4_ROWS && c >= 0 && c < C4_COLS && c4Board[r][c] === player) count++;
            else break;
        }
        return count >= 4;
    });
}


// --- Dots and Boxes ---
let dotsBoard = {
    hLines: [],
    vLines: [],
    boxes: []
};
let dotsPlayer = 1; // 1 = Red (User), 2 = Blue (Bot)
let dotsScores = { 1: 0, 2: 0 };
let dotsBotThinking = false;
const DOTS_W = 6, DOTS_H = 6;

function startDotsGame() {
    dotsPlayer = 1;
    dotsScores = { 1: 0, 2: 0 };
    dotsBotThinking = false;

    dotsBoard.hLines = Array(DOTS_H).fill(null).map(() => Array(DOTS_W - 1).fill(0));
    dotsBoard.vLines = Array(DOTS_H - 1).fill(null).map(() => Array(DOTS_W).fill(0));
    dotsBoard.boxes = Array(DOTS_H - 1).fill(null).map(() => Array(DOTS_W - 1).fill(0));

    updateDotsUI();
    renderDotsBoard();
}

function renderDotsBoard() {
    const boardEl = document.getElementById('dots-board');
    if (!boardEl) return;
    boardEl.innerHTML = '';

    // Grid Setup: 11 columns (dot, h, dot, h...)
    // But simplified to flex rows is messy.
    // CSS Grid: 20px (dot) 30px (h-line) ...
    // Let's rely on the container grid template columns from CSS (11 cols).

    for (let r = 0; r < DOTS_H; r++) {
        // Row of Dots and H-Lines
        for (let c = 0; c < DOTS_W; c++) {
            const dot = document.createElement('div');
            dot.className = 'dot';
            boardEl.appendChild(dot);

            if (c < DOTS_W - 1) {
                const hLine = document.createElement('div');
                const owner = dotsBoard.hLines[r][c]; // 0, 1, or 2
                hLine.className = `h-line ${owner ? 'p' + owner : ''}`;
                hLine.onclick = () => handleLineClick('h', r, c);
                boardEl.appendChild(hLine);
            }
        }

        // Row of V-Lines and Boxes (if not last row)
        if (r < DOTS_H - 1) {
            for (let c = 0; c < DOTS_W; c++) {
                const vLine = document.createElement('div');
                const owner = dotsBoard.vLines[r][c];
                vLine.className = `v-line ${owner ? 'p' + owner : ''}`;
                vLine.onclick = () => handleLineClick('v', r, c);
                boardEl.appendChild(vLine);

                if (c < DOTS_W - 1) {
                    const boxOwner = dotsBoard.boxes[r][c];
                    const box = document.createElement('div');
                    // 'p1' adds Red X via CSS, 'p2' adds Blue X
                    box.className = `box ${boxOwner ? 'p' + boxOwner : ''}`;
                    boardEl.appendChild(box);
                }
            }
        }
    }
}

function handleLineClick(type, r, c) {
    if (dotsBotThinking && dotsPlayer === 2) return; // Locked

    let alreadyTaken = (type === 'h' ? dotsBoard.hLines[r][c] : dotsBoard.vLines[r][c]);
    if (alreadyTaken) return;

    // Mark Line
    if (type === 'h') dotsBoard.hLines[r][c] = dotsPlayer;
    else dotsBoard.vLines[r][c] = dotsPlayer;

    // Check Box
    const scored = checkBoxes(); // returns true if current player completed a box

    renderDotsBoard();
    updateDotsUI();

    if (scored) {
        // Player keeps turn.
        // If bot scored, it should think again
        if (dotsPlayer === 2) {
            // Check if game over first
            if (!isDotsGameOver()) setTimeout(makeDotsBotMove, 1000);
        }
    } else {
        // Switch turn
        dotsPlayer = dotsPlayer === 1 ? 2 : 1;
        updateDotsUI();
        if (dotsPlayer === 2) {
            dotsBotThinking = true;
            setTimeout(makeDotsBotMove, 1000);
        }
    }

    isDotsGameOver();
}

function isDotsGameOver() {
    const totalBoxes = (DOTS_H - 1) * (DOTS_W - 1);
    const takenBoxes = dotsScores[1] + dotsScores[2];
    if (takenBoxes >= totalBoxes) {
        const winner = dotsScores[1] > dotsScores[2] ? 'Player 1' : (dotsScores[2] > dotsScores[1] ? 'Player 2' : 'Draw');
        showModal(`${winner} Wins! final score: ${dotsScores[1]} - ${dotsScores[2]}`, 'Game Over', '🏁');
        return true;
    }
    return false;
}

function checkBoxes() {
    let madeBox = false;
    for (let r = 0; r < DOTS_H - 1; r++) {
        for (let c = 0; c < DOTS_W - 1; c++) {
            if (dotsBoard.boxes[r][c] === 0) {
                if (dotsBoard.hLines[r][c] && dotsBoard.hLines[r + 1][c] &&
                    dotsBoard.vLines[r][c] && dotsBoard.vLines[r][c + 1]) {
                    dotsBoard.boxes[r][c] = dotsPlayer;
                    dotsScores[dotsPlayer]++;
                    madeBox = true;
                }
            }
        }
    }
    return madeBox;
}

function makeDotsBotMove() {
    if (isDotsGameOver()) return;

    // 1. Check for scorable boxes (3 lines taken)
    // ...Implementation of smarter AI: 
    // Find any box with 3 lines and take the 4th.

    let move = findClosingMove();

    if (!move) {
        // Random valid move
        const moves = [];
        for (let r = 0; r < DOTS_H; r++) for (let c = 0; c < DOTS_W - 1; c++)
            if (!dotsBoard.hLines[r][c]) moves.push({ type: 'h', r, c });
        for (let r = 0; r < DOTS_H - 1; r++) for (let c = 0; c < DOTS_W; c++)
            if (!dotsBoard.vLines[r][c]) moves.push({ type: 'v', r, c });

        if (moves.length > 0) move = moves[Math.floor(Math.random() * moves.length)];
    }

    if (move) {
        dotsBotThinking = false; // logic happens in handleLineClick
        // But we need to ensure handleLineClick knows it's bot (it checks dotsPlayer)
        // handleLineClick will re-trigger bot if score
        // So we just call it once here
        // Need to unlock thinking so click works
        dotsBotThinking = false; // Just to be safe for the function call
        // Wait, handleLineClick checks if (thinking && p2) return.
        // Since we are IN the bot move, we can bypass or set thinking false briefly.
        // Actually, simpler: Update the board directly then call UI?
        // No, reuse handleLineClick for consistency.

        // Temporary hack: allow bot to click
        // Modify handleLineClick to allow if called internally?
        // Better: set thinking false before clicking
        dotsBotThinking = false;

        // Actually we need to make sure handleLineClick sets thinking=true again if turn swaps
        handleLineClick(move.type, move.r, move.c);
    }
}

function findClosingMove() {
    for (let r = 0; r < DOTS_H - 1; r++) {
        for (let c = 0; c < DOTS_W - 1; c++) {
            if (dotsBoard.boxes[r][c] === 0) {
                let lines = 0;
                let missing = null;
                if (dotsBoard.hLines[r][c]) lines++; else missing = { type: 'h', r, c };
                if (dotsBoard.hLines[r + 1][c]) lines++; else missing = { type: 'h', r: r + 1, c };
                if (dotsBoard.vLines[r][c]) lines++; else missing = { type: 'v', r, c };
                if (dotsBoard.vLines[r][c + 1]) lines++; else missing = { type: 'v', r, c: c + 1 };

                if (lines === 3) return missing;
            }
        }
    }
    return null;
}

function updateDotsUI() {
    const p1Score = document.getElementById('dots-p1');
    const p2Score = document.getElementById('dots-p2');
    const turnEl = document.getElementById('dots-turn');

    if (p1Score) p1Score.textContent = dotsScores[1];
    if (p2Score) p2Score.textContent = dotsScores[2];
    if (turnEl) {
        turnEl.textContent = dotsPlayer === 1 ? "Your Turn (Red)" : "CPU Turn (Blue)";
        turnEl.style.color = dotsPlayer === 1 ? '#ff4757' : '#3742fa';
    }
}

// --- Battleship (Extended) ---
let bsPlayerGrid = [];
let bsEnemyGrid = [];
let bsShips = [5, 4, 3, 3, 2];
let bsGameActive = false;
let bsPhase = 'setup'; // 'setup', 'playing', 'finished'
let bsTurn = 'player'; // 'player', 'bot'
let bsSetupShipIndex = 0;
let bsSetupHorizontal = true;

function startBattleship() {
    bsPlayerGrid = createGrid(10);
    bsEnemyGrid = createGrid(10);
    bsPhase = 'setup';
    bsTurn = 'player';
    bsSetupShipIndex = 0;
    bsGameActive = true;

    // Auto-place Enemy Ships immediately
    placeRandomShips(bsEnemyGrid);

    updateBSUI();
    renderBattleshipGrids();
}

function rotateShip() {
    bsSetupHorizontal = !bsSetupHorizontal;
    const btn = document.getElementById('btn-rotate');
    if (btn) btn.textContent = `Rotate: ${bsSetupHorizontal ? 'Horizontal' : 'Vertical'}`;
}

function handleBSCellClick(r, c, isEnemyGrid) {
    if (!bsGameActive) return;

    if (bsPhase === 'setup') {
        if (isEnemyGrid) return; // Can't touch enemy grid yet

        // Place Ship logic
        const len = bsShips[bsSetupShipIndex];
        if (canPlaceShip(bsPlayerGrid, r, c, len, bsSetupHorizontal)) {
            // Place it
            for (let i = 0; i < len; i++) {
                if (bsSetupHorizontal) bsPlayerGrid[r][c + i] = 1;
                else bsPlayerGrid[r + i][c] = 1;
            }
            bsSetupShipIndex++;
            if (bsSetupShipIndex >= bsShips.length) {
                bsPhase = 'playing';
                showModal('All ships placed! Game Starting.', 'Battle Ready', '⚔️');
            }
            updateBSUI();
            renderBattleshipGrids();
        } else {
            // Invalid placement visual feedback?
        }
    } else if (bsPhase === 'playing') {
        if (!isEnemyGrid) return; // Can only click enemy grid
        if (bsTurn !== 'player') return; // Not your turn

        // Attack logic
        handleBattleshipAttack(r, c);
    }
}

function updateBSUI() {
    const status = document.getElementById('battleship-status');
    const turnEx = document.getElementById('bs-turn');

    if (bsPhase === 'setup') {
        const shipSize = bsShips[bsSetupShipIndex];
        status.textContent = `Place Ship (Size: ${shipSize})`;
        turnEx.textContent = "Setup Phase";
        document.getElementById('btn-rotate').style.display = 'inline-block';
    } else if (bsPhase === 'playing') {
        document.getElementById('btn-rotate').style.display = 'none';
        turnEx.textContent = bsTurn === 'player' ? "Your Turn" : "Enemy Thinking...";
        // status updated by hits/misses
    } else {
        turnEx.textContent = "Game Over";
    }
}

// ...existing createGrid/placeRandomShips/canPlaceShip...
// Re-implementing specifically for context if needed, but reusing previous logic styles
function createGrid(size) { return Array(size).fill(null).map(() => Array(size).fill(0)); }

function placeRandomShips(grid) {
    bsShips.forEach(len => {
        let placed = false;
        while (!placed) {
            let r = Math.floor(Math.random() * 10);
            let c = Math.floor(Math.random() * 10);
            let horizontal = Math.random() > 0.5;
            if (canPlaceShip(grid, r, c, len, horizontal)) {
                for (let i = 0; i < len; i++) {
                    if (horizontal) grid[r][c + i] = 1;
                    else grid[r + i][c] = 1;
                }
                placed = true;
            }
        }
    });
}

function canPlaceShip(grid, r, c, len, hor) {
    if (hor) {
        if (c + len > 10) return false;
        for (let i = 0; i < len; i++) if (grid[r][c + i] !== 0) return false;
    } else {
        if (r + len > 10) return false;
        for (let i = 0; i < len; i++) if (grid[r + i][c] !== 0) return false;
    }
    return true;
}

function renderBattleshipGrids() {
    const render = (id, grid, isEnemy) => {
        const el = document.getElementById(id);
        if (!el) return;
        el.innerHTML = '';
        if (bsPhase === 'setup' && isEnemy) {
            // Hide enemy grid content during setup? Or just show empty
        }

        // Setup Mode Class for hints?
        if (bsPhase === 'setup' && !isEnemy) el.classList.add('setup-mode');
        else el.classList.remove('setup-mode');

        grid.forEach((row, r) => {
            row.forEach((cell, c) => {
                const div = document.createElement('div');
                div.className = 'ship-cell';
                if (cell === 2) div.classList.add('miss');
                if (cell === 3) div.classList.add('hit');
                // Show player ships always. Hide enemy ships unless sunk? (Not implemented deep logic for sunk revealing yet)
                if (!isEnemy && cell === 1) div.classList.add('ship', 'p1');

                div.onclick = () => handleBSCellClick(r, c, isEnemy);

                // Mouseover for setup preview?
                // Hard to do cleanly without much complexity, skipping visual preview for now, just click
                el.appendChild(div);
            });
        });
    };

    render('player-fleet-grid', bsPlayerGrid, false);
    render('enemy-fleet-grid', bsEnemyGrid, true);
}

function handleBattleshipAttack(r, c) {
    if (bsEnemyGrid[r][c] > 1) return; // Already hit/miss

    if (bsEnemyGrid[r][c] === 1) {
        bsEnemyGrid[r][c] = 3; // Hit
        document.getElementById('battleship-status').innerText = "Hit! Attack again.";
        checkBsWin();
        renderBattleshipGrids();
        // User keeps turn on hit? Classic rules say yes.
        // Let's keep turn.
    } else {
        bsEnemyGrid[r][c] = 2; // Miss
        document.getElementById('battleship-status').innerText = "Miss! Enemy turn...";
        renderBattleshipGrids();

        bsTurn = 'bot';
        updateBSUI();
        setTimeout(bsBotTurn, 1000);
    }
}

function bsBotTurn() {
    if (!bsGameActive || bsTurn !== 'bot') return;

    // AI: Random for now
    let r, c;
    let safety = 0;
    do {
        r = Math.floor(Math.random() * 10);
        c = Math.floor(Math.random() * 10);
        safety++;
        if (safety > 500) break;
    } while (bsPlayerGrid[r][c] > 1);

    if (bsPlayerGrid[r][c] === 1) {
        bsPlayerGrid[r][c] = 3;
        document.getElementById('battleship-status').innerText = "Enemy HIT your ship!";
        renderBattleshipGrids();
        if (!checkBsWin()) {
            setTimeout(bsBotTurn, 1000); // Hit again
        }
    } else {
        bsPlayerGrid[r][c] = 2;
        document.getElementById('battleship-status').innerText = "Enemy Missed.";
        renderBattleshipGrids();
        bsTurn = 'player';
        updateBSUI();
    }
}

function checkBsWin() {
    const enemyAlive = bsEnemyGrid.some(row => row.includes(1));
    const playerAlive = bsPlayerGrid.some(row => row.includes(1));

    if (!enemyAlive) {
        showModal('You sunk all enemy ships!', 'Victory', '🚢');
        bsGameActive = false;
        bsPhase = 'finished';
        updateBSUI();
        return true;
    }
    if (!playerAlive) {
        showModal('Your fleet was destroyed!', 'Defeat', '🏳️');
        bsGameActive = false;
        bsPhase = 'finished';
        updateBSUI();
        return true;
    }
    return false;
}

// --- Maze Navigator (Added Levels) ---
const mazeLevels = [
    { // Level 1
        size: 5,
        goal: { x: 4, y: 4 },
        start: { x: 0, y: 0 },
        walls: [{ x: 1, y: 1 }, { x: 1, y: 2 }, { x: 3, y: 3 }, { x: 2, y: 3 }, { x: 3, y: 1 }]
    },
    { // Level 2
        size: 5,
        goal: { x: 2, y: 2 },
        start: { x: 0, y: 0 },
        walls: [{ x: 1, y: 0 }, { x: 3, y: 0 }, { x: 3, y: 1 }, { x: 1, y: 2 }, { x: 1, y: 3 }, { x: 3, y: 3 }, { x: 3, y: 4 }]
    },
    { // Level 3
        size: 5,
        goal: { x: 4, y: 0 },
        start: { x: 0, y: 4 },
        walls: [{ x: 0, y: 3 }, { x: 1, y: 1 }, { x: 1, y: 3 }, { x: 2, y: 1 }, { x: 3, y: 1 }, { x: 3, y: 3 }, { x: 4, y: 3 }, { x: 2, y: 4 }]
    }
];

let currentMazeLevel = 0;
// Reusing global vars: mazePlayer, mazeProgram

function addCommand(cmd) {
    mazeProgram.push(cmd);
    renderProgram();
}

function resetMaze() {
    // Check if we won logic elsewhere, but here reset to current level start
    if (!mazeLevels[currentMazeLevel]) currentMazeLevel = 0;
    mazePlayer = { ...mazeLevels[currentMazeLevel].start };
    mazeProgram = [];
    renderMaze();
    renderProgram();
}

function renderProgram() {
    const el = document.getElementById('program-display');
    if (!el) return;
    el.innerHTML = '';
    mazeProgram.forEach((cmd, i) => {
        const span = document.createElement('span');
        span.className = 'program-step';
        span.textContent = cmd.toUpperCase();
        el.appendChild(span);
    });
}

function runMazeProgram() {
    // Only difference is using Level Data
    const level = mazeLevels[currentMazeLevel];
    mazePlayer = { ...level.start };
    renderMaze();

    // Async execution
    (async () => {
        for (const cmd of mazeProgram) {
            await new Promise(r => setTimeout(r, 500));
            let nextX = mazePlayer.x;
            let nextY = mazePlayer.y;

            if (cmd === 'up') nextY--;
            if (cmd === 'down') nextY++;
            if (cmd === 'left') nextX--;
            if (cmd === 'right') nextX++;

            // Bounds
            if (nextX < 0 || nextX >= level.size || nextY < 0 || nextY >= level.size) continue;
            // Wall
            if (level.walls.find(w => w.x === nextX && w.y === nextY)) continue;

            mazePlayer = { x: nextX, y: nextY };
            renderMaze();

            if (mazePlayer.x === level.goal.x && mazePlayer.y === level.goal.y) {
                setTimeout(() => {
                    if (currentMazeLevel < mazeLevels.length - 1) {
                        showModal('Level Complete! Next Level.', 'Success', '⭐', 'Next', () => {
                            currentMazeLevel++;
                            const lvlEl = document.getElementById('maze-level');
                            if (lvlEl) lvlEl.textContent = currentMazeLevel + 1;
                            resetMaze();
                        });
                    } else {
                        showModal('All Levels Completed!', 'You Win', '🏆', 'Restart', () => {
                            currentMazeLevel = 0;
                            const lvlEl = document.getElementById('maze-level');
                            if (lvlEl) lvlEl.textContent = 1;
                            resetMaze();
                        });
                    }
                }, 200);
                return;
            }
        }
    })();
}

function renderMaze() {
    const el = document.getElementById('maze-grid');
    if (!el) return;
    el.innerHTML = '';

    const level = mazeLevels[currentMazeLevel];

    for (let y = 0; y < level.size; y++) {
        for (let x = 0; x < level.size; x++) {
            const cell = document.createElement('div');
            cell.className = 'maze-cell';

            if (level.walls.find(w => w.x === x && w.y === y)) cell.classList.add('wall');
            if (x === level.start.x && y === level.start.y) cell.classList.add('start');
            if (x === level.goal.x && y === level.goal.y) cell.classList.add('goal');

            if (x === mazePlayer.x && y === mazePlayer.y) {
                const p = document.createElement('div');
                p.className = 'maze-player';
                cell.appendChild(p);
            }

            el.appendChild(cell);
        }
    }
}


// --- Othello + Other (unchanged but included to complete file) ---
// Reuse previous Othello logic....
// For brevity, I will only rewrite the modified parts above, BUT
// the tool requires replacing the whole file content or chunks.
// Since I'm using `write_to_file` (Overwrite:true), I must include EVERYTHING.

let othelloBoard = [];
let othelloTurn = 'black';

function startOthello() {
    othelloBoard = Array(8).fill(null).map(() => Array(8).fill(null));
    othelloBoard[3][3] = 'white';
    othelloBoard[3][4] = 'black';
    othelloBoard[4][3] = 'black';
    othelloBoard[4][4] = 'white';
    othelloTurn = 'black';
    renderOthello();
}

function renderOthello() {
    const boardEl = document.getElementById('othello-board');
    if (!boardEl) return;
    boardEl.innerHTML = '';
    let blackScore = 0, whiteScore = 0;
    const validMoves = getValidOthelloMoves(othelloTurn);
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const cell = document.createElement('div');
            cell.className = 'othello-cell';
            if (othelloBoard[r][c]) {
                const disc = document.createElement('div');
                disc.className = `disc ${othelloBoard[r][c]}`;
                cell.appendChild(disc);
                if (othelloBoard[r][c] === 'black') blackScore++; else whiteScore++;
            } else {
                if (validMoves.find(m => m.r === r && m.c === c)) {
                    cell.classList.add('valid-move');
                    cell.onclick = () => makeOthelloMove(r, c);
                }
            }
            boardEl.appendChild(cell);
        }
    }
    document.getElementById('othello-black').innerText = blackScore;
    document.getElementById('othello-white').innerText = whiteScore;
}
function getValidOthelloMoves(player) {
    const moves = [];
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            if (othelloBoard[r][c]) continue;
            if (wouldFlip(r, c, player)) moves.push({ r, c });
        }
    }
    return moves;
}

function wouldFlip(r, c, player, execute = false) {
    const opponent = player === 'black' ? 'white' : 'black';
    const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
    let flippedAny = false;
    directions.forEach(([dr, dc]) => {
        let i = 1;
        let potentialFlips = [];
        while (true) {
            const nr = r + dr * i;
            const nc = c + dc * i;
            if (nr < 0 || nr >= 8 || nc < 0 || nc >= 8) break;
            const val = othelloBoard[nr][nc];
            if (!val) break;
            if (val === opponent) {
                potentialFlips.push({ r: nr, c: nc });
            } else if (val === player) {
                if (potentialFlips.length > 0) {
                    flippedAny = true;
                    if (execute) potentialFlips.forEach(p => othelloBoard[p.r][p.c] = player);
                }
                break;
            }
            i++;
        }
    });
    return flippedAny;
}

function makeOthelloMove(r, c) {
    othelloBoard[r][c] = othelloTurn;
    wouldFlip(r, c, othelloTurn, true);
    othelloTurn = othelloTurn === 'black' ? 'white' : 'black';
    renderOthello();
    if (getValidOthelloMoves(othelloTurn).length === 0) {
        othelloTurn = othelloTurn === 'black' ? 'white' : 'black';
        if (getValidOthelloMoves(othelloTurn).length === 0) {
            showModal('No more moves!', 'Game Over', '🏁');
        } else {
            renderOthello();
        }
    }
}

// Reuse Tower of Hanoi, Cryptogram, Food Chain from previous file as they didn't need changes but must exist.
// --- Tower of Hanoi ---
let hanoiDisks = []; let hanoiSelectedRod = null; let hanoiMoves = 0;
function startHanoi() { hanoiDisks = [[4, 3, 2, 1], [], []]; hanoiMoves = 0; hanoiSelectedRod = null; updateHanoiUI(); }
function updateHanoiUI() {
    const rods = document.getElementsByClassName('rod');
    for (let i = 0; i < 3; i++) {
        rods[i].innerHTML = '';
        rods[i].style.borderBottom = hanoiSelectedRod === i ? '3px solid gold' : 'none';
        hanoiDisks[i].forEach(size => {
            const disk = document.createElement('div');
            disk.className = 'hanoi-disk';
            disk.style.width = (size * 25 + 10) + 'px';
            rods[i].appendChild(disk);
        });
    }
    document.getElementById('hanoi-moves').textContent = hanoiMoves;
}
function hanoiMove(rodIndex) {
    if (hanoiSelectedRod === null) {
        if (hanoiDisks[rodIndex].length > 0) { hanoiSelectedRod = rodIndex; updateHanoiUI(); }
    } else {
        if (hanoiSelectedRod === rodIndex) { hanoiSelectedRod = null; } else {
            const sourceTop = hanoiDisks[hanoiSelectedRod][hanoiDisks[hanoiSelectedRod].length - 1];
            const targetTop = hanoiDisks[rodIndex].length > 0 ? hanoiDisks[rodIndex][hanoiDisks[rodIndex].length - 1] : Infinity;
            if (sourceTop < targetTop) {
                hanoiDisks[rodIndex].push(hanoiDisks[hanoiSelectedRod].pop());
                hanoiMoves++;
                hanoiSelectedRod = null;
                if (hanoiDisks[2].length === 4) setTimeout(() => showModal(`Solved in ${hanoiMoves} moves!`, 'Expert Logic', '🗼'), 100);
            } else { showModal('Cannot place larger disk on smaller one', 'Invalid Move', '❌'); }
        }
        updateHanoiUI();
    }
}

// --- Cryptogram ---
const cryptoQuotes = [{ text: "KNOWLEDGE IS POWER" }, { text: "I THINK THEREFORE I AM" }, { text: "TO BE OR NOT TO BE" }];
let currentCrypto = {}; let cryptoKey = {};
function startCryptogram() {
    const quote = cryptoQuotes[Math.floor(Math.random() * cryptoQuotes.length)];
    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
    const shuffled = [...alphabet].sort(() => Math.random() - 0.5);
    cryptoKey = {};
    alphabet.forEach((char, i) => cryptoKey[char] = shuffled[i]);
    currentCrypto = { original: quote.text, encrypted: quote.text.split('').map(c => alphabet.includes(c) ? cryptoKey[c] : c).join('') };
    renderCryptogram();
}
function renderCryptogram() {
    const el = document.getElementById('crypto-puzzle');
    if (!el) return;
    el.innerHTML = '';
    currentCrypto.encrypted.split('').forEach((char, idx) => {
        if (char === ' ') {
            const space = document.createElement('div');
            space.style.width = '20px';
            el.appendChild(space);
            return;
        }
        const wrapper = document.createElement('div'); wrapper.className = 'crypto-char-box';
        const letter = document.createElement('div'); letter.className = 'crypto-code'; letter.innerText = char;
        const input = document.createElement('input'); input.className = 'crypto-input'; input.maxLength = 1; key = char;
        input.oninput = (e) => { const val = e.target.value.toUpperCase(); document.querySelectorAll(`.crypto-input[data-char="${char}"]`).forEach(inp => inp.value = val); };
        input.dataset.char = char;
        wrapper.appendChild(letter); wrapper.appendChild(input); el.appendChild(wrapper);
    });
}
function checkCryptogram() {
    const inputs = document.querySelectorAll('.crypto-input');
    let mappings = {};
    inputs.forEach(inp => mappings[inp.dataset.char] = inp.value.toUpperCase());
    let constructed = currentCrypto.encrypted.split('').map(c => c === ' ' ? ' ' : (mappings[c] || '_')).join('');
    if (constructed === currentCrypto.original) showModal('Message Decoded!', 'Success', '🕵️'); else showModal('Keep trying!', 'Incorrect', '🔒');
}

// Cryptogram Hint - reveals one random unfilled letter
function cryptogramHint() {
    if (!currentCrypto.original || !currentCrypto.encrypted) {
        showModal('Start a puzzle first!', 'Hint', '💡');
        return;
    }

    // Find unfilled inputs
    const inputs = document.querySelectorAll('.crypto-input');
    const unfilledInputs = Array.from(inputs).filter(inp => !inp.value);

    if (unfilledInputs.length === 0) {
        showModal('All letters are filled!', 'Hint', '💡');
        return;
    }

    // Pick a random unfilled input
    const randomInput = unfilledInputs[Math.floor(Math.random() * unfilledInputs.length)];
    const encryptedChar = randomInput.dataset.char;

    // Find the original char by reversing the key
    let originalChar = '';
    for (let orig in cryptoKey) {
        if (cryptoKey[orig] === encryptedChar) {
            originalChar = orig;
            break;
        }
    }

    // Fill all instances of this encrypted char
    document.querySelectorAll(`.crypto-input[data-char="${encryptedChar}"]`).forEach(inp => {
        inp.value = originalChar;
        inp.style.backgroundColor = '#d4efdf';
        setTimeout(() => inp.style.backgroundColor = '', 1000);
    });

    showModal(`Hint: ${encryptedChar} = ${originalChar}`, 'Letter Revealed', '💡');
}

// --- Food Chain ---
const foodChains = [['Sun', 'Grass', 'Grasshopper', 'Frog', 'Snake', 'Eagle'], ['Sun', 'Algae', 'Small Fish', 'Big Fish', 'Shark']];
let currentChain = [];
function startFoodChain() {
    const chain = foodChains[Math.floor(Math.random() * foodChains.length)];
    currentChain = [...chain].sort(() => Math.random() - 0.5);
    const area = document.getElementById('food-chain-area');
    if (!area) return;
    area.innerHTML = '';
    currentChain.forEach(item => {
        const div = document.createElement('div'); div.className = 'chain-item'; div.innerText = item; div.draggable = true;
        div.ondragstart = (e) => { e.dataTransfer.setData('text/plain', item); e.target.classList.add('dragging'); };
        div.ondragend = (e) => { e.target.classList.remove('dragging'); };
        area.appendChild(div);
    });
    area.ondragover = (e) => e.preventDefault();
    area.ondrop = (e) => { e.preventDefault(); const data = e.dataTransfer.getData('text/plain'); const card = Array.from(area.children).find(c => c.innerText === data); area.appendChild(card); };
}
function checkFoodChain() {
    const area = document.getElementById('food-chain-area');
    const items = Array.from(area.children).map(c => c.innerText);
    const correct = foodChains.find(c => c.length === items.length && c.every(i => items.includes(i)));
    if (correct && items.every((val, index) => val === correct[index])) {
        Array.from(area.children).forEach(c => c.classList.add('correct'));
        showModal('Ecosystem Balanced!', 'Success', '🌿');
    } else {
        Array.from(area.children).forEach(c => c.classList.add('incorrect'));
        setTimeout(() => Array.from(area.children).forEach(c => c.classList.remove('incorrect')), 1000);
        showModal('Incorrect Order.', 'Try Again', '⚠️');
    }
}

// ============================================
// NEW EDUCATIONAL GAMES
// ============================================

// --- Periodic Table Element Match ---
const elements = [
    { symbol: 'H', name: 'Hydrogen', atomic: 1, mass: '1.008', type: 'Non-metal' },
    { symbol: 'He', name: 'Helium', atomic: 2, mass: '4.003', type: 'Noble Gas' },
    { symbol: 'Li', name: 'Lithium', atomic: 3, mass: '6.941', type: 'Alkali Metal' },
    { symbol: 'Be', name: 'Beryllium', atomic: 4, mass: '9.012', type: 'Alkaline Earth' },
    { symbol: 'B', name: 'Boron', atomic: 5, mass: '10.81', type: 'Metalloid' },
    { symbol: 'C', name: 'Carbon', atomic: 6, mass: '12.01', type: 'Non-metal' },
    { symbol: 'N', name: 'Nitrogen', atomic: 7, mass: '14.01', type: 'Non-metal' },
    { symbol: 'O', name: 'Oxygen', atomic: 8, mass: '16.00', type: 'Non-metal' },
    { symbol: 'F', name: 'Fluorine', atomic: 9, mass: '19.00', type: 'Halogen' },
    { symbol: 'Ne', name: 'Neon', atomic: 10, mass: '20.18', type: 'Noble Gas' },
    { symbol: 'Na', name: 'Sodium', atomic: 11, mass: '22.99', type: 'Alkali Metal' },
    { symbol: 'Mg', name: 'Magnesium', atomic: 12, mass: '24.31', type: 'Alkaline Earth' },
    { symbol: 'Al', name: 'Aluminium', atomic: 13, mass: '26.98', type: 'Metal' },
    { symbol: 'Si', name: 'Silicon', atomic: 14, mass: '28.09', type: 'Metalloid' },
    { symbol: 'P', name: 'Phosphorus', atomic: 15, mass: '30.97', type: 'Non-metal' },
    { symbol: 'S', name: 'Sulfur', atomic: 16, mass: '32.07', type: 'Non-metal' },
    { symbol: 'Cl', name: 'Chlorine', atomic: 17, mass: '35.45', type: 'Halogen' },
    { symbol: 'Ar', name: 'Argon', atomic: 18, mass: '39.95', type: 'Noble Gas' },
    { symbol: 'K', name: 'Potassium', atomic: 19, mass: '39.10', type: 'Alkali Metal' },
    { symbol: 'Ca', name: 'Calcium', atomic: 20, mass: '40.08', type: 'Alkaline Earth' },
    { symbol: 'Ti', name: 'Titanium', atomic: 22, mass: '47.87', type: 'Transition Metal' },
    { symbol: 'Cr', name: 'Chromium', atomic: 24, mass: '52.00', type: 'Transition Metal' },
    { symbol: 'Mn', name: 'Manganese', atomic: 25, mass: '54.94', type: 'Transition Metal' },
    { symbol: 'Fe', name: 'Iron', atomic: 26, mass: '55.85', type: 'Transition Metal' },
    { symbol: 'Co', name: 'Cobalt', atomic: 27, mass: '58.93', type: 'Transition Metal' },
    { symbol: 'Ni', name: 'Nickel', atomic: 28, mass: '58.69', type: 'Transition Metal' },
    { symbol: 'Cu', name: 'Copper', atomic: 29, mass: '63.55', type: 'Transition Metal' },
    { symbol: 'Zn', name: 'Zinc', atomic: 30, mass: '65.38', type: 'Transition Metal' },
    { symbol: 'Br', name: 'Bromine', atomic: 35, mass: '79.90', type: 'Halogen' },
    { symbol: 'Kr', name: 'Krypton', atomic: 36, mass: '83.80', type: 'Noble Gas' },
    { symbol: 'Ag', name: 'Silver', atomic: 47, mass: '107.87', type: 'Transition Metal' },
    { symbol: 'Sn', name: 'Tin', atomic: 50, mass: '118.71', type: 'Metal' },
    { symbol: 'I', name: 'Iodine', atomic: 53, mass: '126.90', type: 'Halogen' },
    { symbol: 'Au', name: 'Gold', atomic: 79, mass: '196.97', type: 'Transition Metal' },
    { symbol: 'Pb', name: 'Lead', atomic: 82, mass: '207.2', type: 'Metal' }
];

let elementScore = 0, elementRound = 0, currentElement = null;

function startElementMatch() {
    elementScore = 0;
    elementRound = 0;
    document.getElementById('element-score').textContent = '0';
    nextElement();
}

function nextElement() {
    elementRound++;
    if (elementRound > 10) {
        showModal(`Game Over! Score: ${elementScore}/10`, 'Element Match', '🧪');
        return;
    }
    document.getElementById('element-round').textContent = elementRound;

    currentElement = elements[Math.floor(Math.random() * elements.length)];
    document.getElementById('current-element').textContent = currentElement.symbol;
    document.getElementById('element-details').innerHTML =
        `Atomic #: ${currentElement.atomic} | Mass: ${currentElement.mass}<br>Type: ${currentElement.type}`;

    // Generate options
    let options = [currentElement.name];
    while (options.length < 4) {
        const rand = elements[Math.floor(Math.random() * elements.length)].name;
        if (!options.includes(rand)) options.push(rand);
    }
    options.sort(() => Math.random() - 0.5);

    const optionsEl = document.getElementById('element-options');
    optionsEl.innerHTML = '';
    options.forEach(opt => {
        const btn = document.createElement('button');
        btn.textContent = opt;
        btn.onclick = () => checkElement(opt, btn);
        optionsEl.appendChild(btn);
    });
}

function checkElement(answer, btn) {
    if (answer === currentElement.name) {
        elementScore++;
        document.getElementById('element-score').textContent = elementScore;
        btn.classList.add('correct');
    } else {
        btn.classList.add('wrong');
    }
    setTimeout(nextElement, 800);
}

// --- Solar System Explorer ---
const planets = [
    { name: 'Mercury', svg: 'images/mercury.svg', fact: 'Smallest planet, closest to Sun' },
    { name: 'Venus', svg: 'images/venus.svg', fact: 'Hottest planet, rotates backwards' },
    { name: 'Earth', svg: 'images/earth.svg', fact: 'Only planet with liquid water on surface' },
    { name: 'Mars', svg: 'images/mars.svg', fact: 'Called the Red Planet, has 2 moons' },
    { name: 'Jupiter', svg: 'images/Jupitar.svg', fact: 'Largest planet, has a Great Red Spot storm' },
    { name: 'Saturn', svg: 'images/saturn.svg', fact: 'Known for its beautiful rings' },
    { name: 'Uranus', svg: 'images/uranus.svg', fact: 'Rotates on its side, very cold' },
    { name: 'Neptune', svg: 'images/neptune.svg', fact: 'Farthest planet, has strongest winds' }
];

let solarScore = 0, selectedPlanet = null, placedPlanets = [];

function startSolarSystem() {
    solarScore = 0;
    placedPlanets = [];
    document.getElementById('solar-score').textContent = '0';
    document.getElementById('planet-fact').textContent = 'Click a planet, then click a slot to place it!';

    // Create slots
    const slotsEl = document.getElementById('planet-slots');
    slotsEl.innerHTML = '';
    for (let i = 0; i < 8; i++) {
        const slot = document.createElement('div');
        slot.className = 'planet-slot';
        slot.dataset.index = i;
        slot.onclick = () => placePlanetInSlot(i);
        slotsEl.appendChild(slot);
    }

    // Create shuffled planet bank
    const bankEl = document.getElementById('planet-bank');
    bankEl.innerHTML = '';
    const shuffled = [...planets].sort(() => Math.random() - 0.5);
    shuffled.forEach(planet => {
        const item = document.createElement('div');
        item.className = 'planet-item';
        item.innerHTML = `<img src="${planet.svg}" alt="${planet.name}" style="width:30px;height:30px;">`;
        item.dataset.name = planet.name;
        item.title = planet.name;
        item.onclick = () => selectPlanet(planet, item);
        bankEl.appendChild(item);
    });
}

function selectPlanet(planet, el) {
    document.querySelectorAll('.planet-item').forEach(p => p.classList.remove('selected'));
    el.classList.add('selected');
    selectedPlanet = planet;
    document.getElementById('planet-fact').textContent = `${planet.name}: ${planet.fact}`;
}

function placePlanetInSlot(index) {
    if (!selectedPlanet) return;
    const slot = document.querySelectorAll('.planet-slot')[index];
    slot.innerHTML = `<img src="${selectedPlanet.svg}" alt="${selectedPlanet.name}" style="width:30px;height:30px;">`;
    slot.dataset.planet = selectedPlanet.name;
    slot.classList.add('filled');
    placedPlanets[index] = selectedPlanet.name;

    // Remove from bank
    document.querySelector(`.planet-item[data-name="${selectedPlanet.name}"]`)?.remove();
    selectedPlanet = null;
}

function checkSolarOrder() {
    let correct = 0;
    planets.forEach((p, i) => {
        if (placedPlanets[i] === p.name) correct++;
    });
    solarScore = correct;
    document.getElementById('solar-score').textContent = solarScore;
    showModal(`You got ${correct}/8 planets correct!`, 'Solar System', '🔭');
}

// --- Eco-Sorter Game ---
const wasteItems = [
    { emoji: '🍌', name: 'Banana Peel', type: 'bio' },
    { emoji: '🍎', name: 'Apple Core', type: 'bio' },
    { emoji: '🥬', name: 'Vegetable Scraps', type: 'bio' },
    { emoji: '🌿', name: 'Leaves', type: 'bio' },
    { emoji: '🥚', name: 'Eggshell', type: 'bio' },
    { emoji: '📰', name: 'Newspaper', type: 'recycle' },
    { emoji: '📦', name: 'Cardboard Box', type: 'recycle' },
    { emoji: '🍾', name: 'Glass Bottle', type: 'recycle' },
    { emoji: '🥫', name: 'Tin Can', type: 'recycle' },
    { emoji: '📄', name: 'Paper', type: 'recycle' },
    { emoji: '🛍️', name: 'Plastic Bag', type: 'nonbio' },
    { emoji: '🔋', name: 'Battery', type: 'nonbio' },
    { emoji: '💡', name: 'Light Bulb', type: 'nonbio' },
    { emoji: '🧴', name: 'Plastic Bottle', type: 'nonbio' },
    { emoji: '📱', name: 'Old Phone', type: 'nonbio' }
];

let ecoScore = 0, ecoTimer = 30, ecoInterval = null, currentWaste = null, ecoGameActive = false;

function startEcoSorter() {
    ecoScore = 0;
    ecoTimer = 30;
    ecoGameActive = true;
    document.getElementById('eco-score').textContent = '0';
    document.getElementById('eco-timer').textContent = '30';

    nextWaste();

    if (ecoInterval) clearInterval(ecoInterval);
    ecoInterval = setInterval(() => {
        ecoTimer--;
        document.getElementById('eco-timer').textContent = ecoTimer;
        if (ecoTimer <= 0) {
            clearInterval(ecoInterval);
            ecoGameActive = false;
            showModal(`Game Over! Score: ${ecoScore}`, 'Eco-Sorter', '♻️');
        }
    }, 1000);
}

function nextWaste() {
    currentWaste = wasteItems[Math.floor(Math.random() * wasteItems.length)];
    document.getElementById('falling-item').textContent = currentWaste.emoji;
}

function sortWaste(binType) {
    if (!ecoGameActive || !currentWaste) return;

    const bins = document.querySelectorAll('.eco-bin');
    const targetBin = document.querySelector(`.eco-bin.${binType === 'bio' ? 'biodegradable' : binType === 'recycle' ? 'recyclable' : 'non-biodegradable'}`);

    if (currentWaste.type === binType) {
        ecoScore++;
        document.getElementById('eco-score').textContent = ecoScore;
        targetBin.classList.add('correct');
        setTimeout(() => targetBin.classList.remove('correct'), 300);
    } else {
        targetBin.classList.add('wrong');
        setTimeout(() => targetBin.classList.remove('wrong'), 300);
    }
    nextWaste();
}

// --- India Map Master ---
const stateIdMap = {
    'IN-WB': { name: 'West Bengal', capital: 'Kolkata', fact: 'Known for Durga Puja and Rosogolla', wb: true },
    'IN-MH': { name: 'Maharashtra', capital: 'Mumbai', fact: 'Financial capital of India' },
    'IN-TN': { name: 'Tamil Nadu', capital: 'Chennai', fact: 'Home to ancient Dravidian culture' },
    'IN-KA': { name: 'Karnataka', capital: 'Bengaluru', fact: 'IT hub of India' },
    'IN-RJ': { name: 'Rajasthan', capital: 'Jaipur', fact: 'Largest state by area' },
    'IN-GJ': { name: 'Gujarat', capital: 'Gandhinagar', fact: 'Land of the Gir Lions' },
    'IN-UP': { name: 'Uttar Pradesh', capital: 'Lucknow', fact: 'Most populous state' },
    'IN-KL': { name: 'Kerala', capital: 'Thiruvananthapuram', fact: '100% literacy rate' },
    'IN-PB': { name: 'Punjab', capital: 'Chandigarh', fact: 'Land of five rivers' },
    'IN-BR': { name: 'Bihar', capital: 'Patna', fact: 'Home to Nalanda University' },
    'IN-OR': { name: 'Odisha', capital: 'Bhubaneswar', fact: 'Famous for Jagannath Temple' },
    'IN-AS': { name: 'Assam', capital: 'Dispur', fact: 'Largest tea producer' },
    'IN-JH': { name: 'Jharkhand', capital: 'Ranchi', fact: 'Rich in minerals' },
    'IN-MP': { name: 'Madhya Pradesh', capital: 'Bhopal', fact: 'Heart of India' },
    'IN-AP': { name: 'Andhra Pradesh', capital: 'Amaravati', fact: 'Rice bowl of India' },
    'IN-TG': { name: 'Telangana', capital: 'Hyderabad', fact: 'Known for Charminar' },
    'IN-HP': { name: 'Himachal Pradesh', capital: 'Shimla', fact: 'Land of Gods' },
    'IN-CT': { name: 'Chhattisgarh', capital: 'Raipur', fact: 'Rich in forests and minerals' },
    'IN-GA': { name: 'Goa', capital: 'Panaji', fact: 'Smallest state, famous for beaches' },
    'IN-HR': { name: 'Haryana', capital: 'Chandigarh', fact: 'Highest per capita income' },
    'IN-JK': { name: 'Jammu & Kashmir', capital: 'Srinagar', fact: 'Paradise on Earth' },
    'IN-AR': { name: 'Arunachal Pradesh', capital: 'Itanagar', fact: 'Land of the Rising Sun' },
    'IN-MN': { name: 'Manipur', capital: 'Imphal', fact: 'Jewel of India' },
    'IN-ML': { name: 'Meghalaya', capital: 'Shillong', fact: 'Scotland of the East' },
    'IN-MZ': { name: 'Mizoram', capital: 'Aizawl', fact: 'Land of the Highlanders' },
    'IN-NL': { name: 'Nagaland', capital: 'Kohima', fact: 'Land of Festivals' },
    'IN-SK': { name: 'Sikkim', capital: 'Gangtok', fact: 'First organic state' },
    'IN-TR': { name: 'Tripura', capital: 'Agartala', fact: 'Smallest northeastern state' },
    'IN-UT': { name: 'Uttarakhand', capital: 'Dehradun', fact: 'Land of Temples (Dev Bhoomi)' },
    'IN-DL': { name: 'Delhi', capital: 'New Delhi', fact: 'The heart and capital of India' },
    'IN-PY': { name: 'Puducherry', capital: 'Puducherry', fact: 'Known for its French heritage' },
    'IN-CH': { name: 'Chandigarh', capital: 'Chandigarh', fact: 'India\'s first planned city' },
    'IN-AN': { name: 'Andaman & Nicobar', capital: 'Port Blair', fact: 'Known for beautiful beaches and Cellular Jail' },
    'IN-LD': { name: 'Lakshadweep', capital: 'Kavaratti', fact: 'A chain of beautiful coral islands' },
    'IN-DN': { name: 'Dadra & Nagar Haveli', capital: 'Silvassa', fact: 'Portuguese influence and green forests' },
    'IN-DD': { name: 'Daman & Diu', capital: 'Daman', fact: 'Famous for colonial architecture and beaches' }
};

let mapScore = 0, mapRound = 0, targetState = null, mapLoaded = false, usedStates = [];

function startMapMaster() {
    mapScore = 0;
    mapRound = 0;
    usedStates = []; // Reset used states pool
    document.getElementById('map-score').textContent = '0';
    document.getElementById('map-fact').innerHTML = '<em>Loading map...</em>';

    const mapContainer = document.getElementById('india-map-grid');

    // Load SVG map
    if (!mapLoaded) {
        fetch('images/india.svg')
            .then(res => res.text())
            .then(svgText => {
                mapContainer.innerHTML = svgText;
                mapLoaded = true;

                // Style the SVG - scale it down properly
                const svg = mapContainer.querySelector('svg');

                // Get original dimensions from the SVG
                const origWidth = svg.getAttribute('width') || 612;
                const origHeight = svg.getAttribute('height') || 696;

                // Set viewBox if not present to preserve aspect ratio
                if (!svg.getAttribute('viewBox')) {
                    svg.setAttribute('viewBox', `0 0 ${origWidth} ${origHeight}`);
                }

                // Remove fixed width/height and use CSS
                svg.removeAttribute('width');
                svg.removeAttribute('height');
                svg.style.width = '390px';
                svg.style.height = 'auto';
                svg.style.display = 'block';
                svg.style.margin = '0 auto';

                // Add click handlers to all state paths
                svg.querySelectorAll('path').forEach(path => {
                    const stateId = path.id;
                    if (stateIdMap[stateId]) {
                        path.style.cursor = 'pointer';
                        path.style.fill = '#4CAF50';
                        path.style.stroke = '#fff';
                        path.style.strokeWidth = '1';
                        path.style.transition = 'all 0.2s';

                        path.addEventListener('mouseenter', () => {
                            if (path.dataset.locked !== 'true') {
                                path.style.fill = '#FF9800';
                            }
                        });
                        path.addEventListener('mouseleave', () => {
                            if (path.dataset.locked !== 'true') {
                                path.style.fill = '#4CAF50';
                            }
                        });
                        path.addEventListener('click', () => checkMapClick(stateId, path));
                    } else {
                        path.style.fill = '#888';
                        path.style.stroke = '#666';
                    }
                });

                nextMapQuestion();
            })
            .catch(() => {
                mapContainer.innerHTML = '<p style="color:red">Could not load India map. Falling back to grid mode.</p>';
                fallbackGridMode();
            });
    } else {
        // Reset map colors
        const svg = mapContainer.querySelector('svg');
        svg.querySelectorAll('path').forEach(path => {
            path.dataset.locked = 'false';
            if (stateIdMap[path.id]) {
                path.style.fill = '#4CAF50';
            }
        });
        nextMapQuestion();
    }
}

function nextMapQuestion() {
    mapRound++;
    if (mapRound > 10) {
        showModal(`Game Over! Score: ${mapScore}/10`, 'Map Master', '🗺️');
        return;
    }
    document.getElementById('map-round').textContent = mapRound;

    // Get all available state IDs
    const allStateIds = Object.keys(stateIdMap);

    // Filter out used states
    let availableStates = allStateIds.filter(id => !usedStates.includes(id));

    // If we've used all states, reset the pool (shouldn't happen in a 10-round game with 36 states)
    if (availableStates.length === 0) {
        usedStates = [];
        availableStates = allStateIds;
    }

    // Pick a random state from available ones
    const randomId = availableStates[Math.floor(Math.random() * availableStates.length)];
    usedStates.push(randomId); // Mark as used
    targetState = { id: randomId, ...stateIdMap[randomId] };

    document.getElementById('map-question').textContent = `Find: ${targetState.name}`;
    document.getElementById('map-fact').textContent = 'Click on the correct state on the map!';
}

function checkMapClick(stateId, pathEl) {
    if (!targetState) return;

    const clickedState = stateIdMap[stateId];

    if (stateId === targetState.id) {
        mapScore++;
        document.getElementById('map-score').textContent = mapScore;
        pathEl.style.fill = '#2196F3';
        pathEl.dataset.locked = 'true';
        document.getElementById('map-fact').innerHTML = `✅ <strong>Correct!</strong> ${clickedState.fact}<br>Capital: ${clickedState.capital}`;
    } else {
        pathEl.style.fill = '#f44336';
        setTimeout(() => {
            pathEl.style.fill = '#4CAF50';
        }, 500);
        document.getElementById('map-fact').textContent = `❌ That was ${clickedState.name}. Looking for ${targetState.name}!`;
    }
    setTimeout(nextMapQuestion, 1800);
}

// Fallback grid mode if SVG doesn't load
function fallbackGridMode() {
    const indianStates = Object.values(stateIdMap);

    const gridEl = document.getElementById('india-map-grid');
    gridEl.innerHTML = '';

    let options = [];
    if (targetState) options.push(targetState);

    while (options.length < 12) {
        const rand = indianStates[Math.floor(Math.random() * indianStates.length)];
        if (!options.find(o => o.name === rand.name)) options.push(rand);
    }
    options.sort(() => Math.random() - 0.5);

    options.forEach(state => {
        const div = document.createElement('div');
        div.className = 'map-state' + (state.wb ? ' wb' : '');
        div.textContent = state.name;
        div.onclick = () => {
            if (state.name === targetState.name) {
                mapScore++;
                document.getElementById('map-score').textContent = mapScore;
                div.classList.add('correct');
                document.getElementById('map-fact').textContent = `✅ ${state.fact} | Capital: ${state.capital}`;
            } else {
                div.classList.add('wrong');
                document.getElementById('map-fact').textContent = `❌ That was ${state.name}. Try again!`;
            }
            setTimeout(nextMapQuestion, 1500);
        };
        gridEl.appendChild(div);
    });
}
