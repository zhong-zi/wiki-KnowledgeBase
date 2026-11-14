"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SAMPLE_WORKSPACE_ID = void 0;
exports.sampleEvent = sampleEvent;
exports.SAMPLE_WORKSPACE_ID = '11111111-1111-7111-8111-111111111111';
function sampleEvent(id = 'e1') {
    return {
        id,
        schema_version: 1,
        timestamp: '2026-09-02T14:03:11.412Z',
        event: 'page.deleted',
        summary: 'Jane Doe deleted page “Q3”',
        workspace: { id: exports.SAMPLE_WORKSPACE_ID, name: 'Acme', hostname: 'acme.docmost.com' },
        actor: { type: 'user', id: 'u1', name: 'Jane Doe', email: 'jane@acme.com' },
        principal: null,
        resource: { type: 'page', id: 'p1', name: 'Q3' },
        space: null,
        changes: null,
        metadata: null,
        client: { ip: '203.0.113.5', userAgent: 'UA' },
    };
}
//# sourceMappingURL=sample-event.js.map