import { AuthorizationServer } from '@jmondi/oauth2-server';
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { OAuthRepo } from '../repos/oauth.repo';
export declare class OAuthEngineFactory {
    private readonly oauthRepo;
    private readonly environmentService;
    constructor(oauthRepo: OAuthRepo, environmentService: EnvironmentService);
    build(opts: {
        workspaceId: string;
        issuerOrigin: string;
    }): AuthorizationServer;
}
