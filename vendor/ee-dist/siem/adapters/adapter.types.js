"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiemDeliveryError = void 0;
exports.isRetryableStatus = isRetryableStatus;
class SiemDeliveryError extends Error {
    constructor(message, retryable, statusCode) {
        super(message);
        this.retryable = retryable;
        this.statusCode = statusCode;
        this.name = 'SiemDeliveryError';
    }
}
exports.SiemDeliveryError = SiemDeliveryError;
function isRetryableStatus(status) {
    if (status >= 500)
        return true;
    return status === 408 || status === 425 || status === 429;
}
//# sourceMappingURL=adapter.types.js.map