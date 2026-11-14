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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const register_client_dto_1 = require("./dto/register-client.dto");
const authorize_dto_1 = require("./dto/authorize.dto");
const mcp_util_1 = require("../mcp/mcp.util");
const oauth_client_service_1 = require("./services/oauth-client.service");
const oauth_authorize_service_1 = require("./services/oauth-authorize.service");
const oauth_token_service_1 = require("./services/oauth-token.service");
const oauth_grant_service_1 = require("./services/oauth-grant.service");
const revoke_grant_dto_1 = require("./dto/revoke-grant.dto");
const oauth_util_1 = require("./oauth.util");
const environment_service_1 = require("../../integrations/environment/environment.service");
const license_service_1 = require("../licence/license.service");
const skip_transform_decorator_1 = require("../../common/decorators/skip-transform.decorator");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const require_session_auth_decorator_1 = require("../../common/decorators/require-session-auth.decorator");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const auth_workspace_decorator_1 = require("../../common/decorators/auth-workspace.decorator");
const feature_guard_1 = require("../licence/guards/feature.guard");
const features_1 = require("../../common/features");
const throttler_names_1 = require("../../integrations/throttle/throttler-names");
let RegisterClientValidationFilter = class RegisterClientValidationFilter {
    catch(exception, host) {
        host
            .switchToHttp()
            .getResponse()
            .status(400)
            .send((0, register_client_dto_1.registerClientValidationError)(exception.getResponse()));
    }
};
RegisterClientValidationFilter = __decorate([
    (0, common_1.Catch)(common_1.BadRequestException)
], RegisterClientValidationFilter);
let OAuthController = class OAuthController {
    constructor(oauthClientService, oauthAuthorizeService, oauthTokenService, oauthGrantService, environmentService, licenseService) {
        this.oauthClientService = oauthClientService;
        this.oauthAuthorizeService = oauthAuthorizeService;
        this.oauthTokenService = oauthTokenService;
        this.oauthGrantService = oauthGrantService;
        this.environmentService = environmentService;
        this.licenseService = licenseService;
    }
    async register(dto, req) {
        const workspace = req.raw.workspace;
        const workspaceId = req.raw.workspaceId;
        this.assertAvailable(workspace);
        this.assertMcpEnabled(workspace);
        return this.oauthClientService.registerClient(dto, workspaceId);
    }
    async authorizeInfo(dto, workspace, req) {
        this.assertAvailable(workspace);
        this.assertMcpEnabled(workspace);
        return this.oauthAuthorizeService.getAuthorizationInfo(dto, workspace.id, this.buildIssuerOrigin(req));
    }
    async authorize(dto, user, workspace, req) {
        this.assertAvailable(workspace);
        this.assertMcpEnabled(workspace);
        return this.oauthAuthorizeService.approveAuthorization(user, dto, workspace.id, this.buildIssuerOrigin(req));
    }
    async token(req, reply) {
        const workspace = req.raw.workspace;
        const workspaceId = req.raw.workspaceId;
        this.assertAvailable(workspace);
        this.assertMcpEnabled(workspace);
        return this.oauthTokenService.respondToTokenRequest(req, reply, workspaceId, this.buildIssuerOrigin(req));
    }
    async revoke(body, req) {
        const workspace = req.raw.workspace;
        const workspaceId = req.raw.workspaceId;
        this.assertAvailable(workspace);
        await this.oauthTokenService.revokeToken(body ?? {}, workspaceId);
        return {};
    }
    async listGrants(user, workspace) {
        return this.oauthGrantService.listUserGrants(user.id, workspace.id);
    }
    async revokeGrant(dto, user, workspace) {
        await this.oauthGrantService.revokeUserGrant(user.id, dto.grantId, workspace.id);
        return {};
    }
    assertAvailable(workspace) {
        if (this.environmentService.isSelfHosted() &&
            !this.licenseService.isValidEELicense(workspace?.licenseKey)) {
            throw new common_1.ForbiddenException('This endpoint requires a valid enterprise license.');
        }
    }
    assertMcpEnabled(workspace) {
        if (!(0, mcp_util_1.isMcpEnabled)(workspace)) {
            throw new common_1.ForbiddenException('MCP is not enabled for this workspace');
        }
    }
    buildIssuerOrigin(req) {
        return (0, oauth_util_1.buildIssuerOrigin)(req.raw.headers.host, this.environmentService.isHttps());
    }
};
exports.OAuthController = OAuthController;
__decorate([
    (0, throttler_1.SkipThrottle)({ [throttler_names_1.OAUTH_REGISTER_THROTTLER]: false }),
    (0, common_1.UseFilters)(RegisterClientValidationFilter),
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_client_dto_1.RegisterClientDto, Object]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "register", null);
__decorate([
    (0, require_session_auth_decorator_1.RequireSessionAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, throttler_1.SkipThrottle)({ [throttler_names_1.OAUTH_AUTHORIZE_THROTTLER]: false }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('authorize-info'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authorize_dto_1.AuthorizeParamsDto, Object, Object]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "authorizeInfo", null);
__decorate([
    (0, require_session_auth_decorator_1.RequireSessionAuth)(),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, throttler_1.SkipThrottle)({ [throttler_names_1.OAUTH_AUTHORIZE_THROTTLER]: false }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('authorize'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __param(3, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [authorize_dto_1.ApproveAuthorizationDto, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "authorize", null);
__decorate([
    (0, throttler_1.SkipThrottle)({ [throttler_names_1.OAUTH_TOKEN_THROTTLER]: false }),
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Post)('token'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "token", null);
__decorate([
    (0, throttler_1.SkipThrottle)({ [throttler_names_1.OAUTH_TOKEN_THROTTLER]: false }),
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('revoke'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "revoke", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, feature_guard_1.FeatureGuard),
    (0, feature_guard_1.RequireFeature)(features_1.Feature.OAUTH),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('grants'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "listGrants", null);
__decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, feature_guard_1.FeatureGuard),
    (0, feature_guard_1.RequireFeature)(features_1.Feature.OAUTH),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('grants/revoke'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [revoke_grant_dto_1.RevokeGrantDto, Object, Object]),
    __metadata("design:returntype", Promise)
], OAuthController.prototype, "revokeGrant", null);
exports.OAuthController = OAuthController = __decorate([
    (0, throttler_1.SkipThrottle)({ ...throttler_names_1.ALL_NAMED_THROTTLERS_SKIPPED }),
    (0, common_1.UseGuards)(throttler_1.ThrottlerGuard),
    (0, common_1.Controller)('oauth'),
    __metadata("design:paramtypes", [oauth_client_service_1.OAuthClientService,
        oauth_authorize_service_1.OAuthAuthorizeService,
        oauth_token_service_1.OAuthTokenService,
        oauth_grant_service_1.OAuthGrantService,
        environment_service_1.EnvironmentService,
        license_service_1.LicenseService])
], OAuthController);
//# sourceMappingURL=oauth.controller.js.map