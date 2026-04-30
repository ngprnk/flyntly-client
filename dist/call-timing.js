function nowMs() {
    return globalThis.performance?.now?.() ?? Date.now();
}
function randomSuffix() {
    return Math.random().toString(36).slice(2, 8);
}
export function createCallTiming(action, callId) {
    return {
        traceId: `${action}:${callId}:${Date.now()}:${randomSuffix()}`,
        action,
        callId,
        startedAtMs: nowMs(),
    };
}
export function createCallTimingFromRoute(action, callId, traceId, startedAtMs) {
    const parsedStartedAtMs = startedAtMs ? Number(startedAtMs) : Number.NaN;
    return {
        traceId: traceId || `${action}:${callId}:${Date.now()}:${randomSuffix()}`,
        action,
        callId,
        startedAtMs: Number.isFinite(parsedStartedAtMs) ? parsedStartedAtMs : nowMs(),
    };
}
export function markCallTiming(timing, phase, details = {}) {
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
export function callTimingNowMs() {
    return nowMs();
}
//# sourceMappingURL=call-timing.js.map