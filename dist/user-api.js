import { requestJson, requestVoid } from './http.js';
import { createUrlBuilder } from './url.js';
export function createFlyntlyUserApi(config) {
    const buildUrl = createUrlBuilder(config.baseApiUrl);
    return {
        fetchUserProfile: ({ userId, token }) => requestJson(buildUrl(`/users/${userId}`), {
            token,
            fallbackError: 'Failed to load user profile',
        }),
        updateOwnProfile: ({ token, firstName, lastName }) => requestJson(buildUrl('/profile'), {
            method: 'PUT',
            token,
            body: { firstName, lastName },
            fallbackError: 'Failed to update profile',
        }),
        registerPushDevice: ({ authToken, token, tokenEnvironment, installationId, tokenType = 'apns', platform = 'ios', appVersion, deviceName, }) => requestJson(buildUrl('/devices/push-token'), {
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
        unregisterPushDevice: ({ authToken, tokenEnvironment, installationId, token, tokenType = 'apns', platform = 'ios', }) => requestVoid(buildUrl('/devices/push-token'), {
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
//# sourceMappingURL=user-api.js.map