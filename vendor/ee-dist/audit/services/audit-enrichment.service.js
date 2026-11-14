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
exports.AuditEnrichmentService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
function bagString(bag, key) {
    const value = bag?.[key];
    return typeof value === 'string' && value ? value : null;
}
function principalRef(row) {
    const userId = bagString(row.metadata, 'userId');
    if (userId) {
        return { type: 'user', id: userId, name: bagString(row.metadata, 'userName') };
    }
    const groupId = bagString(row.metadata, 'groupId');
    if (groupId) {
        return { type: 'group', id: groupId, name: bagString(row.metadata, 'groupName') };
    }
    const after = row.changes?.after;
    const before = row.changes?.before;
    const memberId = bagString(after, 'userId') ?? bagString(before, 'userId');
    if (memberId) {
        const name = bagString(after, 'userName') ?? bagString(before, 'userName');
        return { type: 'user', id: memberId, name };
    }
    return null;
}
function rowRefs(row) {
    return {
        principal: principalRef(row),
        pageId: bagString(row.metadata, 'pageId') ??
            bagString(row.changes?.before, 'pageId') ??
            bagString(row.changes?.after, 'pageId'),
        spaceId: row.resourceType === 'space' ? null : bagString(row.metadata, 'spaceId'),
    };
}
function resolvePrincipal(principal, users, groups) {
    if (!principal || principal.name)
        return principal;
    const resolved = principal.type === 'user'
        ? users.get(principal.id)?.name
        : groups.get(principal.id)?.name;
    return { ...principal, name: resolved ?? null };
}
let AuditEnrichmentService = class AuditEnrichmentService {
    constructor(db) {
        this.db = db;
    }
    async resolve(rows, workspaceId) {
        if (rows.some((row) => row.workspaceId !== workspaceId)) {
            throw new Error('Audit rows must belong to the requested workspace');
        }
        if (rows.length === 0)
            return [];
        const refs = rows.map(rowRefs);
        const userIds = new Set();
        const pageIds = new Set();
        const spaceIds = new Set();
        const groupIds = new Set();
        const authProviderIds = new Set();
        const templateIds = new Set();
        rows.forEach((row, index) => {
            const ref = refs[index];
            if (row.actorId)
                userIds.add(row.actorId);
            if (row.spaceId)
                spaceIds.add(row.spaceId);
            if (ref.pageId)
                pageIds.add(ref.pageId);
            if (ref.spaceId)
                spaceIds.add(ref.spaceId);
            if (ref.principal && !ref.principal.name) {
                const ids = ref.principal.type === 'user' ? userIds : groupIds;
                ids.add(ref.principal.id);
            }
            if (!row.resourceId)
                return;
            switch (row.resourceType) {
                case 'page':
                    pageIds.add(row.resourceId);
                    break;
                case 'space':
                case 'space_member':
                    spaceIds.add(row.resourceId);
                    break;
                case 'group':
                    groupIds.add(row.resourceId);
                    break;
                case 'user':
                    userIds.add(row.resourceId);
                    break;
                case 'sso_provider':
                    authProviderIds.add(row.resourceId);
                    break;
                case 'template':
                    templateIds.add(row.resourceId);
                    break;
            }
        });
        const [users, pages, spaces, groups, authProviders, templates] = await Promise.all([
            this.loadUsers(workspaceId, userIds),
            this.loadPages(workspaceId, pageIds),
            this.loadSpaces(workspaceId, spaceIds),
            this.loadGroups(workspaceId, groupIds),
            this.loadAuthProviders(workspaceId, authProviderIds),
            this.loadTemplates(workspaceId, templateIds),
        ]);
        return rows.map((row, index) => {
            const ref = refs[index];
            return {
                ...row,
                actor: row.actorId ? (users.get(row.actorId) ?? null) : null,
                resource: this.resolveResource(row, users, pages, spaces, groups, authProviders, templates),
                space: row.spaceId ? (spaces.get(row.spaceId) ?? null) : null,
                principal: resolvePrincipal(ref.principal, users, groups),
                contextPage: ref.pageId
                    ? { id: ref.pageId, name: pages.get(ref.pageId)?.name ?? null }
                    : null,
                contextSpace: ref.spaceId
                    ? { id: ref.spaceId, name: spaces.get(ref.spaceId)?.name ?? null }
                    : null,
            };
        });
    }
    resolveResource(row, users, pages, spaces, groups, authProviders, templates) {
        if (!row.resourceId)
            return null;
        switch (row.resourceType) {
            case 'page':
                return pages.get(row.resourceId) ?? null;
            case 'space':
            case 'space_member': {
                const space = spaces.get(row.resourceId);
                return space ? { id: space.id, name: space.name, slug: space.slug } : null;
            }
            case 'group':
                return groups.get(row.resourceId) ?? null;
            case 'user': {
                const user = users.get(row.resourceId);
                return user ? { id: user.id, name: user.name } : null;
            }
            case 'sso_provider':
                return authProviders.get(row.resourceId) ?? null;
            case 'template':
                return templates.get(row.resourceId) ?? null;
            default:
                return null;
        }
    }
    async loadUsers(workspaceId, ids) {
        const map = new Map();
        if (ids.size === 0)
            return map;
        const rows = await this.db
            .selectFrom('users')
            .select(['id', 'name', 'email', 'avatarUrl'])
            .where('workspaceId', '=', workspaceId)
            .where('id', 'in', [...ids])
            .execute();
        for (const r of rows) {
            map.set(r.id, { id: r.id, name: r.name, email: r.email, avatarUrl: r.avatarUrl });
        }
        return map;
    }
    async loadPages(workspaceId, ids) {
        const map = new Map();
        if (ids.size === 0)
            return map;
        const rows = await this.db
            .selectFrom('pages')
            .select(['id', 'title', 'slugId'])
            .where('workspaceId', '=', workspaceId)
            .where('id', 'in', [...ids])
            .execute();
        for (const r of rows) {
            map.set(r.id, { id: r.id, name: r.title, slugId: r.slugId });
        }
        return map;
    }
    async loadSpaces(workspaceId, ids) {
        const map = new Map();
        if (ids.size === 0)
            return map;
        const rows = await this.db
            .selectFrom('spaces')
            .select(['id', 'name', 'slug'])
            .where('workspaceId', '=', workspaceId)
            .where('id', 'in', [...ids])
            .execute();
        for (const r of rows) {
            map.set(r.id, { id: r.id, name: r.name, slug: r.slug });
        }
        return map;
    }
    async loadGroups(workspaceId, ids) {
        const map = new Map();
        if (ids.size === 0)
            return map;
        const rows = await this.db
            .selectFrom('groups')
            .select(['id', 'name'])
            .where('workspaceId', '=', workspaceId)
            .where('id', 'in', [...ids])
            .execute();
        for (const r of rows) {
            map.set(r.id, { id: r.id, name: r.name });
        }
        return map;
    }
    async loadTemplates(workspaceId, ids) {
        const map = new Map();
        if (ids.size === 0)
            return map;
        const rows = await this.db
            .selectFrom('templates')
            .select(['id', 'title'])
            .where('workspaceId', '=', workspaceId)
            .where('id', 'in', [...ids])
            .execute();
        for (const r of rows) {
            map.set(r.id, { id: r.id, name: r.title });
        }
        return map;
    }
    async loadAuthProviders(workspaceId, ids) {
        const map = new Map();
        if (ids.size === 0)
            return map;
        const rows = await this.db
            .selectFrom('authProviders')
            .select(['id', 'name', 'type'])
            .where('workspaceId', '=', workspaceId)
            .where('id', 'in', [...ids])
            .execute();
        for (const r of rows) {
            map.set(r.id, { id: r.id, name: r.name, type: r.type });
        }
        return map;
    }
};
exports.AuditEnrichmentService = AuditEnrichmentService;
exports.AuditEnrichmentService = AuditEnrichmentService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object])
], AuditEnrichmentService);
//# sourceMappingURL=audit-enrichment.service.js.map