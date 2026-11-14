import { OAuthRepo } from '../repos/oauth.repo';
export declare class OAuthCleanupService {
    private readonly oauthRepo;
    private readonly logger;
    constructor(oauthRepo: OAuthRepo);
    cleanupExpiredRows(): Promise<void>;
}
