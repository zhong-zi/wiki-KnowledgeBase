"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthEngineFactory = void 0;
const common_1 = require("@nestjs/common");
const oauth2_server_1 = require("@jmondi/oauth2-server");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const oauth_repo_1 = require("../repos/oauth.repo");
const oauth_constants_1 = require("../oauth.constants");
const oauth_jwt_service_1 = require("./oauth-jwt.service");
const repositories_1 = require("./repositories");
let OAuthEngineFactory = class OAuthEngineFactory {
    constructor(oauthRepo, environmentService) {
        this.oauthRepo = oauthRepo;
        this.environmentService = environmentService;
    }
    build(opts) {
        const { workspaceId, issuerOrigin } = opts;
        const server = new oauth2_server_1.AuthorizationServer(new repositories_1.WorkspaceClientRepository(this.oauthRepo, workspaceId), new repositories_1.WorkspaceTokenRepository(this.oauthRepo, workspaceId), new repositories_1.WorkspaceScopeRepository(), new oauth_jwt_service_1.OAuthJwtService(this.environmentService.getAppSecret(), workspaceId, issuerOrigin), {
            requiresPKCE: true,
            requiresS256: true,
            issuer: issuerOrigin,
            useOpaqueAuthorizationCodes: true,
            useOpaqueRefreshTokens: true,
        });
        delete server.enabledGrantTypes['client_credentials'];
        delete server.grantTypeAccessTokenTTL['client_credentials'];
        server.enableGrantType({
            grant: 'authorization_code',
            authCodeRepository: new repositories_1.WorkspaceAuthCodeRepository(this.oauthRepo, workspaceId),
            userRepository: new repositories_1.WorkspaceUserRepository(this.oauthRepo, workspaceId),
        }, new oauth2_server_1.DateInterval(oauth_constants_1.ACCESS_TOKEN_TTL));
        server.enableGrantType('refresh_token', new oauth2_server_1.DateInterval(oauth_constants_1.ACCESS_TOKEN_TTL));
        server.getGrant('authorization_code').authCodeTTL =
            new oauth2_server_1.DateInterval('1m');
        return server;
    }
};
exports.OAuthEngineFactory = OAuthEngineFactory;
exports.OAuthEngineFactory = OAuthEngineFactory = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [oauth_repo_1.OAuthRepo,
        environment_service_1.EnvironmentService])
], OAuthEngineFactory);
//# sourceMappingURL=oauth-engine.factory.js.map