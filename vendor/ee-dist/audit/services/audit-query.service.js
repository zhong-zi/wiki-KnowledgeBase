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
exports.AuditQueryService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const audit_store_types_1 = require("../stores/audit-store.types");
const audit_enrichment_service_1 = require("./audit-enrichment.service");
let AuditQueryService = class AuditQueryService {
    constructor(auditStore, db, enrichment) {
        this.auditStore = auditStore;
        this.db = db;
        this.enrichment = enrichment;
    }
    async findByWorkspace(workspaceId, filters, pagination) {
        const result = await this.auditStore.findByWorkspace(workspaceId, filters, pagination);
        const enriched = await this.enrichment.resolve(result.items, workspaceId);
        const items = enriched.map(({ actor, resource, space: _space, principal: _principal, contextPage: _contextPage, contextSpace: _contextSpace, ...rest }) => ({
            ...rest,
            ...(actor ? { actor } : {}),
            ...(resource ? { resource } : {}),
        }));
        return { ...result, items };
    }
    async getRetention(workspaceId) {
        const workspace = await this.db
            .selectFrom('workspaces')
            .select('auditRetentionDays')
            .where('id', '=', workspaceId)
            .executeTakeFirst();
        return workspace?.auditRetentionDays ?? 365;
    }
    async updateRetention(workspaceId, retentionDays) {
        await this.db
            .updateTable('workspaces')
            .set({ auditRetentionDays: retentionDays, updatedAt: new Date() })
            .where('id', '=', workspaceId)
            .execute();
    }
};
exports.AuditQueryService = AuditQueryService;
exports.AuditQueryService = AuditQueryService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(audit_store_types_1.AUDIT_STORE)),
    __param(1, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object, Object, audit_enrichment_service_1.AuditEnrichmentService])
], AuditQueryService);
//# sourceMappingURL=audit-query.service.js.map