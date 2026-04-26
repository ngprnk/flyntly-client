import { requestJson } from './http.js';
import { createUrlBuilder } from './url.js';
export function createFlyntlyOrgApi(config) {
    const buildUrl = createUrlBuilder(config.baseApiUrl);
    return {
        listMembers: ({ orgId, token }) => requestJson(buildUrl(`/orgs/${orgId}/members`), {
            token,
            fallbackError: 'Failed to load workspace members',
        }),
    };
}
//# sourceMappingURL=org-api.js.map