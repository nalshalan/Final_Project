import React from 'react';
import './App.css';

export const tetrominoes = [
    { shape: 'I', coords: [[1, 1, 1, 1]] },
    { shape: 'J', coords: [[1, 0, 0], [1, 1, 1]] },
    { shape: 'L', coords: [[0, 0, 1], [1, 1, 1]] },
    { shape: 'O', coords: [[1, 1], [1, 1]] },
    { shape: 'S', coords: [[0, 1, 1], [1, 1, 0]] },
    { shape: 'T', coords: [[0, 1, 0], [1, 1, 1]] },
    { shape: 'Z', coords: [[1, 1, 0], [0, 1, 1]] }
];

function Piece({ type, cellSize, isNextPiece }) {
    if (!type) return null;

    const tetrominoStyle = {
        position: 'absolute',
        top: isNextPiece ? '0px' : `${type.y * cellSize}px`,
        left: isNextPiece ? '0px' : `${type.x * cellSize}px`,
        display: 'grid',
        gridTemplateColumns: `repeat(${type.coords[0].length}, 1fr)`,
        gridTemplateRows: `repeat(${type.coords.length}, 1fr)`,
        gap: 0,
    };

    const blockStyle = {
        width: `${cellSize}px`,
        height: `${cellSize}px`,
        backgroundColor: type.color,
        border: '1px solid #333',
        boxSizing: 'border-box',
    };

    return (
        <div className={`piece piece-${type.shape}`} style={tetrominoStyle}>
            {type.coords.map((row, rowIndex) =>
                row.map((block, colIndex) =>
                    block ? (
                        <div
                            key={`${rowIndex}-${colIndex}`}
                            className="block"
                            style={{
                                ...blockStyle,
                                gridColumn: colIndex + 1,
                                gridRow: rowIndex + 1,
                            }}
                        />
                    ) : null
                )
            )}
        </div>
    );
}

export default Piece;