"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encodePrivateMetadata = encodePrivateMetadata;
exports.decodePrivateMetadata = decodePrivateMetadata;
function encodePrivateMetadata(m) {
    return JSON.stringify(m);
}
function decodePrivateMetadata(raw) {
    let parsed = {};
    try {
        parsed = JSON.parse(raw ?? '{}');
    }
    catch {
        parsed = {};
    }
    const obj = (parsed && typeof parsed === 'object' ? parsed : {});
    const metadata = (obj.metadata && typeof obj.metadata === 'object'
        ? obj.metadata
        : {});
    return {
        contentKey: typeof obj.contentKey === 'string' ? obj.contentKey : '',
        channelId: typeof obj.channelId === 'string' ? obj.channelId : undefined,
        metadata: {
            sender: typeof metadata.sender === 'string' ? metadata.sender : undefined,
            channelName: typeof metadata.channelName === 'string' ? metadata.channelName : undefined,
            timestamp: typeof metadata.timestamp === 'string' ? metadata.timestamp : undefined,
        },
    };
}
//# sourceMappingURL=private-metadata.js.map