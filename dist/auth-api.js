import { requestJson, requestVoid } from './http.js';
import { createUrlBuilder } from './url.js';
export function createFlyntlyAuthApi(config) {
    const buildUrl = createUrlBuilder(config.baseApiUrl);
    return {
        login: ({ email, password, preferredOrgId }) => requestJson(buildUrl('/auth/login'), {
            method: 'POST',
            body: { email, password, preferredOrgId },
            fallbackError: 'Login failed',
        }),
        me: (token) => requestJson(buildUrl('/auth/me'), {
            token,
            fallbackError: 'Failed to load profile',
        }),
        logout: (token) => requestVoid(buildUrl('/auth/logout'), {
            method: 'POST',
            token,
            fallbackError: 'Failed to sign out',
        }),
    };
}
//# sourceMappingURL=auth-api.js.map