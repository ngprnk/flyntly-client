import { requestJson, requestVoid } from './http.js';
import { createUrlBuilder } from './url.js';
export function createFlyntlyAuthApi(config) {
    const buildUrl = createUrlBuilder(config.baseApiUrl);
    return {
        login: ({ email, password, preferredOrgId, explicitWorkspaceSelection }) => requestJson(buildUrl('/auth/login'), {
            method: 'POST',
            body: { email, password, preferredOrgId, explicitWorkspaceSelection },
            fallbackError: 'Login failed',
        }),
        me: (token) => requestJson(buildUrl('/auth/me'), {
            token,
            fallbackError: 'Failed to load profile',
        }),
        switchOrg: ({ token, orgId }) => requestJson(buildUrl('/auth/switch-org'), {
            method: 'POST',
            token,
            body: { orgId },
            fallbackError: 'Failed to switch workspace',
        }),
        changePassword: ({ token, currentPassword, newPassword }) => requestJson(buildUrl('/auth/change-password'), {
            method: 'POST',
            token,
            body: { currentPassword, newPassword },
            fallbackError: 'Failed to change password',
        }),
        logout: (token) => requestVoid(buildUrl('/auth/logout'), {
            method: 'POST',
            token,
            fallbackError: 'Failed to sign out',
        }),
    };
}
//# sourceMappingURL=auth-api.js.map