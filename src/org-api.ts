import { requestJson } from './http.js';
import { createUrlBuilder } from './url.js';

export interface FlyntlyOrgApiConfig {
  baseApiUrl: string;
}

export interface OrgMemberResponse {
  id: string;
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  firstName?: string | null;
  lastName?: string | null;
}

export interface OrgMembersResponse {
  members: OrgMemberResponse[];
}

export interface FlyntlyOrgApi {
  listMembers: (input: { orgId: string; token: string }) => Promise<OrgMembersResponse>;
}

export function createFlyntlyOrgApi(config: FlyntlyOrgApiConfig): FlyntlyOrgApi {
  const buildUrl = createUrlBuilder(config.baseApiUrl);

  return {
    listMembers: ({ orgId, token }) =>
      requestJson<OrgMembersResponse>(buildUrl(`/orgs/${orgId}/members`), {
        token,
        fallbackError: 'Failed to load workspace members',
      }),
  };
}
