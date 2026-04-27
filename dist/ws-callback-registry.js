export class WSCallbackRegistry {
    callbacks = {
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
        attachmentTranscodeUpdated: new Set(),
    };
    subscribe(event, callback) {
        this.callbacks[event].add(callback);
        return () => {
            this.callbacks[event].delete(callback);
        };
    }
    emit(event, ...args) {
        this.callbacks[event].forEach((callback) => {
            const typedCallback = callback;
            typedCallback(...args);
        });
    }
    count(event) {
        return this.callbacks[event].size;
    }
}
//# sourceMappingURL=ws-callback-registry.js.map