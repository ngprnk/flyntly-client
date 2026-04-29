import { WSCallbackRegistry } from './ws-callback-registry.js';
function getDefaultTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
function isSocketOpen(ws) {
    return ws !== null && ws.readyState === WebSocket.OPEN;
}
function isSocketConnecting(ws) {
    return ws !== null && ws.readyState === WebSocket.CONNECTING;
}
function normalizeReadReceipt(input) {
    if (typeof input === 'number') {
        return { timestamp: input };
    }
    return {
        timestamp: input?.timestamp ?? Date.now(),
        lastReadSeq: input?.lastReadSeq,
    };
}
function shouldReplaceReadReceipt(current, next) {
    if (!current) {
        return true;
    }
    if (typeof current.lastReadSeq === 'number' && typeof next.lastReadSeq === 'number') {
        return next.lastReadSeq >= current.lastReadSeq;
    }
    if (typeof next.lastReadSeq === 'number') {
        return true;
    }
    if (typeof current.lastReadSeq === 'number') {
        return false;
    }
    return next.timestamp >= current.timestamp;
}
function createMarkReadPayload(channelId, receipt) {
    return {
        type: 'mark-read',
        channelId,
        timestamp: receipt.timestamp,
        ...(typeof receipt.lastReadSeq === 'number' ? { lastReadSeq: receipt.lastReadSeq } : {}),
    };
}
export class FlyntlyWebSocketManager {
    ws = null;
    subscribedChannels = new Set();
    pendingReadReceipts = new Map();
    token = null;
    isAuthenticated = false;
    authTimeout = null;
    reconnectTimeout = null;
    presenceHeartbeatTimeout = null;
    messageQueue = [];
    callbacks = new WSCallbackRegistry();
    url;
    getTimezone;
    onServerMessage;
    WebSocketImpl;
    logger;
    onConnectionStateChange;
    presenceState = 'online';
    connectionState = 'idle';
    connectionGeneration = 0;
    reconnectAttempt = 0;
    manuallyDisconnected = false;
    lastNetworkReconnectAt = 0;
    onReconnect = null;
    constructor(options) {
        this.url = options.url;
        this.getTimezone = options.getTimezone ?? getDefaultTimezone;
        this.onServerMessage = options.onServerMessage;
        this.WebSocketImpl = options.WebSocketImpl ?? WebSocket;
        this.logger = options.logger ?? console;
        this.onConnectionStateChange = options.onConnectionStateChange;
        this.installVisibilityPresenceListener();
        this.installBrowserNetworkListeners();
    }
    log(level, message, extra) {
        this.logger[level](`[WS] ${message}`, {
            url: this.url,
            readyState: this.ws?.readyState ?? null,
            authenticated: this.isAuthenticated,
            subscribedChannels: this.subscribedChannels.size,
            queuedMutations: this.messageQueue.length,
            pendingReadReceipts: this.pendingReadReceipts.size,
            online: typeof navigator !== 'undefined' ? navigator.onLine : undefined,
            visibilityState: typeof document !== 'undefined' ? document.visibilityState : undefined,
            ...extra,
        });
    }
    connect(token) {
        if ((isSocketOpen(this.ws) || isSocketConnecting(this.ws)) && this.token === token) {
            return;
        }
        this.token = token;
        this.manuallyDisconnected = false;
        this.isAuthenticated = false;
        this.connectionGeneration += 1;
        const generation = this.connectionGeneration;
        if (this.ws) {
            this.ws.close(1000, 'Reconnecting');
        }
        this.setConnectionState(this.reconnectAttempt > 0 ? 'reconnecting' : 'connecting');
        this.log('info', 'Connecting');
        this.ws = new this.WebSocketImpl(this.url);
        this.ws.onopen = () => this.handleOpen(generation);
        this.ws.onmessage = (event) => this.handleMessage(generation, event);
        this.ws.onclose = (event) => this.handleClose(generation, event);
        this.ws.onerror = (error) => {
            this.log('error', 'Socket error event fired', {
                errorType: error.type,
            });
        };
    }
    handleOpen(generation) {
        if (generation !== this.connectionGeneration) {
            return;
        }
        this.log('info', 'Socket open');
        if (this.authTimeout) {
            clearTimeout(this.authTimeout);
        }
        this.authTimeout = setTimeout(() => {
            if (!this.isAuthenticated) {
                this.log('error', 'Authentication handshake timed out');
            }
        }, 8000);
        if (this.token) {
            this.sendJson({
                type: 'auth',
                token: this.token,
                timezone: this.getTimezone(),
            });
        }
    }
    handleMessage(generation, event) {
        if (generation !== this.connectionGeneration) {
            return;
        }
        if (typeof event.data !== 'string') {
            this.log('warn', 'Ignoring non-text message');
            return;
        }
        try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === 'authenticated') {
                this.handleAuthenticated();
            }
            if (isPresenceBatchMessage(parsed)) {
                this.callbacks.emit('presenceBatch', parsed.users);
            }
        }
        catch {
            // Ignore parse errors here and let the host message handler handle them.
        }
        this.onServerMessage?.(event.data, {
            callbacks: this.callbacks,
            subscribedChannels: this.subscribedChannels,
        });
    }
    handleClose(generation, event) {
        if (generation !== this.connectionGeneration) {
            return;
        }
        this.isAuthenticated = false;
        this.stopPresenceHeartbeat();
        if (this.authTimeout) {
            clearTimeout(this.authTimeout);
            this.authTimeout = null;
        }
        this.log(event.wasClean ? 'warn' : 'error', 'Socket closed', {
            code: event.code,
            reason: event.reason || '(empty)',
            wasClean: event.wasClean,
        });
        if (!this.token || this.manuallyDisconnected) {
            this.setConnectionState('closed');
            return;
        }
        if (event.code === 4003 ||
            event.reason === 'Workspace access revoked' ||
            event.code === 4001 ||
            event.reason === 'Session invalidated') {
            this.setConnectionState('closed');
            return;
        }
        this.scheduleReconnect('socket-close');
    }
    sendJson(payload) {
        if (!isSocketOpen(this.ws)) {
            return;
        }
        this.ws.send(JSON.stringify(payload));
    }
    setConnectionState(state) {
        if (this.connectionState === state) {
            return;
        }
        this.connectionState = state;
        this.onConnectionStateChange?.(state);
    }
    scheduleReconnect(reason) {
        if (!this.token || this.manuallyDisconnected) {
            return;
        }
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        if (typeof navigator !== 'undefined' && navigator.onLine === false) {
            this.setConnectionState('offline');
            this.log('warn', 'Deferring reconnect while browser is offline', { reason });
            return;
        }
        this.reconnectAttempt += 1;
        const exponentialDelay = Math.min(15_000, 1_000 * 2 ** Math.min(this.reconnectAttempt - 1, 4));
        const jitterMs = Math.floor(Math.random() * 500);
        const delayMs = exponentialDelay + jitterMs;
        this.setConnectionState('reconnecting');
        this.log('warn', 'Scheduling reconnect', { delayMs, reason, attempt: this.reconnectAttempt });
        this.reconnectTimeout = setTimeout(() => {
            this.reconnectTimeout = null;
            if (this.token && !this.manuallyDisconnected) {
                this.connect(this.token);
            }
        }, delayMs);
    }
    reconnectNow(reason = 'manual') {
        if (!this.token || this.manuallyDisconnected) {
            return;
        }
        const now = Date.now();
        if (reason !== 'manual' && now - this.lastNetworkReconnectAt < 750) {
            return;
        }
        this.lastNetworkReconnectAt = now;
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        this.reconnectAttempt = 0;
        this.connectionGeneration += 1;
        this.isAuthenticated = false;
        this.stopPresenceHeartbeat();
        if (this.ws) {
            this.ws.close(1000, `Reconnect: ${reason}`);
            this.ws = null;
        }
        this.setConnectionState('connecting');
        this.connect(this.token);
    }
    handleAuthenticated() {
        this.isAuthenticated = true;
        this.reconnectAttempt = 0;
        this.setConnectionState('authenticated');
        if (this.authTimeout) {
            clearTimeout(this.authTimeout);
            this.authTimeout = null;
        }
        this.log('info', 'Authenticated');
        this.sendPresenceHeartbeat();
        this.schedulePresenceHeartbeat();
        for (const channelId of this.subscribedChannels) {
            this.joinChannel(channelId);
        }
        for (const [channelId, receipt] of this.pendingReadReceipts) {
            this.sendJson(createMarkReadPayload(channelId, receipt));
        }
        this.pendingReadReceipts.clear();
        while (this.messageQueue.length > 0) {
            const queuedMessage = this.messageQueue.shift();
            if (queuedMessage) {
                this.sendMutation(queuedMessage.channelId, queuedMessage.update);
            }
        }
        this.onReconnect?.();
    }
    joinChannel(channelId) {
        this.subscribedChannels.add(channelId);
        if (isSocketOpen(this.ws) && this.isAuthenticated && this.token) {
            this.sendJson({
                type: 'join',
                channelId,
                token: this.token,
                timezone: this.getTimezone(),
            });
        }
    }
    leaveChannel(channelId) {
        this.subscribedChannels.delete(channelId);
    }
    sendMutation(channelId, update) {
        if (isSocketOpen(this.ws) && this.isAuthenticated) {
            this.sendJson({
                type: 'mutation',
                channelId,
                update,
            });
            return;
        }
        this.log('warn', 'Not connected, queueing mutation');
        this.messageQueue.push({ channelId, update });
    }
    markChannelAsRead(channelId, input) {
        const receipt = normalizeReadReceipt(input);
        if (!isSocketOpen(this.ws) || !this.isAuthenticated) {
            if (shouldReplaceReadReceipt(this.pendingReadReceipts.get(channelId), receipt)) {
                this.pendingReadReceipts.set(channelId, receipt);
            }
            return;
        }
        this.sendJson(createMarkReadPayload(channelId, receipt));
    }
    setPresenceState(state) {
        const nextState = state === 'away' ? 'away' : 'online';
        if (this.presenceState === nextState) {
            return;
        }
        this.presenceState = nextState;
        this.sendPresenceHeartbeat();
    }
    sendPresenceHeartbeat() {
        if (!isSocketOpen(this.ws) || !this.isAuthenticated) {
            return;
        }
        this.sendJson({
            type: 'presence-heartbeat',
            state: this.presenceState,
        });
    }
    schedulePresenceHeartbeat() {
        this.stopPresenceHeartbeat();
        const delayMs = 25_000 + Math.floor(Math.random() * 10_000);
        this.presenceHeartbeatTimeout = setTimeout(() => {
            this.presenceHeartbeatTimeout = null;
            this.sendPresenceHeartbeat();
            if (this.isAuthenticated) {
                this.schedulePresenceHeartbeat();
            }
        }, delayMs);
    }
    stopPresenceHeartbeat() {
        if (!this.presenceHeartbeatTimeout) {
            return;
        }
        clearTimeout(this.presenceHeartbeatTimeout);
        this.presenceHeartbeatTimeout = null;
    }
    installVisibilityPresenceListener() {
        if (typeof document === 'undefined') {
            return;
        }
        document.addEventListener('visibilitychange', () => {
            this.setPresenceState(document.visibilityState === 'hidden' ? 'away' : 'online');
        });
    }
    installBrowserNetworkListeners() {
        if (typeof window === 'undefined' ||
            typeof window.addEventListener !== 'function') {
            return;
        }
        window.addEventListener('online', () => {
            this.reconnectNow('browser-online');
        });
        window.addEventListener('offline', () => {
            this.setConnectionState('offline');
        });
    }
    disconnect() {
        this.manuallyDisconnected = true;
        this.connectionGeneration += 1;
        if (this.authTimeout) {
            clearTimeout(this.authTimeout);
            this.authTimeout = null;
        }
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
        this.token = null;
        this.isAuthenticated = false;
        this.reconnectAttempt = 0;
        this.stopPresenceHeartbeat();
        this.subscribedChannels.clear();
        this.pendingReadReceipts.clear();
        if (this.ws) {
            this.log('info', 'Disconnecting socket');
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }
        this.setConnectionState('closed');
    }
    onUpdate(callback) {
        return this.callbacks.subscribe('update', callback);
    }
    onUnreadUpdate(callback) {
        return this.callbacks.subscribe('unread', callback);
    }
    onChannelDeleted(callback) {
        return this.callbacks.subscribe('channelDeleted', callback);
    }
    onWorkspaceAccessRevoked(callback) {
        return this.callbacks.subscribe('workspaceAccessRevoked', callback);
    }
    onMessage(callback) {
        return this.callbacks.subscribe('message', callback);
    }
    onMessageEdit(callback) {
        return this.callbacks.subscribe('messageEdit', callback);
    }
    onMessageDelete(callback) {
        return this.callbacks.subscribe('messageDelete', callback);
    }
    onThreadAdded(callback) {
        return this.callbacks.subscribe('threadAdded', callback);
    }
    onThreadEdited(callback) {
        return this.callbacks.subscribe('threadEdited', callback);
    }
    onThreadDeleted(callback) {
        return this.callbacks.subscribe('threadDeleted', callback);
    }
    onReactionToggled(callback) {
        return this.callbacks.subscribe('reactionToggled', callback);
    }
    onMessagePinned(callback) {
        return this.callbacks.subscribe('messagePinned', callback);
    }
    onMessageUnpinned(callback) {
        return this.callbacks.subscribe('messageUnpinned', callback);
    }
    onPresenceBatch(callback) {
        return this.callbacks.subscribe('presenceBatch', callback);
    }
    onAttachmentTranscodeUpdated(callback) {
        return this.callbacks.subscribe('attachmentTranscodeUpdated', callback);
    }
}
export function createFlyntlyWebSocketManager(options) {
    return new FlyntlyWebSocketManager(options);
}
function isPresenceBatchMessage(message) {
    return message.type === 'presence-batch' && Array.isArray(message.users);
}
//# sourceMappingURL=ws-client.js.map