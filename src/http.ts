export interface RequestJsonOptions extends Omit<RequestInit, 'headers' | 'body'> {
  token?: string | null;
  body?: unknown;
  headers?: HeadersInit;
  fallbackError?: string;
}

export class FlyntlyApiError extends Error {
  public readonly status: number;
  public readonly payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = 'FlyntlyApiError';
    this.status = status;
    this.payload = payload;
  }
}

export function isFlyntlyApiError(error: unknown): error is FlyntlyApiError {
  return error instanceof FlyntlyApiError;
}

export async function requestJson<TResponse>(
  url: string,
  options: RequestJsonOptions = {},
): Promise<TResponse> {
  const { token, body, headers, fallbackError = 'Request failed', ...requestOptions } = options;
  const resolvedHeaders = new Headers(headers);

  if (token) {
    resolvedHeaders.set('Authorization', `Bearer ${token}`);
  }

  let resolvedBody: BodyInit | undefined;
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
    const errorPayload = await response.json().catch(() => null) as { error?: string } | null;
    throw new FlyntlyApiError(errorPayload?.error || fallbackError, response.status, errorPayload);
  }

  return (await response.json()) as TResponse;
}

export async function requestVoid(url: string, options: RequestJsonOptions = {}): Promise<void> {
  await requestJson<unknown>(url, options);
}
