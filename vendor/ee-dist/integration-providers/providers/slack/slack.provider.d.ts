import { IntegrationProvider, IntegrationDefinition, ConnectedEvent, IdentityLinkEvent, LinkDescription, OAuthConfig, ProviderAccount, ResolveAccountOpts, ResolvedIdentity, UnfurlOpts, UnfurlResult } from '../../../../core/integration/registry/integration-provider.interface';
import { IntegrationRepo } from '../../../../core/integration/repos/integration.repo';
import { IntegrationConnectionRepo } from '../../../../core/integration/repos/integration-connection.repo';
import { SlackUnfurlService } from './unfurl/slack-unfurl.service';
export declare class SlackProvider extends IntegrationProvider {
    private readonly integrationRepo;
    private readonly connectionRepo;
    private readonly slackUnfurlService;
    definition: IntegrationDefinition;
    constructor(integrationRepo: IntegrationRepo, connectionRepo: IntegrationConnectionRepo, slackUnfurlService: SlackUnfurlService);
    getOAuthConfig(workspaceSettings: Record<string, any>): OAuthConfig;
    resolveIdentity(opts: IdentityLinkEvent): Promise<ResolvedIdentity>;
    unfurl(opts: UnfurlOpts): Promise<UnfurlResult>;
    describeLink(patternType: string, match: RegExpMatchArray, url: string): LinkDescription | null;
    private threadTsFromUrl;
    resolveAccount(opts: ResolveAccountOpts): Promise<ProviderAccount>;
    onConnected(opts: ConnectedEvent): Promise<void>;
}
