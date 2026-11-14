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
var SiemDeliveryService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiemDeliveryService = void 0;
const common_1 = require("@nestjs/common");
const cache_manager_1 = require("@nestjs/cache-manager");
const nestjs_kysely_1 = require("nestjs-kysely");
const features_1 = require("../../../common/features");
const cache_keys_1 = require("../../../common/helpers/cache-keys");
const license_check_service_1 = require("../../../integrations/environment/license-check.service");
const audit_store_types_1 = require("../../audit/stores/audit-store.types");
const audit_enrichment_service_1 = require("../../audit/services/audit-enrichment.service");
const siem_event_builder_1 = require("./siem-event.builder");
const siem_destination_service_1 = require("./siem-destination.service");
const siem_notification_service_1 = require("./siem-notification.service");
const adapter_registry_1 = require("../adapters/adapter.registry");
const adapter_types_1 = require("../adapters/adapter.types");
const backoff_1 = require("../backoff");
const redact_1 = require("../security/redact");
const siem_constants_1 = require("../siem.constants");
const CHUNK_ENVELOPE_BYTES = 2;
const EVENT_SEPARATOR_BYTES = 2;
function chunkByPayload(rows, events, adapter, destination) {
    const chunks = [];
    let chunkRows = [];
    let chunkEvents = [];
    let chunkBytes = CHUNK_ENVELOPE_BYTES;
    for (let i = 0; i < events.length; i++) {
        const eventBytes = adapter.measure([events[i]], destination) + EVENT_SEPARATOR_BYTES;
        const overCount = chunkEvents.length + 1 > adapter.maxBatchSize;
        const overBytes = chunkEvents.length > 0 && chunkBytes + eventBytes > adapter.maxPayloadBytes;
        if (chunkEvents.length > 0 && (overCount || overBytes)) {
            chunks.push({ rows: chunkRows, events: chunkEvents });
            chunkRows = [];
            chunkEvents = [];
            chunkBytes = CHUNK_ENVELOPE_BYTES;
        }
        chunkRows.push(rows[i]);
        chunkEvents.push(events[i]);
        chunkBytes += eventBytes;
    }
    if (chunkEvents.length > 0)
        chunks.push({ rows: chunkRows, events: chunkEvents });
    return chunks;
}
let SiemDeliveryService = SiemDeliveryService_1 = class SiemDeliveryService {
    constructor(db, auditStore, enrichment, eventBuilder, registry, destinations, cache, licenseCheck, notifications) {
        this.db = db;
        this.auditStore = auditStore;
        this.enrichment = enrichment;
        this.eventBuilder = eventBuilder;
        this.registry = registry;
        this.destinations = destinations;
        this.cache = cache;
        this.licenseCheck = licenseCheck;
        this.notifications = notifications;
        this.logger = new common_1.Logger(SiemDeliveryService_1.name);
    }
    async deliver(destinationId) {
        const outcome = {
            delivered: 0,
            batches: 0,
            failed: false,
        };
        const row = await this.db
            .selectFrom('siemDestinations')
            .selectAll()
            .where('id', '=', destinationId)
            .executeTakeFirst();
        if (!row || !row.enabled)
            return outcome;
        const workspace = await this.db
            .selectFrom('workspaces')
            .select(['id', 'name', 'hostname', 'licenseKey', 'plan'])
            .where('id', '=', row.workspaceId)
            .executeTakeFirst();
        if (!workspace || !(await this.isLicensed(workspace)))
            return outcome;
        let failingSince = row.failingSince ? new Date(row.failingSince) : null;
        let status = row.status;
        let hasDelivered = row.lastDeliveredAt !== null;
        let destination;
        try {
            destination = this.destinations.resolve(row);
        }
        catch (err) {
            const message = (0, redact_1.sanitiseError)(err);
            const failures = row.consecutiveFailures + 1;
            await this.recordFailure(row, {
                cursorId: row.cursorId,
                cursorSnapshot: row.cursorSnapshot,
                failingSince,
                status,
            }, workspace.hostname, failures, message, true, hasDelivered);
            this.logger.warn({ destinationId: row.id, outcome: 'failed', error: message }, 'SIEM destination could not be resolved');
            outcome.failed = true;
            return outcome;
        }
        const adapter = this.registry.get(destination.type);
        let cursor = {
            createdAt: new Date(row.cursorCreatedAt),
            id: row.cursorId,
            snapshot: row.cursorSnapshot,
        };
        let consecutiveFailures = row.consecutiveFailures;
        for (let batch = 0; batch < siem_constants_1.SIEM_MAX_BATCHES_PER_JOB; batch++) {
            const until = new Date(Date.now() - this.auditStore.visibilityLagMs);
            const readCursor = cursor;
            const { rows, snapshot } = await this.auditStore.findAfterCursor(row.workspaceId, readCursor, adapter.maxBatchSize, until);
            if (rows.length === 0)
                break;
            const lateRows = rows.filter((r) => r.id <= readCursor.id).length;
            let sent = 0;
            const started = Date.now();
            try {
                const enriched = await this.enrichment.resolve(rows, row.workspaceId);
                const events = this.eventBuilder.build(enriched, workspace);
                const chunks = chunkByPayload(rows, events, adapter, destination);
                for (const chunk of chunks) {
                    await this.sendChunk(chunk, adapter, destination);
                    sent += chunk.rows.length;
                    const last = chunk.rows[chunk.rows.length - 1];
                    const next = {
                        id: last.id > cursor.id ? last.id : cursor.id,
                        createdAt: chunk.rows.reduce((max, r) => (r.createdAt > max ? r.createdAt : max), cursor.createdAt),
                        snapshot: sent >= lateRows ? snapshot : cursor.snapshot,
                    };
                    consecutiveFailures = 0;
                    const wasFailing = status === 'failing';
                    const now = new Date(Date.now());
                    const written = await this.db
                        .updateTable('siemDestinations')
                        .set({
                        cursorCreatedAt: next.createdAt,
                        cursorId: next.id,
                        cursorSnapshot: next.snapshot,
                        lastDeliveredAt: now,
                        consecutiveFailures: 0,
                        failingSince: null,
                        nextAttemptAt: null,
                        status: 'healthy',
                        lastError: null,
                        lastErrorAt: null,
                        updatedAt: now,
                    })
                        .where('id', '=', row.id)
                        .where('version', '=', row.version)
                        .where('cursorId', '=', cursor.id)
                        .where('cursorSnapshot', cursor.snapshot === null ? 'is' : '=', cursor.snapshot)
                        .executeTakeFirst();
                    if (Number(written?.numUpdatedRows ?? 0) === 0) {
                        outcome.delivered += sent;
                        this.logger.log({ destinationId: row.id, outcome: 'stopped', delivered: sent }, 'SIEM destination changed or advanced elsewhere; stopping this job');
                        return outcome;
                    }
                    cursor = next;
                    failingSince = null;
                    status = 'healthy';
                    hasDelivered = true;
                    if (wasFailing) {
                        await this.notifications.destinationRecovered({
                            id: row.id,
                            name: row.name,
                            type: destination.type,
                            workspaceId: row.workspaceId,
                            hostname: workspace.hostname,
                            creatorId: row.creatorId,
                        });
                    }
                }
                outcome.delivered += rows.length;
                outcome.batches += 1;
                this.logger.debug({
                    destinationId: row.id,
                    type: destination.type,
                    batchSize: rows.length,
                    chunks: chunks.length,
                    durationMs: Date.now() - started,
                    outcome: 'delivered',
                }, 'SIEM batch delivered');
            }
            catch (err) {
                consecutiveFailures += 1;
                const retryable = err instanceof adapter_types_1.SiemDeliveryError ? err.retryable : true;
                const message = (0, redact_1.sanitiseError)(err, destination.secrets);
                await this.recordFailure(row, {
                    cursorId: cursor.id,
                    cursorSnapshot: cursor.snapshot,
                    failingSince,
                    status,
                }, workspace.hostname, consecutiveFailures, message, !retryable, hasDelivered);
                outcome.failed = true;
                this.logger.warn({
                    destinationId: row.id,
                    type: destination.type,
                    batchSize: rows.length,
                    durationMs: Date.now() - started,
                    outcome: 'failed',
                    retryable,
                    consecutiveFailures,
                    error: message,
                }, 'SIEM batch delivery failed');
                break;
            }
        }
        return outcome;
    }
    async sendChunk(chunk, adapter, destination) {
        try {
            await adapter.send(chunk.events, destination);
            return;
        }
        catch (err) {
            if (!(err instanceof adapter_types_1.SiemDeliveryError) || err.statusCode !== 413)
                throw err;
            if (chunk.events.length > 1) {
                const mid = Math.ceil(chunk.events.length / 2);
                await this.sendChunk({ rows: chunk.rows.slice(0, mid), events: chunk.events.slice(0, mid) }, adapter, destination);
                await this.sendChunk({ rows: chunk.rows.slice(mid), events: chunk.events.slice(mid) }, adapter, destination);
                return;
            }
            const minimal = this.eventBuilder.minimal(chunk.events[0]);
            try {
                await adapter.send([minimal], destination);
            }
            catch (minimalErr) {
                if (!(minimalErr instanceof adapter_types_1.SiemDeliveryError) || minimalErr.statusCode !== 413) {
                    throw minimalErr;
                }
                throw new adapter_types_1.SiemDeliveryError('Receiver rejected a minimal event with 413; raise its payload limit', false, 413);
            }
        }
    }
    async recordFailure(row, observed, hostname, failures, message, forceFailing, hasDelivered) {
        const now = new Date(Date.now());
        const failingSince = observed.failingSince ?? now;
        const autoDisable = Date.now() - failingSince.getTime() >= siem_constants_1.SIEM_AUTO_DISABLE_AFTER_MS;
        const failing = forceFailing || autoDisable || failures >= siem_constants_1.SIEM_FAILING_THRESHOLD;
        const written = await this.db
            .updateTable('siemDestinations')
            .set({
            consecutiveFailures: failures,
            failingSince,
            lastError: autoDisable
                ? `Disabled after 24 hours of failed deliveries: ${message}`.slice(0, 500)
                : message,
            lastErrorAt: now,
            nextAttemptAt: autoDisable
                ? null
                : new Date(Date.now() + (0, backoff_1.backoffMs)(failures)),
            ...(failing ? { status: 'failing' } : {}),
            ...(autoDisable ? { enabled: false } : {}),
            updatedAt: now,
        })
            .where('id', '=', row.id)
            .where('version', '=', row.version)
            .where('enabled', '=', true)
            .where('status', '=', observed.status)
            .where('cursorId', '=', observed.cursorId)
            .where('cursorSnapshot', observed.cursorSnapshot === null ? 'is' : '=', observed.cursorSnapshot)
            .executeTakeFirst();
        if (Number(written?.numUpdatedRows ?? 0) === 0)
            return;
        const notice = {
            id: row.id,
            name: row.name,
            type: row.type,
            workspaceId: row.workspaceId,
            hostname,
            creatorId: row.creatorId,
            failingSince,
            lastError: message,
        };
        if (autoDisable) {
            this.logger.warn({ destinationId: row.id, failingSince, error: message }, 'SIEM destination disabled after 24 hours of failed deliveries');
            await this.notifications.destinationDisabled(notice);
        }
        else if (failing && hasDelivered && observed.status !== 'failing') {
            await this.notifications.destinationFailing(notice);
        }
    }
    async isLicensed(workspace) {
        const key = cache_keys_1.CacheKey.SIEM_LICENSED(workspace.id);
        const cached = await this.cache.get(key);
        if (cached !== undefined && cached !== null)
            return cached;
        const licensed = this.licenseCheck.hasFeature(workspace.licenseKey, features_1.Feature.SIEM, workspace.plan);
        await this.cache.set(key, licensed, siem_constants_1.SIEM_LICENSE_CACHE_TTL_MS);
        return licensed;
    }
};
exports.SiemDeliveryService = SiemDeliveryService;
exports.SiemDeliveryService = SiemDeliveryService = SiemDeliveryService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __param(1, (0, common_1.Inject)(audit_store_types_1.AUDIT_STORE)),
    __param(6, (0, common_1.Inject)(cache_manager_1.CACHE_MANAGER)),
    __metadata("design:paramtypes", [Object, Object, audit_enrichment_service_1.AuditEnrichmentService,
        siem_event_builder_1.SiemEventBuilder,
        adapter_registry_1.SiemAdapterRegistry,
        siem_destination_service_1.SiemDestinationService, Object, license_check_service_1.LicenseCheckService,
        siem_notification_service_1.SiemNotificationService])
], SiemDeliveryService);
//# sourceMappingURL=siem-delivery.service.js.map