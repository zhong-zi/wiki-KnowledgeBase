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
exports.OAuthRepo = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const date_fns_1 = require("date-fns");
let OAuthRepo = class OAuthRepo {
    constructor(db) {
        this.db = db;
    }
    async findClientById(clientId, workspaceId) {
        return this.db
            .selectFrom('oauthClients')
            .selectAll()
            .where('id', '=', clientId)
            .where('workspaceId', '=', workspaceId)
            .where('deletedAt', 'is', null)
            .executeTakeFirst();
    }
    async insertClient(client) {
        return this.db
            .insertInto('oauthClients')
            .values(client)
            .returningAll()
            .executeTakeFirstOrThrow();
    }
    async countActiveDynamicClients(workspaceId) {
        const result = await this.db
            .selectFrom('oauthClients')
            .select((eb) => eb.fn.count('id').as('count'))
            .where('workspaceId', '=', workspaceId)
            .where('isDynamic', '=', true)
            .where('deletedAt', 'is', null)
            .executeTakeFirst();
        return Number(result?.count ?? 0);
    }
    async insertAuthCode(row) {
        await this.db.insertInto('oauthAuthorizationCodes').values(row).execute();
    }
    async findAuthCodeByHash(codeHash, workspaceId) {
        return this.db
            .selectFrom('oauthAuthorizationCodes')
            .selectAll()
            .where('codeHash', '=', codeHash)
            .where('workspaceId', '=', workspaceId)
            .executeTakeFirst();
    }
    async consumeAuthCode(codeHash, workspaceId) {
        return this.db
            .updateTable('oauthAuthorizationCodes')
            .set({ consumedAt: new Date() })
            .where('codeHash', '=', codeHash)
            .where('workspaceId', '=', workspaceId)
            .where('consumedAt', 'is', null)
            .where('expiresAt', '>', new Date())
            .returningAll()
            .executeTakeFirst();
    }
    async upsertGrant(row) {
        return this.db
            .insertInto('oauthGrants')
            .values(row)
            .onConflict((oc) => oc.columns(['userId', 'clientId']).doUpdateSet({
            scopes: row.scopes,
            updatedAt: new Date(),
            revokedAt: null,
        }))
            .returningAll()
            .executeTakeFirstOrThrow();
    }
    async findGrantById(grantId, workspaceId) {
        return this.db
            .selectFrom('oauthGrants')
            .selectAll()
            .where('id', '=', grantId)
            .where('workspaceId', '=', workspaceId)
            .executeTakeFirst();
    }
    async findGrantByUserClient(userId, clientId, workspaceId) {
        return this.db
            .selectFrom('oauthGrants')
            .selectAll()
            .where('userId', '=', userId)
            .where('clientId', '=', clientId)
            .where('workspaceId', '=', workspaceId)
            .where('revokedAt', 'is', null)
            .executeTakeFirst();
    }
    async listGrantsByUser(userId, workspaceId) {
        return this.db
            .selectFrom('oauthGrants')
            .innerJoin('oauthClients', 'oauthClients.id', 'oauthGrants.clientId')
            .selectAll('oauthGrants')
            .select('oauthClients.name as clientName')
            .select('oauthClients.redirectUris as clientRedirectUris')
            .where('oauthGrants.userId', '=', userId)
            .where('oauthGrants.workspaceId', '=', workspaceId)
            .where('oauthGrants.revokedAt', 'is', null)
            .orderBy('oauthGrants.createdAt', 'desc')
            .execute();
    }
    async revokeGrant(grantId, workspaceId) {
        await this.db
            .updateTable('oauthTokens')
            .set({ revokedAt: new Date() })
            .where('grantId', '=', grantId)
            .where('workspaceId', '=', workspaceId)
            .where('revokedAt', 'is', null)
            .execute();
        await this.db
            .updateTable('oauthGrants')
            .set({ revokedAt: new Date() })
            .where('id', '=', grantId)
            .where('workspaceId', '=', workspaceId)
            .where('revokedAt', 'is', null)
            .execute();
    }
    async revokeAllGrantsForUser(userId, workspaceId) {
        const grants = await this.db
            .selectFrom('oauthGrants')
            .select('id')
            .where('userId', '=', userId)
            .where('workspaceId', '=', workspaceId)
            .where('revokedAt', 'is', null)
            .execute();
        if (grants.length === 0) {
            return 0;
        }
        const grantIds = grants.map((grant) => grant.id);
        const now = new Date();
        await this.db
            .updateTable('oauthTokens')
            .set({ revokedAt: now })
            .where('grantId', 'in', grantIds)
            .where('workspaceId', '=', workspaceId)
            .where('revokedAt', 'is', null)
            .execute();
        await this.db
            .updateTable('oauthGrants')
            .set({ revokedAt: now })
            .where('id', 'in', grantIds)
            .where('workspaceId', '=', workspaceId)
            .execute();
        return grantIds.length;
    }
    async insertToken(row) {
        return this.db
            .insertInto('oauthTokens')
            .values(row)
            .returningAll()
            .executeTakeFirstOrThrow();
    }
    async setTokenRefresh(tokenId, workspaceId, refreshTokenHash, refreshExpiresAt) {
        await this.db
            .updateTable('oauthTokens')
            .set({ refreshTokenHash, refreshExpiresAt })
            .where('id', '=', tokenId)
            .where('workspaceId', '=', workspaceId)
            .execute();
    }
    async findTokenByRefreshHash(refreshTokenHash, workspaceId) {
        return this.db
            .selectFrom('oauthTokens')
            .selectAll()
            .where('refreshTokenHash', '=', refreshTokenHash)
            .where('workspaceId', '=', workspaceId)
            .executeTakeFirst();
    }
    async findTokenByJti(jti, workspaceId) {
        return this.db
            .selectFrom('oauthTokens')
            .selectAll()
            .where('accessTokenJti', '=', jti)
            .where('workspaceId', '=', workspaceId)
            .executeTakeFirst();
    }
    async revokeToken(tokenId, workspaceId) {
        await this.db
            .updateTable('oauthTokens')
            .set({ revokedAt: new Date() })
            .where('id', '=', tokenId)
            .where('workspaceId', '=', workspaceId)
            .execute();
    }
    async revokeTokenIfActive(tokenId, workspaceId) {
        const row = await this.db
            .updateTable('oauthTokens')
            .set({ revokedAt: new Date() })
            .where('id', '=', tokenId)
            .where('workspaceId', '=', workspaceId)
            .where('revokedAt', 'is', null)
            .returning('id')
            .executeTakeFirst();
        return row != null;
    }
    async revokeTokensForGrant(grantId, workspaceId) {
        await this.db
            .updateTable('oauthTokens')
            .set({ revokedAt: new Date() })
            .where('grantId', '=', grantId)
            .where('workspaceId', '=', workspaceId)
            .where('revokedAt', 'is', null)
            .execute();
    }
    async touchGrantLastUsed(grantId) {
        await this.db
            .updateTable('oauthGrants')
            .set({ lastUsedAt: new Date() })
            .where('id', '=', grantId)
            .execute();
    }
    async deleteExpiredRows() {
        const now = new Date();
        await this.db
            .deleteFrom('oauthAuthorizationCodes')
            .where((eb) => eb.or([
            eb('consumedAt', '<', (0, date_fns_1.subDays)(now, 1)),
            eb('expiresAt', '<', (0, date_fns_1.subDays)(now, 1)),
        ]))
            .execute();
        await this.db
            .deleteFrom('oauthTokens')
            .where((eb) => eb.or([
            eb.and([
                eb('revokedAt', 'is not', null),
                eb('revokedAt', '<', (0, date_fns_1.subDays)(now, 7)),
            ]),
            eb.and([
                eb('refreshExpiresAt', 'is not', null),
                eb('refreshExpiresAt', '<', (0, date_fns_1.subDays)(now, 7)),
            ]),
            eb.and([
                eb('revokedAt', 'is', null),
                eb('refreshExpiresAt', 'is', null),
                eb('accessExpiresAt', '<', (0, date_fns_1.subDays)(now, 7)),
            ]),
        ]))
            .execute();
        await this.db
            .deleteFrom('oauthClients')
            .where('deletedAt', 'is not', null)
            .execute();
        await this.db
            .deleteFrom('oauthClients')
            .where('isDynamic', '=', true)
            .where('deletedAt', 'is', null)
            .where('createdAt', '<', (0, date_fns_1.subDays)(now, 30))
            .where((eb) => eb.not(eb.exists(eb
            .selectFrom('oauthGrants')
            .select('id')
            .whereRef('oauthGrants.clientId', '=', 'oauthClients.id'))))
            .execute();
    }
};
exports.OAuthRepo = OAuthRepo;
exports.OAuthRepo = OAuthRepo = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object])
], OAuthRepo);
//# sourceMappingURL=oauth.repo.js.map