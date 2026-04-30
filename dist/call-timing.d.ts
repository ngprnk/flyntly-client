export type CallTimingAction = 'start' | 'join';
export type CallTimingContext = {
    traceId: string;
    action: CallTimingAction;
    callId: string;
    startedAtMs: number;
};
type CallTimingDetails = Record<string, string | number | boolean | null | undefined>;
export declare function createCallTiming(action: CallTimingAction, callId: string): CallTimingContext;
export declare function createCallTimingFromRoute(action: CallTimingAction, callId: string, traceId: string | undefined, startedAtMs: string | undefined): CallTimingContext;
export declare function markCallTiming(timing: CallTimingContext, phase: string, details?: CallTimingDetails): void;
export declare function callTimingNowMs(): number;
export {};
//# sourceMappingURL=call-timing.d.ts.map