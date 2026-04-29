import { WSCallbackRegistry } from './ws-callback-registry.js';
import type { RawMessageEditPayload, RawMessagePayload, RawAttachmentTranscodeUpdatePayload, RawPinPayload, PresenceState, PresenceUserPayload, RawReactionPayload, RawThreadPayload } from './ws-types.js';
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
export declare class FlyntlyWebSocketManager {
    private ws;
    private readonly subscribedChannels;
    private readonly pendingReadReceipts;
    private token;
    private isAuthenticated;
    private authTimeout;
    private reconnectTimeout;
    private presenceHeartbeatTimeout;
    private readonly messageQueue;
    private readonly callbacks;
    private readonly url;
    private readonly getTimezone;
    private readonly onServerMessage?;
    private readonly WebSocketImpl;
    private readonly logger;
    private presenceState;
    onReconnect: (() => void) | null;
    constructor(options: FlyntlyWebSocketManagerOptions);
    private log;
    connect(token: string): void;
    private handleOpen;
    private handleMessage;
    private handleClose;
    private sendJson;
    private handleAuthenticated;
    joinChannel(channelId: string): void;
    leaveChannel(channelId: string): void;
    sendMutation(channelId: string, update: string): void;
    markChannelAsRead(channelId: string, timestamp?: number): void;
    setPresenceState(state: PresenceState): void;
    private sendPresenceHeartbeat;
    private schedulePresenceHeartbeat;
    private stopPresenceHeartbeat;
    private installVisibilityPresenceListener;
    disconnect(): void;
    onUpdate(callback: (channelId: string) => void): () => void;
    onUnreadUpdate(callback: (channelId: string, count: number) => void): () => void;
    onChannelDeleted(callback: (channelId: string) => void): () => void;
    onWorkspaceAccessRevoked(callback: (orgId: string, replacementToken: string, replacementOrgId: string | null) => void): () => void;
    onMessage(callback: (channelId: string, message: RawMessagePayload) => void): () => void;
    onMessageEdit(callback: (channelId: string, message: RawMessageEditPayload) => void): () => void;
    onMessageDelete(callback: (channelId: string, messageId: string) => void): () => void;
    onThreadAdded(callback: (channelId: string, thread: RawThreadPayload) => void): () => void;
    onThreadEdited(callback: (channelId: string, thread: RawThreadPayload) => void): () => void;
    onThreadDeleted(callback: (channelId: string, threadId: string) => void): () => void;
    onReactionToggled(callback: (channelId: string, messageId: string, reactions: RawReactionPayload[]) => void): () => void;
    onMessagePinned(callback: (channelId: string, pin: RawPinPayload) => void): () => void;
    onMessageUnpinned(callback: (channelId: string, messageId: string) => void): () => void;
    onPresenceBatch(callback: (users: PresenceUserPayload[]) => void): () => void;
    onAttachmentTranscodeUpdated(callback: (channelId: string, attachment: RawAttachmentTranscodeUpdatePayload, messageIds: string[], threadReplyIds: string[], parentMessageIds: string[]) => void): () => void;
}
export declare function createFlyntlyWebSocketManager(options: FlyntlyWebSocketManagerOptions): FlyntlyWebSocketManager;
//# sourceMappingURL=ws-client.d.ts.map