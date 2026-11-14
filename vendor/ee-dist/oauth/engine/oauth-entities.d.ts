import { OAuthAuthCode as JmondiAuthCode, OAuthClient as JmondiClient, OAuthScope as JmondiScope, OAuthToken as JmondiToken } from '@jmondi/oauth2-server';
import { OAuthAuthorizationCode, OAuthClient, OAuthGrant, OAuthToken } from "../../../database/types/entity.types";
export type WorkspaceOAuthToken = JmondiToken & {
    rowId?: string;
};
export type WorkspaceOAuthClient = JmondiClient & {
    tokenEndpointAuthMethod: string;
    workspaceId: string;
};
export declare function sha256hex(value: string): string;
export declare function randomTokenString(): string;
export declare function toScopeEntities(scopes: unknown): JmondiScope[];
export declare function clientRef(id: string): JmondiClient;
export declare function toJmondiClient(row: OAuthClient): WorkspaceOAuthClient;
export declare function toJmondiAuthCode(row: OAuthAuthorizationCode, wireCode: string): JmondiAuthCode;
export declare function toJmondiToken(row: OAuthToken, grant: OAuthGrant, wireRefreshToken: string): WorkspaceOAuthToken;
