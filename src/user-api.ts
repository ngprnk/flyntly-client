import { requestJson, requestVoid } from './http.js';
import type { WorkspaceUserStatus } from './org-api.js';
import { createUrlBuilder } from './url.js';

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
  workspaceStatus?: WorkspaceUserStatus | null;
}

export interface UserProfileResponse {
  user: UserProfileRecord;
}

export interface UpdateOwnProfileInput {
  token: string;
  firstName: string;
  lastName: string;
}

export interface UpdateOwnProfileResponse {
  user: {
    id: string;
    email: string;
    first_name?: string | null;
    last_name?: string | null;
    firstName?: string | null;
    lastName?: string | null;
  };
  message?: string;
}

export type PushTokenEnvironment = 'development' | 'production';

export interface RegisterPushDeviceInput {
  token: string;
  tokenEnvironment: PushTokenEnvironment;
  installationId: string;
  tokenType?: 'apns';
  platform?: 'ios';
  appVersion?: string | null;
  deviceName?: string | null;
  authToken: string;
}

export interface UnregisterPushDeviceInput {
  tokenEnvironment: PushTokenEnvironment;
  installationId?: string;
  token?: string;
  tokenType?: 'apns';
  platform?: 'ios';
  authToken: string;
}

export interface RegisterPushDeviceResponse {
  device: {
    id: string;
    platform: 'ios';
    tokenType: 'apns';
    tokenEnvironment: PushTokenEnvironment;
    installationId: string;
  };
}

export interface FlyntlyUserApi {
  fetchUserProfile: (input: { userId: string; token: string }) => Promise<UserProfileResponse>;
  updateOwnProfile: (input: UpdateOwnProfileInput) => Promise<UpdateOwnProfileResponse>;
  registerPushDevice: (input: RegisterPushDeviceInput) => Promise<RegisterPushDeviceResponse>;
  unregisterPushDevice: (input: UnregisterPushDeviceInput) => Promise<void>;
}

export function createFlyntlyUserApi(config: FlyntlyUserApiConfig): FlyntlyUserApi {
  const buildUrl = createUrlBuilder(config.baseApiUrl);

  return {
    fetchUserProfile: ({ userId, token }) =>
      requestJson<UserProfileResponse>(buildUrl(`/users/${userId}`), {
        token,
        fallbackError: 'Failed to load user profile',
      }),
    updateOwnProfile: ({ token, firstName, lastName }) =>
      requestJson<UpdateOwnProfileResponse>(buildUrl('/profile'), {
        method: 'PUT',
        token,
        body: { firstName, lastName },
        fallbackError: 'Failed to update profile',
      }),
    registerPushDevice: ({
      authToken,
      token,
      tokenEnvironment,
      installationId,
      tokenType = 'apns',
      platform = 'ios',
      appVersion,
      deviceName,
    }) =>
      requestJson<RegisterPushDeviceResponse>(buildUrl('/devices/push-token'), {
        method: 'POST',
        token: authToken,
        body: {
          token,
          tokenEnvironment,
          installationId,
          tokenType,
          platform,
          appVersion,
          deviceName,
        },
        fallbackError: 'Failed to register push notifications',
      }),
    unregisterPushDevice: ({
      authToken,
      tokenEnvironment,
      installationId,
      token,
      tokenType = 'apns',
      platform = 'ios',
    }) =>
      requestVoid(buildUrl('/devices/push-token'), {
        method: 'DELETE',
        token: authToken,
        body: {
          tokenEnvironment,
          installationId,
          token,
          tokenType,
          platform,
        },
        fallbackError: 'Failed to unregister push notifications',
      }),
  };
}
