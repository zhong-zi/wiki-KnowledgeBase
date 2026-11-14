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
exports.OAuthWellKnownController = void 0;
const common_1 = require("@nestjs/common");
const workspace_repo_1 = require("../../database/repos/workspace/workspace.repo");
const environment_service_1 = require("../../integrations/environment/environment.service");
const license_service_1 = require("../licence/license.service");
const skip_transform_decorator_1 = require("../../common/decorators/skip-transform.decorator");
const oauth_metadata_service_1 = require("./services/oauth-metadata.service");
const oauth_util_1 = require("./oauth.util");
const mcp_util_1 = require("../mcp/mcp.util");
let OAuthWellKnownController = class OAuthWellKnownController {
    constructor(workspaceRepo, environmentService, licenseService, oauthMetadataService) {
        this.workspaceRepo = workspaceRepo;
        this.environmentService = environmentService;
        this.licenseService = licenseService;
        this.oauthMetadataService = oauthMetadataService;
    }
    async getAuthorizationServerMetadata(req) {
        const workspace = await this.resolveWorkspace(req);
        this.assertAvailable(workspace);
        return this.oauthMetadataService.buildAuthorizationServerMetadata(this.buildIssuerOrigin(req));
    }
    async getProtectedResourceMetadata(req) {
        const workspace = await this.resolveWorkspace(req);
        this.assertAvailable(workspace);
        return this.oauthMetadataService.buildProtectedResourceMetadata(this.buildIssuerOrigin(req));
    }
    async getProtectedResourceMcpMetadata(req) {
        const workspace = await this.resolveWorkspace(req);
        this.assertAvailable(workspace);
        return this.oauthMetadataService.buildProtectedResourceMetadata(this.buildIssuerOrigin(req), '/mcp');
    }
    async resolveWorkspace(req) {
        if (this.environmentService.isSelfHosted()) {
            return this.workspaceRepo.findFirst();
        }
        const header = req.raw.headers.host;
        const subdomain = header.split('.')[0];
        return this.workspaceRepo.findByHostname(subdomain);
    }
    assertAvailable(workspace) {
        if (!workspace) {
            throw new common_1.NotFoundException();
        }
        if (this.environmentService.isSelfHosted() &&
            !this.licenseService.isValidEELicense(workspace.licenseKey)) {
            throw new common_1.NotFoundException();
        }
        if (!(0, mcp_util_1.isMcpEnabled)(workspace)) {
            throw new common_1.NotFoundException();
        }
    }
    buildIssuerOrigin(req) {
        return (0, oauth_util_1.buildIssuerOrigin)(req.raw.headers.host, this.environmentService.isHttps());
    }
};
exports.OAuthWellKnownController = OAuthWellKnownController;
__decorate([
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Get)('oauth-authorization-server'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OAuthWellKnownController.prototype, "getAuthorizationServerMetadata", null);
__decorate([
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Get)('oauth-protected-resource'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OAuthWellKnownController.prototype, "getProtectedResourceMetadata", null);
__decorate([
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Get)('oauth-protected-resource/mcp'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], OAuthWellKnownController.prototype, "getProtectedResourceMcpMetadata", null);
exports.OAuthWellKnownController = OAuthWellKnownController = __decorate([
    (0, common_1.Controller)('.well-known'),
    __metadata("design:paramtypes", [workspace_repo_1.WorkspaceRepo,
        environment_service_1.EnvironmentService,
        license_service_1.LicenseService,
        oauth_metadata_service_1.OAuthMetadataService])
], OAuthWellKnownController);
//# sourceMappingURL=well-known.controller.js.map