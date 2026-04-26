export interface FlyntlyAuthApiConfig {
    baseApiUrl: string;
}
export interface LoginOrganization {
    id: string;
    name: string;
    role: string;
}
export interface LoginResponse {
    token: string;
    userId: string;
    orgId: string | null;
    needsOrganization: boolean;
    organizations?: LoginOrganization[];
}
export interface CurrentUserResponse {
    user: {
        id: string;
        email: string;
        first_name?: string | null;
        last_name?: string | null;
        firstName?: string | null;
        lastName?: string | null;
    };
}
export interface FlyntlyAuthApi {
    login: (input: {
        email: string;
        password: string;
        preferredOrgId?: string | null;
    }) => Promise<LoginResponse>;
    me: (token: string) => Promise<CurrentUserResponse>;
    logout: (token: string) => Promise<void>;
}
export declare function createFlyntlyAuthApi(config: FlyntlyAuthApiConfig): FlyntlyAuthApi;
//# sourceMappingURL=auth-api.d.ts.map