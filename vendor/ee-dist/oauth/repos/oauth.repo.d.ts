import { KyselyDB } from "../../../database/types/kysely.types";
import { OAuthClient, InsertableOAuthClient, OAuthGrant, OAuthAuthorizationCode, OAuthToken } from "../../../database/types/entity.types";
export declare class OAuthRepo {
    private readonly db;
    constructor(db: KyselyDB);
    findClientById(clientId: string, workspaceId: string): Promise<OAuthClient | undefined>;
    insertClient(client: InsertableOAuthClient): Promise<OAuthClient>;
    countActiveDynamicClients(workspaceId: string): Promise<number>;
    insertAuthCode(row: {
        codeHash: string;
        clientId: string;
        userId: string;
        workspaceId: string;
        scopes: string[];
        redirectUri: string;
        codeChallenge: string | null;
        codeChallengeMethod: string | null;
        expiresAt: Date;
    }): Promise<void>;
    findAuthCodeByHash(codeHash: string, workspaceId: string): Promise<OAuthAuthorizationCode | undefined>;
    consumeAuthCode(codeHash: string, workspaceId: string): Promise<OAuthAuthorizationCode | undefined>;
    upsertGrant(row: {
        userId: string;
        clientId: string;
        workspaceId: string;
        scopes: string[];
    }): Promise<OAuthGrant>;
    findGrantById(grantId: string, workspaceId: string): Promise<OAuthGrant | undefined>;
    findGrantByUserClient(userId: string, clientId: string, workspaceId: string): Promise<OAuthGrant | undefined>;
    listGrantsByUser(userId: string, workspaceId: string): Promise<(OAuthGrant & {
        clientName: string;
        clientRedirectUris: unknown;
    })[]>;
    revokeGrant(grantId: string, workspaceId: string): Promise<void>;
    revokeAllGrantsForUser(userId: string, workspaceId: string): Promise<number>;
    insertToken(row: {
        grantId: string;
        workspaceId: string;
        accessTokenJti: string;
        refreshTokenHash: string | null;
        scopes: string[];
        accessExpiresAt: Date;
        refreshExpiresAt: Date | null;
    }): Promise<OAuthToken>;
    setTokenRefresh(tokenId: string, workspaceId: string, refreshTokenHash: string, refreshExpiresAt: Date): Promise<void>;
    findTokenByRefreshHash(refreshTokenHash: string, workspaceId: string): Promise<OAuthToken | undefined>;
    findTokenByJti(jti: string, workspaceId: string): Promise<OAuthToken | undefined>;
    revokeToken(tokenId: string, workspaceId: string): Promise<void>;
    revokeTokenIfActive(tokenId: string, workspaceId: string): Promise<boolean>;
    revokeTokensForGrant(grantId: string, workspaceId: string): Promise<void>;
    touchGrantLastUsed(grantId: string): Promise<void>;
    deleteExpiredRows(): Promise<void>;
}
