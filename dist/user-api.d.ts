export interface FlyntlyUserApiConfig {
    baseApiUrl: string;
}
export interface UserProfileRecord {
    id: string;
    email: string;
    firstName?: string | null;
    first_name?: string | null;
    lastName?: string | null;
    last_name?: string | null;
    fullName?: string | null;
    full_name?: string | null;
    createdAt?: string | number | null;
    created_at?: string | number | null;
    timezone?: string | null;
    lastSeenAt?: string | number | null;
    last_seen_at?: string | number | null;
}
export interface UserProfileResponse {
    user: UserProfileRecord;
}
export interface FlyntlyUserApi {
    fetchUserProfile: (input: {
        userId: string;
        token: string;
    }) => Promise<UserProfileResponse>;
}
export declare function createFlyntlyUserApi(config: FlyntlyUserApiConfig): FlyntlyUserApi;
//# sourceMappingURL=user-api.d.ts.map