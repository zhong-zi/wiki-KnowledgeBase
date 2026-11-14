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
var SiemDestinationService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiemDestinationService = exports.SiemSecretsUnreadableError = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const node_util_1 = require("node:util");
const uuid_1 = require("uuid");
const encryption_service_1 = require("../../../integrations/encryption/encryption.service");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const audit_events_1 = require("../../../common/events/audit-events");
const audit_service_1 = require("../../audit/services/audit.service");
const outbound_url_guard_1 = require("../../../integrations/outbound/outbound-url.guard");
const destination_config_validator_1 = require("../validation/destination-config.validator");
const adapter_registry_1 = require("../adapters/adapter.registry");
const adapter_types_1 = require("../adapters/adapter.types");
const redact_1 = require("../security/redact");
const siem_event_builder_1 = require("./siem-event.builder");
const siem_constants_1 = require("../siem.constants");
const UUID_LIKE_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
class SiemSecretsUnreadableError extends Error {
    constructor(destinationId) {
        super('Stored secrets for this destination cannot be decrypted; re-enter them');
        this.destinationId = destinationId;
        this.name = 'SiemSecretsUnreadableError';
    }
}
exports.SiemSecretsUnreadableError = SiemSecretsUnreadableError;
function providedSecrets(raw) {
    const out = {};
    for (const [key, value] of Object.entries(raw ?? {})) {
        if (typeof value === 'string' && value !== '')
            out[key] = value;
    }
    return out;
}
function sameTarget(type, a, b) {
    if (type === 'datadog') {
        return a.site === b.site;
    }
    return (new URL(a.url).origin ===
        new URL(b.url).origin);
}
let SiemDestinationService = SiemDestinationService_1 = class SiemDestinationService {
    constructor(db, encryption, environmentService, urlGuard, registry, eventBuilder, auditService) {
        this.db = db;
        this.encryption = encryption;
        this.environmentService = environmentService;
        this.urlGuard = urlGuard;
        this.registry = registry;
        this.eventBuilder = eventBuilder;
        this.auditService = auditService;
        this.logger = new common_1.Logger(SiemDestinationService_1.name);
    }
    async list(workspaceId) {
        const rows = await this.db
            .selectFrom('siemDestinations')
            .selectAll()
            .where('workspaceId', '=', workspaceId)
            .orderBy('createdAt', 'asc')
            .execute();
        return rows.map((row) => this.toView(row));
    }
    async create(workspaceId, creatorId, dto) {
        const existingDestinations = await this.db
            .selectFrom('siemDestinations')
            .select('id')
            .where('workspaceId', '=', workspaceId)
            .execute();
        if (existingDestinations.length >= siem_constants_1.SIEM_MAX_DESTINATIONS_PER_WORKSPACE) {
            throw new common_1.BadRequestException(`A workspace can have at most ${siem_constants_1.SIEM_MAX_DESTINATIONS_PER_WORKSPACE} SIEM destinations`);
        }
        const { channelId: _channelId, ...incomingConfig } = dto.config ?? {};
        const { config, secrets } = (0, destination_config_validator_1.validateDestinationConfig)({
            type: dto.type,
            config: incomingConfig,
            secrets: dto.secrets ?? {},
            isCloud: this.environmentService.isCloud(),
            requireSecrets: true,
        });
        await this.assertUrlAllowed(dto.type, config);
        const row = await this.db.transaction().execute(async (trx) => {
            await trx
                .selectFrom('workspaces')
                .select('id')
                .where('id', '=', workspaceId)
                .forUpdate()
                .execute();
            const destinationsAfterLock = await trx
                .selectFrom('siemDestinations')
                .select('id')
                .where('workspaceId', '=', workspaceId)
                .execute();
            if (destinationsAfterLock.length >= siem_constants_1.SIEM_MAX_DESTINATIONS_PER_WORKSPACE) {
                throw new common_1.BadRequestException(`A workspace can have at most ${siem_constants_1.SIEM_MAX_DESTINATIONS_PER_WORKSPACE} SIEM destinations`);
            }
            return trx
                .insertInto('siemDestinations')
                .values({
                workspaceId,
                creatorId,
                name: dto.name,
                type: dto.type,
                enabled: dto.enabled ?? true,
                config: config,
                secrets: this.encryptSecrets(secrets),
                cursorCreatedAt: new Date(),
                cursorId: (0, uuid_1.v7)(),
            })
                .returningAll()
                .executeTakeFirstOrThrow();
        });
        await this.auditService.log({
            event: audit_events_1.AuditEvent.SIEM_DESTINATION_CREATED,
            resourceType: audit_events_1.AuditResource.SIEM_DESTINATION,
            resourceId: row.id,
            changes: {
                after: { name: row.name, type: row.type, enabled: row.enabled, config },
            },
        });
        return this.toView(row);
    }
    async update(workspaceId, dto) {
        const existing = await this.findByIdForWorkspace(workspaceId, dto.destinationId);
        const type = existing.type;
        const decryptedSecrets = this.decryptSecrets(existing);
        const existingSecrets = decryptedSecrets ?? {};
        const rotated = providedSecrets(dto.secrets);
        const secretsChanged = Object.keys(rotated).length > 0;
        const storedSecretsUnreadable = decryptedSecrets === null && !secretsChanged;
        const mergedRawConfig = {
            ...existing.config,
            ...(dto.config ?? {}),
        };
        const { config: normalizedTarget } = (0, destination_config_validator_1.validateDestinationConfig)({
            type,
            config: mergedRawConfig,
            secrets: {},
            isCloud: this.environmentService.isCloud(),
            requireSecrets: false,
        });
        const targetChanged = !sameTarget(type, existing.config, normalizedTarget);
        let secretsForValidation = { ...existingSecrets, ...rotated };
        if (targetChanged) {
            if (Object.keys(existingSecrets).length > 0 && !secretsChanged) {
                throw new common_1.BadRequestException('Re-enter the destination credentials when changing its URL or site');
            }
            secretsForValidation = rotated;
        }
        const { config, secrets } = (0, destination_config_validator_1.validateDestinationConfig)({
            type,
            config: mergedRawConfig,
            secrets: secretsForValidation,
            isCloud: this.environmentService.isCloud(),
            requireSecrets: !storedSecretsUnreadable,
        });
        if (type === 'splunk_hec') {
            const existingChannelId = existing.config
                .channelId;
            if (typeof existingChannelId === 'string' &&
                UUID_LIKE_RE.test(existingChannelId)) {
                config.channelId = existingChannelId;
            }
        }
        const configChanged = !(0, node_util_1.isDeepStrictEqual)(config, existing.config);
        if (storedSecretsUnreadable && (targetChanged || configChanged)) {
            throw new common_1.BadRequestException('The stored credentials for this destination cannot be decrypted; enter them again to change its configuration');
        }
        if (targetChanged || configChanged) {
            await this.assertUrlAllowed(type, config);
        }
        const resetDelivery = configChanged || secretsChanged
            ? {
                consecutiveFailures: 0,
                failingSince: null,
                nextAttemptAt: null,
                status: 'healthy',
                lastError: null,
                lastErrorAt: null,
                version: existing.version + 1,
            }
            : {};
        const resumeAfterDisable = dto.enabled === true && !existing.enabled
            ? { consecutiveFailures: 0, failingSince: null, status: 'healthy' }
            : {};
        const row = await this.db
            .updateTable('siemDestinations')
            .set({
            name: dto.name ?? existing.name,
            enabled: dto.enabled ?? existing.enabled,
            config: config,
            ...(secretsChanged || targetChanged
                ? { secrets: this.encryptSecrets(secrets) }
                : {}),
            ...resetDelivery,
            ...resumeAfterDisable,
            updatedAt: new Date(),
        })
            .where('id', '=', existing.id)
            .where('workspaceId', '=', workspaceId)
            .returningAll()
            .executeTakeFirstOrThrow();
        const rotatedKeys = Object.keys(rotated);
        await this.auditService.log({
            event: audit_events_1.AuditEvent.SIEM_DESTINATION_UPDATED,
            resourceType: audit_events_1.AuditResource.SIEM_DESTINATION,
            resourceId: row.id,
            changes: {
                before: {
                    name: existing.name,
                    enabled: existing.enabled,
                    config: existing.config,
                },
                after: {
                    name: row.name,
                    enabled: row.enabled,
                    config,
                    ...(rotatedKeys.length
                        ? {
                            secrets: Object.fromEntries(rotatedKeys.map((k) => [k, '[rotated]'])),
                        }
                        : {}),
                },
            },
        });
        return this.toView(row);
    }
    async remove(workspaceId, destinationId) {
        const existing = await this.findByIdForWorkspace(workspaceId, destinationId);
        await this.db
            .deleteFrom('siemDestinations')
            .where('id', '=', existing.id)
            .where('workspaceId', '=', workspaceId)
            .execute();
        await this.auditService.log({
            event: audit_events_1.AuditEvent.SIEM_DESTINATION_DELETED,
            resourceType: audit_events_1.AuditResource.SIEM_DESTINATION,
            resourceId: existing.id,
            changes: {
                before: {
                    name: existing.name,
                    type: existing.type,
                    config: existing.config,
                },
            },
        });
    }
    async retry(workspaceId, destinationId) {
        await this.findByIdForWorkspace(workspaceId, destinationId);
        await this.db
            .updateTable('siemDestinations')
            .set({
            nextAttemptAt: null,
            consecutiveFailures: 0,
            updatedAt: new Date(),
        })
            .where('id', '=', destinationId)
            .where('workspaceId', '=', workspaceId)
            .execute();
    }
    async test(workspace, user, dto) {
        let existing = null;
        let id = siem_constants_1.NIL_UUID;
        let name = 'Test destination';
        if (dto.destinationId) {
            existing = await this.findByIdForWorkspace(workspace.id, dto.destinationId);
            id = existing.id;
            name = existing.name;
        }
        let validated = (0, destination_config_validator_1.validateDestinationConfig)({
            type: dto.type,
            config: dto.config,
            secrets: providedSecrets(dto.secrets),
            isCloud: this.environmentService.isCloud(),
            requireSecrets: false,
        });
        if (existing &&
            existing.type === dto.type &&
            sameTarget(dto.type, existing.config, validated.config)) {
            const storedSecrets = this.decryptSecrets(existing);
            const supplied = providedSecrets(dto.secrets);
            if (storedSecrets === null && Object.keys(supplied).length === 0) {
                throw new common_1.BadRequestException('The stored credentials for this destination cannot be decrypted; enter them to run a test');
            }
            validated = (0, destination_config_validator_1.validateDestinationConfig)({
                type: dto.type,
                config: dto.config,
                secrets: { ...(storedSecrets ?? {}), ...supplied },
                isCloud: this.environmentService.isCloud(),
                requireSecrets: true,
            });
        }
        else {
            validated = (0, destination_config_validator_1.validateDestinationConfig)({
                type: dto.type,
                config: dto.config,
                secrets: providedSecrets(dto.secrets),
                isCloud: this.environmentService.isCloud(),
                requireSecrets: true,
            });
        }
        const { config, secrets } = validated;
        try {
            await this.assertUrlAllowed(dto.type, config);
        }
        catch (err) {
            return { delivered: false, error: (0, redact_1.sanitiseError)(err, secrets, 200) };
        }
        const destination = {
            id,
            workspaceId: workspace.id,
            name,
            type: dto.type,
            enabled: true,
            config,
            secrets,
        };
        const event = this.eventBuilder.buildTestEvent(workspace, user, {
            id,
            name,
        });
        try {
            await this.registry.get(dto.type).send([event], destination);
            return { delivered: true };
        }
        catch (err) {
            if (err instanceof adapter_types_1.SiemDeliveryError) {
                return {
                    delivered: false,
                    error: (0, redact_1.sanitiseError)(err, secrets, 200),
                    statusCode: err.statusCode,
                };
            }
            return { delivered: false, error: (0, redact_1.sanitiseError)(err, secrets, 200) };
        }
    }
    resolve(row) {
        const secrets = this.decryptSecrets(row);
        if (secrets === null) {
            throw new SiemSecretsUnreadableError(row.id);
        }
        return {
            id: row.id,
            workspaceId: row.workspaceId,
            name: row.name,
            type: row.type,
            enabled: row.enabled,
            config: row.config,
            secrets: secrets,
        };
    }
    async findByIdForWorkspace(workspaceId, destinationId) {
        const row = await this.db
            .selectFrom('siemDestinations')
            .selectAll()
            .where('id', '=', destinationId)
            .where('workspaceId', '=', workspaceId)
            .executeTakeFirst();
        if (!row)
            throw new common_1.NotFoundException('SIEM destination not found');
        return row;
    }
    toView(row) {
        const secrets = this.decryptSecrets(row) ?? {};
        return {
            id: row.id,
            name: row.name,
            type: row.type,
            enabled: row.enabled,
            status: row.status,
            config: row.config,
            hasSecrets: Object.fromEntries(Object.entries(secrets).map(([k, v]) => [k, Boolean(v)])),
            cursorCreatedAt: row.cursorCreatedAt,
            lastDeliveredAt: row.lastDeliveredAt,
            lastError: row.lastError,
            lastErrorAt: row.lastErrorAt,
            consecutiveFailures: row.consecutiveFailures,
            nextAttemptAt: row.nextAttemptAt,
            failingSince: row.failingSince,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt,
        };
    }
    encryptSecrets(secrets) {
        return this.encryption.encrypt(JSON.stringify(secrets), encryption_service_1.EncryptionPurpose.SIEM_CREDENTIALS);
    }
    decryptSecrets(row) {
        if (!row.secrets)
            return {};
        try {
            return JSON.parse(this.encryption.decrypt(row.secrets, encryption_service_1.EncryptionPurpose.SIEM_CREDENTIALS));
        }
        catch {
            this.logger.warn({ destinationId: row.id }, 'SIEM destination secrets cannot be decrypted; they must be re-entered');
            return null;
        }
    }
    async assertUrlAllowed(type, config) {
        if (type === 'datadog')
            return;
        const url = config.url;
        try {
            await this.urlGuard.validate(url);
        }
        catch (err) {
            if (err instanceof outbound_url_guard_1.OutboundUrlError)
                throw new common_1.BadRequestException(err.message);
            throw err;
        }
    }
};
exports.SiemDestinationService = SiemDestinationService;
exports.SiemDestinationService = SiemDestinationService = SiemDestinationService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object, encryption_service_1.EncryptionService,
        environment_service_1.EnvironmentService,
        outbound_url_guard_1.OutboundUrlGuard,
        adapter_registry_1.SiemAdapterRegistry,
        siem_event_builder_1.SiemEventBuilder,
        audit_service_1.AuditService])
], SiemDestinationService);
//# sourceMappingURL=siem-destination.service.js.map