import { IntegrationProvider, IntegrationDefinition, LinkDescription, OAuthConfig, ProviderAccount, ResolveAccountOpts, UnfurlPattern, UnfurlOpts, UnfurlResult } from '../../../../core/integration/registry/integration-provider.interface';
import { GitLabService } from './gitlab.service';
export declare class GitLabProvider extends IntegrationProvider {
    private readonly gitlabService;
    private readonly logger;
    definition: IntegrationDefinition;
    constructor(gitlabService: GitLabService);
    getOAuthConfig(settings: Record<string, any>): OAuthConfig;
    getUnfurlPatterns(settings: Record<string, any>): UnfurlPattern[];
    getUnfurlHosts(settings: Record<string, any>): string[];
    resolveAccount(opts: ResolveAccountOpts): Promise<ProviderAccount>;
    unfurl(opts: UnfurlOpts): Promise<UnfurlResult>;
    describeLink(patternType: string, match: RegExpMatchArray, url: string): LinkDescription | null;
    private decodeWorkItemShowParam;
    private resolveBaseUrl;
    private resolveApiBaseUrl;
}
