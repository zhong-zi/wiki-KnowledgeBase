"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EMBED_RESUME_CLOCK_SKEW_MS = exports.VECTOR_PREWARM_TTL_MS = exports.TURBOPUFFER_WRITE_TIMEOUT_MS = exports.TURBOPUFFER_QUERY_TIMEOUT_MS = exports.TURBOPUFFER_MAX_RETRIES = exports.VECTOR_SEARCH_MAX_DISTANCE = exports.VECTOR_SEARCH_LIMIT = exports.VectorDriverName = exports.VECTOR_DRIVER_TOKEN = void 0;
exports.VECTOR_DRIVER_TOKEN = 'VECTOR_DRIVER_TOKEN';
var VectorDriverName;
(function (VectorDriverName) {
    VectorDriverName["PGVECTOR"] = "pgvector";
    VectorDriverName["TURBOPUFFER"] = "turbopuffer";
})(VectorDriverName || (exports.VectorDriverName = VectorDriverName = {}));
exports.VECTOR_SEARCH_LIMIT = 20;
exports.VECTOR_SEARCH_MAX_DISTANCE = 0.9;
exports.TURBOPUFFER_MAX_RETRIES = 3;
exports.TURBOPUFFER_QUERY_TIMEOUT_MS = 10_000;
exports.TURBOPUFFER_WRITE_TIMEOUT_MS = 60_000;
exports.VECTOR_PREWARM_TTL_MS = 5 * 60 * 1000;
exports.EMBED_RESUME_CLOCK_SKEW_MS = 5 * 60 * 1000;
//# sourceMappingURL=vector.constants.js.map