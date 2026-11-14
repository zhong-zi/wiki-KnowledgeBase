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
var OAuthStrategyService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthStrategyService = void 0;
const common_1 = require("@nestjs/common");
const user_repo_1 = require("../../../database/repos/user/user.repo");
const workspace_repo_1 = require("../../../database/repos/workspace/workspace.repo");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const helpers_1 = require("../../../common/helpers");
const oauth_repo_1 = require("../repos/oauth.repo");
const oauth_util_1 = require("../oauth.util");
let OAuthStrategyService = OAuthStrategyService_1 = class OAuthStrategyService {
    constructor(oauthRepo, userRepo, workspaceRepo, environmentService) {
        this.oauthRepo = oauthRepo;
        this.userRepo = userRepo;
        this.workspaceRepo = workspaceRepo;
        this.environmentService = environmentService;
        this.logger = new common_1.Logger(OAuthStrategyService_1.name);
    }
    async validateOAuthToken(payload, reqContext) {
        const invalidTokenMsg = 'Invalid OAuth token';
        const requestWorkspaceId = reqContext.workspaceId ??
            (await this.resolveWorkspaceIdFromHost(reqContext.host));
        if (!requestWorkspaceId || payload.workspaceId !== requestWorkspaceId) {
            this.logger.debug(`oauth token rejected: workspace mismatch (token=${payload.workspaceId} request=${requestWorkspaceId ?? 'unresolved'} host=${reqContext.host})`);
            throw new common_1.UnauthorizedException(invalidTokenMsg);
        }
        const expectedAud = (0, oauth_util_1.buildIssuerOrigin)(reqContext.host, this.environmentService.isHttps());
        if (payload.aud !== expectedAud) {
            this.logger.debug(`oauth token rejected: aud mismatch (token=${payload.aud} expected=${expectedAud})`);
            throw new common_1.UnauthorizedException(invalidTokenMsg);
        }
        if (payload.iss !== expectedAud) {
            this.logger.debug(`oauth token rejected: iss mismatch (token=${payload.iss} expected=${expectedAud})`);
            throw new common_1.UnauthorizedException(invalidTokenMsg);
        }
        const grant = await this.oauthRepo.findGrantById(payload.grantId, payload.workspaceId);
        if (!grant || grant.revokedAt) {
            this.logger.debug(`oauth token rejected: grant ${payload.grantId} ${grant ? 'revoked' : 'not found'}`);
            throw new common_1.UnauthorizedException(invalidTokenMsg);
        }
        const tokenRow = await this.oauthRepo.findTokenByJti(payload.jti, payload.workspaceId);
        if (!tokenRow || tokenRow.revokedAt) {
            this.logger.debug(`oauth token rejected: jti ${payload.jti} ${tokenRow ? 'revoked' : 'not found'}`);
            throw new common_1.UnauthorizedException(invalidTokenMsg);
        }
        const user = await this.userRepo.findById(payload.sub, payload.workspaceId);
        if (!user || (0, helpers_1.isUserDisabled)(user)) {
            this.logger.debug(`oauth token rejected: user ${payload.sub} ${user ? 'disabled' : 'not found'}`);
            throw new common_1.UnauthorizedException(invalidTokenMsg);
        }
        const workspace = await this.workspaceRepo.findById(payload.workspaceId);
        if (!workspace) {
            this.logger.debug(`oauth token rejected: workspace ${payload.workspaceId} not found`);
            throw new common_1.UnauthorizedException(invalidTokenMsg);
        }
        await this.oauthRepo.touchGrantLastUsed(grant.id);
        this.logger.debug(`oauth token accepted (grant=${grant.id} scopes=${payload.scope})`);
        return {
            user,
            workspace,
            oauth: {
                grantId: payload.grantId,
                scopes: payload.scope.split(' ').filter(Boolean),
            },
        };
    }
    async resolveWorkspaceIdFromHost(host) {
        if (this.environmentService.isCloud()) {
            const subdomain = host.split('.')[0];
            const workspace = await this.workspaceRepo.findByHostname(subdomain);
            return workspace?.id;
        }
        const workspace = await this.workspaceRepo.findFirst();
        return workspace?.id;
    }
};
exports.OAuthStrategyService = OAuthStrategyService;
exports.OAuthStrategyService = OAuthStrategyService = OAuthStrategyService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [oauth_repo_1.OAuthRepo,
        user_repo_1.UserRepo,
        workspace_repo_1.WorkspaceRepo,
        environment_service_1.EnvironmentService])
], OAuthStrategyService);
//# sourceMappingURL=oauth-strategy.service.js.map