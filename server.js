const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// Serve static files from current directory
app.use(express.static(__dirname));

// Game state
const waitingPlayers = new Map(); // roomId -> player data
const activeGames = new Map(); // roomId -> game data
const playerRooms = new Map(); // socketId -> roomId

class GameRoom {
    constructor(roomId, player1, player2) {
        this.roomId = roomId;
        this.players = {
            player1: {
                id: player1.id,
                socketId: player1.socketId,
                name: player1.name || 'Player 1',
                difficulty: player1.difficulty,
                score: 0,
                grid: this.createEmptyGrid(),
                gameOver: false,
                won: false
            },
            player2: {
                id: player2.id,
                socketId: player2.socketId,
                name: player2.name || 'Player 2',
                difficulty: player2.difficulty,
                score: 0,
                grid: this.createEmptyGrid(),
                gameOver: false,
                won: false
            }
        };
        this.gameStarted = false;
        this.winner = null;
    }

    createEmptyGrid() {
        const grid = [];
        for (let i = 0; i < 10; i++) {
            grid[i] = new Array(10).fill(null);
        }
        return grid;
    }

    updateGrid(playerId, grid, score) {
        const playerKey = this.players.player1.id === playerId ? 'player1' : 'player2';
        this.players[playerKey].grid = grid;
        this.players[playerKey].score = score;

        // Check for game over
        this.checkGameOver(playerKey);
    }

    checkGameOver(playerKey) {
        const player = this.players[playerKey];
        if (player.score >= 5000 && !this.winner) {
            this.winner = playerKey;
            player.won = true;
            this.players[playerKey === 'player1' ? 'player2' : 'player1'].gameOver = true;
            return true;
        }
        return false;
    }

    getOpponent(playerId) {
        if (this.players.player1.id === playerId) {
            return this.players.player2;
        }
        return this.players.player1;
    }
}

// Generate unique room ID
function generateRoomId() {
    return Math.random().toString(36).substr(2, 8);
}

// Socket connection handling
io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    // Player looking for game
    socket.on('find-game', (data) => {
        const { gameMode, difficulty, playerName } = data;

        // Look for waiting player with same game mode
        let matched = false;

        for (const [roomId, playerData] of waitingPlayers.entries()) {
            if (playerData.gameMode === gameMode && playerData.socketId !== socket.id) {
                // Found a match!
                matched = true;

                const player1 = waitingPlayers.get(roomId);
                const player2 = {
                    id: socket.id,
                    socketId: socket.id,
                    name: playerName || 'Player 2',
                    difficulty: difficulty
                };

                // Create game room
                const gameRoom = new GameRoom(roomId, player1, player2);
                activeGames.set(roomId, gameRoom);

                // Remove from waiting list
                waitingPlayers.delete(roomId);
                playerRooms.set(player1.socketId, roomId);
                playerRooms.set(socket.id, roomId);

                // Notify both players that game is starting
                io.to(player1.socketId).emit('game-found', {
                    opponent: {
                        name: player2.name,
                        difficulty: player2.difficulty
                    },
                    isPlayer1: true
                });

                io.to(socket.id).emit('game-found', {
                    opponent: {
                        name: player1.name,
                        difficulty: player1.difficulty
                    },
                    isPlayer1: false
                });

                console.log(`Game started in room ${roomId} between ${player1.name} and ${player2.name}`);
                break;
            }
        }

        // No match found, add to waiting list
        if (!matched) {
            const roomId = generateRoomId();
            waitingPlayers.set(roomId, {
                id: socket.id,
                socketId: socket.id,
                name: playerName || 'Player 1',
                difficulty: difficulty,
                gameMode: gameMode
            });

            playerRooms.set(socket.id, roomId);

            socket.emit('waiting-for-player');
            console.log(`Player ${playerName || socket.id} waiting in room ${roomId}`);
        }
    });

    // Player cancels matchmaking
    socket.on('cancel-matchmaking', () => {
        const roomId = playerRooms.get(socket.id);
        if (roomId && waitingPlayers.has(roomId)) {
            waitingPlayers.delete(roomId);
            playerRooms.delete(socket.id);
            socket.emit('matchmaking-cancelled');
            console.log(`Player ${socket.id} cancelled matchmaking`);
        }
    });

    // Game state updates
    socket.on('update-game-state', (data) => {
        const roomId = playerRooms.get(socket.id);
        if (roomId && activeGames.has(roomId)) {
            const gameRoom = activeGames.get(roomId);

            // Update player's grid and score
            gameRoom.updateGrid(socket.id, data.grid, data.score);

            // Handle game over from no moves
            if (data.gameOver && !gameRoom.winner) {
                // Player got game over, opponent wins
                const opponent = gameRoom.getOpponent(socket.id);
                const playerKey = gameRoom.players.player1.id === socket.id ? 'player2' : 'player1';

                gameRoom.winner = playerKey;
                gameRoom.players[playerKey].won = true;
                gameRoom.players[playerKey].gameOver = true;
            }

            // Get opponent data
            const opponent = gameRoom.getOpponent(socket.id);

            // Send opponent's state to this player
            socket.emit('opponent-update', {
                score: opponent.score,
                grid: opponent.grid,
                gameOver: opponent.gameOver,
                won: opponent.won
            });

            // Check for game over
            if (gameRoom.winner) {
                const winner = gameRoom.players[gameRoom.winner];

                // Notify both players of game result
                const player1Reason = gameRoom.winner === 'player1' ? 'victory' : 'opponent_game_over';
                const player2Reason = gameRoom.winner === 'player2' ? 'victory' : 'opponent_game_over';

                io.to(gameRoom.players.player1.socketId).emit('game-over', {
                    winner: gameRoom.winner === 'player1',
                    winnerName: winner.name,
                    finalScore: gameRoom.players.player1.score,
                    opponentScore: gameRoom.players.player2.score,
                    reason: player1Reason
                });

                io.to(gameRoom.players.player2.socketId).emit('game-over', {
                    winner: gameRoom.winner === 'player2',
                    winnerName: winner.name,
                    finalScore: gameRoom.players.player2.score,
                    opponentScore: gameRoom.players.player1.score,
                    reason: player2Reason
                });

                // Clean up game
                activeGames.delete(roomId);
                console.log(`Game ended in room ${roomId}. Winner: ${winner.name}`);
            }
        }
    });

    // Player disconnects
    socket.on('disconnect', () => {
        console.log('Player disconnected:', socket.id);

        const roomId = playerRooms.get(socket.id);

        // Remove from waiting list
        if (roomId && waitingPlayers.has(roomId)) {
            waitingPlayers.delete(roomId);
            console.log(`Player ${socket.id} removed from waiting list`);
        }

        // Handle active game disconnection
        if (roomId && activeGames.has(roomId)) {
            const gameRoom = activeGames.get(roomId);
            const opponent = gameRoom.getOpponent(socket.id);

            // Notify opponent that player disconnected
            if (opponent) {
                io.to(opponent.socketId).emit('opponent-disconnected');
            }

            activeGames.delete(roomId);
            console.log(`Player ${socket.id} disconnected from active game ${roomId}`);
        }

        playerRooms.delete(socket.id);
    });
});

// Serve the main HTML file
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'puzzle-game.html'));
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Crystal Grid multiplayer server running on port ${PORT}`);
    console.log(`Open http://localhost:${PORT} to play`);
    console.log(`Other devices can connect using your local IP address on port ${PORT}`);
});