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

export interface OrganizationActionResponse {
  success: true;
  token: string;
  orgId: string | null;
  needsOrganization: boolean;
}

export interface FlyntlyOrgApi {
  listMembers: (input: { orgId: string; token: string }) => Promise<OrgMembersResponse>;
  archiveOrganization: (input: { orgId: string; token: string }) => Promise<OrganizationActionResponse>;
  deleteOrganization: (input: { orgId: string; token: string }) => Promise<OrganizationActionResponse>;
}

export function createFlyntlyOrgApi(config: FlyntlyOrgApiConfig): FlyntlyOrgApi {
  const buildUrl = createUrlBuilder(config.baseApiUrl);

  return {
    listMembers: ({ orgId, token }) =>
      requestJson<OrgMembersResponse>(buildUrl(`/orgs/${orgId}/members`), {
        token,
        fallbackError: 'Failed to load workspace members',
      }),
    archiveOrganization: ({ orgId, token }) =>
      requestJson<OrganizationActionResponse>(buildUrl(`/orgs/${orgId}/archive`), {
        method: 'POST',
        token,
        fallbackError: 'Failed to archive workspace',
      }),
    deleteOrganization: ({ orgId, token }) =>
      requestJson<OrganizationActionResponse>(buildUrl(`/orgs/${orgId}`), {
        method: 'DELETE',
        token,
        fallbackError: 'Failed to delete workspace',
      }),
  };
}
