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
  const { fallbackError = 'Request failed' } = options;
  const response = await sendRequest(url, options);
  await assertOk(response, fallbackError);

  return (await response.json()) as TResponse;
}

export async function requestVoid(url: string, options: RequestJsonOptions = {}): Promise<void> {
  const { fallbackError = 'Request failed' } = options;
  const response = await sendRequest(url, options);
  await assertOk(response, fallbackError);
}

async function sendRequest(url: string, options: RequestJsonOptions): Promise<Response> {
  const { token, body, headers, fallbackError: _fallbackError, ...requestOptions } = options;
  const resolvedHeaders = new Headers(headers);

  if (token) {
    resolvedHeaders.set('Authorization', `Bearer ${token}`);
  }

  let resolvedBody: BodyInit | undefined;
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

async function assertOk(response: Response, fallbackError: string): Promise<void> {
  if (response.ok) {
    return;
  }

  const errorPayload = await response.json().catch(() => null) as { error?: string } | null;
  throw new FlyntlyApiError(errorPayload?.error || fallbackError, response.status, errorPayload);
}
