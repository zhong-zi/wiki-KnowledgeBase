import { ExtraAccessTokenFieldArgs, ExtraAccessTokenFields, JwtService } from '@jmondi/oauth2-server';
export declare class OAuthJwtService extends JwtService {
    private readonly workspaceId;
    private readonly issuerOrigin;
    constructor(secret: string, workspaceId: string, issuerOrigin: string);
    extraTokenFields({ user }: ExtraAccessTokenFieldArgs): ExtraAccessTokenFields;
}
