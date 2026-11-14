"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isMcpEnabled = isMcpEnabled;
exports.isMcpOauthEnforced = isMcpOauthEnforced;
exports.toWebRequest = toWebRequest;
function isMcpEnabled(workspace) {
    return workspace?.settings?.['ai']?.['mcp'] === true;
}
function isMcpOauthEnforced(workspace) {
    return workspace?.settings?.['ai']?.['enforceMcpOauth'] === true;
}
function toWebRequest(req) {
    const headers = new Headers();
    for (const [name, value] of Object.entries(req.headers)) {
        if (value === undefined || name.startsWith(':'))
            continue;
        for (const item of Array.isArray(value) ? value : [value]) {
            headers.append(name, item);
        }
    }
    return new Request(new URL(req.url, `${req.protocol}://${req.host}`), {
        method: req.method,
        headers,
    });
}
//# sourceMappingURL=mcp.util.js.map