import { requestJson } from './http.js';
import { createUrlBuilder } from './url.js';
export function createFlyntlyOrgApi(config) {
    const buildUrl = createUrlBuilder(config.baseApiUrl);
    return {
        listMembers: ({ orgId, token }) => requestJson(buildUrl(`/orgs/${orgId}/members`), {
            token,
            fallbackError: 'Failed to load workspace members',
        }),
        sendInvitations: ({ token, emails, orgId }) => requestJson(buildUrl('/invitations/send'), {
            method: 'POST',
            token,
            body: orgId ? { emails, orgId } : { emails },
            fallbackError: 'Failed to send invitations',
        }),
        listInvitations: ({ token }) => requestJson(buildUrl('/invitations'), {
            token,
            fallbackError: 'Failed to load invitations',
        }),
        revokeInvitation: ({ token, invitationId }) => requestJson(buildUrl(`/invitations/${invitationId}`), {
            method: 'DELETE',
            token,
            fallbackError: 'Failed to revoke invitation',
        }),
        getMyStatus: ({ token }) => requestJson(buildUrl('/profile/status'), {
            token,
            fallbackError: 'Failed to load status',
        }),
        setMyStatus: ({ token, statusText, statusEmoji, expiresAt, pauseNotifications }) => requestJson(buildUrl('/profile/status'), {
            method: 'PUT',
            token,
            body: {
                statusText,
                statusEmoji,
                expiresAt,
                pauseNotifications,
            },
            fallbackError: 'Failed to save status',
        }),
        clearMyStatus: ({ token }) => requestJson(buildUrl('/profile/status'), {
            method: 'DELETE',
            token,
            fallbackError: 'Failed to clear status',
        }),
        archiveOrganization: ({ orgId, token }) => requestJson(buildUrl(`/orgs/${orgId}/archive`), {
            method: 'POST',
            token,
            fallbackError: 'Failed to archive workspace',
        }),
        deleteOrganization: ({ orgId, token }) => requestJson(buildUrl(`/orgs/${orgId}`), {
            method: 'DELETE',
            token,
            fallbackError: 'Failed to delete workspace',
        }),
    };
}
//# sourceMappingURL=org-api.js.map