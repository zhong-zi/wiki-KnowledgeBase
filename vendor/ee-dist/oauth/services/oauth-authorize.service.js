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
exports.OAuthAuthorizeService = void 0;
const common_1 = require("@nestjs/common");
const oauth_repo_1 = require("../repos/oauth.repo");
const oauth_constants_1 = require("../oauth.constants");
const known_clients_1 = require("../known-clients");
const oauth_entities_1 = require("../engine/oauth-entities");
const audit_service_1 = require("../../../integrations/audit/audit.service");
const audit_events_1 = require("../../../common/events/audit-events");
const KNOWN_SCOPES = new Set(oauth_constants_1.OAUTH_SCOPES);
function oauthError(error, description) {
    return new common_1.BadRequestException({ error, error_description: description });
}
function appendQueryParams(uri, entries) {
    const url = new URL(uri);
    for (const [key, value] of Object.entries(entries)) {
        url.searchParams.append(key, value);
    }
    return url.toString();
}
let OAuthAuthorizeService = class OAuthAuthorizeService {
    constructor(oauthRepo, auditService) {
        this.oauthRepo = oauthRepo;
        this.auditService = auditService;
    }
    async getAuthorizationInfo(params, workspaceId, issuerOrigin) {
        if (params.response_type !== 'code') {
            throw oauthError('invalid_request', 'response_type must be code');
        }
        if (params.code_challenge_method !== 'S256') {
            throw oauthError('invalid_request', 'code_challenge_method must be S256');
        }
        let scopes;
        if (params.scope === undefined) {
            scopes = [...oauth_constants_1.OAUTH_SCOPES];
        }
        else {
            const tokens = params.scope.split(' ');
            if (tokens.some((token) => !KNOWN_SCOPES.has(token))) {
                throw oauthError('invalid_request', `Unknown scope requested: ${params.scope}`);
            }
            scopes = Array.from(new Set(tokens));
        }
        const client = await this.oauthRepo.findClientById(params.client_id, workspaceId);
        if (!client) {
            throw oauthError('invalid_client', 'Unknown client');
        }
        if (!client.redirectUris.includes(params.redirect_uri)) {
            throw oauthError('invalid_redirect_uri', 'redirect_uri is not registered for this client');
        }
        if (params.resource !== undefined) {
            let resourceOrigin;
            try {
                resourceOrigin = new URL(params.resource).origin;
            }
            catch {
                throw oauthError('invalid_target', 'resource must be a valid URL');
            }
            if (resourceOrigin !== issuerOrigin) {
                throw oauthError('invalid_target', 'resource must be on this authorization server');
            }
        }
        const verifiedName = (0, known_clients_1.resolveVerifiedName)(params.redirect_uri);
        return {
            clientName: verifiedName ?? client.name,
            redirectUri: params.redirect_uri,
            scopes,
            clientCreatedAt: client.createdAt,
            verified: verifiedName !== null,
        };
    }
    async approveAuthorization(user, params, workspaceId, issuerOrigin) {
        const info = await this.getAuthorizationInfo(params, workspaceId, issuerOrigin);
        const stateParam = params.state !== undefined ? { state: params.state } : {};
        if (!params.approved) {
            return {
                redirectUrl: appendQueryParams(params.redirect_uri, {
                    error: 'access_denied',
                    error_description: 'The user denied the request',
                    iss: issuerOrigin,
                    ...stateParam,
                }),
            };
        }
        const approvedScopes = Array.from(new Set(params.approvedScopes ?? []));
        if (approvedScopes.length === 0 ||
            !approvedScopes.every((scope) => info.scopes.includes(scope))) {
            throw oauthError('invalid_request', 'approvedScopes must be a non-empty subset of the requested scopes');
        }
        const grant = await this.oauthRepo.upsertGrant({
            userId: user.id,
            clientId: params.client_id,
            workspaceId,
            scopes: approvedScopes,
        });
        this.auditService?.log({
            event: audit_events_1.AuditEvent.OAUTH_GRANT_CREATED,
            resourceType: audit_events_1.AuditResource.OAUTH_GRANT,
            resourceId: grant.id,
            changes: {
                after: { clientName: info.clientName, scopes: approvedScopes },
            },
        });
        const code = (0, oauth_entities_1.randomTokenString)();
        await this.oauthRepo.insertAuthCode({
            codeHash: (0, oauth_entities_1.sha256hex)(code),
            clientId: params.client_id,
            userId: user.id,
            workspaceId,
            scopes: approvedScopes,
            redirectUri: params.redirect_uri,
            codeChallenge: params.code_challenge,
            codeChallengeMethod: 'S256',
            expiresAt: new Date(Date.now() + oauth_constants_1.AUTH_CODE_TTL_MS),
        });
        return {
            redirectUrl: appendQueryParams(params.redirect_uri, {
                code,
                iss: issuerOrigin,
                ...stateParam,
            }),
        };
    }
};
exports.OAuthAuthorizeService = OAuthAuthorizeService;
exports.OAuthAuthorizeService = OAuthAuthorizeService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(audit_service_1.AUDIT_SERVICE)),
    __metadata("design:paramtypes", [oauth_repo_1.OAuthRepo, Object])
], OAuthAuthorizeService);
//# sourceMappingURL=oauth-authorize.service.js.map