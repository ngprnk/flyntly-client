import type { BuildUrlArg } from './url.js';
export interface FlyntlyChatApiConfig {
    chatApiUrl: string;
}
export interface SentMessageResponse {
    message: {
        id: string;
        channel_id: string;
        user_id: string;
        text: string;
        timestamp: number;
        message_seq: number | null;
        edited: boolean;
        deleted: boolean;
        attachments?: Array<{
            id: string;
            key: string;
            url: string;
            name: string;
            size: number;
            contentType: string;
            bucket: string;
            uploadedBy: string;
            transcodedUrl?: string | null;
            transcodedKey?: string | null;
            transcodedContentType?: string | null;
            transcodeStatus?: string | null;
            transcodeError?: string | null;
            transcodeAttempts?: number | string | null;
            transcodedAt?: number | string | null;
        }>;
    };
}
export interface SentThreadReplyResponse {
    id: string;
    timestamp: number;
}
export interface ChannelBootstrapResponse {
    messages: unknown[];
}
export interface ChannelPaginationResponse {
    messages: unknown[];
}
export interface PinRecord {
    id: string;
    message_id: string;
    pinned_by: string;
    pinned_at: string;
    message_text: string | null;
    message_deleted: boolean | null;
    message_user_id: string | null;
}
export interface ChannelPinsResponse {
    pins: PinRecord[];
}
export interface ChannelBookmarksResponse {
    messageIds?: string[];
}
export interface AllBookmarksResponse {
    bookmarks: Array<{
        bookmark_id: string;
        channel_id: string;
        message_id: string;
    }>;
}
export interface ReactionsResponse {
    reactions: Array<{
        emoji: string;
        count: number;
        userIds?: string[];
    }>;
}
export interface ThreadsResponse {
    threads: unknown[];
}
export interface ThreadAuthorRecord {
    id: string;
    email: string;
    firstName?: string;
    first_name?: string;
    lastName?: string;
    last_name?: string;
    fullName?: string;
    full_name?: string;
}
export interface UserThreadLatestReplyRecord {
    id: string;
    user_id: string;
    text: string | null;
    timestamp: number;
    author?: ThreadAuthorRecord | null;
}
export interface UserThreadSummaryRecord {
    id: string;
    parent_message_id: string;
    channel_id: string;
    channel_name: string;
    is_dm: boolean;
    is_public: boolean;
    parent_text: string | null;
    parent_user_id: string;
    parent_author?: ThreadAuthorRecord | null;
    parent_timestamp: number;
    reply_count: number;
    latest_reply?: UserThreadLatestReplyRecord | null;
    participant_ids: string[];
    participant_authors: ThreadAuthorRecord[];
    unread: boolean;
}
export interface UserThreadsResponse {
    threads: UserThreadSummaryRecord[];
    next_cursor?: string | null;
    has_more?: boolean;
}
export interface MentionRecord {
    id: string;
    message_id: string;
    channel_id: string;
    channel_name: string;
    is_dm: boolean;
    message_text: string | null;
    message_user_id: string;
    message_user_name?: string | null;
    message_user_email?: string | null;
    timestamp: number;
    unread: boolean;
    mention_kind: 'direct' | 'channel';
}
export interface MentionsResponse {
    mentions: MentionRecord[];
    next_cursor?: string | null;
    has_more?: boolean;
}
export interface InboxPageRequest {
    token: string;
    limit?: number;
    before?: string | null;
    cursor?: string | null;
}
export interface FlyntlyChatApi {
    buildChatUrl: (...args: BuildUrlArg[]) => string;
    fetchChannelBootstrap: (input: {
        channelId: string;
        token: string;
    }) => Promise<ChannelBootstrapResponse>;
    fetchOlderChannelMessages: (input: {
        channelId: string;
        token: string;
        beforeTimestamp: string;
        limit?: number;
    }) => Promise<ChannelPaginationResponse>;
    listChannels: <TResponse>(token: string) => Promise<TResponse>;
    createChannel: <TResponse>(input: {
        token: string;
        body: unknown;
    }) => Promise<TResponse>;
    inviteChannelMember: <TResponse>(input: {
        channelId: string;
        token: string;
        body: unknown;
    }) => Promise<TResponse>;
    listChannelMembers: <TResponse>(input: {
        channelId: string;
        token: string;
    }) => Promise<TResponse>;
    updateChannel: <TResponse>(input: {
        channelId: string;
        token: string;
        body: unknown;
    }) => Promise<TResponse>;
    deleteChannel: <TResponse>(input: {
        channelId: string;
        token: string;
    }) => Promise<TResponse>;
    createDirectMessage: <TResponse>(input: {
        token: string;
        body: unknown;
    }) => Promise<TResponse>;
    addMessage: (input: {
        channelId: string;
        token: string;
        text: string;
        attachmentIds?: string[];
    }) => Promise<SentMessageResponse['message']>;
    editMessage: (input: {
        channelId: string;
        messageId: string;
        token: string;
        text: string;
    }) => Promise<void>;
    deleteMessage: (input: {
        channelId: string;
        messageId: string;
        token: string;
    }) => Promise<void>;
    toggleReaction: (input: {
        channelId: string;
        messageId: string;
        token: string;
        emoji: string;
        op: 'add' | 'remove';
    }) => Promise<void>;
    fetchMessageReactions: (input: {
        channelId: string;
        messageId: string;
        token: string;
    }) => Promise<ReactionsResponse>;
    fetchThreads: (input: {
        channelId: string;
        parentMessageId: string;
        token: string;
    }) => Promise<ThreadsResponse>;
    fetchUserThreads: <TResponse = UserThreadsResponse>(input: string | InboxPageRequest) => Promise<TResponse>;
    addThreadReply: (input: {
        channelId: string;
        parentMessageId: string;
        token: string;
        text: string;
        attachmentIds?: string[];
    }) => Promise<SentThreadReplyResponse>;
    editThreadReply: (input: {
        channelId: string;
        threadId: string;
        token: string;
        text: string;
    }) => Promise<void>;
    deleteThreadReply: (input: {
        channelId: string;
        threadId: string;
        token: string;
    }) => Promise<void>;
    fetchChannelPins: (input: {
        channelId: string;
        token: string;
    }) => Promise<ChannelPinsResponse>;
    fetchAllPins: <TResponse>(token: string) => Promise<TResponse>;
    pinMessage: (input: {
        channelId: string;
        messageId: string;
        token: string;
    }) => Promise<void>;
    unpinMessage: (input: {
        channelId: string;
        messageId: string;
        token: string;
    }) => Promise<void>;
    fetchChannelBookmarks: (input: {
        channelId: string;
        token: string;
    }) => Promise<ChannelBookmarksResponse>;
    fetchAllBookmarks: (token: string) => Promise<AllBookmarksResponse>;
    addBookmark: (input: {
        channelId: string;
        messageId: string;
        token: string;
    }) => Promise<unknown>;
    deleteBookmark: (input: {
        bookmarkId: string;
        token: string;
    }) => Promise<void>;
    fetchMentions: <TResponse = MentionsResponse>(input: string | InboxPageRequest) => Promise<TResponse>;
    searchMessages: <TResponse>(input: {
        channelId: string;
        token: string;
        query: string;
    }) => Promise<TResponse>;
    createPoll: <TResponse>(input: {
        channelId: string;
        token: string;
        body: unknown;
    }) => Promise<TResponse>;
    votePoll: <TResponse>(input: {
        token: string;
        body: unknown;
    }) => Promise<TResponse>;
}
export declare function createFlyntlyChatApi(config: FlyntlyChatApiConfig): FlyntlyChatApi;
//# sourceMappingURL=chat-api.d.ts.map