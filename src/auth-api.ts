import { requestJson, requestVoid } from './http.js';
import { createUrlBuilder } from './url.js';

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

export interface SwitchOrganizationResponse {
  success: true;
  token: string;
  orgId: string;
  orgName: string;
}

export interface FlyntlyAuthApi {
  login: (input: { email: string; password: string; preferredOrgId?: string | null }) => Promise<LoginResponse>;
  me: (token: string) => Promise<CurrentUserResponse>;
  switchOrg: (input: { token: string; orgId: string }) => Promise<SwitchOrganizationResponse>;
  logout: (token: string) => Promise<void>;
}

export function createFlyntlyAuthApi(config: FlyntlyAuthApiConfig): FlyntlyAuthApi {
  const buildUrl = createUrlBuilder(config.baseApiUrl);

  return {
    login: ({ email, password, preferredOrgId }) =>
      requestJson<LoginResponse>(buildUrl('/auth/login'), {
        method: 'POST',
        body: { email, password, preferredOrgId },
        fallbackError: 'Login failed',
      }),
    me: (token) =>
      requestJson<CurrentUserResponse>(buildUrl('/auth/me'), {
        token,
        fallbackError: 'Failed to load profile',
      }),
    switchOrg: ({ token, orgId }) =>
      requestJson<SwitchOrganizationResponse>(buildUrl('/auth/switch-org'), {
        method: 'POST',
        token,
        body: { orgId },
        fallbackError: 'Failed to switch workspace',
      }),
    logout: (token) =>
      requestVoid(buildUrl('/auth/logout'), {
        method: 'POST',
        token,
        fallbackError: 'Failed to sign out',
      }),
  };
}
