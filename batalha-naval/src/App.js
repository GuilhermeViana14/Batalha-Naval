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
    const [playerId, setPlayerId] = useState(null); // Estado do ID do jogador
    const [waitingForOpponent, setWaitingForOpponent] = useState(false);
    const [winner, setWinner] = useState(null);

    useEffect(() => {
        socket.on('connect', () => {
            console.log('Conectado ao servidor');
        });

        // Recebe o ID do jogador e configura apenas uma vez
        socket.on('player_added', (msg) => {
            console.log("Mensagem do servidor:", msg);
            const [messageText, playerIdFromServer] = msg.message;

            setMessage(messageText);

            // Só configura o ID do jogador se ainda estiver indefinido
            if (playerId === null && playerIdFromServer !== undefined) {
                console.log("Definindo o playerId:", playerIdFromServer);
                setPlayerId(playerIdFromServer);
            }

            // Ajusta a mensagem de espera
            if (messageText === 'Jogador 2 adicionado') {
                setWaitingForOpponent(false); 
            }
        });

        // Quando o jogo começa, notifica ambos os jogadores
        socket.on('game_started', (msg) => {
            console.log("Jogo iniciado:", msg);
            setMessage(msg.message);
            setGameStarted(true);
        });

        // Atualiza os tabuleiros dos jogadores após uma jogada
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

        // Lida com o evento quando o outro jogador sai
        socket.on('player_left', () => {
            console.log("O outro jogador saiu");
            setMessage('O outro jogador deixou o jogo.');
            resetGame();
        });

        // Limpeza dos eventos ao desmontar
        return () => {
            socket.off('connect');
            socket.off('player_added');
            socket.off('game_started');
            socket.off('move_result');
            socket.off('player_left');
        };
    }, [playerId]);

    // Função para começar o jogo e adicionar o jogador ao servidor
    const startGame = () => {
        if (playerId === null) { // Envia apenas uma vez
            console.log("Solicitando ao servidor para adicionar o jogador");
            socket.emit('add_player');
            setWaitingForOpponent(true); 
        } else if (playerId === 1) {
            console.log("Jogador 2 entrou, agora iniciando o jogo!");
            socket.emit('start_game'); // Quando o segundo jogador clica
        }
    };

    // Função para realizar uma jogada
    const handleClick = (x, y) => {
        if (!gameStarted) {
            alert("Comece o jogo primeiro!");
            return;
        }
        console.log("Enviando jogada:", { player_id: playerId, x, y });
        socket.emit('make_move', { player_id: playerId, x, y });
    };

    // Função para sair do jogo
    const leaveGame = () => {
        if (playerId !== null) {
            console.log("Solicitando para sair do jogo:", playerId);
            socket.emit('leave_game', { player_id: playerId });
            resetGame();
        }
    };

    // Função para resetar o jogo e o estado do jogador
    const resetGame = () => {
        console.log("Resetando o jogo e o estado do jogador");
        setPlayer1Board(Array(5).fill().map(() => Array(5).fill(0)));
        setPlayer2Board(Array(5).fill().map(() => Array(5).fill(0)));
        setMessage('');
        setGameStarted(false);
        setPlayerId(null);  // Redefine o ID do jogador para evitar conflitos
        setWinner(null);
        setWaitingForOpponent(false);
    };

    // Define os tabuleiros com base no ID do jogador
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
                    <div>
                        <button className="leave-button" onClick={leaveGame} disabled={playerId === null}>Leave Game</button>
                    </div>
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
