"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.redactSecrets = redactSecrets;
exports.sanitiseError = sanitiseError;
function redactSecrets(message, secrets) {
    if (!secrets)
        return message;
    const values = Object.values(secrets)
        .filter((v) => typeof v === 'string' && v.length > 0)
        .sort((a, b) => b.length - a.length);
    let out = message;
    for (const value of values)
        out = out.split(value).join('[redacted]');
    return out;
}
function sanitiseError(err, secrets, maxLength = 500) {
    const message = err instanceof Error ? err.message : String(err);
    return redactSecrets(message, secrets)
        .replace(/\s+/g, ' ')
        .trim()
        .slice(0, maxLength);
}
//# sourceMappingURL=redact.js.map