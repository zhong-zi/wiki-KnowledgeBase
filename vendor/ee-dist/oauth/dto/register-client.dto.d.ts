export declare function registerClientValidationError(response: unknown): {
    error: string;
    error_description: string;
};
export declare class RegisterClientDto {
    client_name?: string;
    redirect_uris: string[];
    client_uri?: string;
    logo_uri?: string;
    scope?: string;
    grant_types?: string[];
    response_types?: string[];
    token_endpoint_auth_method?: string;
}
