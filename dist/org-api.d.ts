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
    listMembers: (input: {
        orgId: string;
        token: string;
    }) => Promise<OrgMembersResponse>;
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