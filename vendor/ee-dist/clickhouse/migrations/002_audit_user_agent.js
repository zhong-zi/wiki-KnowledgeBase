"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.up = up;
async function up(client) {
    await client.command({
        query: `ALTER TABLE audit ADD COLUMN IF NOT EXISTS user_agent Nullable(String)`,
    });
}
//# sourceMappingURL=002_audit_user_agent.js.map