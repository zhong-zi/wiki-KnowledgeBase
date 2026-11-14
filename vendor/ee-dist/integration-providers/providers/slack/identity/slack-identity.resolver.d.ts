import { IntegrationRepo } from '../../../../../core/integration/repos/integration.repo';
import { IntegrationConnectionRepo } from '../../../../../core/integration/repos/integration-connection.repo';
import { UserRepo } from "../../../../../database/repos/user/user.repo";
import { WorkspaceRepo } from "../../../../../database/repos/workspace/workspace.repo";
import { SlackBlock } from '../client/slack-api.types';
export type ResolvedSlackUser = {
    user: {
        id: string;
        name: string;
        email?: string;
    };
    workspace: {
        id: string;
        name: string;
    };
    integration: {
        id: string;
    };
};
export declare class SlackIdentityResolver {
    private readonly integrationRepo;
    private readonly connectionRepo;
    private readonly userRepo;
    private readonly workspaceRepo;
    constructor(integrationRepo: IntegrationRepo, connectionRepo: IntegrationConnectionRepo, userRepo: UserRepo, workspaceRepo: WorkspaceRepo);
    resolveSlackUser(slackTeamId: string, slackUserId: string): Promise<ResolvedSlackUser | null>;
    buildLinkPrompt(args: {
        slackUserName: string;
        appUrl: string;
    }): SlackBlock[];
    private hydrate;
}
