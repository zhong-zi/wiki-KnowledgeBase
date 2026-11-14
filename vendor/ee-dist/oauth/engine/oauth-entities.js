"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sha256hex = sha256hex;
exports.randomTokenString = randomTokenString;
exports.toScopeEntities = toScopeEntities;
exports.clientRef = clientRef;
exports.toJmondiClient = toJmondiClient;
exports.toJmondiAuthCode = toJmondiAuthCode;
exports.toJmondiToken = toJmondiToken;
const node_crypto_1 = require("node:crypto");
function sha256hex(value) {
    return (0, node_crypto_1.createHash)('sha256').update(value).digest('hex');
}
function randomTokenString() {
    return (0, node_crypto_1.randomBytes)(48).toString('base64url');
}
function toScopeEntities(scopes) {
    return scopes.map((name) => ({ name }));
}
function clientRef(id) {
    return { id, name: '', redirectUris: [], allowedGrants: [], scopes: [] };
}
function toJmondiClient(row) {
    return {
        id: row.id,
        name: row.name,
        redirectUris: row.redirectUris,
        allowedGrants: row.grantTypes,
        scopes: toScopeEntities(row.scopes),
        workspaceId: row.workspaceId,
        tokenEndpointAuthMethod: row.tokenEndpointAuthMethod,
    };
}
function toJmondiAuthCode(row, wireCode) {
    return {
        code: wireCode,
        redirectUri: row.redirectUri,
        codeChallenge: row.codeChallenge,
        codeChallengeMethod: row.codeChallengeMethod,
        expiresAt: row.expiresAt,
        user: { id: row.userId },
        client: clientRef(row.clientId),
        scopes: toScopeEntities(row.scopes),
    };
}
function toJmondiToken(row, grant, wireRefreshToken) {
    return {
        accessToken: row.accessTokenJti,
        accessTokenExpiresAt: row.accessExpiresAt,
        refreshToken: wireRefreshToken,
        refreshTokenExpiresAt: row.refreshExpiresAt,
        client: clientRef(grant.clientId),
        user: { id: grant.userId, grantId: row.grantId },
        scopes: toScopeEntities(row.scopes),
        rowId: row.id,
    };
}
//# sourceMappingURL=oauth-entities.js.map