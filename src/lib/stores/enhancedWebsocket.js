// Enhanced WebSocket Manager for Suhba Islamic Trivia
import { writable, derived } from 'svelte/store';
import { toastManager } from './toast.js';
// Stores
export const connectionState = writable({
    connected: false,
    connecting: false,
    reconnecting: false,
    error: null,
    latency: 0,
    quality: 'disconnected'
});
export const currentRoom = writable(null);
export const currentPlayer = writable(null);
export const realtimeMessages = writable([]);
// Derived stores for UI
export const connectedPlayers = derived(currentRoom, ($room) => $room?.players.filter(p => p.connected) || []);
export const isHost = derived([currentRoom, currentPlayer], ([$room, $player]) => $room && $player ? $player.isHost : false);
export const gameInProgress = derived(currentRoom, ($room) => $room?.gameState.phase !== 'waiting');
class EnhancedWebSocketManager {
    ws = null;
    reconnectAttempts = 0;
    maxReconnectAttempts = 10;
    reconnectDelay = 1000;
    heartbeatInterval = null;
    latencyCheckInterval = null;
    messageQueue = [];
    pendingAcks = new Map();
    async connect(url = 'ws://localhost:3005') {
        if (this.ws?.readyState === WebSocket.OPEN) {
            return Promise.resolve();
        }
        connectionState.update(state => ({
            ...state,
            connecting: true,
            error: null
        }));
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(url);
                const connectTimeout = setTimeout(() => {
                    this.ws?.close();
                    reject(new Error('Connection timeout'));
                }, 10000);
                this.ws.onopen = () => {
                    clearTimeout(connectTimeout);
                    console.log('🕌 Enhanced Suhba WebSocket connected');
                    connectionState.update(state => ({
                        ...state,
                        connected: true,
                        connecting: false,
                        reconnecting: false,
                        error: null,
                        quality: 'excellent'
                    }));
                    this.reconnectAttempts = 0;
                    this.startHeartbeat();
                    this.startLatencyCheck();
                    this.processMessageQueue();
                    resolve();
                };
                this.ws.onmessage = (event) => {
                    try {
                        const message = JSON.parse(event.data);
                        this.handleMessage(message);
                    }
                    catch (error) {
                        console.error('❌ Failed to parse message:', error);
                    }
                };
                this.ws.onclose = (event) => {
                    clearTimeout(connectTimeout);
                    console.log('🔌 WebSocket disconnected:', event.code, event.reason);
                    connectionState.update(state => ({
                        ...state,
                        connected: false,
                        connecting: false,
                        quality: 'disconnected'
                    }));
                    this.stopHeartbeat();
                    this.stopLatencyCheck();
                    if (event.code !== 1000) { // Not a normal closure
                        this.attemptReconnect();
                    }
                };
                this.ws.onerror = (error) => {
                    clearTimeout(connectTimeout);
                    console.error('❌ WebSocket error:', error);
                    connectionState.update(state => ({
                        ...state,
                        error: this.getErrorMessage(url),
                        connecting: false,
                        quality: 'disconnected'
                    }));
                    reject(error);
                };
            }
            catch (error) {
                connectionState.update(state => ({
                    ...state,
                    error: 'Failed to create connection',
                    connecting: false
                }));
                reject(error);
            }
        });
    }
    handleMessage(message) {
        console.log('📨 Received:', message.type);
        // Handle acknowledgments
        if (message.type === 'ack' && message.data?.messageId) {
            const pending = this.pendingAcks.get(message.data.messageId);
            if (pending) {
                clearTimeout(pending.timeout);
                pending.resolve(message);
                this.pendingAcks.delete(message.data.messageId);
            }
            return;
        }
        // Handle heartbeat response
        if (message.type === 'pong') {
            this.updateLatency(message.timestamp);
            return;
        }
        // Update message store
        realtimeMessages.update(msgs => [...msgs.slice(-50), message]); // Keep last 50 messages
        // Handle game-specific messages
        switch (message.type) {
            case 'room_joined':
                this.handleRoomJoined(message);
                break;
            case 'player_joined':
                this.handlePlayerJoined(message);
                break;
            case 'player_left':
                this.handlePlayerLeft(message);
                break;
            case 'game_started':
                this.handleGameStarted(message);
                break;
            case 'question_started':
                this.handleQuestionStarted(message);
                break;
            case 'answer_submitted':
                this.handleAnswerSubmitted(message);
                break;
            case 'question_ended':
                this.handleQuestionEnded(message);
                break;
            case 'game_ended':
                this.handleGameEnded(message);
                break;
            case 'player_typing':
                this.handlePlayerTyping(message);
                break;
            case 'room_settings_changed':
                this.handleRoomSettingsChanged(message);
                break;
            case 'error':
                this.handleError(message);
                break;
            default:
                console.log('🤷 Unhandled message type:', message.type);
        }
    }
    // Enhanced message sending with acknowledgments
    async sendMessage(type, data = {}, requireAck = false) {
        const message = {
            type,
            timestamp: Date.now(),
            messageId: this.generateMessageId(),
            data,
            playerId: this.getCurrentPlayerId()
        };
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify(message));
            if (requireAck) {
                return this.waitForAck(message.messageId);
            }
        }
        else {
            // Queue message for when connection is restored
            this.messageQueue.push(message);
            console.log('📝 Message queued (disconnected):', type);
        }
    }
    // Game-specific methods
    async createRoom(gameType, settings) {
        try {
            const response = await this.sendMessage('create_room', {
                gameType,
                settings,
                playerName: this.getPlayerName()
            }, true);
            toastManager.success('🏠 Room created successfully!');
        }
        catch (error) {
            toastManager.error('❌ Failed to create room');
            throw error;
        }
    }
    async joinRoom(roomCode, playerName) {
        try {
            await this.sendMessage('join_room', {
                roomCode,
                playerName
            }, true);
            toastManager.success(`🎮 Joined room ${roomCode}!`);
        }
        catch (error) {
            toastManager.error('❌ Failed to join room');
            throw error;
        }
    }
    async startGame() {
        await this.sendMessage('start_game', {}, true);
    }
    async submitAnswer(questionId, answer) {
        await this.sendMessage('submit_answer', {
            questionId,
            answer,
            timestamp: Date.now()
        });
    }
    async sendTypingIndicator(isTyping) {
        await this.sendMessage('typing', { isTyping });
    }
    async leaveRoom() {
        await this.sendMessage('leave_room');
        currentRoom.set(null);
    }
    // Connection management
    attemptReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            connectionState.update(state => ({
                ...state,
                error: 'Connection lost - please refresh to reconnect'
            }));
            return;
        }
        this.reconnectAttempts++;
        connectionState.update(state => ({
            ...state,
            reconnecting: true,
            error: `Reconnecting... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
        }));
        setTimeout(() => {
            this.connect().catch(() => {
                // Will retry automatically
            });
        }, this.reconnectDelay * this.reconnectAttempts);
    }
    startHeartbeat() {
        this.heartbeatInterval = window.setInterval(() => {
            this.sendMessage('ping', { timestamp: Date.now() });
        }, 30000); // Every 30 seconds
    }
    stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
    }
    startLatencyCheck() {
        this.latencyCheckInterval = window.setInterval(() => {
            this.sendMessage('ping', { timestamp: Date.now() });
        }, 5000); // Every 5 seconds
    }
    stopLatencyCheck() {
        if (this.latencyCheckInterval) {
            clearInterval(this.latencyCheckInterval);
            this.latencyCheckInterval = null;
        }
    }
    updateLatency(serverTimestamp) {
        const latency = Date.now() - serverTimestamp;
        let quality = 'excellent';
        if (latency > 500)
            quality = 'poor';
        else if (latency > 200)
            quality = 'fair';
        else if (latency > 100)
            quality = 'good';
        connectionState.update(state => ({
            ...state,
            latency,
            quality
        }));
    }
    // Message handlers
    handleRoomJoined(message) {
        currentRoom.set(message.data.room);
        currentPlayer.set(message.data.player);
        toastManager.success('🎮 Successfully joined the Suhba!');
    }
    handlePlayerJoined(message) {
        currentRoom.update(room => {
            if (!room)
                return room;
            return {
                ...room,
                players: [...room.players, message.data.player]
            };
        });
        toastManager.info(`👋 ${message.data.player.name} joined the Suhba`);
    }
    handlePlayerLeft(message) {
        currentRoom.update(room => {
            if (!room)
                return room;
            return {
                ...room,
                players: room.players.filter(p => p.id !== message.data.playerId)
            };
        });
        toastManager.info(`👋 ${message.data.playerName} left the Suhba`);
    }
    handleGameStarted(message) {
        currentRoom.update(room => {
            if (!room)
                return room;
            return {
                ...room,
                gameState: {
                    ...room.gameState,
                    phase: 'question',
                    currentQuestion: 0,
                    questionStartTime: Date.now()
                }
            };
        });
        toastManager.success('🎯 Game started! May Allah bless this Suhba');
    }
    handleQuestionStarted(message) {
        currentRoom.update(room => {
            if (!room)
                return room;
            return {
                ...room,
                gameState: {
                    ...room.gameState,
                    phase: 'question',
                    currentQuestion: message.data.questionNumber,
                    questionStartTime: Date.now(),
                    answers: {}
                }
            };
        });
    }
    handleAnswerSubmitted(message) {
        currentRoom.update(room => {
            if (!room)
                return room;
            return {
                ...room,
                gameState: {
                    ...room.gameState,
                    answers: {
                        ...room.gameState.answers,
                        [message.data.playerId]: message.data.answer
                    }
                }
            };
        });
    }
    handleQuestionEnded(message) {
        currentRoom.update(room => {
            if (!room)
                return room;
            return {
                ...room,
                gameState: {
                    ...room.gameState,
                    phase: 'results',
                    scores: message.data.scores
                }
            };
        });
    }
    handleGameEnded(message) {
        currentRoom.update(room => {
            if (!room)
                return room;
            return {
                ...room,
                gameState: {
                    ...room.gameState,
                    phase: 'finished'
                }
            };
        });
        toastManager.success('🏆 Game completed! Barakallahu feekum');
    }
    handlePlayerTyping(message) {
        // Handle typing indicators for chat or answer input
        console.log(`✍️ ${message.data.playerName} is typing...`);
    }
    handleRoomSettingsChanged(message) {
        currentRoom.update(room => {
            if (!room)
                return room;
            return {
                ...room,
                settings: { ...room.settings, ...message.data.settings }
            };
        });
    }
    handleError(message) {
        toastManager.error(message.data.message || 'An error occurred');
        console.error('🚨 Server error:', message.data);
    }
    // Utility methods
    generateMessageId() {
        return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    getCurrentPlayerId() {
        // This would get the current player ID from your app state
        return 'player_' + Math.random().toString(36).substr(2, 9);
    }
    getPlayerName() {
        return localStorage.getItem('suhba-player-name') || 'Anonymous';
    }
    getErrorMessage(url) {
        if (url.includes('localhost')) {
            return '🔧 Backend server not running - Please start the multiplayer server';
        }
        else if (!navigator.onLine) {
            return '📡 No internet connection';
        }
        else {
            return '🔌 Unable to connect to game server';
        }
    }
    async waitForAck(messageId) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                this.pendingAcks.delete(messageId);
                reject(new Error('Message acknowledgment timeout'));
            }, 10000);
            this.pendingAcks.set(messageId, { resolve, reject, timeout });
        });
    }
    processMessageQueue() {
        while (this.messageQueue.length > 0 && this.ws?.readyState === WebSocket.OPEN) {
            const message = this.messageQueue.shift();
            if (message) {
                this.ws.send(JSON.stringify(message));
            }
        }
    }
    disconnect() {
        this.stopHeartbeat();
        this.stopLatencyCheck();
        if (this.ws) {
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }
        connectionState.update(state => ({
            ...state,
            connected: false,
            connecting: false,
            reconnecting: false,
            quality: 'disconnected'
        }));
    }
}
// Export singleton instance
export const enhancedWsManager = new EnhancedWebSocketManager();
