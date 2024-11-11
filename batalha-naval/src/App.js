import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Board from './components/Boards';
import './css/batalha_naval.css';

const socket = io('127.0.0.1:5000', {
    transports: ['websocket']
});

const App = () => {
    const [player1Board, setPlayer1Board] = useState(Array(5).fill().map(() => Array(5).fill(0)));
    const [player2Board, setPlayer2Board] = useState(Array(5).fill().map(() => Array(5).fill(0)));
    const [message, setMessage] = useState('');
    const [gameStarted, setGameStarted] = useState(false);
    const [playerId, setPlayerId] = useState(null);
    const [waitingForOpponent, setWaitingForOpponent] = useState(false); 
    const [winner, setWinner] = useState(null);
    const [usedIds, setUsedIds] = useState([]); // Estado para controlar os IDs usados

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Conectado ao servidor');
        });

        socket.on('move_result', (result) => {
            if (result && Array.isArray(result.boards) && result.boards.length === 2) {
                setPlayer1Board(result.boards[0].board);
                setPlayer2Board(result.boards[1].board);
            }

            if (result.message) {
                setMessage(result.message);
            }

            if (result.winner) {
                setWinner(result.winner);
            }
        });

        socket.on('player_added', (msg) => {
            setMessage(msg.message);
            if (msg.message === 'Jogador 2 adicionado') {
                setWaitingForOpponent(false); 
            }
        });

        socket.on('game_started', (msg) => {
            setMessage(msg.message);
            setGameStarted(true);  // Define gameStarted como true quando o jogo começa
        });

        socket.on('player_left', () => {
            setMessage('O outro jogador deixou o jogo.');
            resetGame();
        });

        return () => {
            socket.off('move_result');
            socket.off('player_added');
            socket.off('game_started');
            socket.off('player_left');
        };
    }, [playerId]);

    const generateUniqueId = () => {
        let id;
        do {
            id = Math.floor(Math.random() * 2); // Geração aleatória de ID (0 ou 1)
        } while (usedIds.includes(id)); // Verifica se o ID já foi usado
        return id;
    };

    const startGame = () => {
        if (playerId === null) {
            const id = generateUniqueId(); // Gera ID único
            setPlayerId(id);
            setUsedIds((prevIds) => [...prevIds, id]); // Adiciona o ID aos IDs usados
            socket.emit('add_player', { player_id: id });
            setWaitingForOpponent(true); 
        }
    };

    const handleClick = (x, y) => {
        if (!gameStarted) {
            alert("Comece o jogo primeiro!");
            return;
        }
        socket.emit('make_move', { player_id: playerId, x, y });
    };

    const leaveGame = () => {
        if (playerId !== null) {
            socket.emit('leave_game', { player_id: playerId });
            resetGame();
        }
    };

    const resetGame = () => {
        setPlayer1Board(Array(5).fill().map(() => Array(5).fill(0)));
        setPlayer2Board(Array(5).fill().map(() => Array(5).fill(0)));
        setMessage('');
        setGameStarted(false);
        setPlayerId(null);
        setWinner(null);
        setWaitingForOpponent(false); 
        setUsedIds([]); // Reseta os IDs usados
    };

    const myBoard = playerId === 0 ? player1Board : player2Board;
    const opponentBoard = playerId === 0 ? player2Board : player1Board;

    return (
        <div className="app-container">
            {!gameStarted && (
                <div className="start-game-container">
                    <h2 className="start-game-title">Batalha Naval</h2>
                    <button className="start-button" onClick={startGame}>Start Game</button>
                </div>
            )}
            {gameStarted ? (
                <>
                    <div className="board-container">
                        <div className="board-wrapper">
                            <h2 className="board-title">Seu Tabuleiro</h2>
                            <Board board={myBoard} isMyBoard={true} />
                        </div>
                        <div className="board-wrapper">
                            <h2 className="board-title">Tabuleiro do Oponente</h2>
                            <Board board={opponentBoard} isMyBoard={false} handleClick={handleClick} />
                        </div>
                    </div>
                    <div><button className="leave-button" onClick={leaveGame}>Leave Game</button></div>
                    <div className="player-info">
                        <h3>{playerId === 0 ? 'Você é o Jogador 1' : 'Você é o Jogador 2'}</h3>
                    </div>
                </>
            ) : (
                <p className="waiting-message">{waitingForOpponent && 'Aguardando oponente...'}</p>
            )}
            {gameStarted && (
                <div className="message-container">
                    <span className="message-label">Mensagem: </span>
                    <span className="message-content">{message}</span>
                </div>
            )}
            {winner && <h2 className="winner">Vencedor: Jogador {winner}</h2>}
        </div>
    );
};

export default App;
