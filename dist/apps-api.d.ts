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
export interface GoogleDriveResource {
    id: string;
    resourceKey: string;
    name: string;
    kind: string;
    targetResource: string;
    webUrl?: string | null;
}
export interface GoogleCalendar {
    id: string;
    summary: string;
    primary: boolean;
    accessRole?: string | null;
    backgroundColor?: string | null;
}
export interface InstallUrlResponse {
    installUrl: string;
    state: string;
}
export interface CompleteGitHubInstallRequest {
    state: string;
    installationId: string;
}
export interface CompleteGoogleDriveInstallRequest {
    state: string;
    code: string;
}
export interface CompleteGoogleCalendarInstallRequest {
    state: string;
    code: string;
}
export interface SaveGitHubSubscriptionsRequest {
    installationId: string;
    channelId: string;
    repositoryIds: string[];
    events: string[];
}
export interface SaveGoogleDriveSubscriptionsRequest {
    installationId: string;
    channelId: string;
    resourceKeys: string[];
    events: string[];
}
export interface SaveGoogleCalendarSubscriptionsRequest {
    installationId: string;
    channelId: string;
    calendarIds: string[];
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
export interface GoogleDriveResourcesResponse {
    resources: GoogleDriveResource[];
}
export interface GoogleCalendarsResponse {
    calendars: GoogleCalendar[];
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
    createGoogleDriveInstallUrl: (token: string) => Promise<InstallUrlResponse>;
    completeGoogleDriveInstall: (input: {
        token: string;
        body: CompleteGoogleDriveInstallRequest;
    }) => Promise<AppInstallation>;
    listGoogleDriveResources: (input: {
        token: string;
        installationId: string;
    }) => Promise<GoogleDriveResourcesResponse>;
    saveGoogleDriveSubscriptions: (input: {
        token: string;
        body: SaveGoogleDriveSubscriptionsRequest;
    }) => Promise<AppInstallation>;
    deleteGoogleDriveSubscription: (input: {
        token: string;
        subscriptionId: string;
    }) => Promise<void>;
    createGoogleCalendarInstallUrl: (token: string) => Promise<InstallUrlResponse>;
    completeGoogleCalendarInstall: (input: {
        token: string;
        body: CompleteGoogleCalendarInstallRequest;
    }) => Promise<AppInstallation>;
    listGoogleCalendars: (input: {
        token: string;
        installationId: string;
    }) => Promise<GoogleCalendarsResponse>;
    saveGoogleCalendarSubscriptions: (input: {
        token: string;
        body: SaveGoogleCalendarSubscriptionsRequest;
    }) => Promise<AppInstallation>;
    deleteGoogleCalendarSubscription: (input: {
        token: string;
        subscriptionId: string;
    }) => Promise<void>;
}
export declare function createFlyntlyAppsApi(config: FlyntlyAppsApiConfig): FlyntlyAppsApi;
//# sourceMappingURL=apps-api.d.ts.map