import type { BuildUrlArg } from './url';
import { createUrlBuilder } from './url';
import { requestJson, requestVoid } from './http';

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

export interface FlyntlyChatApi {
  buildChatUrl: (...args: BuildUrlArg[]) => string;
  fetchChannelBootstrap: (input: { channelId: string; token: string }) => Promise<ChannelBootstrapResponse>;
  fetchOlderChannelMessages: (input: { channelId: string; token: string; beforeTimestamp: string; limit?: number }) => Promise<ChannelPaginationResponse>;
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
