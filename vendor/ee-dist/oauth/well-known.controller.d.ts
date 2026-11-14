import { FastifyRequest } from 'fastify';
import { WorkspaceRepo } from "../../database/repos/workspace/workspace.repo";
import { EnvironmentService } from '../../integrations/environment/environment.service';
import { LicenseService } from '../licence/license.service';
import { OAuthMetadataService } from './services/oauth-metadata.service';
export declare class OAuthWellKnownController {
    private readonly workspaceRepo;
    private readonly environmentService;
    private readonly licenseService;
    private readonly oauthMetadataService;
    constructor(workspaceRepo: WorkspaceRepo, environmentService: EnvironmentService, licenseService: LicenseService, oauthMetadataService: OAuthMetadataService);
    getAuthorizationServerMetadata(req: FastifyRequest): Promise<{
        issuer: string;
        authorization_endpoint: string;
        token_endpoint: string;
        registration_endpoint: string;
        revocation_endpoint: string;
        grant_types_supported: string[];
        response_types_supported: string[];
        code_challenge_methods_supported: string[];
        token_endpoint_auth_methods_supported: string[];
        authorization_response_iss_parameter_supported: boolean;
        scopes_supported: ("read" | "write")[];
    }>;
    getProtectedResourceMetadata(req: FastifyRequest): Promise<{
        resource: string;
        authorization_servers: string[];
        bearer_methods_supported: string[];
        scopes_supported: ("read" | "write")[];
    }>;
    getProtectedResourceMcpMetadata(req: FastifyRequest): Promise<{
        resource: string;
        authorization_servers: string[];
        bearer_methods_supported: string[];
        scopes_supported: ("read" | "write")[];
    }>;
    private resolveWorkspace;
    private assertAvailable;
    private buildIssuerOrigin;
}
