import { WSCallbackRegistry } from './ws-callback-registry.js';
import type {
  RawMessageEditPayload,
  RawMessagePayload,
  RawAttachmentTranscodeUpdatePayload,
  RawPinPayload,
  PresenceState,
  PresenceUserPayload,
  RawReactionPayload,
  RawThreadPayload,
  WSMessageQueueItem,
} from './ws-types.js';

export interface FlyntlyWebSocketManagerOptions {
  url: string;
  getTimezone?: () => string;
  onServerMessage?: (eventData: string, context: {
    callbacks: WSCallbackRegistry;
    subscribedChannels: Set<string>;
  }) => void;
  WebSocketImpl?: typeof WebSocket;
  logger?: Pick<Console, 'info' | 'warn' | 'error'>;
}

function getDefaultTimezone(): string {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}

function isSocketOpen(ws: WebSocket | null): ws is WebSocket {
  return ws !== null && ws.readyState === WebSocket.OPEN;
}

export class FlyntlyWebSocketManager {
  private ws: WebSocket | null = null;
  private readonly subscribedChannels = new Set<string>();
  private readonly pendingReadReceipts = new Map<string, number>();
  private token: string | null = null;
  private isAuthenticated = false;
  private authTimeout: ReturnType<typeof setTimeout> | null = null;
  private reconnectTimeout: ReturnType<typeof setTimeout> | null = null;
  private presenceHeartbeatTimeout: ReturnType<typeof setTimeout> | null = null;
  private readonly messageQueue: WSMessageQueueItem[] = [];
  private readonly callbacks = new WSCallbackRegistry();
  private readonly url: string;
  private readonly getTimezone: () => string;
  private readonly onServerMessage?: FlyntlyWebSocketManagerOptions['onServerMessage'];
  private readonly WebSocketImpl: typeof WebSocket;
  private readonly logger: Pick<Console, 'info' | 'warn' | 'error'>;
  private presenceState: Extract<PresenceState, 'online' | 'away'> = 'online';
  public onReconnect: (() => void) | null = null;

  constructor(options: FlyntlyWebSocketManagerOptions) {
    this.url = options.url;
    this.getTimezone = options.getTimezone ?? getDefaultTimezone;
    this.onServerMessage = options.onServerMessage;
    this.WebSocketImpl = options.WebSocketImpl ?? WebSocket;
    this.logger = options.logger ?? console;
    this.installVisibilityPresenceListener();
  }

  private log(level: 'info' | 'warn' | 'error', message: string, extra?: Record<string, unknown>): void {
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

  connect(token: string): void {
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
    this.ws.onmessage = (event) => this.handleMessage(event as MessageEvent<string>);
    this.ws.onclose = (event) => this.handleClose(event);
    this.ws.onerror = (error) => {
      this.log('error', 'Socket error event fired', {
        errorType: error.type,
      });
    };
  }

  private handleOpen(): void {
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

  private handleMessage(event: MessageEvent<string>): void {
    if (typeof event.data !== 'string') {
      this.log('warn', 'Ignoring non-text message');
      return;
    }

    try {
      const parsed = JSON.parse(event.data) as { type?: string };
      if (parsed.type === 'authenticated') {
        this.handleAuthenticated();
      }
      if (isPresenceBatchMessage(parsed)) {
        this.callbacks.emit('presenceBatch', parsed.users);
      }
    } catch {
      // Ignore parse errors here and let the host message handler handle them.
    }

    this.onServerMessage?.(event.data, {
      callbacks: this.callbacks,
      subscribedChannels: this.subscribedChannels,
    });
  }

  private handleClose(event: CloseEvent): void {
    this.isAuthenticated = false;
    this.stopPresenceHeartbeat();

    if (this.authTimeout) {
      clearTimeout(this.authTimeout);
      this.authTimeout = null;
    }

    this.log(
      event.wasClean ? 'warn' : 'error',
      'Socket closed',
      {
        code: event.code,
        reason: event.reason || '(empty)',
        wasClean: event.wasClean,
      },
    );

    if (!this.token) {
      return;
    }

    if (
      event.code === 4003 ||
      event.reason === 'Workspace access revoked' ||
      event.code === 4001 ||
      event.reason === 'Session invalidated'
    ) {
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

  private sendJson(payload: object): void {
    if (!isSocketOpen(this.ws)) {
      return;
    }

    this.ws.send(JSON.stringify(payload));
  }

  private handleAuthenticated(): void {
    this.isAuthenticated = true;

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

  joinChannel(channelId: string): void {
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

  leaveChannel(channelId: string): void {
    this.subscribedChannels.delete(channelId);
  }

  sendMutation(channelId: string, update: string): void {
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

  markChannelAsRead(channelId: string, timestamp?: number): void {
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

  setPresenceState(state: PresenceState): void {
    const nextState = state === 'away' ? 'away' : 'online';
    if (this.presenceState === nextState) {
      return;
    }

    this.presenceState = nextState;
    this.sendPresenceHeartbeat();
  }

  private sendPresenceHeartbeat(): void {
    if (!isSocketOpen(this.ws) || !this.isAuthenticated) {
      return;
    }

    this.sendJson({
      type: 'presence-heartbeat',
      state: this.presenceState,
    });
  }

  private schedulePresenceHeartbeat(): void {
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

  private stopPresenceHeartbeat(): void {
    if (!this.presenceHeartbeatTimeout) {
      return;
    }

    clearTimeout(this.presenceHeartbeatTimeout);
    this.presenceHeartbeatTimeout = null;
  }

  private installVisibilityPresenceListener(): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.addEventListener('visibilitychange', () => {
      this.setPresenceState(document.visibilityState === 'hidden' ? 'away' : 'online');
    });
  }

  disconnect(): void {
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
    this.stopPresenceHeartbeat();
    this.subscribedChannels.clear();
    this.pendingReadReceipts.clear();

    if (this.ws) {
      this.log('info', 'Disconnecting socket');
      this.ws.close(1000, 'Client disconnect');
      this.ws = null;
    }
  }

  onUpdate(callback: (channelId: string) => void): () => void {
    return this.callbacks.subscribe('update', callback);
  }

  onUnreadUpdate(callback: (channelId: string, count: number) => void): () => void {
    return this.callbacks.subscribe('unread', callback);
  }

  onChannelDeleted(callback: (channelId: string) => void): () => void {
    return this.callbacks.subscribe('channelDeleted', callback);
  }

  onWorkspaceAccessRevoked(
    callback: (orgId: string, replacementToken: string, replacementOrgId: string | null) => void,
  ): () => void {
    return this.callbacks.subscribe('workspaceAccessRevoked', callback);
  }

  onMessage(callback: (channelId: string, message: RawMessagePayload) => void): () => void {
    return this.callbacks.subscribe('message', callback);
  }

  onMessageEdit(callback: (channelId: string, message: RawMessageEditPayload) => void): () => void {
    return this.callbacks.subscribe('messageEdit', callback);
  }

  onMessageDelete(callback: (channelId: string, messageId: string) => void): () => void {
    return this.callbacks.subscribe('messageDelete', callback);
  }

  onThreadAdded(callback: (channelId: string, thread: RawThreadPayload) => void): () => void {
    return this.callbacks.subscribe('threadAdded', callback);
  }

  onThreadEdited(callback: (channelId: string, thread: RawThreadPayload) => void): () => void {
    return this.callbacks.subscribe('threadEdited', callback);
  }

  onThreadDeleted(callback: (channelId: string, threadId: string) => void): () => void {
    return this.callbacks.subscribe('threadDeleted', callback);
  }

  onReactionToggled(
    callback: (channelId: string, messageId: string, reactions: RawReactionPayload[]) => void,
  ): () => void {
    return this.callbacks.subscribe('reactionToggled', callback);
  }

  onMessagePinned(callback: (channelId: string, pin: RawPinPayload) => void): () => void {
    return this.callbacks.subscribe('messagePinned', callback);
  }

  onMessageUnpinned(callback: (channelId: string, messageId: string) => void): () => void {
    return this.callbacks.subscribe('messageUnpinned', callback);
  }

  onPresenceBatch(callback: (users: PresenceUserPayload[]) => void): () => void {
    return this.callbacks.subscribe('presenceBatch', callback);
  }

  onAttachmentTranscodeUpdated(
    callback: (
      channelId: string,
      attachment: RawAttachmentTranscodeUpdatePayload,
      messageIds: string[],
      threadReplyIds: string[],
      parentMessageIds: string[],
    ) => void,
  ): () => void {
    return this.callbacks.subscribe('attachmentTranscodeUpdated', callback);
  }
}

export function createFlyntlyWebSocketManager(options: FlyntlyWebSocketManagerOptions): FlyntlyWebSocketManager {
  return new FlyntlyWebSocketManager(options);
}

function isPresenceBatchMessage(message: { type?: string }): message is { type: 'presence-batch'; users: PresenceUserPayload[] } {
  return message.type === 'presence-batch' && Array.isArray((message as { users?: unknown }).users);
}
