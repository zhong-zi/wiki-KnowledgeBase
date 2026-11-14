import { ProviderAccount, UnfurlResult } from '../../../../core/integration/registry/integration-provider.interface';
export declare class GoogleDocsService {
    getAccount(accessToken: string): Promise<ProviderAccount>;
    unfurlFile(accessToken: string, fileId: string, url: string): Promise<UnfurlResult>;
    private apiGet;
}
