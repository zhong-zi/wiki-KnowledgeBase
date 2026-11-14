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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiemEventBuilder = void 0;
exports.truncateIfNeeded = truncateIfNeeded;
exports.toSiemEvent = toSiemEvent;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const domain_service_1 = require("../../../integrations/environment/domain.service");
const siem_constants_1 = require("../siem.constants");
const audit_events_1 = require("../../../common/events/audit-events");
const siem_summary_1 = require("./siem-summary");
function clamp(value, max) {
    return value.length > max ? value.slice(0, max - 1) + '…' : value;
}
function clampWorkspace(workspace) {
    return {
        id: workspace.id,
        name: workspace.name ? clamp(workspace.name, 256) : workspace.name,
        hostname: workspace.hostname ? clamp(workspace.hostname, 256) : workspace.hostname,
    };
}
function slugifyTitle(title) {
    return title
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
function pageSlug(slugId, title) {
    const titleSlug = title ? slugifyTitle(title) : '';
    return titleSlug ? `${titleSlug}-${slugId}` : slugId;
}
function stringField(bag, field) {
    const value = bag?.[field];
    return typeof value === 'string' && value ? value : null;
}
function beforeField(row, field) {
    return stringField(row.changes?.before, field);
}
function summaryLabel(row) {
    return (row.resource?.name ??
        stringField(row.metadata, 'pageTitle') ??
        stringField(row.metadata, 'spaceName') ??
        stringField(row.metadata, 'title') ??
        stringField(row.metadata, 'name') ??
        stringField(row.changes?.after, 'name') ??
        beforeField(row, 'name'));
}
function summaryInput(row, eventKey, actorName) {
    return {
        event: eventKey,
        actorName,
        resource: {
            type: row.resourceType,
            id: row.resourceId ?? row.resource?.id ?? null,
            name: summaryLabel(row),
        },
        space: row.space ? { name: row.space.name } : null,
        changes: row.changes,
        metadata: row.metadata,
        principal: row.principal,
        contextPage: row.contextPage,
        contextSpace: row.contextSpace,
    };
}
function buildPrincipal(row) {
    if (!row.principal)
        return null;
    const name = row.principal.name;
    return {
        type: row.principal.type,
        id: row.principal.id,
        name: name ? clamp(name, 320) : name,
    };
}
function buildActor(row) {
    if (row.actorType === 'system' || !row.actorId)
        return null;
    const name = row.actor?.name ?? null;
    const email = row.actor?.email ?? null;
    return {
        type: row.actorType,
        id: row.actorId,
        name: name ? clamp(name, 320) : name,
        email: email ? clamp(email, 320) : email,
    };
}
function buildResource(row, baseUrl) {
    if (!row.resourceId && !row.resource)
        return null;
    const rawName = row.resource?.name ?? beforeField(row, 'title') ?? beforeField(row, 'name');
    const name = rawName ? clamp(rawName, 512) : rawName;
    const resource = {
        type: row.resourceType,
        id: row.resourceId ?? row.resource?.id ?? null,
        name,
    };
    if (row.resourceType === 'page' && row.resource?.slugId) {
        const slug = pageSlug(row.resource.slugId, name);
        const url = row.space?.slug
            ? `${baseUrl}/s/${row.space.slug}/p/${slug}`
            : `${baseUrl}/p/${slug}`;
        resource.url = clamp(url, 2048);
    }
    else if (row.resourceType === 'space' && row.resource?.slug) {
        resource.url = clamp(`${baseUrl}/s/${row.resource.slug}`, 2048);
    }
    return resource;
}
function byteLength(event) {
    return Buffer.byteLength(JSON.stringify(event), 'utf8');
}
function truncateIfNeeded(event) {
    if (byteLength(event) <= siem_constants_1.SIEM_MAX_EVENT_BYTES)
        return event;
    const withoutChanges = { ...event, changes: { _truncated: true } };
    if (byteLength(withoutChanges) <= siem_constants_1.SIEM_MAX_EVENT_BYTES)
        return withoutChanges;
    const withoutMetadata = { ...withoutChanges, metadata: { _truncated: true } };
    if (byteLength(withoutMetadata) <= siem_constants_1.SIEM_MAX_EVENT_BYTES)
        return withoutMetadata;
    const final = {
        ...withoutMetadata,
        resource: withoutMetadata.resource
            ? { ...withoutMetadata.resource, url: undefined }
            : null,
        summary: clamp(withoutMetadata.summary, 200),
    };
    if (byteLength(final) <= siem_constants_1.SIEM_MAX_EVENT_BYTES)
        return final;
    throw new Error('event exceeds SIEM_MAX_EVENT_BYTES after truncation');
}
function toSiemEvent(row, workspace, baseUrl) {
    const actor = buildActor(row);
    const resource = buildResource(row, baseUrl);
    const eventKey = clamp(row.event, 128);
    const actorName = actor?.name ?? (row.actorType === 'api_key' ? 'API key' : null);
    const event = {
        id: row.id,
        schema_version: 1,
        timestamp: new Date(row.createdAt).toISOString(),
        event: eventKey,
        summary: clamp((0, siem_summary_1.buildSummary)(summaryInput(row, eventKey, actorName)), 1000),
        workspace: clampWorkspace(workspace),
        actor,
        principal: buildPrincipal(row),
        resource,
        space: row.space
            ? {
                id: row.space.id,
                name: row.space.name ? clamp(row.space.name, 256) : row.space.name,
                slug: row.space.slug ? clamp(row.space.slug, 256) : row.space.slug,
            }
            : null,
        changes: row.changes ?? null,
        metadata: row.metadata ?? null,
        client: {
            ip: row.ipAddress ? clamp(row.ipAddress, 64) : row.ipAddress,
            userAgent: row.userAgent ? clamp(row.userAgent, 512) : row.userAgent,
        },
    };
    return truncateIfNeeded(event);
}
let SiemEventBuilder = class SiemEventBuilder {
    constructor(domainService) {
        this.domainService = domainService;
    }
    build(rows, workspace) {
        const { baseUrl, siemWorkspace } = this.resolveWorkspace(workspace);
        return rows.map((row) => toSiemEvent(row, siemWorkspace, baseUrl));
    }
    buildTestEvent(workspace, actor, destination) {
        const { siemWorkspace } = this.resolveWorkspace(workspace);
        const actorName = actor.name ? clamp(actor.name, 320) : actor.name;
        const resourceName = clamp(destination.name, 512);
        return {
            id: (0, uuid_1.v7)(),
            schema_version: 1,
            timestamp: new Date().toISOString(),
            event: audit_events_1.AuditEvent.SIEM_DESTINATION_TEST,
            summary: clamp(`${actorName ?? 'System'} sent a test event to “${resourceName}”`, 1000),
            workspace: clampWorkspace(siemWorkspace),
            actor: {
                type: 'user',
                id: actor.id,
                name: actorName,
                email: actor.email ? clamp(actor.email, 320) : actor.email,
            },
            principal: null,
            resource: {
                type: audit_events_1.AuditResource.SIEM_DESTINATION,
                id: destination.id,
                name: resourceName,
            },
            space: null,
            changes: null,
            metadata: { test: true },
            client: { ip: null, userAgent: null },
        };
    }
    minimal(event) {
        return {
            id: event.id,
            schema_version: event.schema_version,
            timestamp: event.timestamp,
            event: event.event,
            summary: event.summary.slice(0, 200),
            workspace: event.workspace,
            actor: event.actor
                ? { type: event.actor.type, id: event.actor.id, name: null, email: null }
                : null,
            principal: event.principal
                ? { type: event.principal.type, id: event.principal.id, name: null }
                : null,
            resource: event.resource
                ? { type: event.resource.type, id: event.resource.id, name: null }
                : null,
            space: null,
            changes: { _truncated: true },
            metadata: { _truncated: true },
            client: { ip: null, userAgent: null },
        };
    }
    resolveWorkspace(workspace) {
        const baseUrl = this.domainService.getUrl(workspace.hostname ?? undefined);
        return {
            baseUrl,
            siemWorkspace: {
                id: workspace.id,
                name: workspace.name,
                hostname: new URL(baseUrl).host,
            },
        };
    }
};
exports.SiemEventBuilder = SiemEventBuilder;
exports.SiemEventBuilder = SiemEventBuilder = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [domain_service_1.DomainService])
], SiemEventBuilder);
//# sourceMappingURL=siem-event.builder.js.map