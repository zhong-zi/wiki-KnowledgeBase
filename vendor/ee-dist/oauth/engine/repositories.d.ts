import { GrantIdentifier, OAuthAuthCode as JmondiAuthCode, OAuthAuthCodeRepository, OAuthClient as JmondiClient, OAuthClientRepository, OAuthScope as JmondiScope, OAuthScopeRepository, OAuthTokenRepository, OAuthUser as JmondiUser, OAuthUserIdentifier, OAuthUserRepository } from '@jmondi/oauth2-server';
import { OAuthRepo } from '../repos/oauth.repo';
import { WorkspaceOAuthClient, WorkspaceOAuthToken } from './oauth-entities';
export declare class WorkspaceClientRepository implements OAuthClientRepository {
    private readonly oauthRepo;
    private readonly workspaceId;
    constructor(oauthRepo: OAuthRepo, workspaceId: string);
    getByIdentifier(clientId: string): Promise<WorkspaceOAuthClient>;
    isClientValid(grantType: GrantIdentifier, client: WorkspaceOAuthClient, clientSecret?: string): Promise<boolean>;
}
export declare class WorkspaceAuthCodeRepository implements OAuthAuthCodeRepository {
    private readonly oauthRepo;
    private readonly workspaceId;
    private readonly consumedByThisRequest;
    constructor(oauthRepo: OAuthRepo, workspaceId: string);
    getByIdentifier(wireCode: string): Promise<JmondiAuthCode>;
    private cascadeOnReplay;
    issueAuthCode(client: JmondiClient, user: JmondiUser | undefined, scopes: JmondiScope[]): JmondiAuthCode;
    persist(authCode: JmondiAuthCode): Promise<void>;
    isRevoked(wireCode: string): Promise<boolean>;
    revoke(wireCode: string): Promise<void>;
}
export declare class WorkspaceTokenRepository implements OAuthTokenRepository {
    private readonly oauthRepo;
    private readonly workspaceId;
    constructor(oauthRepo: OAuthRepo, workspaceId: string);
    issueToken(client: JmondiClient, scopes: JmondiScope[], user?: JmondiUser | null): Promise<WorkspaceOAuthToken>;
    persist(token: WorkspaceOAuthToken): Promise<void>;
    issueRefreshToken(token: WorkspaceOAuthToken, _client: JmondiClient): Promise<WorkspaceOAuthToken>;
    revoke(token: WorkspaceOAuthToken): Promise<void>;
    revokeDescendantsOf(wireCode: string): Promise<void>;
    isRefreshTokenRevoked(token: WorkspaceOAuthToken): Promise<boolean>;
    getByRefreshToken(wireRefreshToken: string): Promise<WorkspaceOAuthToken>;
}
export declare class WorkspaceScopeRepository implements OAuthScopeRepository {
    getAllByIdentifiers(scopeNames: string[]): Promise<JmondiScope[]>;
    finalize(scopes: JmondiScope[], _identifier?: GrantIdentifier, _client?: JmondiClient, _userId?: OAuthUserIdentifier): Promise<JmondiScope[]>;
}
export declare class WorkspaceUserRepository implements OAuthUserRepository {
    private readonly oauthRepo;
    private readonly workspaceId;
    constructor(oauthRepo: OAuthRepo, workspaceId: string);
    getUserByCredentials(identifier: OAuthUserIdentifier, password?: string, _grantType?: GrantIdentifier, client?: JmondiClient): Promise<JmondiUser | undefined>;
}
