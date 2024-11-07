// Board.js

import React from 'react';

const Board = ({ board, isMyBoard, handleClick }) => (
    <div className="board">
        {board.map((row, i) => (
            <div key={i} className="board-row">
                {row.map((cell, j) => {
                    const displayCell = isMyBoard ? cell : (cell === 1 ? 0 : cell); // Oculta os navios no tabuleiro do oponente
                    return (
                        <button
                            key={j}
                            className={`board-cell ${
                                displayCell === 2 ? 'hit' :
                                displayCell === 1 ? 'ship' :
                                displayCell === 3 ? 'miss' : ''
                            }`}
                            onClick={() => !isMyBoard && handleClick(i, j)}
                            disabled={isMyBoard}
                        >
                            {displayCell === 0 ? '' : displayCell === 1 ? 'N' : displayCell === 2 ? 'X' : 'M'}
                        </button>
                    );
                })}
            </div>
        ))}
    </div>
);

export default Board;
