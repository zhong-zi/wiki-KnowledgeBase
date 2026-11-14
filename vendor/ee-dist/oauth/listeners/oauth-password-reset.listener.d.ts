import { OAuthRepo } from '../repos/oauth.repo';
export declare class UserPasswordResetEvent {
    userId: string;
    workspaceId: string;
}
export declare class OAuthPasswordResetListener {
    private readonly oauthRepo;
    private readonly logger;
    constructor(oauthRepo: OAuthRepo);
    handlePasswordReset(event: UserPasswordResetEvent): Promise<void>;
}
