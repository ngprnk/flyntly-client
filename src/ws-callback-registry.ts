import type { WSEventCallbacks } from './ws-types.js';

export class WSCallbackRegistry {
  private readonly callbacks: {
    [K in keyof WSEventCallbacks]: Set<WSEventCallbacks[K]>;
  } = {
    update: new Set(),
    unread: new Set(),
    channelDeleted: new Set(),
    workspaceAccessRevoked: new Set(),
    message: new Set(),
    messageEdit: new Set(),
    messageDelete: new Set(),
    threadAdded: new Set(),
    threadEdited: new Set(),
    threadDeleted: new Set(),
    reactionToggled: new Set(),
    messagePinned: new Set(),
    messageUnpinned: new Set(),
    presenceBatch: new Set(),
    attachmentTranscodeUpdated: new Set(),
    callStarted: new Set(),
    callUpdated: new Set(),
    callJoined: new Set(),
    callLeft: new Set(),
    callDeclined: new Set(),
    callMissed: new Set(),
    callEnded: new Set(),
    callRingingStopped: new Set(),
  };

  subscribe<K extends keyof WSEventCallbacks>(
    event: K,
    callback: WSEventCallbacks[K],
  ): () => void {
    this.callbacks[event].add(callback);

    return () => {
      this.callbacks[event].delete(callback);
    };
  }

  emit<K extends keyof WSEventCallbacks>(
    event: K,
    ...args: Parameters<WSEventCallbacks[K]>
  ): void {
    this.callbacks[event].forEach((callback) => {
      const typedCallback = callback as (...callbackArgs: Parameters<WSEventCallbacks[K]>) => void;
      typedCallback(...args);
    });
  }

  count<K extends keyof WSEventCallbacks>(event: K): number {
    return this.callbacks[event].size;
  }
}
