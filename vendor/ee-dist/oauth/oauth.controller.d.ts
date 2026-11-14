import { FastifyReply, FastifyRequest } from 'fastify';
import { User, Workspace } from "../../database/types/entity.types";
import { RegisterClientDto } from './dto/register-client.dto';
import { ApproveAuthorizationDto, AuthorizeParamsDto } from './dto/authorize.dto';
import { OAuthClientService } from './services/oauth-client.service';
import { OAuthAuthorizeService } from './services/oauth-authorize.service';
import { OAuthTokenService } from './services/oauth-token.service';
import { OAuthGrantService } from './services/oauth-grant.service';
import { RevokeGrantDto } from './dto/revoke-grant.dto';
import { EnvironmentService } from '../../integrations/environment/environment.service';
import { LicenseService } from '../licence/license.service';
export declare class OAuthController {
    private readonly oauthClientService;
    private readonly oauthAuthorizeService;
    private readonly oauthTokenService;
    private readonly oauthGrantService;
    private readonly environmentService;
    private readonly licenseService;
    constructor(oauthClientService: OAuthClientService, oauthAuthorizeService: OAuthAuthorizeService, oauthTokenService: OAuthTokenService, oauthGrantService: OAuthGrantService, environmentService: EnvironmentService, licenseService: LicenseService);
    register(dto: RegisterClientDto, req: FastifyRequest): Promise<{
        client_id: string;
        client_id_issued_at: number;
        client_name: string;
        redirect_uris: import("../../database/types/db").JsonValue;
        grant_types: import("../../database/types/db").JsonValue;
        response_types: string[];
        token_endpoint_auth_method: string;
        scope: string;
    }>;
    authorizeInfo(dto: AuthorizeParamsDto, workspace: Workspace, req: FastifyRequest): Promise<{
        clientName: string;
        redirectUri: string;
        scopes: string[];
        clientCreatedAt: Date;
        verified: boolean;
    }>;
    authorize(dto: ApproveAuthorizationDto, user: User, workspace: Workspace, req: FastifyRequest): Promise<{
        redirectUrl: string;
    }>;
    token(req: FastifyRequest, reply: FastifyReply): Promise<void>;
    revoke(body: {
        token?: string;
        token_type_hint?: string;
        client_id?: string;
    }, req: FastifyRequest): Promise<{}>;
    listGrants(user: User, workspace: Workspace): Promise<{
        id: string;
        clientName: string;
        redirectUris: string[];
        scopes: string[];
        createdAt: Date;
        lastUsedAt: Date;
    }[]>;
    revokeGrant(dto: RevokeGrantDto, user: User, workspace: Workspace): Promise<{}>;
    private assertAvailable;
    private assertMcpEnabled;
    private buildIssuerOrigin;
}
