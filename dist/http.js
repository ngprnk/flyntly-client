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
    const { token, body, headers, fallbackError = 'Request failed', ...requestOptions } = options;
    const resolvedHeaders = new Headers(headers);
    if (token) {
        resolvedHeaders.set('Authorization', `Bearer ${token}`);
    }
    let resolvedBody;
    if (body !== undefined) {
        resolvedHeaders.set('Content-Type', 'application/json');
        resolvedBody = JSON.stringify(body);
    }
    const response = await fetch(url, {
        ...requestOptions,
        headers: resolvedHeaders,
        body: resolvedBody,
    });
    if (!response.ok) {
        const errorPayload = await response.json().catch(() => null);
        throw new FlyntlyApiError(errorPayload?.error || fallbackError, response.status, errorPayload);
    }
    return (await response.json());
}
export async function requestVoid(url, options = {}) {
    await requestJson(url, options);
}
//# sourceMappingURL=http.js.map