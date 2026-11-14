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
var McpAuthExceptionFilter_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.McpAuthExceptionFilter = void 0;
const common_1 = require("@nestjs/common");
const environment_service_1 = require("../../integrations/environment/environment.service");
const helpers_1 = require("../../common/helpers");
const oauth_util_1 = require("../oauth/oauth.util");
let McpAuthExceptionFilter = McpAuthExceptionFilter_1 = class McpAuthExceptionFilter {
    constructor(environmentService) {
        this.environmentService = environmentService;
        this.logger = new common_1.Logger(McpAuthExceptionFilter_1.name);
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const request = ctx.getRequest();
        const reply = ctx.getResponse();
        const resourceMetadataUrl = `${(0, oauth_util_1.buildIssuerOrigin)(request.raw.headers.host, this.environmentService.isHttps())}/.well-known/oauth-protected-resource/mcp`;
        const challenge = exception instanceof common_1.UnauthorizedException
            ? this.buildUnauthorizedChallenge(request, resourceMetadataUrl)
            : `Bearer resource_metadata="${resourceMetadataUrl}", error="insufficient_scope"`;
        this.logger.debug(`mcp auth challenge ${exception.getStatus()} "${exception.message}" (bearer=${!!(0, helpers_1.extractBearerTokenFromHeader)(request)} host=${request.raw.headers.host})`);
        reply
            .header('WWW-Authenticate', challenge)
            .status(exception.getStatus())
            .send(exception.getResponse());
    }
    buildUnauthorizedChallenge(request, resourceMetadataUrl) {
        const base = `Bearer resource_metadata="${resourceMetadataUrl}"`;
        return (0, helpers_1.extractBearerTokenFromHeader)(request)
            ? `${base}, error="invalid_token"`
            : base;
    }
};
exports.McpAuthExceptionFilter = McpAuthExceptionFilter;
exports.McpAuthExceptionFilter = McpAuthExceptionFilter = McpAuthExceptionFilter_1 = __decorate([
    (0, common_1.Injectable)(),
    (0, common_1.Catch)(common_1.UnauthorizedException, common_1.ForbiddenException),
    __metadata("design:paramtypes", [environment_service_1.EnvironmentService])
], McpAuthExceptionFilter);
//# sourceMappingURL=mcp-auth.exception-filter.js.map