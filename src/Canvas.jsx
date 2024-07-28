import React, { useEffect, useState, useCallback, useRef } from 'react';
import Piece, { tetrominoes } from './Piece';
import useSound from './UseSound';
import './App.css';

const cellSize = 30;
const boardWidth = 10;
const boardHeight = 15;

const initialBoard = Array.from({ length: boardHeight }, () =>
    Array(boardWidth).fill({ color: '', isBlock: false })
);

function Canvas({ isPaused, setIsPaused, setScore, setLines, setLevel, nextPiece, setNextPiece, selectedLevel, isGameOver, setIsGameOver, showQuitConfirmation, setShowQuitConfirmation, isSoundEffectsMuted, isMusicMuted, audioRef }) {
    const [board, setBoard] = useState(initialBoard);
    const [currentPiece, setCurrentPiece] = useState(null);
    const [currentLevel, setCurrentLevel] = useState(selectedLevel); // Initial level
    const [totalLinesCleared, setTotalLinesCleared] = useState(0);
    const [isClearingLines, setIsClearingLines] = useState(false);
    const [showNextPiece, setShowNextPiece] = useState(true);

    const requestRef = useRef();
    const lastTimeRef = useRef(0);

    // Audio references
    const playLineClearSound = useSound("../sounds/line_clear.mp3", isSoundEffectsMuted);
    const playGameOverSound = useSound("../sounds/game_over.mp3", isSoundEffectsMuted);
    const playRotateSound = useSound("../sounds/rotate.mp3", isSoundEffectsMuted);
    const playMoveSound = useSound("../sounds/move.mp3", isSoundEffectsMuted);
    const playLandSound = useSound("../sounds/land.mp3", isSoundEffectsMuted);

    // Function to get a random piece
    const getRandomPiece = useCallback(() => {
        const randIndex = Math.floor(Math.random() * tetrominoes.length);
        return {
            ...tetrominoes[randIndex],
            x: Math.floor(boardWidth / 2) - Math.floor(tetrominoes[randIndex].coords[0].length / 2),
            y: 0,
            color: getColorByShape(tetrominoes[randIndex].shape),
        };
    }, []);

    // Function to get color based on shape
    const getColorByShape = useCallback((shape) => {
        const colors = {
            I: 'yellow',
            J: 'purple',
            L: 'green',
            O: 'blue',
            S: 'red',
            T: 'orange',
            Z: 'cyan'
        };

        return colors[shape] || 'grey';
    }, []);

    // Function to check collision between piece and board
    const isCollision = useCallback((piece, board) => {
        for (let y = 0; y < piece.coords.length; y++) {
            for (let x = 0; x < piece.coords[y].length; x++) {
                if (
                    piece.coords[y][x] &&
                    (piece.y + y >= boardHeight ||
                        piece.x + x < 0 ||
                        piece.x + x >= boardWidth ||
                        (board[piece.y + y] && board[piece.y + y][piece.x + x].isBlock))
                ) {
                    return true;
                }
            }
        }
        return false;
    }, [boardHeight, boardWidth]);

    // Function to merge piece into the board
    const mergePieceToBoard = useCallback((piece, board) => {
        const newBoard = board.map(row => row.map(cell => ({ ...cell })));
        piece.coords.forEach((row, y) => {
            row.forEach((block, x) => {
                if (block && newBoard[piece.y + y] && newBoard[piece.y + y][piece.x + x]) {
                    newBoard[piece.y + y][piece.x + x] = { color: piece.color, isBlock: true };
                }
            });
        });
        return newBoard;
    }, []);

    // Function to clear completed lines from the board
    const clearLines = useCallback((board) => {
        // Identify filled lines
        const filledLines = board.reduce((acc, row, rowIndex) => {
            if (row.every(cell => cell.isBlock)) acc.push(rowIndex);
            return acc;
        }, []);

        console.log('Filled Lines:', filledLines);

        // Flash effect
        if (filledLines.length > 0) {
            setIsClearingLines(true); // Start clearing lines
            setShowNextPiece(false); // Hide next piece during flashing
            playLineClearSound(); // Play line clear sound

            let flashCount = 0;
            const flashInterval = setInterval(() => {
                const updatedBoard = board.map((row, rowIndex) => {
                    if (filledLines.includes(rowIndex)) {
                        return row.map(cell => ({
                            ...cell,
                            color: flashCount % 2 === 0 ? 'white' : cell.color,
                        }));
                    }
                    return row;
                });
                setBoard(updatedBoard);
                flashCount++;
                if (flashCount > 4) { // Adjust the number of flashes as needed
                    clearInterval(flashInterval);
                    // Remove filled lines
                    const newBoard = board.filter((_, rowIndex) => !filledLines.includes(rowIndex));
                    // Add empty lines at the top
                    while (newBoard.length < boardHeight) {
                        newBoard.unshift(Array(boardWidth).fill({ color: '', isBlock: false }));
                    }
                    setBoard(newBoard);

                    const linesCleared = filledLines.length; 
                    setScore(prevScore => prevScore + linesCleared * 100);

                    setLines(prevLines => {
                        const newLines = prevLines + linesCleared;
                        console.log('Lines Cleared:', linesCleared);
                        console.log('Total Lines Cleared:', newLines);

                        return newLines;
                    });
                    setTotalLinesCleared(prevTotal => prevTotal + linesCleared);
                    finalizeBoard(newBoard); // Call a function to settle the board after clearing lines

                    setIsClearingLines(false); // Finish clearing lines
                    setShowNextPiece(true); // Show next piece after flashing
                }
            }, 200); // Adjust the flash interval (milliseconds) as needed
        }

        return board;
    }, [boardHeight, boardWidth, setScore, setLines, nextPiece]);

    // Function to finalize board after animations
    const finalizeBoard = useCallback((finalBoard) => {
        // Example logic to check for game over condition
        const gameOver = finalBoard[0].some(cell => cell.isBlock); // Check if top row has blocks

        if (gameOver) {
            setIsGameOver(true);
            playGameOverSound(); // Play game over sound immediately
        }
    }, [setIsGameOver]);

    // Function to move the piece down
    const movePieceDown = useCallback(() => {
        if (!currentPiece || isPaused || isGameOver || isClearingLines) return;

        const newPiece = { ...currentPiece, y: currentPiece.y + 1 };
        if (!isCollision(newPiece, board)) {
            setCurrentPiece(newPiece);
        } else {
            if (currentPiece.y <= 0) {
                setIsGameOver(true);
                playGameOverSound(); // Play game over sound immediately
            } else {
                const mergedBoard = mergePieceToBoard(currentPiece, board);
                const clearedBoard = clearLines(mergedBoard);
                setBoard(clearedBoard);
                if (!isClearingLines) {
                    setCurrentPiece(nextPiece);
                    setNextPiece(getRandomPiece());
                    playLandSound(); // Play land sound
                }
            }
        }
    }, [currentPiece, isCollision, isPaused, isGameOver, isClearingLines, board, mergePieceToBoard, clearLines, getRandomPiece, nextPiece]);

    // Function to move the piece horizontally
    const movePiece = useCallback((deltaX) => {
        if (!currentPiece || isPaused || isGameOver) return;

        const newPiece = { ...currentPiece, x: currentPiece.x + deltaX };
        if (!isCollision(newPiece, board)) {
            setCurrentPiece(newPiece);
        }
    }, [currentPiece, isCollision, isPaused, isGameOver, board]);

    // Function to rotate the current piece
    const rotatePiece = useCallback(() => {
        if (!currentPiece || isPaused || isGameOver) return;

        // Clone the current piece object
        const newPiece = { ...currentPiece };

        // Rotate the piece clockwise
        newPiece.coords = newPiece.coords[0].map((_, colIndex) =>
            newPiece.coords.map((row) => row[colIndex]).reverse()
        );

        // Check if rotation causes collision
        if (!isCollision(newPiece, board)) {
            setCurrentPiece(newPiece);
            playRotateSound(); // Play rotate sound
        }
    }, [currentPiece, isCollision, isPaused, isGameOver, board, playRotateSound]);

    // Function for hard drop
    const hardDrop = useCallback(() => {
        if (!currentPiece || isPaused || isGameOver) return;

        let newPiece = { ...currentPiece, y: currentPiece.y + 1 };
        let dropDistance = 0;

        while (!isCollision(newPiece, board)) {
            newPiece = { ...newPiece, y: newPiece.y + 1 };
            dropDistance++;
        }
        newPiece = { ...newPiece, y: newPiece.y - 1 };

        const mergedBoard = mergePieceToBoard(newPiece, board);
        const clearedBoard = clearLines(mergedBoard);
        setBoard(clearedBoard);

        // Increase score based on drop distance
        setScore(prevScore => prevScore + dropDistance * 2); // Scoring: 2 points per line dropped

        if (!isClearingLines) {
            setNextPiece(getRandomPiece());
            setCurrentPiece(nextPiece);
            playLandSound(); // Play land sound
        }
    }, [currentPiece, isCollision, isPaused, isGameOver, isClearingLines, board, mergePieceToBoard, clearLines, getRandomPiece, nextPiece]);

    const gameLoop = useCallback((time) => {
        if (isPaused || isGameOver) return;

        // Define speed based on selected level
        let speed;
        switch (currentLevel) {
            case 1:
                speed = 1000;
                break;
            case 2:
                speed = 900;
                break;
            case 3:
                speed = 800;
                break;
            case 4:
                speed = 700;
                break;
            case 5:
                speed = 600;
                break;
            case 6:
                speed = 500;
                break;
            case 7:
                speed = 400;
                break;
            case 8:
                speed = 300;
                break;
            case 9:
                speed = 200;
                break;
            case 10:
                speed = 100;
                break;
            default:
                speed = 1000; // Default to level 1 speed
                break;
        }

        if (time - lastTimeRef.current > speed) {
            movePieceDown();
            lastTimeRef.current = time;
        }

        requestRef.current = requestAnimationFrame(gameLoop);
    }, [isPaused, isGameOver, currentLevel, movePieceDown]);

    useEffect(() => {
        if (!isPaused && !isGameOver ) {
            requestRef.current = requestAnimationFrame(gameLoop);
        }
        return () => cancelAnimationFrame(requestRef.current);
    }, [isPaused, isGameOver, gameLoop]);

    // Effect to initialize the game
    useEffect(() => {
        setCurrentPiece(getRandomPiece());
        setNextPiece(getRandomPiece());
    }, [getRandomPiece]);

    // Effect to handle keyboard controls
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (isPaused || isGameOver) return;

            switch (e.key) {
                case 'ArrowLeft':
                    movePiece(-1); // Move left
                    playMoveSound(); // Play move sound
                    break;
                case 'ArrowRight':
                    movePiece(1); // Move right
                    playMoveSound(); // Play move sound
                    break;
                case 'ArrowDown':
                    movePieceDown(); // Move down
                    setScore(prevScore => prevScore + 1); // Increase score on move down
                    playMoveSound(); // Play move sound
                    break;
                case 'ArrowUp':
                    rotatePiece(); // Rotate the piece
                    break;
                case ' ':
                    hardDrop(); // Hard drop
                    break;
                default:
                    break;
            }
        };

        document.addEventListener('keydown', handleKeyPress);
        return () => {
            document.removeEventListener('keydown', handleKeyPress);
        };
    }, [movePiece, movePieceDown, rotatePiece, hardDrop, isPaused, isGameOver, currentPiece, playMoveSound, playRotateSound]);

    // Use effect to handle game resumption
    useEffect(() => {
        if (showQuitConfirmation === false && !isGameOver && currentPiece) {
            setIsPaused(false); // Resume game if quit confirmation is dismissed and game is not over
        }
    }, [showQuitConfirmation, isGameOver, currentPiece]);

    useEffect(() => {
        // Calculate new level based on total lines cleared
        const newLevel = Math.floor(totalLinesCleared / 10) + selectedLevel;
        if (newLevel !== currentLevel) {
            setCurrentLevel(newLevel);
            setLevel(newLevel);
        }
    }, [totalLinesCleared, currentLevel, selectedLevel]);

    // Function to handle restart game
    const restartGame = useCallback(() => {
        console.log('Restarting game with selectedLevel:', selectedLevel);
        setIsPaused(false);
        setIsGameOver(false);
        setBoard(initialBoard);
        setLevel(selectedLevel);
        setScore(0);
        setLines(0);
        setCurrentPiece(getRandomPiece());
        setNextPiece(getRandomPiece());
        setTotalLinesCleared(0);
        lastTimeRef.current = 0;
        requestRef.current = requestAnimationFrame(gameLoop);

        // Restart the background music
        if (!isMusicMuted) {
            audioRef.current.currentTime = 0; // Reset to the beginning
            audioRef.current.play();
        }
    }, [selectedLevel, setScore, setLines, getRandomPiece, gameLoop, isMusicMuted]);

    const handleQuitGame = () => {
        setIsGameOver(true); // Set game over state to true
        setShowQuitConfirmation(true);
    };

    const confirmQuitGame = () => {
        window.location.href = 'http://localhost:5173/';
    };

    const cancelQuitGame = () => {
        setShowQuitConfirmation(false);
    };

    // Rendering the game board and current piece
    return (
        <div
            className="board"
            style={{
                width: boardWidth * cellSize,
                height: boardHeight * cellSize,
                position: 'relative',
                backgroundColor: '#111',
                border: '2px solid #333',
                margin: '0 auto',
            }}
        >
            {board.map((row, y) =>
                row.map((cell, x) => (
                    <div
                        key={`${y}-${x}`}
                        className="cell"
                        style={{
                            width: cellSize,
                            height: cellSize,
                            backgroundColor: cell.color || 'black',
                            position: 'absolute',
                            top: y * cellSize,
                            left: x * cellSize,
                            border: '1px solid #333',
                            boxSizing: 'border-box',
                        }}
                    ></div>
                ))
            )}

            {showNextPiece && currentPiece && (
                <Piece type={currentPiece} cellSize={cellSize} />
            )}

            {/* Quit Game Overlay */}
            {showQuitConfirmation && (
                <div 
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        color: 'white',
                        fontSize: '24px',
                    }}
                >
                    <div>Are you sure?</div>
                    <div style={{ marginTop: '10px' }}>
                        <button onClick={confirmQuitGame} style={{ padding: '10px 20px', fontSize: '18px', cursor: 'pointer' }}>Yes</button>
                        <button onClick={cancelQuitGame} style={{ padding: '10px 20px', fontSize: '18px', cursor: 'pointer' }}>No</button>
                    </div>
                </div>
            )}

            {/* Game Over Overlay */}
            {isGameOver && !showQuitConfirmation && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        color: 'white',
                        fontSize: '24px',
                    }}
                >
                    <div>Game Over</div>
                    <div style={{ marginTop: '10px' }}>
                        <button onClick={restartGame} style={{ padding: '10px 20px', fontSize: '18px', cursor: 'pointer' }}>Restart</button>
                        <button onClick={handleQuitGame} style={{ padding: '10px 20px', fontSize: '18px', cursor: 'pointer' }}>Quit</button>
                    </div>
                </div>
            )}

            {/* Pause Game Overlay */}
            {isPaused && !showQuitConfirmation && (
                <div
                    style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        backgroundColor: 'rgba(0, 0, 0, 0.5)',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        flexDirection: 'column',
                        color: 'white',
                        fontSize: '24px',
                    }}
                >
                    <div>Paused</div>
                </div>
            )}
        </div>
    );
}

export default Canvas;