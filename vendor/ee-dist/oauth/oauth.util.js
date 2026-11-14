"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildIssuerOrigin = buildIssuerOrigin;
function buildIssuerOrigin(hostHeader, isHttps) {
    return `${isHttps ? 'https' : 'http'}://${hostHeader}`;
}
//# sourceMappingURL=oauth.util.js.map