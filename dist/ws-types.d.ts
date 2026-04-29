export interface RawReactionPayload {
    emoji: string;
    count: number | string;
    userIds?: string[];
}
export interface RawMessagePayload {
    id: string;
    user_id: string;
    text: string;
    timestamp: number | string;
    message_seq?: number | string | null;
    messageSeq?: number | string | null;
    attachments?: unknown[];
    reactions_agg?: unknown[] | string;
    attachments_agg?: unknown[] | string;
    blocks?: unknown;
    is_bot?: boolean;
    poll_data?: unknown;
    pollData?: unknown;
    thread_count?: number | string;
    thread_participant_ids?: string[] | string;
    edited?: boolean;
    deleted?: boolean;
    [key: string]: unknown;
}
export interface RawMessageEditPayload {
    id: string;
    text: string;
}
export interface RawMessageUpdatePayload {
    messageId: string;
    blocks?: unknown;
    pollData?: {
        options?: Array<Record<string, unknown>>;
        [key: string]: unknown;
    };
    updated_at?: string;
}
export interface RawThreadPayload {
    id: string;
    parent_message_id: string;
    text: string;
    user_id: string;
    timestamp: number;
    edited?: boolean;
    deleted?: boolean;
    attachments?: unknown[];
}
export interface RawPinPayload {
    id: string;
    messageId: string;
    pinnedBy: string;
    pinnedAt: string;
}
export interface RawAttachmentTranscodeUpdatePayload {
    id: string;
    key?: string | null;
    transcodedUrl?: string | null;
    transcoded_url?: string | null;
    transcodedContentType?: string | null;
    transcoded_content_type?: string | null;
    transcodeStatus?: string | null;
    transcode_status?: string | null;
    transcodeError?: string | null;
    transcode_error?: string | null;
}
export type PresenceState = 'online' | 'away' | 'offline' | 'unknown';
export interface PresenceUserPayload {
    userId: string;
    presence: PresenceState;
    lastSeen?: number | null;
}
export interface WSMessageQueueItem {
    channelId: string;
    update: string;
}
export type WebSocketConnectionState = 'idle' | 'connecting' | 'authenticated' | 'reconnecting' | 'offline' | 'closed';
export interface WSEventCallbacks {
    update: (channelId: string) => void;
    unread: (channelId: string, count: number, lastMessageSeq?: number) => void;
    channelDeleted: (channelId: string) => void;
    workspaceAccessRevoked: (orgId: string, replacementToken: string, replacementOrgId: string | null) => void;
    message: (channelId: string, message: RawMessagePayload) => void;
    messageEdit: (channelId: string, message: RawMessageEditPayload) => void;
    messageDelete: (channelId: string, messageId: string) => void;
    threadAdded: (channelId: string, thread: RawThreadPayload) => void;
    threadEdited: (channelId: string, thread: RawThreadPayload) => void;
    threadDeleted: (channelId: string, threadId: string) => void;
    reactionToggled: (channelId: string, messageId: string, reactions: RawReactionPayload[]) => void;
    messagePinned: (channelId: string, pin: RawPinPayload) => void;
    messageUnpinned: (channelId: string, messageId: string) => void;
    presenceBatch: (users: PresenceUserPayload[]) => void;
    attachmentTranscodeUpdated: (channelId: string, attachment: RawAttachmentTranscodeUpdatePayload, messageIds: string[], threadReplyIds: string[], parentMessageIds: string[]) => void;
}
export type ServerMessage = {
    type: 'authenticated';
} | {
    type: 'unread-count-update';
    channelId: string;
    unreadCount: number;
    lastMessageSeq?: number;
} | {
    type: 'unread-count-batch';
    updates: Array<{
        channelId: string;
        unreadCount: number;
        lastMessageSeq?: number;
    }>;
} | {
    type: 'mark-read-ack';
    channelId: string;
    unreadCount: number;
    lastReadSeq?: number;
    timestamp?: number;
} | {
    type: 'channel-deleted';
    channelId: string;
} | {
    type: 'workspace-access-revoked';
    orgId: string;
    replacementToken: string;
    replacementOrgId: string | null;
    needsOrganization?: boolean;
} | {
    type: 'message';
    channelId: string;
    message: RawMessagePayload;
} | {
    type: 'message-edited';
    channelId: string;
    message: RawMessageEditPayload;
} | {
    type: 'message_updated';
    payload?: RawMessageUpdatePayload;
    messageId?: string;
    blocks?: unknown;
    pollData?: RawMessageUpdatePayload['pollData'];
} | {
    type: 'message-deleted';
    channelId: string;
    messageId: string;
} | {
    type: 'thread-added';
    channelId: string;
    thread: RawThreadPayload;
} | {
    type: 'thread-edited';
    channelId: string;
    thread: RawThreadPayload;
} | {
    type: 'thread-deleted';
    channelId: string;
    threadId: string;
} | {
    type: 'reaction-toggled';
    channelId: string;
    messageId: string;
    reactions: RawReactionPayload[];
} | {
    type: 'message-pinned';
    channelId: string;
    pin: RawPinPayload;
} | {
    type: 'message-unpinned';
    channelId: string;
    messageId: string;
} | {
    type: 'presence-batch';
    users: PresenceUserPayload[];
} | {
    type: 'attachment-transcode-updated';
    channelId: string;
    attachment: RawAttachmentTranscodeUpdatePayload;
    messageIds?: string[];
    threadReplyIds?: string[];
    parentMessageIds?: string[];
} | {
    type: 'joined';
    channelId?: string;
} | {
    type: 'error';
    error: string;
};
//# sourceMappingURL=ws-types.d.ts.map