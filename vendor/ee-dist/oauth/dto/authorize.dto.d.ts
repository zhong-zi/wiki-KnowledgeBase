export declare class AuthorizeParamsDto {
    response_type: string;
    client_id: string;
    redirect_uri: string;
    state?: string;
    code_challenge: string;
    code_challenge_method?: string;
    scope?: string;
    resource?: string;
}
export declare class ApproveAuthorizationDto extends AuthorizeParamsDto {
    approved: boolean;
    approvedScopes?: string[];
}
