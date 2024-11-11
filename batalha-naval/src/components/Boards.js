// Board.js

import React from 'react';
import '../css/board.css';
const Board = ({ board, isMyBoard, handleClick }) => {
    const letters = ['A', 'B', 'C', 'D', 'E'];

    return (
        <div className="board">
            {/* Header with numbers */}
            <div className="board-row header">
                <div className="board-cell header-cell"></div>
                {[1, 2, 3, 4, 5].map((num) => (
                    <div key={num} className="board-cell header-cell">{num}</div>
                ))}
            </div>
            {/* Rows with letter and cells */}
            {board.map((row, rowIndex) => (
                <div key={rowIndex} className="board-row">
                    {/* Row header with letters */}
                    <div className="board-cell header-cell">{letters[rowIndex]}</div>
                    {row.map((cell, colIndex) => {
                        // Conditionally apply the 'ship' class only if it's the player's own board
                        const cellClass = cell === 1 && isMyBoard ? 'ship' :
                                          cell === 2 ? 'hit' :
                                          cell === 3 ? 'miss' : '';
                        return (
                            <div
                                key={colIndex}
                                className={`board-cell ${cellClass}`}
                                onClick={() => !isMyBoard && handleClick(rowIndex, colIndex)}
                            ></div>
                        );
                    })}
                </div>
            ))}
        </div>
    );
};

export default Board;