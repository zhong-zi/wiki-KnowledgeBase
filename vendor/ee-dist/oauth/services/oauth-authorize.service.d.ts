import { OAuthRepo } from '../repos/oauth.repo';
import { ApproveAuthorizationDto, AuthorizeParamsDto } from '../dto/authorize.dto';
import { IAuditService } from '../../../integrations/audit/audit.service';
export declare class OAuthAuthorizeService {
    private readonly oauthRepo;
    private readonly auditService;
    constructor(oauthRepo: OAuthRepo, auditService: IAuditService);
    getAuthorizationInfo(params: AuthorizeParamsDto, workspaceId: string, issuerOrigin: string): Promise<{
        clientName: string;
        redirectUri: string;
        scopes: string[];
        clientCreatedAt: Date;
        verified: boolean;
    }>;
    approveAuthorization(user: {
        id: string;
    }, params: ApproveAuthorizationDto, workspaceId: string, issuerOrigin: string): Promise<{
        redirectUrl: string;
    }>;
}
