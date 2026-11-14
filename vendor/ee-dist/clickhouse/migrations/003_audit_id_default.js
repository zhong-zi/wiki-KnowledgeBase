"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
async function up(client) {
    await client.command({
        query: `ALTER TABLE audit MODIFY COLUMN id DEFAULT generateUUIDv7()`,
    });
}
//# sourceMappingURL=003_audit_id_default.js.map