import { IntegrationRepo } from '../../../../../core/integration/repos/integration.repo';
import { IntegrationConnectionRepo } from '../../../../../core/integration/repos/integration-connection.repo';
import { OAuthService } from '../../../../../core/integration/oauth/oauth.service';
import { WorkspaceRepo } from "../../../../../database/repos/workspace/workspace.repo";
import { DomainService } from '../../../../../integrations/environment/domain.service';
import { SlackHandlerContext } from './slack-handler.interface';
export declare class SlackHandlerContextBuilder {
    private readonly integrationRepo;
    private readonly connectionRepo;
    private readonly workspaceRepo;
    private readonly oauthService;
    private readonly domainService;
    constructor(integrationRepo: IntegrationRepo, connectionRepo: IntegrationConnectionRepo, workspaceRepo: WorkspaceRepo, oauthService: OAuthService, domainService: DomainService);
    fromTeamId(slackTeamId: string, rawBody: string, responseUrl?: string): Promise<SlackHandlerContext | null>;
    fromWorkspaceId(workspaceId: string): Promise<SlackHandlerContext | null>;
    private fromIntegration;
}
