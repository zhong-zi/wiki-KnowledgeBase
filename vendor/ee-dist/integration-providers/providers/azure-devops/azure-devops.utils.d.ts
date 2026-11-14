import { OAuthConfig } from '../../../../core/integration/registry/integration-provider.interface';
export declare const AZURE_DEVOPS_SCOPES: string[];
export declare const DEFAULT_TENANT = "organizations";
export declare function resolveTenant(): string;
export declare function buildOAuthConfig(tenant?: string): OAuthConfig;
export declare function branchName(ref: string | undefined): string | undefined;
