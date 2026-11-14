import { IntegrationProvider, IntegrationDefinition, LinkDescription, OAuthConfig, ProviderAccount, ResolveAccountOpts, UnfurlPattern, UnfurlOpts, UnfurlResult } from '../../../../core/integration/registry/integration-provider.interface';
import { JiraService } from './jira.service';
export declare class JiraProvider extends IntegrationProvider {
    private readonly jiraService;
    private readonly logger;
    definition: IntegrationDefinition;
    constructor(jiraService: JiraService);
    getOAuthConfig(settings: Record<string, any>): OAuthConfig;
    getUnfurlPatterns(settings: Record<string, any>): UnfurlPattern[];
    getUnfurlHosts(settings: Record<string, any>): string[];
    resolveAccount(opts: ResolveAccountOpts): Promise<ProviderAccount>;
    unfurl(opts: UnfurlOpts): Promise<UnfurlResult>;
    private resolveBaseUrl;
    describeLink(patternType: string, match: RegExpMatchArray, url: string): LinkDescription | null;
}
