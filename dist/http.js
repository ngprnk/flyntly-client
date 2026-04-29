export class FlyntlyApiError extends Error {
    status;
    payload;
    constructor(message, status, payload) {
        super(message);
        this.name = 'FlyntlyApiError';
        this.status = status;
        this.payload = payload;
    }
}
export function isFlyntlyApiError(error) {
    return error instanceof FlyntlyApiError;
}
export async function requestJson(url, options = {}) {
    const { fallbackError = 'Request failed' } = options;
    const response = await sendRequest(url, options);
    await assertOk(response, fallbackError);
    return (await response.json());
}
export async function requestVoid(url, options = {}) {
    const { fallbackError = 'Request failed' } = options;
    const response = await sendRequest(url, options);
    await assertOk(response, fallbackError);
}
async function sendRequest(url, options) {
    const { token, body, headers, fallbackError: _fallbackError, ...requestOptions } = options;
    const resolvedHeaders = new Headers(headers);
    if (token) {
        resolvedHeaders.set('Authorization', `Bearer ${token}`);
    }
    let resolvedBody;
    if (body !== undefined) {
        resolvedHeaders.set('Content-Type', 'application/json');
        resolvedBody = JSON.stringify(body);
    }
    return fetch(url, {
        ...requestOptions,
        headers: resolvedHeaders,
        body: resolvedBody,
    });
}
async function assertOk(response, fallbackError) {
    if (response.ok) {
        return;
    }
    const errorPayload = await response.json().catch(() => null);
    throw new FlyntlyApiError(errorPayload?.error || fallbackError, response.status, errorPayload);
}
//# sourceMappingURL=http.js.map