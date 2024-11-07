import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import Board from './components/Boards';
import Controls from './components/Controls';
import './batalha_naval.css';

const socket = io('https://batalha-naval-backend-production.up.railway.app', {
    transports: ['websocket']  // Força o uso de WebSocket
});
  const App = () => {
    const [player1Board, setPlayer1Board] = useState(Array(5).fill().map(() => Array(5).fill(0)));
    const [player2Board, setPlayer2Board] = useState(Array(5).fill().map(() => Array(5).fill(0)));
    const [message, setMessage] = useState('');
    const [gameStarted, setGameStarted] = useState(false);
    const [playerId, setPlayerId] = useState(null);
    const [winner, setWinner] = useState(null);

    const personalizeMessage = (message) => {
        if (message.includes("vez do jogador")) {
            return message.replace("vez do jogador", "Agora é a vez do jogador!");
        }
        if (message.includes("acertou")) {
            return message.replace("acertou", "Você acertou! Parabéns!");
        }
        if (message.includes("errou")) {
            return message.replace("errou", "Infelizmente, você errou.");
        }
        if (message.includes("Vencedor")) {
            return `${message} 🎉 Parabéns! Você venceu!`;
        }
        return message;
    };

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Conectado ao servidor');
        });

        socket.on('move_result', (result) => {
            console.log("Dados recebidos do servidor:", result);

            if (result && Array.isArray(result.boards) && result.boards.length === 2) {
                setPlayer1Board(result.boards[0].board);
                setPlayer2Board(result.boards[1].board);
            }

            if (result.message) {
                const customizedMessage = personalizeMessage(result.message);
                setMessage(customizedMessage);
            }

            if (result.winner) {
                setWinner(result.winner);
            }
        });

        socket.on('player_added', (msg) => {
            const customizedMessage = personalizeMessage(msg.message);
            setMessage(customizedMessage);
        });

        socket.on('game_started', (msg) => {
            const customizedMessage = personalizeMessage(msg.message);
            setMessage(customizedMessage);
            setGameStarted(true);
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

    const startGame = () => {
        if (playerId === null) {
            const id = Math.floor(Math.random() * 2);
            setPlayerId(id);
            socket.emit('add_player', { player_id: id });
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
    };

    const myBoard = playerId === 0 ? player1Board : player2Board;
    const opponentBoard = playerId === 0 ? player2Board : player1Board;

    return (
        <div className="app-container">
            <h1 className="app-title">Batalha Naval</h1>
            <Controls startGame={startGame} leaveGame={leaveGame} />
            {gameStarted ? (
                <div className="board-container">
                    <h2>Seu Tabuleiro</h2>
                    <Board board={myBoard} isMyBoard={true} />
                    <h2>Tabuleiro do Oponente</h2>
                    <Board board={opponentBoard} isMyBoard={false} handleClick={handleClick} /> {/* Corrigido aqui */}
                </div>
            ) : (
                <p className="waiting-message">Aguardando oponente...</p>
            )}
            <p className="message">{message}</p>
            {winner && <h2 className="winner">Vencedor: Jogador {winner}</h2>}
        </div>
    );
};

export default App;
