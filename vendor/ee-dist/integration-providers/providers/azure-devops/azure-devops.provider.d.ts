import { IntegrationDefinition, IntegrationProvider, LinkDescription, OAuthConfig, ProviderAccount, ResolveAccountOpts, UnfurlOpts, UnfurlResult } from '../../../../core/integration/registry/integration-provider.interface';
import { EnvironmentService } from '../../../../integrations/environment/environment.service';
import { AzureDevOpsService } from './azure-devops.service';
export declare const AZURE_DEVOPS_TYPE = "azure_devops";
export declare class AzureDevOpsProvider extends IntegrationProvider {
    private readonly azureDevOpsService;
    private readonly logger;
    definition: IntegrationDefinition;
    constructor(azureDevOpsService: AzureDevOpsService, environmentService: EnvironmentService);
    getOAuthConfig(): OAuthConfig;
    resolveAccount(opts: ResolveAccountOpts): Promise<ProviderAccount>;
    unfurl(opts: UnfurlOpts): Promise<UnfurlResult>;
    describeLink(patternType: string, match: RegExpMatchArray): LinkDescription | null;
}
