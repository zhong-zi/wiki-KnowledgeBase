import { ProviderAccount, UnfurlResult } from '../../../../core/integration/registry/integration-provider.interface';
export declare class GitLabService {
    getAccount(accessToken: string, apiBaseUrl: string): Promise<ProviderAccount>;
    unfurlMergeRequest(accessToken: string, apiBaseUrl: string, projectPath: string, iid: number, url: string): Promise<UnfurlResult>;
    unfurlIssue(accessToken: string, apiBaseUrl: string, projectPath: string, iid: number, url: string): Promise<UnfurlResult>;
    unfurlProject(accessToken: string, apiBaseUrl: string, projectPath: string, url: string): Promise<UnfurlResult>;
    unfurlCommit(accessToken: string, apiBaseUrl: string, projectPath: string, commitSha: string, url: string): Promise<UnfurlResult>;
    unfurlIssuesList(accessToken: string, apiBaseUrl: string, projectPath: string, url: string): Promise<UnfurlResult>;
    unfurlMergesList(accessToken: string, apiBaseUrl: string, projectPath: string, url: string): Promise<UnfurlResult>;
    private formatMrStatus;
    private getMrStatusColor;
    private apiGet;
}
