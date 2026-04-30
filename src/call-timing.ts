export type CallTimingAction = 'start' | 'join';

export type CallTimingContext = {
  traceId: string;
  action: CallTimingAction;
  callId: string;
  startedAtMs: number;
};

type CallTimingDetails = Record<string, string | number | boolean | null | undefined>;

function nowMs(): number {
  return globalThis.performance?.now?.() ?? Date.now();
}

function randomSuffix(): string {
  return Math.random().toString(36).slice(2, 8);
}

export function createCallTiming(action: CallTimingAction, callId: string): CallTimingContext {
  return {
    traceId: `${action}:${callId}:${Date.now()}:${randomSuffix()}`,
    action,
    callId,
    startedAtMs: nowMs(),
  };
}

export function createCallTimingFromRoute(
  action: CallTimingAction,
  callId: string,
  traceId: string | undefined,
  startedAtMs: string | undefined,
): CallTimingContext {
  const parsedStartedAtMs = startedAtMs ? Number(startedAtMs) : Number.NaN;
  return {
    traceId: traceId || `${action}:${callId}:${Date.now()}:${randomSuffix()}`,
    action,
    callId,
    startedAtMs: Number.isFinite(parsedStartedAtMs) ? parsedStartedAtMs : nowMs(),
  };
}

export function markCallTiming(
  timing: CallTimingContext,
  phase: string,
  details: CallTimingDetails = {},
): void {
  const elapsedMs = Math.round(nowMs() - timing.startedAtMs);
  console.info('[CallTiming]', {
    traceId: timing.traceId,
    action: timing.action,
    callId: timing.callId,
    phase,
    elapsedMs,
    ...details,
  });
}

export function callTimingNowMs(): number {
  return nowMs();
}
