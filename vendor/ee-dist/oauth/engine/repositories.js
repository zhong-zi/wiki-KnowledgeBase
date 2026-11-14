"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceUserRepository = exports.WorkspaceScopeRepository = exports.WorkspaceTokenRepository = exports.WorkspaceAuthCodeRepository = exports.WorkspaceClientRepository = void 0;
const common_1 = require("@nestjs/common");
const date_fns_1 = require("date-fns");
const uuid_1 = require("uuid");
const oauth2_server_1 = require("@jmondi/oauth2-server");
const oauth_constants_1 = require("../oauth.constants");
const oauth_entities_1 = require("./oauth-entities");
const logger = new common_1.Logger('OAuthEngine');
class WorkspaceClientRepository {
    constructor(oauthRepo, workspaceId) {
        this.oauthRepo = oauthRepo;
        this.workspaceId = workspaceId;
    }
    async getByIdentifier(clientId) {
        const row = await this.oauthRepo.findClientById(clientId, this.workspaceId);
        if (!row) {
            throw oauth2_server_1.OAuthException.invalidClient();
        }
        return (0, oauth_entities_1.toJmondiClient)(row);
    }
    async isClientValid(grantType, client, clientSecret) {
        return (!clientSecret &&
            client.allowedGrants.includes(grantType) &&
            client.tokenEndpointAuthMethod === 'none');
    }
}
exports.WorkspaceClientRepository = WorkspaceClientRepository;
class WorkspaceAuthCodeRepository {
    constructor(oauthRepo, workspaceId) {
        this.oauthRepo = oauthRepo;
        this.workspaceId = workspaceId;
        this.consumedByThisRequest = new Set();
    }
    async getByIdentifier(wireCode) {
        const codeHash = (0, oauth_entities_1.sha256hex)(wireCode);
        const consumed = await this.oauthRepo.consumeAuthCode(codeHash, this.workspaceId);
        if (!consumed) {
            await this.cascadeOnReplay(codeHash);
            throw oauth2_server_1.OAuthException.invalidGrant('Authorization code is invalid, expired, or already used');
        }
        this.consumedByThisRequest.add(wireCode);
        return (0, oauth_entities_1.toJmondiAuthCode)(consumed, wireCode);
    }
    async cascadeOnReplay(codeHash) {
        const row = await this.oauthRepo.findAuthCodeByHash(codeHash, this.workspaceId);
        if (!row?.consumedAt)
            return;
        const grant = await this.oauthRepo.findGrantByUserClient(row.userId, row.clientId, this.workspaceId);
        if (grant) {
            await this.oauthRepo.revokeGrant(grant.id, this.workspaceId);
        }
    }
    issueAuthCode(client, user, scopes) {
        return {
            code: (0, oauth_entities_1.randomTokenString)(),
            redirectUri: null,
            codeChallenge: null,
            codeChallengeMethod: null,
            expiresAt: new Date(Date.now() + oauth_constants_1.AUTH_CODE_TTL_MS),
            user,
            client,
            scopes,
        };
    }
    async persist(authCode) {
        if (authCode.user?.id == null) {
            throw oauth2_server_1.OAuthException.invalidGrant('Authorization code has no user');
        }
        if (!authCode.redirectUri) {
            throw oauth2_server_1.OAuthException.invalidParameter('redirect_uri');
        }
        await this.oauthRepo.insertAuthCode({
            codeHash: (0, oauth_entities_1.sha256hex)(authCode.code),
            clientId: authCode.client.id,
            userId: String(authCode.user.id),
            workspaceId: this.workspaceId,
            scopes: authCode.scopes.map((scope) => scope.name),
            redirectUri: authCode.redirectUri,
            codeChallenge: authCode.codeChallenge ?? null,
            codeChallengeMethod: authCode.codeChallengeMethod ?? null,
            expiresAt: authCode.expiresAt,
        });
    }
    async isRevoked(wireCode) {
        if (this.consumedByThisRequest.has(wireCode)) {
            return false;
        }
        const row = await this.oauthRepo.findAuthCodeByHash((0, oauth_entities_1.sha256hex)(wireCode), this.workspaceId);
        return !row || row.consumedAt != null;
    }
    async revoke(wireCode) {
        await this.oauthRepo.consumeAuthCode((0, oauth_entities_1.sha256hex)(wireCode), this.workspaceId);
    }
}
exports.WorkspaceAuthCodeRepository = WorkspaceAuthCodeRepository;
class WorkspaceTokenRepository {
    constructor(oauthRepo, workspaceId) {
        this.oauthRepo = oauthRepo;
        this.workspaceId = workspaceId;
    }
    async issueToken(client, scopes, user) {
        return {
            accessToken: (0, uuid_1.v7)(),
            accessTokenExpiresAt: new oauth2_server_1.DateInterval(oauth_constants_1.ACCESS_TOKEN_TTL).getEndDate(),
            refreshToken: null,
            refreshTokenExpiresAt: null,
            client,
            user,
            scopes,
        };
    }
    async persist(token) {
        const grantId = token.user?.grantId;
        if (typeof grantId !== 'string' || !grantId) {
            throw oauth2_server_1.OAuthException.invalidGrant('Token is not bound to a grant');
        }
        const row = await this.oauthRepo.insertToken({
            grantId,
            workspaceId: this.workspaceId,
            accessTokenJti: token.accessToken,
            refreshTokenHash: token.refreshToken
                ? (0, oauth_entities_1.sha256hex)(token.refreshToken)
                : null,
            scopes: token.scopes.map((scope) => scope.name),
            accessExpiresAt: token.accessTokenExpiresAt,
            refreshExpiresAt: token.refreshTokenExpiresAt ?? null,
        });
        token.rowId = row.id;
    }
    async issueRefreshToken(token, _client) {
        if (typeof token.rowId !== 'string') {
            throw oauth2_server_1.OAuthException.invalidGrant('Token was never persisted');
        }
        token.refreshToken = (0, oauth_entities_1.randomTokenString)();
        token.refreshTokenExpiresAt = (0, date_fns_1.addDays)(new Date(), oauth_constants_1.REFRESH_TOKEN_TTL_DAYS);
        await this.oauthRepo.setTokenRefresh(token.rowId, this.workspaceId, (0, oauth_entities_1.sha256hex)(token.refreshToken), token.refreshTokenExpiresAt);
        return token;
    }
    async revoke(token) {
        const rowId = typeof token.rowId === 'string'
            ? token.rowId
            : (await this.oauthRepo.findTokenByJti(token.accessToken, this.workspaceId))?.id;
        if (!rowId) {
            return;
        }
        const revoked = await this.oauthRepo.revokeTokenIfActive(rowId, this.workspaceId);
        if (!revoked) {
            throw oauth2_server_1.OAuthException.invalidGrant('Refresh token has already been used');
        }
    }
    async revokeDescendantsOf(wireCode) {
        const codeRow = await this.oauthRepo.findAuthCodeByHash((0, oauth_entities_1.sha256hex)(wireCode), this.workspaceId);
        if (!codeRow)
            return;
        const grant = await this.oauthRepo.findGrantByUserClient(codeRow.userId, codeRow.clientId, this.workspaceId);
        if (grant) {
            logger.warn(`auth code replay detected, revoking grant ${grant.id}`);
            await this.oauthRepo.revokeGrant(grant.id, this.workspaceId);
        }
    }
    async isRefreshTokenRevoked(token) {
        const wire = token.refreshToken;
        if (typeof wire !== 'string' || !wire) {
            return true;
        }
        const row = await this.oauthRepo.findTokenByRefreshHash((0, oauth_entities_1.sha256hex)(wire), this.workspaceId);
        if (!row) {
            return true;
        }
        if (row.revokedAt) {
            logger.warn(`refresh token reuse detected, revoking grant ${row.grantId}`);
            await this.oauthRepo.revokeGrant(row.grantId, this.workspaceId);
            return true;
        }
        const grant = await this.oauthRepo.findGrantById(row.grantId, this.workspaceId);
        return !grant || grant.revokedAt != null;
    }
    async getByRefreshToken(wireRefreshToken) {
        const row = await this.oauthRepo.findTokenByRefreshHash((0, oauth_entities_1.sha256hex)(wireRefreshToken), this.workspaceId);
        if (!row) {
            throw oauth2_server_1.OAuthException.invalidGrant('Refresh token not found');
        }
        const grant = await this.oauthRepo.findGrantById(row.grantId, this.workspaceId);
        if (!grant) {
            throw oauth2_server_1.OAuthException.invalidGrant('Refresh token not found');
        }
        return (0, oauth_entities_1.toJmondiToken)(row, grant, wireRefreshToken);
    }
}
exports.WorkspaceTokenRepository = WorkspaceTokenRepository;
class WorkspaceScopeRepository {
    async getAllByIdentifiers(scopeNames) {
        return [...new Set(scopeNames)]
            .filter((name) => oauth_constants_1.OAUTH_SCOPES.includes(name))
            .map((name) => ({ name }));
    }
    async finalize(scopes, _identifier, _client, _userId) {
        return scopes.filter((scope, index, all) => all.findIndex((other) => other.name === scope.name) === index);
    }
}
exports.WorkspaceScopeRepository = WorkspaceScopeRepository;
class WorkspaceUserRepository {
    constructor(oauthRepo, workspaceId) {
        this.oauthRepo = oauthRepo;
        this.workspaceId = workspaceId;
    }
    async getUserByCredentials(identifier, password, _grantType, client) {
        if (password !== undefined || !client) {
            throw oauth2_server_1.OAuthException.invalidGrant();
        }
        const grant = await this.oauthRepo.findGrantByUserClient(String(identifier), client.id, this.workspaceId);
        if (!grant) {
            throw oauth2_server_1.OAuthException.invalidGrant('No active grant for this client');
        }
        return { id: identifier, grantId: grant.id };
    }
}
exports.WorkspaceUserRepository = WorkspaceUserRepository;
//# sourceMappingURL=repositories.js.map