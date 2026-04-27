import { requestJson } from './http.js';
import { createUrlBuilder } from './url.js';
export function createFlyntlyOrgApi(config) {
    const buildUrl = createUrlBuilder(config.baseApiUrl);
    return {
        listMembers: ({ orgId, token }) => requestJson(buildUrl(`/orgs/${orgId}/members`), {
            token,
            fallbackError: 'Failed to load workspace members',
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