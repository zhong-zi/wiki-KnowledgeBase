import { OAuthRepo } from '../repos/oauth.repo';
import { IAuditService } from '../../../integrations/audit/audit.service';
export declare class OAuthGrantService {
    private readonly oauthRepo;
    private readonly auditService;
    constructor(oauthRepo: OAuthRepo, auditService: IAuditService);
    listUserGrants(userId: string, workspaceId: string): Promise<{
        id: string;
        clientName: string;
        redirectUris: string[];
        scopes: string[];
        createdAt: Date;
        lastUsedAt: Date;
    }[]>;
    revokeUserGrant(userId: string, grantId: string, workspaceId: string): Promise<void>;
}
