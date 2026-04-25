export interface RequestJsonOptions extends Omit<RequestInit, 'headers' | 'body'> {
    token?: string | null;
    body?: unknown;
    headers?: HeadersInit;
    fallbackError?: string;
}
export declare class FlyntlyApiError extends Error {
    readonly status: number;
    readonly payload: unknown;
    constructor(message: string, status: number, payload: unknown);
}
export declare function isFlyntlyApiError(error: unknown): error is FlyntlyApiError;
export declare function requestJson<TResponse>(url: string, options?: RequestJsonOptions): Promise<TResponse>;
export declare function requestVoid(url: string, options?: RequestJsonOptions): Promise<void>;
//# sourceMappingURL=http.d.ts.map