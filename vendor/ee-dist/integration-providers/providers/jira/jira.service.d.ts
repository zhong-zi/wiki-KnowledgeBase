import { RedisService } from '@nestjs-labs/nestjs-ioredis';
import { ProviderAccount, UnfurlResult } from '../../../../core/integration/registry/integration-provider.interface';
export declare class JiraService {
    private readonly redisService;
    private readonly redis;
    constructor(redisService: RedisService);
    getAccount(accessToken: string, dataCenterBaseUrl: string | null): Promise<ProviderAccount>;
    unfurlIssue(accessToken: string, host: string, issueKey: string, url: string): Promise<UnfurlResult>;
    private extractDescription;
    private extractRenderedDescription;
    private getStatusColor;
    private isCloudHost;
    private resolveApiBase;
    private resolveCloudId;
    private getAccessibleResources;
    private apiGet;
}
