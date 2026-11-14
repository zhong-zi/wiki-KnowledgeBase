import type { FastifyReply, FastifyRequest } from 'fastify';
import { OAuthEngineFactory } from '../engine/oauth-engine.factory';
import { OAuthRepo } from '../repos/oauth.repo';
import { TokenService } from '../../../core/auth/services/token.service';
export declare class OAuthTokenService {
    private readonly oauthEngineFactory;
    private readonly oauthRepo;
    private readonly tokenService;
    private readonly logger;
    constructor(oauthEngineFactory: OAuthEngineFactory, oauthRepo: OAuthRepo, tokenService: TokenService);
    respondToTokenRequest(req: FastifyRequest, reply: FastifyReply, workspaceId: string, issuerOrigin: string): Promise<void>;
    revokeToken(body: {
        token?: string;
        token_type_hint?: string;
        client_id?: string;
    }, workspaceId: string): Promise<void>;
    private revokeAsRefreshToken;
    private revokeAsAccessToken;
    private revokeIfClientMatches;
}
