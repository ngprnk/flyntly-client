import { createUrlBuilder } from './url.js';
import { requestJson, requestVoid } from './http.js';
export function createFlyntlyChatApi(config) {
    const buildChatUrl = createUrlBuilder(config.chatApiUrl);
    return {
        buildChatUrl,
        fetchChannelBootstrap: ({ channelId, token }) => requestJson(buildChatUrl(`/channels/${channelId}/bootstrap`), {
            token,
            fallbackError: 'Failed to bootstrap channel',
        }),
        fetchOlderChannelMessages: ({ channelId, token, beforeTimestamp, limit = 50 }) => requestJson(buildChatUrl(`/channels/${channelId}/messages/paginated`, {
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
            const data = await requestJson(buildChatUrl(`/channels/${channelId}/messages`), {
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
        fetchMessageReactions: ({ channelId, messageId, token }) => requestJson(buildChatUrl(`/channels/${channelId}/messages/${messageId}/reactions`), {
            token,
            fallbackError: 'Failed to fetch reactions',
        }),
        fetchThreads: ({ channelId, parentMessageId, token }) => requestJson(buildChatUrl(`/channels/${channelId}/messages/${parentMessageId}/threads`), {
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
        addThreadReply: ({ channelId, parentMessageId, token, text, attachmentIds }) => requestJson(buildChatUrl(`/channels/${channelId}/threads`), {
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
        fetchChannelPins: ({ channelId, token }) => requestJson(buildChatUrl(`/channels/${channelId}/pins`), {
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
        fetchChannelBookmarks: ({ channelId, token }) => requestJson(buildChatUrl(`/channels/${channelId}/bookmarks`), {
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
        markActivityRead: ({ token, ids }) => requestVoid(buildChatUrl('/activity/read'), {
            method: 'POST',
            token,
            body: { ids },
            fallbackError: 'Failed to mark activity read',
        }),
        fetchNotificationKeywords: (token) => requestJson(buildChatUrl('/activity/keywords'), {
            token,
            fallbackError: 'Failed to load notification keywords',
        }),
        createNotificationKeyword: ({ token, keyword }) => requestJson(buildChatUrl('/activity/keywords'), {
            method: 'POST',
            token,
            body: { keyword },
            fallbackError: 'Failed to save notification keyword',
        }),
        deleteNotificationKeyword: ({ token, keywordId }) => requestVoid(buildChatUrl(`/activity/keywords/${keywordId}`), {
            method: 'DELETE',
            token,
            fallbackError: 'Failed to delete notification keyword',
        }),
        queryPresence: ({ token, userIds }) => requestJson(buildChatUrl('/presence/query'), {
            method: 'POST',
            token,
            body: { userIds },
            fallbackError: 'Failed to load presence',
        }),
        searchMessages: ({ channelId, token, query }) => requestJson(buildChatUrl(`/channels/${channelId}/messages/search`, { query: { q: query } }), {
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
function normalizeInboxPageRequest(input) {
    if (typeof input === 'string') {
        return { token: input };
    }
    return input;
}
function inboxPageQuery(input) {
    return {
        limit: input.limit,
        before: input.before ?? input.cursor,
    };
}
//# sourceMappingURL=chat-api.js.map