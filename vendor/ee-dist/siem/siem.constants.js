"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SIEM_LICENSE_CACHE_TTL_MS = exports.SIEM_BACKOFF_MAX_MS = exports.SIEM_BACKOFF_BASE_MS = exports.SIEM_NOTIFICATION_ERROR_MAX_LENGTH = exports.SIEM_MAX_NOTIFICATION_RECIPIENTS = exports.SIEM_MAX_DESTINATIONS_PER_WORKSPACE = exports.SIEM_AUTO_DISABLE_AFTER_MS = exports.SIEM_FAILING_THRESHOLD = exports.SIEM_MAX_PAYLOAD_BYTES = exports.SIEM_MAX_EVENT_BYTES = exports.SIEM_REQUEST_TIMEOUT_MS = exports.SIEM_MAX_BATCHES_PER_JOB = exports.SIEM_CLICKHOUSE_LAG_MS = exports.SIEM_LAG_MS = exports.SIEM_SCHEDULER_REFRESH_MS = exports.SIEM_SCHEDULER_RETRY_MAX_MS = exports.SIEM_SCHEDULER_RETRY_BASE_MS = exports.SIEM_SWEEP_EVERY_MS = exports.SIEM_SWEEP_SCHEDULER_ID = exports.NIL_UUID = exports.SERVER_VERSION = void 0;
exports.siemDeliverJobId = siemDeliverJobId;
const packageJson = require('../../../package.json');
exports.SERVER_VERSION = packageJson.version ?? '0.0.0';
exports.NIL_UUID = '00000000-0000-0000-0000-000000000000';
exports.SIEM_SWEEP_SCHEDULER_ID = 'siem-sweep';
exports.SIEM_SWEEP_EVERY_MS = 10_000;
exports.SIEM_SCHEDULER_RETRY_BASE_MS = 5_000;
exports.SIEM_SCHEDULER_RETRY_MAX_MS = 60_000;
exports.SIEM_SCHEDULER_REFRESH_MS = 5 * 60_000;
exports.SIEM_LAG_MS = 5_000;
exports.SIEM_CLICKHOUSE_LAG_MS = 30_000;
exports.SIEM_MAX_BATCHES_PER_JOB = 10;
var outbound_agent_factory_1 = require("../../integrations/outbound/outbound-agent.factory");
Object.defineProperty(exports, "SIEM_REQUEST_TIMEOUT_MS", { enumerable: true, get: function () { return outbound_agent_factory_1.OUTBOUND_REQUEST_TIMEOUT_MS; } });
exports.SIEM_MAX_EVENT_BYTES = 32 * 1024;
exports.SIEM_MAX_PAYLOAD_BYTES = 4 * 1024 * 1024;
exports.SIEM_FAILING_THRESHOLD = 3;
exports.SIEM_AUTO_DISABLE_AFTER_MS = 24 * 60 * 60 * 1000;
exports.SIEM_MAX_DESTINATIONS_PER_WORKSPACE = 2;
exports.SIEM_MAX_NOTIFICATION_RECIPIENTS = 3;
exports.SIEM_NOTIFICATION_ERROR_MAX_LENGTH = 200;
exports.SIEM_BACKOFF_BASE_MS = 30_000;
exports.SIEM_BACKOFF_MAX_MS = 30 * 60_000;
exports.SIEM_LICENSE_CACHE_TTL_MS = 60 * 60 * 1000;
function siemDeliverJobId(destinationId) {
    return `siem-deliver-${destinationId}`;
}
//# sourceMappingURL=siem.constants.js.map