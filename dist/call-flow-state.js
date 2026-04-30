export const initialCallFlowState = {
    phase: 'idle',
    action: null,
    operationId: null,
    callId: null,
    kind: null,
    error: null,
};
const pendingPhases = new Set([
    'starting',
    'joining',
    'connecting',
    'leaving',
    'ending',
]);
export function createCallOperationId(action) {
    return `${action}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
}
export function isTemporaryCallId(callId) {
    return Boolean(callId?.startsWith('temp:'));
}
export function isCallFlowBusy(phase) {
    return pendingPhases.has(phase);
}
export function shouldIgnoreCallOperation(state, operationId) {
    return state.operationId !== operationId;
}
export function deriveCallPhase(call, currentUserId) {
    if (!call || !isActiveCall(call)) {
        return 'idle';
    }
    const participantStatus = currentUserId
        ? call.participants.find((participant) => participant.userId === currentUserId)?.status ?? null
        : null;
    if (participantStatus === 'joined' || call.createdBy === currentUserId || call.status === 'live') {
        return 'live';
    }
    return call.createdBy === currentUserId ? 'ringing' : 'incoming';
}
export function reduceCallFlowState(state, event) {
    switch (event.type) {
        case 'reset':
            return initialCallFlowState;
        case 'dismiss':
            return { ...initialCallFlowState };
        case 'sync': {
            if (pendingPhases.has(state.phase)) {
                return state;
            }
            const phase = deriveCallPhase(event.call, event.currentUserId);
            return {
                phase,
                action: null,
                operationId: null,
                callId: event.call?.id ?? null,
                kind: event.call?.kind ?? null,
                error: state.phase === 'failed' && phase === 'idle' ? state.error : null,
            };
        }
        case 'startRequested':
            return {
                phase: 'starting',
                action: 'start',
                operationId: event.operationId,
                callId: event.callId,
                kind: event.kind,
                error: null,
            };
        case 'joinRequested':
            return {
                phase: 'joining',
                action: 'join',
                operationId: event.operationId,
                callId: event.callId,
                kind: event.kind,
                error: null,
            };
        case 'backendSucceeded':
            if (shouldIgnoreCallOperation(state, event.operationId)) {
                return state;
            }
            return {
                phase: 'connecting',
                action: state.action,
                operationId: event.operationId,
                callId: event.callId,
                kind: event.kind,
                error: null,
            };
        case 'sdkJoined':
            return {
                ...state,
                phase: 'live',
                action: null,
                operationId: null,
                error: null,
            };
        case 'leaveRequested':
            return {
                phase: 'leaving',
                action: 'leave',
                operationId: null,
                callId: event.callId,
                kind: event.kind,
                error: null,
            };
        case 'endRequested':
            return {
                phase: 'ending',
                action: 'end',
                operationId: null,
                callId: event.callId,
                kind: event.kind,
                error: null,
            };
        case 'operationFailed':
            if (event.operationId && shouldIgnoreCallOperation(state, event.operationId)) {
                return state;
            }
            return {
                ...state,
                phase: 'failed',
                action: null,
                operationId: null,
                error: event.message,
            };
        default:
            return state;
    }
}
export function buildOptimisticCall(input) {
    const timestamp = input.timestamp ?? Date.now();
    return {
        id: `temp:${input.operationId}`,
        channelId: input.channelId,
        createdBy: input.currentUserId,
        kind: input.kind,
        status: 'ringing',
        startedAt: timestamp,
        ringExpiresAt: timestamp + 45_000,
        endedAt: null,
        participants: [
            {
                userId: input.currentUserId,
                status: 'joined',
                joinedAt: timestamp,
                leftAt: null,
                declinedAt: null,
            },
        ],
    };
}
export function callFlowStatusText(phase, call) {
    switch (phase) {
        case 'starting':
            return 'Starting call...';
        case 'joining':
            return 'Joining call...';
        case 'connecting':
            return 'Connecting...';
        case 'leaving':
            return 'Leaving...';
        case 'ending':
            return 'Ending...';
        case 'failed':
            return 'Call failed';
        case 'incoming':
            return call?.status === 'live' ? 'Live. Join when ready.' : 'Ringing. Join when ready.';
        case 'ringing':
            return 'Ringing in this conversation';
        case 'live':
            return 'Live in this conversation';
        case 'idle':
        default:
            return call?.status === 'ringing' ? 'Ringing' : 'Live';
    }
}
function isActiveCall(call) {
    return call.status === 'ringing' || call.status === 'live';
}
//# sourceMappingURL=call-flow-state.js.map