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
exports.McpController = void 0;
const common_1 = require("@nestjs/common");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const auth_workspace_decorator_1 = require("../../common/decorators/auth-workspace.decorator");
const skip_transform_decorator_1 = require("../../common/decorators/skip-transform.decorator");
const oauth_scope_decorator_1 = require("../../common/decorators/oauth-scope.decorator");
const mcp_service_1 = require("./mcp.service");
const feature_guard_1 = require("../licence/guards/feature.guard");
const feature_registry_1 = require("../licence/feature-registry");
const mcp_auth_exception_filter_1 = require("./mcp-auth.exception-filter");
const mcp_util_1 = require("./mcp.util");
const jwt_payload_1 = require("../../core/auth/dto/jwt-payload");
let McpController = class McpController {
    constructor(mcpService) {
        this.mcpService = mcpService;
    }
    async handlePost(req, reply, user, workspace) {
        this.assertMcpEnabled(workspace);
        this.assertAuthTypeAllowed(req, workspace);
        const oauthScopes = req?.user?.oauth?.scopes;
        await this.mcpService.handlePost(req, reply, user, workspace, oauthScopes);
    }
    assertMcpEnabled(workspace) {
        if (!(0, mcp_util_1.isMcpEnabled)(workspace)) {
            throw new common_1.ForbiddenException('MCP is not enabled for this workspace');
        }
    }
    assertAuthTypeAllowed(req, workspace) {
        if ((0, mcp_util_1.isMcpOauthEnforced)(workspace) &&
            req?.user?.authType === jwt_payload_1.JwtType.API_KEY) {
            throw new common_1.UnauthorizedException('API keys are disabled for MCP on this workspace. Connect with OAuth instead.');
        }
    }
};
exports.McpController = McpController;
__decorate([
    (0, oauth_scope_decorator_1.OAuthScope)('read'),
    (0, common_1.Post)(),
    (0, skip_transform_decorator_1.SkipTransform)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, auth_user_decorator_1.AuthUser)()),
    __param(3, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, Object, Object]),
    __metadata("design:returntype", Promise)
], McpController.prototype, "handlePost", null);
exports.McpController = McpController = __decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.MCP),
    (0, common_1.UseFilters)(mcp_auth_exception_filter_1.McpAuthExceptionFilter),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, feature_guard_1.FeatureGuard),
    (0, common_1.Controller)('mcp'),
    __metadata("design:paramtypes", [mcp_service_1.McpService])
], McpController);
//# sourceMappingURL=mcp.controller.js.map