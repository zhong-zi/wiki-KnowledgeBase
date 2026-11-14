"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.backoffMs = backoffMs;
const siem_constants_1 = require("./siem.constants");
function backoffMs(consecutiveFailures) {
    const n = Math.max(1, consecutiveFailures);
    return Math.min(siem_constants_1.SIEM_BACKOFF_BASE_MS * 2 ** (n - 1), siem_constants_1.SIEM_BACKOFF_MAX_MS);
}
//# sourceMappingURL=backoff.js.map