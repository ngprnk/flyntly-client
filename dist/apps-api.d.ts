import type { BuildUrlArg } from './url.js';
export interface FlyntlyAppsApiConfig {
    chatApiUrl: string;
}
export interface AppCatalogItem {
    id: string;
    slug: string;
    name: string;
    description: string;
    provider: string;
    configured: boolean;
    capabilities: {
        events?: string[];
        interactive?: boolean;
    };
    scopes: string[];
}
export interface AppSubscription {
    id: string;
    channelId: string;
    externalResourceId: string;
    externalResourceName: string;
    events: string[];
}
export interface AppInstallation {
    id: string;
    appId: string;
    provider: string;
    status: string;
    externalInstallationId?: string | null;
    externalAccountLogin?: string | null;
    externalAccountType?: string | null;
    botActorId: string;
    botName: string;
    botAvatarUrl?: string | null;
    subscriptions: AppSubscription[];
}
export interface GitHubRepository {
    id: number;
    name: string;
    full_name: string;
    html_url: string;
    private: boolean;
}
export interface InstallUrlResponse {
    installUrl: string;
    state: string;
}
export interface CompleteGitHubInstallRequest {
    state: string;
    installationId: string;
}
export interface SaveGitHubSubscriptionsRequest {
    installationId: string;
    channelId: string;
    repositoryIds: string[];
    events: string[];
}
export interface AppsCatalogResponse {
    apps: AppCatalogItem[];
}
export interface AppInstallationsResponse {
    installations: AppInstallation[];
}
export interface GitHubRepositoriesResponse {
    repositories: GitHubRepository[];
}
export interface FlyntlyAppsApi {
    buildAppsUrl: (...args: BuildUrlArg[]) => string;
    listCatalog: (token: string) => Promise<AppsCatalogResponse>;
    listInstallations: (token: string) => Promise<AppInstallationsResponse>;
    createGitHubInstallUrl: (token: string) => Promise<InstallUrlResponse>;
    completeGitHubInstall: (input: {
        token: string;
        body: CompleteGitHubInstallRequest;
    }) => Promise<AppInstallation>;
    listGitHubRepositories: (input: {
        token: string;
        installationId: string;
    }) => Promise<GitHubRepositoriesResponse>;
    saveGitHubSubscriptions: (input: {
        token: string;
        body: SaveGitHubSubscriptionsRequest;
    }) => Promise<AppInstallation>;
    deleteGitHubSubscription: (input: {
        token: string;
        subscriptionId: string;
    }) => Promise<void>;
}
export declare function createFlyntlyAppsApi(config: FlyntlyAppsApiConfig): FlyntlyAppsApi;
//# sourceMappingURL=apps-api.d.ts.map