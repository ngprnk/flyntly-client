import type { BuildUrlArg } from './url.js';
import type { PresenceUserPayload } from './ws-types.js';
import { createUrlBuilder } from './url.js';
import { requestJson, requestVoid } from './http.js';

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
  latestSeq?: number | null;
  hasMore?: boolean;
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

export interface ActivityRecord {
  id: string;
  kind: 'mention' | 'channel_mention' | 'here_mention' | 'keyword' | 'thread_reply' | 'reaction';
  sourceType: 'message' | 'thread_reply' | 'reaction';
  sourceId: string;
  channelId: string;
  channelName: string;
  isDm: boolean;
  messageId?: string | null;
  threadId?: string | null;
  actorUserId: string;
  actorName?: string | null;
  actorEmail?: string | null;
  previewText?: string | null;
  emoji?: string | null;
  occurredAt: number;
  unread: boolean;
}

export interface ActivityResponse {
  activity: ActivityRecord[];
  next_cursor?: string | null;
  has_more?: boolean;
}

export interface NotificationKeywordRecord {
  id: string;
  keyword: string;
  normalizedKeyword: string;
  createdAt: number;
}

export interface NotificationKeywordsResponse {
  keywords: NotificationKeywordRecord[];
}

export interface NotificationKeywordResponse {
  keyword: NotificationKeywordRecord;
}

export interface PresenceQueryResponse {
  users: PresenceUserPayload[];
}

export interface InboxPageRequest {
  token: string;
  limit?: number;
  before?: string | null;
  cursor?: string | null;
}

export interface FlyntlyChatApi {
  buildChatUrl: (...args: BuildUrlArg[]) => string;
  fetchChannelBootstrap: (input: { channelId: string; token: string }) => Promise<ChannelBootstrapResponse>;
  fetchOlderChannelMessages: (input: { channelId: string; token: string; beforeTimestamp: string; limit?: number }) => Promise<ChannelPaginationResponse>;
  fetchChannelMessagesAfterSeq: (input: { channelId: string; token: string; afterSeq: number; limit?: number }) => Promise<ChannelPaginationResponse>;
  listChannels: <TResponse>(token: string) => Promise<TResponse>;
  createChannel: <TResponse>(input: { token: string; body: unknown }) => Promise<TResponse>;
  inviteChannelMember: <TResponse>(input: { channelId: string; token: string; body: unknown }) => Promise<TResponse>;
  listChannelMembers: <TResponse>(input: { channelId: string; token: string }) => Promise<TResponse>;
  updateChannel: <TResponse>(input: { channelId: string; token: string; body: unknown }) => Promise<TResponse>;
  deleteChannel: <TResponse>(input: { channelId: string; token: string }) => Promise<TResponse>;
  createDirectMessage: <TResponse>(input: { token: string; body: unknown }) => Promise<TResponse>;
  addMessage: (input: { channelId: string; token: string; text: string; attachmentIds?: string[] }) => Promise<SentMessageResponse['message']>;
  editMessage: (input: { channelId: string; messageId: string; token: string; text: string }) => Promise<void>;
  deleteMessage: (input: { channelId: string; messageId: string; token: string }) => Promise<void>;
  toggleReaction: (input: { channelId: string; messageId: string; token: string; emoji: string; op: 'add' | 'remove' }) => Promise<void>;
  fetchMessageReactions: (input: { channelId: string; messageId: string; token: string }) => Promise<ReactionsResponse>;
  fetchThreads: (input: { channelId: string; parentMessageId: string; token: string }) => Promise<ThreadsResponse>;
  fetchUserThreads: <TResponse = UserThreadsResponse>(input: string | InboxPageRequest) => Promise<TResponse>;
  addThreadReply: (input: { channelId: string; parentMessageId: string; token: string; text: string; attachmentIds?: string[] }) => Promise<SentThreadReplyResponse>;
  editThreadReply: (input: { channelId: string; threadId: string; token: string; text: string }) => Promise<void>;
  deleteThreadReply: (input: { channelId: string; threadId: string; token: string }) => Promise<void>;
  fetchChannelPins: (input: { channelId: string; token: string }) => Promise<ChannelPinsResponse>;
  fetchAllPins: <TResponse>(token: string) => Promise<TResponse>;
  pinMessage: (input: { channelId: string; messageId: string; token: string }) => Promise<void>;
  unpinMessage: (input: { channelId: string; messageId: string; token: string }) => Promise<void>;
  fetchChannelBookmarks: (input: { channelId: string; token: string }) => Promise<ChannelBookmarksResponse>;
  fetchAllBookmarks: (token: string) => Promise<AllBookmarksResponse>;
  addBookmark: (input: { channelId: string; messageId: string; token: string }) => Promise<unknown>;
  deleteBookmark: (input: { bookmarkId: string; token: string }) => Promise<void>;
  fetchMentions: <TResponse = MentionsResponse>(input: string | InboxPageRequest) => Promise<TResponse>;
  fetchActivity: <TResponse = ActivityResponse>(input: string | InboxPageRequest) => Promise<TResponse>;
  markActivityRead: (input: { token: string; ids: string[] }) => Promise<void>;
  fetchNotificationKeywords: <TResponse = NotificationKeywordsResponse>(token: string) => Promise<TResponse>;
  createNotificationKeyword: <TResponse = NotificationKeywordResponse>(input: { token: string; keyword: string }) => Promise<TResponse>;
  deleteNotificationKeyword: (input: { token: string; keywordId: string }) => Promise<void>;
  queryPresence: (input: { token: string; userIds: string[] }) => Promise<PresenceQueryResponse>;
  searchMessages: <TResponse>(input: { channelId: string; token: string; query: string }) => Promise<TResponse>;
  createPoll: <TResponse>(input: { channelId: string; token: string; body: unknown }) => Promise<TResponse>;
  votePoll: <TResponse>(input: { token: string; body: unknown }) => Promise<TResponse>;
}

export function createFlyntlyChatApi(config: FlyntlyChatApiConfig): FlyntlyChatApi {
  const buildChatUrl = createUrlBuilder(config.chatApiUrl);

  return {
    buildChatUrl,
    fetchChannelBootstrap: ({ channelId, token }) =>
      requestJson(buildChatUrl(`/channels/${channelId}/bootstrap`), {
        token,
        fallbackError: 'Failed to bootstrap channel',
      }),
    fetchOlderChannelMessages: ({ channelId, token, beforeTimestamp, limit = 50 }) =>
      requestJson(buildChatUrl(`/channels/${channelId}/messages/paginated`, {
        query: { before: beforeTimestamp, limit },
      }), {
        token,
        fallbackError: 'Failed to load older messages',
      }),
    fetchChannelMessagesAfterSeq: ({ channelId, token, afterSeq, limit = 100 }) =>
      requestJson(buildChatUrl(`/channels/${channelId}/messages/paginated`, {
        query: { afterSeq, limit },
      }), {
        token,
        fallbackError: 'Failed to catch up channel messages',
      }),
    listChannels: (token) => requestJson(buildChatUrl('/channels'), { token }),
    createChannel: ({ token, body }) => requestJson(buildChatUrl('/channels'), {
      method: 'POST',
      token,
      body,
    }),
    inviteChannelMember: ({ channelId, token, body }) => requestJson(buildChatUrl(`/channels/${channelId}/invite`), {
      method: 'POST',
      token,
      body,
    }),
    listChannelMembers: ({ channelId, token }) => requestJson(buildChatUrl(`/channels/${channelId}/members`), { token }),
    updateChannel: ({ channelId, token, body }) => requestJson(buildChatUrl(`/channels/${channelId}`), {
      method: 'PATCH',
      token,
      body,
    }),
    deleteChannel: ({ channelId, token }) => requestJson(buildChatUrl(`/channels/${channelId}`), {
      method: 'DELETE',
      token,
    }),
    createDirectMessage: ({ token, body }) => requestJson(buildChatUrl('/dms'), {
      method: 'POST',
      token,
      body,
    }),
    addMessage: async ({ channelId, token, text, attachmentIds }) => {
      const data = await requestJson<SentMessageResponse>(buildChatUrl(`/channels/${channelId}/messages`), {
        method: 'POST',
        token,
        body: { text, attachmentIds },
        fallbackError: 'Failed to send message',
      });
      return data.message;
    },
    editMessage: ({ channelId, messageId, token, text }) => requestVoid(buildChatUrl(`/channels/${channelId}/messages/${messageId}/edit`), {
      method: 'POST',
      token,
      body: { text },
      fallbackError: 'Failed to edit message',
    }),
    deleteMessage: ({ channelId, messageId, token }) => requestVoid(buildChatUrl(`/channels/${channelId}/messages/${messageId}`), {
      method: 'DELETE',
      token,
      fallbackError: 'Failed to delete message',
    }),
    toggleReaction: ({ channelId, messageId, token, emoji, op }) => requestVoid(buildChatUrl(`/channels/${channelId}/reactions`), {
      method: 'POST',
      token,
      body: { messageId, emoji, op },
      fallbackError: 'Failed to toggle reaction',
    }),
    fetchMessageReactions: ({ channelId, messageId, token }) =>
      requestJson(buildChatUrl(`/channels/${channelId}/messages/${messageId}/reactions`), {
        token,
        fallbackError: 'Failed to fetch reactions',
      }),
    fetchThreads: ({ channelId, parentMessageId, token }) =>
      requestJson(buildChatUrl(`/channels/${channelId}/messages/${parentMessageId}/threads`), {
        token,
        fallbackError: 'Failed to fetch threads',
      }),
    fetchUserThreads: (input) => {
      const page = normalizeInboxPageRequest(input);
      return requestJson(buildChatUrl('/threads', { query: inboxPageQuery(page) }), {
        token: page.token,
        fallbackError: 'Failed to load threads',
      });
    },
    addThreadReply: ({ channelId, parentMessageId, token, text, attachmentIds }) =>
      requestJson(buildChatUrl(`/channels/${channelId}/threads`), {
        method: 'POST',
        token,
        body: { parentMessageId, text, attachmentIds },
        fallbackError: 'Failed to send thread reply',
      }),
    editThreadReply: ({ channelId, threadId, token, text }) => requestVoid(buildChatUrl(`/channels/${channelId}/threads/${threadId}/edit`), {
      method: 'POST',
      token,
      body: { text },
      fallbackError: 'Failed to edit thread reply',
    }),
    deleteThreadReply: ({ channelId, threadId, token }) => requestVoid(buildChatUrl(`/channels/${channelId}/threads/${threadId}`), {
      method: 'DELETE',
      token,
      fallbackError: 'Failed to delete thread reply',
    }),
    fetchChannelPins: ({ channelId, token }) =>
      requestJson(buildChatUrl(`/channels/${channelId}/pins`), {
        token,
        fallbackError: 'Failed to fetch pins',
      }),
    fetchAllPins: (token) => requestJson(buildChatUrl('/pins'), { token }),
    pinMessage: ({ channelId, messageId, token }) => requestVoid(buildChatUrl(`/channels/${channelId}/pins`), {
      method: 'POST',
      token,
      body: { messageId },
      fallbackError: 'Failed to pin message',
    }),
    unpinMessage: ({ channelId, messageId, token }) => requestVoid(buildChatUrl(`/channels/${channelId}/pins/${messageId}`), {
      method: 'DELETE',
      token,
      fallbackError: 'Failed to unpin message',
    }),
    fetchChannelBookmarks: ({ channelId, token }) =>
      requestJson(buildChatUrl(`/channels/${channelId}/bookmarks`), {
        token,
        fallbackError: 'Failed to load bookmarks',
      }),
    fetchAllBookmarks: (token) => requestJson(buildChatUrl('/bookmarks'), {
      token,
      fallbackError: 'Failed to load bookmarks',
    }),
    addBookmark: ({ channelId, messageId, token }) => requestJson(buildChatUrl('/bookmarks'), {
      method: 'POST',
      token,
      body: { channelId, messageId },
      fallbackError: 'Failed to add bookmark',
    }),
    deleteBookmark: ({ bookmarkId, token }) => requestVoid(buildChatUrl(`/bookmarks/${bookmarkId}`), {
      method: 'DELETE',
      token,
      fallbackError: 'Failed to remove bookmark',
    }),
    fetchMentions: (input) => {
      const page = normalizeInboxPageRequest(input);
      return requestJson(buildChatUrl('/mentions', { query: inboxPageQuery(page) }), {
        token: page.token,
        fallbackError: 'Failed to load mentions',
      });
    },
    fetchActivity: (input) => {
      const page = normalizeInboxPageRequest(input);
      return requestJson(buildChatUrl('/activity', { query: inboxPageQuery(page) }), {
        token: page.token,
        fallbackError: 'Failed to load activity',
      });
    },
    markActivityRead: ({ token, ids }) =>
      requestVoid(buildChatUrl('/activity/read'), {
        method: 'POST',
        token,
        body: { ids },
        fallbackError: 'Failed to mark activity read',
      }),
    fetchNotificationKeywords: (token) =>
      requestJson(buildChatUrl('/activity/keywords'), {
        token,
        fallbackError: 'Failed to load notification keywords',
      }),
    createNotificationKeyword: ({ token, keyword }) =>
      requestJson(buildChatUrl('/activity/keywords'), {
        method: 'POST',
        token,
        body: { keyword },
        fallbackError: 'Failed to save notification keyword',
      }),
    deleteNotificationKeyword: ({ token, keywordId }) =>
      requestVoid(buildChatUrl(`/activity/keywords/${keywordId}`), {
        method: 'DELETE',
        token,
        fallbackError: 'Failed to delete notification keyword',
      }),
    queryPresence: ({ token, userIds }) =>
      requestJson(buildChatUrl('/presence/query'), {
        method: 'POST',
        token,
        body: { userIds },
        fallbackError: 'Failed to load presence',
      }),
    searchMessages: ({ channelId, token, query }) =>
      requestJson(buildChatUrl(`/channels/${channelId}/messages/search`, { query: { q: query } }), {
        token,
        fallbackError: 'Failed to search messages',
      }),
    createPoll: ({ channelId, token, body }) => requestJson(buildChatUrl(`/channels/${channelId}/polls`), {
      method: 'POST',
      token,
      body,
      fallbackError: 'Failed to create poll',
    }),
    votePoll: ({ token, body }) => requestJson(buildChatUrl('/polls/vote'), {
      method: 'POST',
      token,
      body,
      fallbackError: 'Failed to vote in poll',
    }),
  };
}

function normalizeInboxPageRequest(input: string | InboxPageRequest): InboxPageRequest {
  if (typeof input === 'string') {
    return { token: input };
  }

  return input;
}

function inboxPageQuery(input: InboxPageRequest): Record<string, string | number | null | undefined> {
  return {
    limit: input.limit,
    before: input.before ?? input.cursor,
  };
}
