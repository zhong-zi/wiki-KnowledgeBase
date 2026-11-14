export declare class OAuthMetadataService {
    buildAuthorizationServerMetadata(issuerOrigin: string): {
        issuer: string;
        authorization_endpoint: string;
        token_endpoint: string;
        registration_endpoint: string;
        revocation_endpoint: string;
        grant_types_supported: string[];
        response_types_supported: string[];
        code_challenge_methods_supported: string[];
        token_endpoint_auth_methods_supported: string[];
        authorization_response_iss_parameter_supported: boolean;
        scopes_supported: ("read" | "write")[];
    };
    buildProtectedResourceMetadata(issuerOrigin: string, resourcePath?: string): {
        resource: string;
        authorization_servers: string[];
        bearer_methods_supported: string[];
        scopes_supported: ("read" | "write")[];
    };
}
