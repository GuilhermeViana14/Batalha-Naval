import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import './batalha_naval.css';

const socket = io('http://127.0.0.1:5000'); // Altere a URL se necessário

const App = () => {
    const [board, setBoard] = useState(Array(5).fill().map(() => Array(5).fill(0))); // Tabuleiro do oponente
    const [myBoard, setMyBoard] = useState(Array(5).fill().map(() => Array(5).fill(0))); // Seu tabuleiro
    const [message, setMessage] = useState('');
    const [gameStarted, setGameStarted] = useState(false);
    const [playerId, setPlayerId] = useState(null);
    const [winner, setWinner] = useState(null); // Para armazenar o vencedor

    useEffect(() => {
        // Escuta eventos do socket
        socket.on('move_result', (result) => {
            console.log("Resposta do servidor:", result); // Para depuração
            
            // Atualiza os tabuleiros
            if (Array.isArray(result.boards) && result.boards.length === 2) {
                const newMyBoard = Array.isArray(result.boards[0]) ? result.boards[0] : Array(5).fill().map(() => Array(5).fill(0));
                const newBoard = Array.isArray(result.boards[1]) ? result.boards[1] : Array(5).fill().map(() => Array(5).fill(0));
                
                setMyBoard(newMyBoard); // Atualiza seu tabuleiro
                setBoard(newBoard); // Atualiza o tabuleiro do oponente
            }

            // Atualiza a mensagem
            if (result && result.message) {
                setMessage(result.message);
            } else {
                console.error("Resposta do servidor não contém a mensagem esperada:", result);
            }

            // Verifica se houve um vencedor
            if (result.winner) {
                setWinner(result.winner); // Atualiza o estado do vencedor
            }
        });

        socket.on('player_added', (msg) => {
            setMessage(msg.message);
        });

        socket.on('game_started', (msg) => {
            setMessage(msg.message);
            setGameStarted(true); // Define o jogo como iniciado
        });

        return () => {
            socket.off('move_result');
            socket.off('player_added');
            socket.off('game_started');
        };
    }, []);

    // Função para iniciar o jogo
    const startGame = () => {
        if (playerId === null) {
            const id = Math.floor(Math.random() * 2); // Gera ID aleatório entre 0 e 1
            setPlayerId(id);
            socket.emit('add_player', { player_id: id });  // Adiciona o jogador
        }
    };

    // Função para lidar com o clique na célula do tabuleiro
    const handleClick = (x, y) => {
        if (!gameStarted) {
            alert("Comece o jogo primeiro!");
            return;
        }
        socket.emit('make_move', { player_id: playerId, x, y }); // Envia a jogada com o ID do jogador
    };

    return (
        <div className="app-container">
            <h1 className="app-title">Batalha Naval</h1>
            <button className="start-button" onClick={startGame}>Start Game</button>
            {gameStarted ? (
                <div className="board-container">
                    <h2 className="board-title">Seu Tabuleiro</h2>
                    <div className="board">
                        {myBoard.map((row, i) => (
                            <div className="board-row" key={i}>
                                {row.map((cell, j) => (
                                    <button 
                                        className={`board-cell ${cell === 2 ? 'hit' : cell === 1 ? 'miss' : ''}`} 
                                        key={j}
                                        disabled // Não permite clicar no seu próprio tabuleiro
                                    >
                                        {cell === 0 ? ' ' : cell === 1 ? 'X' : 'O'}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
                    <h2 className="board-title">Tabuleiro do Oponente</h2>
                    <div className="board">
                        {board.map((row, i) => (
                            <div className="board-row" key={i}>
                                {row.map((cell, j) => (
                                    <button 
                                        className={`board-cell ${cell === 2 ? 'hit' : cell === 1 ? 'miss' : ''}`} 
                                        key={j} 
                                        onClick={() => handleClick(i, j)} // Ação para o clique
                                    >
                                        {cell === 0 ? ' ' : cell === 1 ? 'X' : 'O'}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </div>
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
