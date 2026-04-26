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
    listMembers: (input: {
        orgId: string;
        token: string;
    }) => Promise<OrgMembersResponse>;
}
export declare function createFlyntlyOrgApi(config: FlyntlyOrgApiConfig): FlyntlyOrgApi;
//# sourceMappingURL=org-api.d.ts.map