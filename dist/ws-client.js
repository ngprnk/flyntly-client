import { WSCallbackRegistry } from './ws-callback-registry.js';
function getDefaultTimezone() {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
function isSocketOpen(ws) {
    return ws !== null && ws.readyState === WebSocket.OPEN;
}
export class FlyntlyWebSocketManager {
    ws = null;
    subscribedChannels = new Set();
    pendingReadReceipts = new Map();
    token = null;
    isAuthenticated = false;
    authTimeout = null;
    reconnectTimeout = null;
    messageQueue = [];
    callbacks = new WSCallbackRegistry();
    url;
    getTimezone;
    onServerMessage;
    WebSocketImpl;
    logger;
    onReconnect = null;
    constructor(options) {
        this.url = options.url;
        this.getTimezone = options.getTimezone ?? getDefaultTimezone;
        this.onServerMessage = options.onServerMessage;
        this.WebSocketImpl = options.WebSocketImpl ?? WebSocket;
        this.logger = options.logger ?? console;
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
        if (isSocketOpen(this.ws) && this.token === token) {
            return;
        }
        this.token = token;
        this.isAuthenticated = false;
        if (this.ws) {
            this.ws.close(1000, 'Reconnecting');
        }
        this.log('info', 'Connecting');
        this.ws = new this.WebSocketImpl(this.url);
        this.ws.onopen = () => this.handleOpen();
        this.ws.onmessage = (event) => this.handleMessage(event);
        this.ws.onclose = (event) => this.handleClose(event);
        this.ws.onerror = (error) => {
            this.log('error', 'Socket error event fired', {
                errorType: error.type,
            });
        };
    }
    handleOpen() {
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
    handleMessage(event) {
        if (typeof event.data !== 'string') {
            this.log('warn', 'Ignoring non-text message');
            return;
        }
        try {
            const parsed = JSON.parse(event.data);
            if (parsed.type === 'authenticated') {
                this.handleAuthenticated();
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
    handleClose(event) {
        this.isAuthenticated = false;
        if (this.authTimeout) {
            clearTimeout(this.authTimeout);
            this.authTimeout = null;
        }
        this.log(event.wasClean ? 'warn' : 'error', 'Socket closed', {
            code: event.code,
            reason: event.reason || '(empty)',
            wasClean: event.wasClean,
        });
        if (!this.token) {
            return;
        }
        if (event.code === 4003 ||
            event.reason === 'Workspace access revoked' ||
            event.code === 4001 ||
            event.reason === 'Session invalidated') {
            return;
        }
        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
        }
        this.log('warn', 'Scheduling reconnect', { delayMs: 3000 });
        this.reconnectTimeout = setTimeout(() => {
            if (this.token) {
                this.connect(this.token);
            }
        }, 3000);
    }
    sendJson(payload) {
        if (!isSocketOpen(this.ws)) {
            return;
        }
        this.ws.send(JSON.stringify(payload));
    }
    handleAuthenticated() {
        this.isAuthenticated = true;
        if (this.authTimeout) {
            clearTimeout(this.authTimeout);
            this.authTimeout = null;
        }
        this.log('info', 'Authenticated');
        for (const channelId of this.subscribedChannels) {
            this.joinChannel(channelId);
        }
        for (const [channelId, timestamp] of this.pendingReadReceipts) {
            this.sendJson({
                type: 'mark-read',
                channelId,
                timestamp,
            });
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
    markChannelAsRead(channelId, timestamp) {
        const resolvedTimestamp = timestamp || Date.now();
        if (!isSocketOpen(this.ws) || !this.isAuthenticated) {
            this.pendingReadReceipts.set(channelId, resolvedTimestamp);
            return;
        }
        this.sendJson({
            type: 'mark-read',
            channelId,
            timestamp: resolvedTimestamp,
        });
    }
    disconnect() {
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
        this.subscribedChannels.clear();
        this.pendingReadReceipts.clear();
        if (this.ws) {
            this.log('info', 'Disconnecting socket');
            this.ws.close(1000, 'Client disconnect');
            this.ws = null;
        }
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
    onAttachmentTranscodeUpdated(callback) {
        return this.callbacks.subscribe('attachmentTranscodeUpdated', callback);
    }
}
export function createFlyntlyWebSocketManager(options) {
    return new FlyntlyWebSocketManager(options);
}
//# sourceMappingURL=ws-client.js.map