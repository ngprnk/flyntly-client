import { requestJson } from './http.js';
import { createUrlBuilder } from './url.js';
export function createFlyntlyUserApi(config) {
    const buildUrl = createUrlBuilder(config.baseApiUrl);
    return {
        fetchUserProfile: ({ userId, token }) => requestJson(buildUrl(`/users/${userId}`), {
            token,
            fallbackError: 'Failed to load user profile',
        }),
    };
}
//# sourceMappingURL=user-api.js.map