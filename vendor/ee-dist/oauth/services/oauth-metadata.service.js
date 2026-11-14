"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthMetadataService = void 0;
const common_1 = require("@nestjs/common");
const oauth_constants_1 = require("../oauth.constants");
let OAuthMetadataService = class OAuthMetadataService {
    buildAuthorizationServerMetadata(issuerOrigin) {
        return {
            issuer: issuerOrigin,
            authorization_endpoint: `${issuerOrigin}/oauth/consent`,
            token_endpoint: `${issuerOrigin}/api/oauth/token`,
            registration_endpoint: `${issuerOrigin}/api/oauth/register`,
            revocation_endpoint: `${issuerOrigin}/api/oauth/revoke`,
            grant_types_supported: ['authorization_code', 'refresh_token'],
            response_types_supported: ['code'],
            code_challenge_methods_supported: ['S256'],
            token_endpoint_auth_methods_supported: ['none'],
            authorization_response_iss_parameter_supported: true,
            scopes_supported: [...oauth_constants_1.OAUTH_SCOPES],
        };
    }
    buildProtectedResourceMetadata(issuerOrigin, resourcePath) {
        return {
            resource: resourcePath ? `${issuerOrigin}${resourcePath}` : issuerOrigin,
            authorization_servers: [issuerOrigin],
            bearer_methods_supported: ['header'],
            scopes_supported: [...oauth_constants_1.OAUTH_SCOPES],
        };
    }
};
exports.OAuthMetadataService = OAuthMetadataService;
exports.OAuthMetadataService = OAuthMetadataService = __decorate([
    (0, common_1.Injectable)()
], OAuthMetadataService);
//# sourceMappingURL=oauth-metadata.service.js.map