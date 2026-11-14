import { OAuthRepo } from '../repos/oauth.repo';
import { RegisterClientDto } from '../dto/register-client.dto';
import { IAuditService } from '../../../integrations/audit/audit.service';
export declare class OAuthClientService {
    private readonly oauthRepo;
    private readonly auditService;
    constructor(oauthRepo: OAuthRepo, auditService: IAuditService);
    registerClient(dto: RegisterClientDto, workspaceId: string): Promise<{
        client_id: string;
        client_id_issued_at: number;
        client_name: string;
        redirect_uris: import("../../../database/types/db").JsonValue;
        grant_types: import("../../../database/types/db").JsonValue;
        response_types: string[];
        token_endpoint_auth_method: string;
        scope: string;
    }>;
    private validateDisplayUri;
    private validateRedirectUris;
}
