import type { WSEventCallbacks } from './ws-types.js';
export declare class WSCallbackRegistry {
    private readonly callbacks;
    subscribe<K extends keyof WSEventCallbacks>(event: K, callback: WSEventCallbacks[K]): () => void;
    emit<K extends keyof WSEventCallbacks>(event: K, ...args: Parameters<WSEventCallbacks[K]>): void;
    count<K extends keyof WSEventCallbacks>(event: K): number;
}
//# sourceMappingURL=ws-callback-registry.d.ts.map