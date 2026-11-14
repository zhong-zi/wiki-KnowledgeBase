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
var OAuthTokenService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthTokenService = void 0;
const common_1 = require("@nestjs/common");
const oauth2_server_1 = require("@jmondi/oauth2-server");
const fastify_1 = require("@jmondi/oauth2-server/fastify");
const oauth_engine_factory_1 = require("../engine/oauth-engine.factory");
const oauth_repo_1 = require("../repos/oauth.repo");
const oauth_entities_1 = require("../engine/oauth-entities");
const token_service_1 = require("../../../core/auth/services/token.service");
const jwt_payload_1 = require("../../../core/auth/dto/jwt-payload");
let OAuthTokenService = OAuthTokenService_1 = class OAuthTokenService {
    constructor(oauthEngineFactory, oauthRepo, tokenService) {
        this.oauthEngineFactory = oauthEngineFactory;
        this.oauthRepo = oauthRepo;
        this.tokenService = tokenService;
        this.logger = new common_1.Logger(OAuthTokenService_1.name);
    }
    async respondToTokenRequest(req, reply, workspaceId, issuerOrigin) {
        const resource = req.body?.resource;
        if (resource != null && resource !== '') {
            let resourceOrigin = null;
            if (typeof resource === 'string') {
                try {
                    resourceOrigin = new URL(resource).origin;
                }
                catch { }
            }
            if (resourceOrigin !== issuerOrigin) {
                this.logger.debug(`token request rejected: resource origin ${resourceOrigin ?? 'unparseable'} does not match issuer ${issuerOrigin}`);
                reply.status(400).send({
                    error: 'invalid_target',
                    error_description: 'The requested resource is not served by this authorization server',
                });
                return;
            }
        }
        const grantType = req.body?.grant_type;
        const clientId = req.body?.client_id;
        this.logger.debug(`token request (grant_type=${grantType} client=${clientId} issuer=${issuerOrigin})`);
        const engine = this.oauthEngineFactory.build({ workspaceId, issuerOrigin });
        try {
            const oauthResponse = await engine.respondToAccessTokenRequest((0, fastify_1.requestFromFastify)(req));
            (0, fastify_1.handleFastifyReply)(reply, oauthResponse);
            this.logger.debug(`token issued (grant_type=${grantType} client=${clientId})`);
        }
        catch (err) {
            if ((0, oauth2_server_1.isOAuthError)(err) &&
                err.errorType === oauth2_server_1.ErrorType.InvalidRequest &&
                err.status === 400 &&
                (err.errorDescription ?? '').toLowerCase().includes('revoked')) {
                this.logger.debug(`token request remapped to invalid_grant (client=${clientId}): ${err.errorDescription}`);
                reply.status(400).send({
                    error: 'invalid_grant',
                    error_description: err.errorDescription,
                });
                return;
            }
            if ((0, oauth2_server_1.isOAuthError)(err)) {
                this.logger.debug(`token request failed (grant_type=${grantType} client=${clientId}): ${err.errorType} ${err.errorDescription ?? ''}`);
            }
            else {
                this.logger.error(`token request unexpected error (grant_type=${grantType} client=${clientId})`, err?.stack);
            }
            (0, fastify_1.handleFastifyError)(err, reply);
        }
    }
    async revokeToken(body, workspaceId) {
        if (typeof body?.token !== 'string' || !body.token) {
            return;
        }
        const token = body.token;
        const clientId = typeof body.client_id === 'string' && body.client_id
            ? body.client_id
            : null;
        const attempts = body.token_type_hint === 'access_token'
            ? [this.revokeAsAccessToken, this.revokeAsRefreshToken]
            : [this.revokeAsRefreshToken, this.revokeAsAccessToken];
        for (const attempt of attempts) {
            if (await attempt.call(this, token, workspaceId, clientId)) {
                return;
            }
        }
    }
    async revokeAsRefreshToken(token, workspaceId, clientId) {
        const row = await this.oauthRepo.findTokenByRefreshHash((0, oauth_entities_1.sha256hex)(token), workspaceId);
        if (!row) {
            return false;
        }
        return this.revokeIfClientMatches(row, workspaceId, clientId);
    }
    async revokeAsAccessToken(token, workspaceId, clientId) {
        let payload;
        try {
            payload = await this.tokenService.verifyJwt(token, jwt_payload_1.JwtType.OAUTH_ACCESS);
        }
        catch {
            return false;
        }
        if (payload.workspaceId !== workspaceId || !payload.jti) {
            return false;
        }
        const row = await this.oauthRepo.findTokenByJti(payload.jti, workspaceId);
        if (!row) {
            return false;
        }
        return this.revokeIfClientMatches(row, workspaceId, clientId);
    }
    async revokeIfClientMatches(row, workspaceId, clientId) {
        if (clientId) {
            const grant = await this.oauthRepo.findGrantById(row.grantId, workspaceId);
            if (!grant || grant.clientId !== clientId) {
                this.logger.debug(`revocation ignored: token of grant ${row.grantId} was not issued to client ${clientId}`);
                return true;
            }
        }
        await this.oauthRepo.revokeToken(row.id, workspaceId);
        return true;
    }
};
exports.OAuthTokenService = OAuthTokenService;
exports.OAuthTokenService = OAuthTokenService = OAuthTokenService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [oauth_engine_factory_1.OAuthEngineFactory,
        oauth_repo_1.OAuthRepo,
        token_service_1.TokenService])
], OAuthTokenService);
//# sourceMappingURL=oauth-token.service.js.map