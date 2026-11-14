import { ProviderAccount, UnfurlResult } from '../../../../core/integration/registry/integration-provider.interface';
export declare class AzureDevOpsService {
    private readonly logger;
    private readonly stateCategories;
    getAccount(accessToken: string): Promise<ProviderAccount>;
    unfurlWorkItem(accessToken: string, org: string, id: number, url: string): Promise<UnfurlResult>;
    unfurlPullRequest(accessToken: string, org: string, id: number, url: string): Promise<UnfurlResult>;
    private resolveStateColor;
    private apiGet;
    private fetchJson;
}
