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

export interface SendOrganizationInvitationsResponse {
  success: true;
  sent: number;
  total: number;
  results: Array<{
    email: string;
    success: boolean;
    warning?: string;
  }>;
  failed: Array<{
    email: string;
    success: false;
    error?: string;
  }>;
}

export interface OrganizationInvitationResponse {
  id: string;
  inviter_id: string;
  invitee_email: string;
  org_id: string;
  token: string;
  status: 'pending' | 'accepted' | 'expired';
  expires_at: number;
  created_at: number;
  accepted_at?: number | null;
  claimed_by_user_id?: string | null;
  isExpired?: boolean;
  remainingDays?: number;
}

export interface OrganizationInvitationsResponse {
  invitations: OrganizationInvitationResponse[];
}

export interface WorkspaceUserStatus {
  orgId: string;
  userId: string;
  statusText: string;
  statusEmoji: string | null;
  expiresAt: number | null;
  pauseNotifications: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface WorkspaceUserStatusResponse {
  status: WorkspaceUserStatus | null;
}

export interface SetWorkspaceUserStatusInput {
  token: string;
  statusText: string;
  statusEmoji?: string | null;
  expiresAt?: number | null;
  pauseNotifications?: boolean;
}

export interface FlyntlyOrgApi {
  listMembers: (input: { orgId: string; token: string }) => Promise<OrgMembersResponse>;
  sendInvitations: (input: { token: string; emails: string[]; orgId?: string | null }) => Promise<SendOrganizationInvitationsResponse>;
  listInvitations: (input: { token: string }) => Promise<OrganizationInvitationsResponse>;
  revokeInvitation: (input: { token: string; invitationId: string }) => Promise<{ success: true; message: string }>;
  getMyStatus: (input: { token: string }) => Promise<WorkspaceUserStatusResponse>;
  setMyStatus: (input: SetWorkspaceUserStatusInput) => Promise<WorkspaceUserStatusResponse>;
  clearMyStatus: (input: { token: string }) => Promise<WorkspaceUserStatusResponse>;
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
    sendInvitations: ({ token, emails, orgId }) =>
      requestJson<SendOrganizationInvitationsResponse>(buildUrl('/invitations/send'), {
        method: 'POST',
        token,
        body: orgId ? { emails, orgId } : { emails },
        fallbackError: 'Failed to send invitations',
      }),
    listInvitations: ({ token }) =>
      requestJson<OrganizationInvitationsResponse>(buildUrl('/invitations'), {
        token,
        fallbackError: 'Failed to load invitations',
      }),
    revokeInvitation: ({ token, invitationId }) =>
      requestJson<{ success: true; message: string }>(buildUrl(`/invitations/${invitationId}`), {
        method: 'DELETE',
        token,
        fallbackError: 'Failed to revoke invitation',
      }),
    getMyStatus: ({ token }) =>
      requestJson<WorkspaceUserStatusResponse>(buildUrl('/profile/status'), {
        token,
        fallbackError: 'Failed to load status',
      }),
    setMyStatus: ({ token, statusText, statusEmoji, expiresAt, pauseNotifications }) =>
      requestJson<WorkspaceUserStatusResponse>(buildUrl('/profile/status'), {
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
    clearMyStatus: ({ token }) =>
      requestJson<WorkspaceUserStatusResponse>(buildUrl('/profile/status'), {
        method: 'DELETE',
        token,
        fallbackError: 'Failed to clear status',
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
