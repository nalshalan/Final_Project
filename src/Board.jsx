import React from 'react';
import Canvas from './Canvas';

function Board({ boardWidth, boardHeight, isPaused, setScore, setLines, setLevel, nextPiece, setNextPiece }) {
    // Initializing the game board with boardWidth and boardHeight
    const initialBoard = Array.from({ length: boardHeight }, () => 
        Array(boardWidth).fill({ color: '', isBlock: false })
    );

    return (
        <Canvas 
            initialBoard={initialBoard} 
            boardWidth={boardWidth} 
            boardHeight={boardHeight} 
            isPaused={isPaused} 
            setScore={setScore}
            setLines={setLines}
            setLevel={setLevel}
            nextPiece={nextPiece}
            setNextPiece={setNextPiece}
        />
    );
}

export default Board;