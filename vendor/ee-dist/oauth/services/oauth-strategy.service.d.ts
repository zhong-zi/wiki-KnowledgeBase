import { UserRepo } from "../../../database/repos/user/user.repo";
import { WorkspaceRepo } from "../../../database/repos/workspace/workspace.repo";
import { User, Workspace } from "../../../database/types/entity.types";
import { JwtOAuthPayload } from '../../../core/auth/dto/jwt-payload';
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { OAuthRepo } from '../repos/oauth.repo';
export declare class OAuthStrategyService {
    private readonly oauthRepo;
    private readonly userRepo;
    private readonly workspaceRepo;
    private readonly environmentService;
    private readonly logger;
    constructor(oauthRepo: OAuthRepo, userRepo: UserRepo, workspaceRepo: WorkspaceRepo, environmentService: EnvironmentService);
    validateOAuthToken(payload: JwtOAuthPayload, reqContext: {
        workspaceId?: string;
        host: string;
    }): Promise<{
        user: User;
        workspace: Workspace;
        oauth: {
            grantId: string;
            scopes: string[];
        };
    }>;
    private resolveWorkspaceIdFromHost;
}
