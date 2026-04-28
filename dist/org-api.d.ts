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
export interface FlyntlyOrgApi {
    listMembers: (input: {
        orgId: string;
        token: string;
    }) => Promise<OrgMembersResponse>;
    sendInvitations: (input: {
        token: string;
        emails: string[];
        orgId?: string | null;
    }) => Promise<SendOrganizationInvitationsResponse>;
    listInvitations: (input: {
        token: string;
    }) => Promise<OrganizationInvitationsResponse>;
    revokeInvitation: (input: {
        token: string;
        invitationId: string;
    }) => Promise<{
        success: true;
        message: string;
    }>;
    archiveOrganization: (input: {
        orgId: string;
        token: string;
    }) => Promise<OrganizationActionResponse>;
    deleteOrganization: (input: {
        orgId: string;
        token: string;
    }) => Promise<OrganizationActionResponse>;
}
export declare function createFlyntlyOrgApi(config: FlyntlyOrgApiConfig): FlyntlyOrgApi;
//# sourceMappingURL=org-api.d.ts.map