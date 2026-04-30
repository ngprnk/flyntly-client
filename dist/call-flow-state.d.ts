import type { CallKind, CallRecord } from './chat-api.js';
export type CallFlowPhase = 'idle' | 'starting' | 'ringing' | 'incoming' | 'joining' | 'connecting' | 'live' | 'leaving' | 'ending' | 'failed';
export type CallFlowAction = 'start' | 'join' | 'decline' | 'leave' | 'end';
export interface CallFlowState {
    phase: CallFlowPhase;
    action: CallFlowAction | null;
    operationId: string | null;
    callId: string | null;
    kind: CallKind | null;
    error: string | null;
}
export type CallFlowEvent = {
    type: 'reset';
} | {
    type: 'sync';
    call: CallRecord | null;
    currentUserId: string | null;
} | {
    type: 'startRequested';
    operationId: string;
    callId: string;
    kind: CallKind;
} | {
    type: 'joinRequested';
    operationId: string;
    callId: string;
    kind: CallKind;
} | {
    type: 'backendSucceeded';
    operationId: string;
    callId: string;
    kind: CallKind;
} | {
    type: 'sdkJoined';
} | {
    type: 'leaveRequested';
    callId: string | null;
    kind: CallKind | null;
} | {
    type: 'endRequested';
    callId: string | null;
    kind: CallKind | null;
} | {
    type: 'operationFailed';
    operationId: string | null;
    message: string;
} | {
    type: 'dismiss';
};
export declare const initialCallFlowState: CallFlowState;
export declare function createCallOperationId(action: CallFlowAction): string;
export declare function isTemporaryCallId(callId: string | null | undefined): boolean;
export declare function isCallFlowBusy(phase: CallFlowPhase): boolean;
export declare function shouldIgnoreCallOperation(state: CallFlowState, operationId: string): boolean;
export declare function deriveCallPhase(call: CallRecord | null, currentUserId: string | null): CallFlowPhase;
export declare function reduceCallFlowState(state: CallFlowState, event: CallFlowEvent): CallFlowState;
export declare function buildOptimisticCall(input: {
    channelId: string;
    currentUserId: string;
    kind: CallKind;
    operationId: string;
    timestamp?: number;
}): CallRecord;
export declare function callFlowStatusText(phase: CallFlowPhase, call: CallRecord | null): string;
//# sourceMappingURL=call-flow-state.d.ts.map