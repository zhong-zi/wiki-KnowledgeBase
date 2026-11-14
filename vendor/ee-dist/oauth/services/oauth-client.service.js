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
exports.OAuthClientService = void 0;
const common_1 = require("@nestjs/common");
const oauth_repo_1 = require("../repos/oauth.repo");
const oauth_constants_1 = require("../oauth.constants");
const audit_service_1 = require("../../../integrations/audit/audit.service");
const audit_events_1 = require("../../../common/events/audit-events");
const ALLOWED_GRANT_TYPES = ['authorization_code', 'refresh_token'];
const LOOPBACK_HOSTNAMES = new Set(['127.0.0.1', '[::1]', 'localhost']);
const CUSTOM_SCHEME_PATTERN = /^[a-zA-Z][a-zA-Z0-9+.-]*$/;
function invalidRedirectUri(description) {
    return new common_1.BadRequestException({
        error: 'invalid_redirect_uri',
        error_description: description,
    });
}
function invalidClientMetadata(description) {
    return new common_1.BadRequestException({
        error: 'invalid_client_metadata',
        error_description: description,
    });
}
function clientDisplayName(dto) {
    const name = dto.client_name?.trim();
    if (name) {
        return name;
    }
    const url = new URL(dto.redirect_uris[0]);
    const fallback = url.protocol === 'https:' || url.protocol === 'http:'
        ? url.hostname
        : url.protocol.slice(0, -1);
    return fallback.slice(0, oauth_constants_1.MAX_CLIENT_NAME_LENGTH);
}
let OAuthClientService = class OAuthClientService {
    constructor(oauthRepo, auditService) {
        this.oauthRepo = oauthRepo;
        this.auditService = auditService;
    }
    async registerClient(dto, workspaceId) {
        this.validateRedirectUris(dto.redirect_uris);
        this.validateDisplayUri('client_uri', dto.client_uri);
        this.validateDisplayUri('logo_uri', dto.logo_uri);
        if (dto.token_endpoint_auth_method &&
            dto.token_endpoint_auth_method !== 'none') {
            throw invalidClientMetadata(`Unsupported token_endpoint_auth_method: ${dto.token_endpoint_auth_method}`);
        }
        if (dto.grant_types?.some((grant) => !ALLOWED_GRANT_TYPES.includes(grant))) {
            throw invalidClientMetadata('grant_types must be a subset of authorization_code, refresh_token');
        }
        const activeClients = await this.oauthRepo.countActiveDynamicClients(workspaceId);
        if (activeClients >= oauth_constants_1.MAX_DYNAMIC_CLIENTS_PER_WORKSPACE) {
            throw invalidClientMetadata('Workspace has reached the maximum number of registered OAuth clients');
        }
        const client = await this.oauthRepo.insertClient({
            name: clientDisplayName(dto),
            redirectUris: dto.redirect_uris,
            clientUri: dto.client_uri ?? null,
            logoUri: dto.logo_uri ?? null,
            grantTypes: [...ALLOWED_GRANT_TYPES],
            scopes: [...oauth_constants_1.OAUTH_SCOPES],
            tokenEndpointAuthMethod: 'none',
            isDynamic: true,
            workspaceId,
        });
        this.auditService?.log({
            event: audit_events_1.AuditEvent.OAUTH_CLIENT_REGISTERED,
            resourceType: audit_events_1.AuditResource.OAUTH_CLIENT,
            resourceId: client.id,
            changes: {
                after: { name: client.name, redirectUris: client.redirectUris },
            },
        });
        return {
            client_id: client.id,
            client_id_issued_at: Math.floor(new Date(client.createdAt).getTime() / 1000),
            client_name: client.name,
            redirect_uris: client.redirectUris,
            grant_types: client.grantTypes,
            response_types: ['code'],
            token_endpoint_auth_method: 'none',
            scope: oauth_constants_1.OAUTH_SCOPES.join(' '),
        };
    }
    validateDisplayUri(field, rawUri) {
        if (rawUri === undefined) {
            return;
        }
        let url;
        try {
            url = new URL(rawUri);
        }
        catch {
            throw invalidClientMetadata(`${field} is not a valid URI: ${rawUri}`);
        }
        if (url.protocol !== 'https:' && url.protocol !== 'http:') {
            throw invalidClientMetadata(`${field} must be an http or https URI: ${rawUri}`);
        }
    }
    validateRedirectUris(redirectUris) {
        for (const rawUri of redirectUris) {
            let url;
            try {
                url = new URL(rawUri);
            }
            catch {
                throw invalidRedirectUri(`Redirect URI is not a valid URI: ${rawUri}`);
            }
            if (oauth_constants_1.FORBIDDEN_REDIRECT_SCHEMES.includes(url.protocol)) {
                throw invalidRedirectUri(`Redirect URI scheme is forbidden: ${rawUri}`);
            }
            if (rawUri.includes('#')) {
                throw invalidRedirectUri(`Redirect URI must not contain a fragment: ${rawUri}`);
            }
            if (url.protocol === 'https:') {
                continue;
            }
            if (url.protocol === 'http:') {
                if (LOOPBACK_HOSTNAMES.has(url.hostname)) {
                    continue;
                }
                throw invalidRedirectUri(`http redirect URIs are only allowed for loopback addresses: ${rawUri}`);
            }
            if (!CUSTOM_SCHEME_PATTERN.test(url.protocol.slice(0, -1))) {
                throw invalidRedirectUri(`Redirect URI scheme is invalid: ${rawUri}`);
            }
        }
    }
};
exports.OAuthClientService = OAuthClientService;
exports.OAuthClientService = OAuthClientService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, common_1.Inject)(audit_service_1.AUDIT_SERVICE)),
    __metadata("design:paramtypes", [oauth_repo_1.OAuthRepo, Object])
], OAuthClientService);
//# sourceMappingURL=oauth-client.service.js.map