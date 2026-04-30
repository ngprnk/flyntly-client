import type { CallKind, CallRecord } from './chat-api.js';

export type CallFlowPhase =
  | 'idle'
  | 'starting'
  | 'ringing'
  | 'incoming'
  | 'joining'
  | 'connecting'
  | 'live'
  | 'leaving'
  | 'ending'
  | 'failed';

export type CallFlowAction = 'start' | 'join' | 'decline' | 'leave' | 'end';

export interface CallFlowState {
  phase: CallFlowPhase;
  action: CallFlowAction | null;
  operationId: string | null;
  callId: string | null;
  kind: CallKind | null;
  error: string | null;
}

export type CallFlowEvent =
  | { type: 'reset' }
  | { type: 'sync'; call: CallRecord | null; currentUserId: string | null }
  | { type: 'startRequested'; operationId: string; callId: string; kind: CallKind }
  | { type: 'joinRequested'; operationId: string; callId: string; kind: CallKind }
  | { type: 'backendSucceeded'; operationId: string; callId: string; kind: CallKind }
  | { type: 'sdkJoined' }
  | { type: 'leaveRequested'; callId: string | null; kind: CallKind | null }
  | { type: 'endRequested'; callId: string | null; kind: CallKind | null }
  | { type: 'operationFailed'; operationId: string | null; message: string }
  | { type: 'dismiss' };

export const initialCallFlowState: CallFlowState = {
  phase: 'idle',
  action: null,
  operationId: null,
  callId: null,
  kind: null,
  error: null,
};

const pendingPhases = new Set<CallFlowPhase>([
  'starting',
  'joining',
  'connecting',
  'leaving',
  'ending',
]);

export function createCallOperationId(action: CallFlowAction): string {
  return `${action}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
}

export function isTemporaryCallId(callId: string | null | undefined): boolean {
  return Boolean(callId?.startsWith('temp:'));
}

export function isCallFlowBusy(phase: CallFlowPhase): boolean {
  return pendingPhases.has(phase);
}

export function shouldIgnoreCallOperation(state: CallFlowState, operationId: string): boolean {
  return state.operationId !== operationId;
}

export function deriveCallPhase(call: CallRecord | null, currentUserId: string | null): CallFlowPhase {
  if (!call || !isActiveCall(call)) {
    return 'idle';
  }

  const participantStatus = currentUserId
    ? call.participants.find((participant) => participant.userId === currentUserId)?.status ?? null
    : null;

  if (participantStatus === 'joined') {
    return 'live';
  }

  if (call.createdBy === currentUserId) {
    return call.status === 'ringing' ? 'ringing' : 'live';
  }

  return 'incoming';
}

export function reduceCallFlowState(
  state: CallFlowState,
  event: CallFlowEvent,
): CallFlowState {
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

export function buildOptimisticCall(input: {
  channelId: string;
  currentUserId: string;
  kind: CallKind;
  operationId: string;
  timestamp?: number;
}): CallRecord {
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

export function callFlowStatusText(phase: CallFlowPhase, call: CallRecord | null): string {
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
      if (!call) {
        return 'Connecting...';
      }
      return call?.status === 'ringing' ? 'Ringing' : 'Live';
  }
}

function isActiveCall(call: CallRecord): boolean {
  return call.status === 'ringing' || call.status === 'live';
}
