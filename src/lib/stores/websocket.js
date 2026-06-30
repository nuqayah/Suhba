import { writable } from 'svelte/store';
// WebSocket connection state
export const connectionState = writable({
    connected: false,
    connecting: false,
    error: null
});
// Room state
export const roomState = writable({
    roomId: null,
    isHost: false,
    playerCount: 0,
    gameStarted: false,
    quizData: null,
    players: [],
    gameType: null,
    gameId: null
});
// Messages store for real-time updates
export const messages = writable([]);
class WebSocketManager {
    ws = null;
    reconnectAttempts = 0;
    maxReconnectAttempts = 5;
    reconnectDelay = 1000;
    messageQueue = [];
    connectionPromise = null;
    connect(url = 'ws://localhost:3005/api') {
        if (this.ws?.readyState === WebSocket.OPEN) {
            return Promise.resolve();
        }
        if (this.connectionPromise) {
            return this.connectionPromise;
        }
        connectionState.update(state => ({ ...state, connecting: true, error: null }));
        this.connectionPromise = new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(url);
                this.ws.onopen = () => {
                    console.log('WebSocket connected');
                    connectionState.update(state => ({
                        ...state,
                        connected: true,
                        connecting: false,
                        error: null
                    }));
                    this.reconnectAttempts = 0;
                    this.connectionPromise = null;
                    // Process any queued messages
                    this.processMessageQueue();
                    resolve();
                };
                this.ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        this.handleMessage(message);
                    }
                    catch (error) {
                        console.error('Failed to parse WebSocket message:', error);
                    }
                };
                this.ws.onclose = () => {
                    console.log('WebSocket disconnected');
                    connectionState.update(state => ({
                        ...state,
                        connected: false,
                        connecting: false
                    }));
                    this.attemptReconnect();
                };
                this.ws.onerror = (error) => {
                    console.error('❌ WebSocket error:', error);
                    console.error('❌ WebSocket URL was:', url);
                    // Provide more user-friendly error messages
                    let errorMessage = 'Connection failed';
                    if (url.includes('localhost')) {
                        errorMessage = 'Server not running - Please start the backend server';
                    }
                    else if (!navigator.onLine) {
                        errorMessage = 'No internet connection';
                    }
                    else {
                        errorMessage = 'Unable to connect to game server';
                    }
                    connectionState.update(state => ({
                        ...state,
                        error: errorMessage,
                        connecting: false
                    }));
                    this.connectionPromise = null;
                    reject(new Error('WebSocket connection failed'));
                };
            }
            catch (error) {
                console.error('Failed to create WebSocket connection:', error);
                connectionState.update(state => ({
                    ...state,
                    error: 'Failed to connect',
                    connecting: false
                }));
                this.connectionPromise = null;
                reject(error);
            }
        });
        return this.connectionPromise;
    }
    handleMessage(message) {
        console.log('📨 WebSocket received:', message.type, message);
        // Add message to store
        messages.update(msgs => [...msgs, message]);
        // Handle specific message types
        switch (message.type) {
            case 'quiz_data':
                console.log('📊 Quiz data received (ignoring - waiting for manual start):', message);
                roomState.update(state => ({
                    ...state,
                    quizData: message.data
                    // Don't set gameStarted=true here - only from game_started message
                }));
                break;
            case 'joined':
                roomState.update(state => {
                    const newPlayerCount = message.player_count || state.playerCount + 1;
                    const newPlayers = generatePlayerNames(newPlayerCount);
                    console.log('👥 Player joined - updating count to:', newPlayerCount, 'players:', newPlayers);
                    return {
                        ...state,
                        playerCount: newPlayerCount,
                        players: newPlayers
                    };
                });
                break;
            case 'left':
                roomState.update(state => {
                    const newPlayerCount = message.player_count || Math.max(0, state.playerCount - 1);
                    const newPlayers = generatePlayerNames(newPlayerCount);
                    return {
                        ...state,
                        playerCount: newPlayerCount,
                        players: newPlayers
                    };
                });
                break;
            case 'error':
                console.error('WebSocket error:', message.details);
                connectionState.update(state => ({
                    ...state,
                    error: message.details || 'An error occurred'
                }));
                break;
            case 'game_started':
                // Handle game start broadcast from host
                console.log('🎮 GAME_STARTED message received:', message);
                roomState.update(state => {
                    console.log('🎮 Updating roomState with gameStarted=true, gameId=', message.game_id);
                    return {
                        ...state,
                        gameStarted: true,
                        gameType: message.game_type,
                        gameId: message.game_id
                    };
                });
                break;
            case 'answer_selected':
                console.log('📝 Answer selected by player:', message);
                // Let the frontend handle this in the effect
                break;
            case 'next_question':
                console.log('➡️ Moving to next question:', message);
                // Let the frontend handle this in the effect
                break;
            case 'active':
                // Handle active rooms list if needed
                console.log('Active rooms:', message);
                break;
        }
    }
    attemptReconnect() {
        if (this.reconnectAttempts < this.maxReconnectAttempts) {
            this.reconnectAttempts++;
            console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
            setTimeout(() => {
                this.connect();
            }, this.reconnectDelay * this.reconnectAttempts);
        }
    }
    send(message) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
        }
        else {
            console.log('WebSocket not ready, queuing message:', message);
            this.messageQueue.push(message);
        }
    }
    processMessageQueue() {
        while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
            const message = this.messageQueue.shift();
            if (message) {
                console.log('Processing queued message:', message);
                this.ws.send(JSON.stringify(message));
            }
        }
    }
    // Specific game actions
    async createRoom(roomId, quizType, open = true) {
        await this.connect();
        this.send({
            type: 'join',
            room_id: roomId,
            quiz_type: quizType,
            open: open
        });
        roomState.update(state => ({
            ...state,
            roomId,
            isHost: true
        }));
    }
    async joinRoom(roomId, quizType) {
        await this.connect();
        this.send({
            type: 'join',
            room_id: roomId,
            quiz_type: quizType,
            open: false
        });
        roomState.update(state => ({
            ...state,
            roomId,
            isHost: false
        }));
    }
    leaveRoom(roomId) {
        this.send({
            type: 'leave',
            room_id: roomId
        });
        roomState.update(state => ({
            roomId: null,
            isHost: false,
            playerCount: 0,
            gameStarted: false,
            quizData: null,
            players: [],
            gameType: null,
            gameId: null
        }));
    }
    answerQuestion(roomId) {
        this.send({
            type: 'answered',
            room_id: roomId
        });
    }
    startGame(roomId, gameType, gameId) {
        this.send({
            type: 'start_game',
            room_id: roomId,
            game_type: gameType,
            game_id: gameId
        });
    }
    endGame(roomId) {
        this.send({
            type: 'ended',
            room_id: roomId
        });
    }
    getActiveRooms() {
        this.send({
            type: 'get_active'
        });
    }
    resetGameStarted() {
        roomState.update(state => ({
            ...state,
            gameStarted: false
        }));
    }
    selectAnswer(roomId, answerIndex, isCorrect, currentPlayer, playerName) {
        this.send({
            type: 'answer_selected',
            room_id: roomId,
            answer_index: answerIndex,
            is_correct: isCorrect,
            current_player: currentPlayer,
            player_name: playerName
        });
    }
    nextQuestion(roomId, nextPlayer, questionIndex) {
        this.send({
            type: 'next_question',
            room_id: roomId,
            next_player: nextPlayer,
            question_index: questionIndex
        });
    }
    disconnect() {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
        connectionState.update(() => ({
            connected: false,
            connecting: false,
            error: null
        }));
    }
}
// Helper function to generate proper player names
function generatePlayerNames(playerCount) {
    const players = [];
    for (let i = 0; i < playerCount; i++) {
        if (i === 0) {
            players.push('Host');
        }
        else {
            players.push(`Player ${i + 1}`);
        }
    }
    return players;
}
// Export singleton instance
export const wsManager = new WebSocketManager();
// Convenience functions
export function connectToBackend() {
    wsManager.connect();
}
export function disconnectFromBackend() {
    wsManager.disconnect();
}
