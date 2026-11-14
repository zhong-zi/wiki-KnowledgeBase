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
exports.OAuthGrantService = void 0;
const common_1 = require("@nestjs/common");
const oauth_repo_1 = require("../repos/oauth.repo");
const audit_service_1 = require("../../../integrations/audit/audit.service");
const audit_events_1 = require("../../../common/events/audit-events");
let OAuthGrantService = class OAuthGrantService {
    constructor(oauthRepo, auditService) {
        this.oauthRepo = oauthRepo;
        this.auditService = auditService;
    }
    async listUserGrants(userId, workspaceId) {
        const grants = await this.oauthRepo.listGrantsByUser(userId, workspaceId);
        return grants.map((grant) => ({
            id: grant.id,
            clientName: grant.clientName,
            redirectUris: Array.isArray(grant.clientRedirectUris)
                ? grant.clientRedirectUris
                : [],
            scopes: grant.scopes,
            createdAt: grant.createdAt,
            lastUsedAt: grant.lastUsedAt,
        }));
    }
    async revokeUserGrant(userId, grantId, workspaceId) {
        const grant = await this.oauthRepo.findGrantById(grantId, workspaceId);
        if (!grant || grant.userId !== userId) {
            throw new common_1.NotFoundException('Grant not found');
        }
        if (grant.revokedAt) {
            return;
        }
        await this.oauthRepo.revokeGrant(grantId, workspaceId);
        this.auditService?.log({
            event: audit_events_1.AuditEvent.OAUTH_GRANT_REVOKED,
            resourceType: audit_events_1.AuditResource.OAUTH_GRANT,
            resourceId: grantId,
            changes: {
                before: { clientId: grant.clientId, scopes: grant.scopes },
            },
        });
    }
};
exports.OAuthGrantService = OAuthGrantService;
exports.OAuthGrantService = OAuthGrantService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(audit_service_1.AUDIT_SERVICE)),
    __metadata("design:paramtypes", [oauth_repo_1.OAuthRepo, Object])
], OAuthGrantService);
//# sourceMappingURL=oauth-grant.service.js.map