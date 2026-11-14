"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthJwtService = void 0;
const oauth2_server_1 = require("@jmondi/oauth2-server");
class OAuthJwtService extends oauth2_server_1.JwtService {
    constructor(secret, workspaceId, issuerOrigin) {
        super(secret);
        this.workspaceId = workspaceId;
        this.issuerOrigin = issuerOrigin;
    }
    extraTokenFields({ user }) {
        const grantId = user?.grantId;
        if (typeof grantId !== 'string' || !grantId) {
            throw oauth2_server_1.OAuthException.invalidGrant('Token is not bound to a grant');
        }
        return {
            type: 'oauth_access',
            workspaceId: this.workspaceId,
            grantId,
            aud: this.issuerOrigin,
        };
    }
}
exports.OAuthJwtService = OAuthJwtService;
//# sourceMappingURL=oauth-jwt.service.js.map