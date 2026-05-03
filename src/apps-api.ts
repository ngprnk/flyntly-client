import type { BuildUrlArg } from './url.js';
import { requestJson, requestVoid } from './http.js';
import { createUrlBuilder } from './url.js';

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
  createdBy: string;
  canManage: boolean;
  externalResourceId: string;
  externalResourceName: string;
  events: string[];
}

export interface AppInstallation {
  id: string;
  appId: string;
  provider: string;
  status: string;
  installedBy: string;
  canManage: boolean;
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

export interface VercelProject {
  id: string;
  name: string;
  teamId?: string | null;
  teamName?: string | null;
  framework?: string | null;
  projectUrl?: string | null;
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

export interface CompleteVercelInstallRequest {
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

export interface SaveVercelSubscriptionsRequest {
  installationId: string;
  channelId: string;
  projectIds: string[];
  events: string[];
  target: string;
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

export interface VercelProjectsResponse {
  projects: VercelProject[];
}

export interface FlyntlyAppsApi {
  buildAppsUrl: (...args: BuildUrlArg[]) => string;
  listCatalog: (token: string) => Promise<AppsCatalogResponse>;
  listInstallations: (token: string) => Promise<AppInstallationsResponse>;
  createGitHubInstallUrl: (token: string) => Promise<InstallUrlResponse>;
  completeGitHubInstall: (input: { token: string; body: CompleteGitHubInstallRequest }) => Promise<AppInstallation>;
  listGitHubRepositories: (input: { token: string; installationId: string }) => Promise<GitHubRepositoriesResponse>;
  saveGitHubSubscriptions: (input: { token: string; body: SaveGitHubSubscriptionsRequest }) => Promise<AppInstallation>;
  deleteGitHubSubscription: (input: { token: string; subscriptionId: string }) => Promise<void>;
  createGoogleDriveInstallUrl: (token: string) => Promise<InstallUrlResponse>;
  completeGoogleDriveInstall: (input: { token: string; body: CompleteGoogleDriveInstallRequest }) => Promise<AppInstallation>;
  listGoogleDriveResources: (input: { token: string; installationId: string }) => Promise<GoogleDriveResourcesResponse>;
  saveGoogleDriveSubscriptions: (input: { token: string; body: SaveGoogleDriveSubscriptionsRequest }) => Promise<AppInstallation>;
  deleteGoogleDriveSubscription: (input: { token: string; subscriptionId: string }) => Promise<void>;
  createGoogleCalendarInstallUrl: (token: string) => Promise<InstallUrlResponse>;
  completeGoogleCalendarInstall: (input: { token: string; body: CompleteGoogleCalendarInstallRequest }) => Promise<AppInstallation>;
  listGoogleCalendars: (input: { token: string; installationId: string }) => Promise<GoogleCalendarsResponse>;
  saveGoogleCalendarSubscriptions: (input: { token: string; body: SaveGoogleCalendarSubscriptionsRequest }) => Promise<AppInstallation>;
  deleteGoogleCalendarSubscription: (input: { token: string; subscriptionId: string }) => Promise<void>;
  createVercelInstallUrl: (token: string) => Promise<InstallUrlResponse>;
  completeVercelInstall: (input: { token: string; body: CompleteVercelInstallRequest }) => Promise<AppInstallation>;
  listVercelProjects: (input: { token: string; installationId: string }) => Promise<VercelProjectsResponse>;
  saveVercelSubscriptions: (input: { token: string; body: SaveVercelSubscriptionsRequest }) => Promise<AppInstallation>;
  deleteVercelSubscription: (input: { token: string; subscriptionId: string }) => Promise<void>;
}

export function createFlyntlyAppsApi(config: FlyntlyAppsApiConfig): FlyntlyAppsApi {
  const buildAppsUrl = createUrlBuilder(config.chatApiUrl);

  return {
    buildAppsUrl,
    listCatalog: (token) =>
      requestJson(buildAppsUrl('/apps/catalog'), {
        token,
        fallbackError: 'Failed to load app catalog',
      }),
    listInstallations: (token) =>
      requestJson(buildAppsUrl('/apps/installations'), {
        token,
        fallbackError: 'Failed to load app installations',
      }),
    createGitHubInstallUrl: (token) =>
      requestJson(buildAppsUrl('/apps/github/install-url'), {
        method: 'POST',
        token,
        fallbackError: 'Failed to start GitHub installation',
      }),
    completeGitHubInstall: ({ token, body }) =>
      requestJson(buildAppsUrl('/apps/github/complete'), {
        method: 'POST',
        token,
        body,
        fallbackError: 'Failed to finish GitHub installation',
      }),
    listGitHubRepositories: ({ token, installationId }) =>
      requestJson(buildAppsUrl(`/apps/github/installations/${installationId}/repositories`), {
        token,
        fallbackError: 'Failed to load GitHub repositories',
      }),
    saveGitHubSubscriptions: ({ token, body }) =>
      requestJson(buildAppsUrl('/apps/github/subscriptions'), {
        method: 'POST',
        token,
        body,
        fallbackError: 'Failed to save GitHub subscriptions',
      }),
    deleteGitHubSubscription: ({ token, subscriptionId }) =>
      requestVoid(buildAppsUrl(`/apps/github/subscriptions/${subscriptionId}`), {
        method: 'DELETE',
        token,
        fallbackError: 'Failed to remove GitHub subscription',
      }),
    createGoogleDriveInstallUrl: (token) =>
      requestJson(buildAppsUrl('/apps/google-drive/install-url'), {
        method: 'POST',
        token,
        fallbackError: 'Failed to start Google Drive installation',
      }),
    completeGoogleDriveInstall: ({ token, body }) =>
      requestJson(buildAppsUrl('/apps/google-drive/complete'), {
        method: 'POST',
        token,
        body,
        fallbackError: 'Failed to finish Google Drive installation',
      }),
    listGoogleDriveResources: ({ token, installationId }) =>
      requestJson(buildAppsUrl(`/apps/google-drive/installations/${installationId}/resources`), {
        token,
        fallbackError: 'Failed to load Google Drive resources',
      }),
    saveGoogleDriveSubscriptions: ({ token, body }) =>
      requestJson(buildAppsUrl('/apps/google-drive/subscriptions'), {
        method: 'POST',
        token,
        body,
        fallbackError: 'Failed to save Google Drive subscriptions',
      }),
    deleteGoogleDriveSubscription: ({ token, subscriptionId }) =>
      requestVoid(buildAppsUrl(`/apps/google-drive/subscriptions/${subscriptionId}`), {
        method: 'DELETE',
        token,
        fallbackError: 'Failed to remove Google Drive subscription',
      }),
    createGoogleCalendarInstallUrl: (token) =>
      requestJson(buildAppsUrl('/apps/google-calendar/install-url'), {
        method: 'POST',
        token,
        fallbackError: 'Failed to start Google Calendar installation',
      }),
    completeGoogleCalendarInstall: ({ token, body }) =>
      requestJson(buildAppsUrl('/apps/google-calendar/complete'), {
        method: 'POST',
        token,
        body,
        fallbackError: 'Failed to finish Google Calendar installation',
      }),
    listGoogleCalendars: ({ token, installationId }) =>
      requestJson(buildAppsUrl(`/apps/google-calendar/installations/${installationId}/calendars`), {
        token,
        fallbackError: 'Failed to load Google calendars',
      }),
    saveGoogleCalendarSubscriptions: ({ token, body }) =>
      requestJson(buildAppsUrl('/apps/google-calendar/subscriptions'), {
        method: 'POST',
        token,
        body,
        fallbackError: 'Failed to save Google Calendar subscriptions',
      }),
    deleteGoogleCalendarSubscription: ({ token, subscriptionId }) =>
      requestVoid(buildAppsUrl(`/apps/google-calendar/subscriptions/${subscriptionId}`), {
        method: 'DELETE',
        token,
        fallbackError: 'Failed to remove Google Calendar subscription',
      }),
    createVercelInstallUrl: (token) =>
      requestJson(buildAppsUrl('/apps/vercel/install-url'), {
        method: 'POST',
        token,
        fallbackError: 'Failed to start Vercel installation',
      }),
    completeVercelInstall: ({ token, body }) =>
      requestJson(buildAppsUrl('/apps/vercel/complete'), {
        method: 'POST',
        token,
        body,
        fallbackError: 'Failed to finish Vercel installation',
      }),
    listVercelProjects: ({ token, installationId }) =>
      requestJson(buildAppsUrl(`/apps/vercel/installations/${installationId}/projects`), {
        token,
        fallbackError: 'Failed to load Vercel projects',
      }),
    saveVercelSubscriptions: ({ token, body }) =>
      requestJson(buildAppsUrl('/apps/vercel/subscriptions'), {
        method: 'POST',
        token,
        body,
        fallbackError: 'Failed to save Vercel subscriptions',
      }),
    deleteVercelSubscription: ({ token, subscriptionId }) =>
      requestVoid(buildAppsUrl(`/apps/vercel/subscriptions/${subscriptionId}`), {
        method: 'DELETE',
        token,
        fallbackError: 'Failed to remove Vercel subscription',
      }),
  };
}
