import { LinkDescription, UnfurlPattern } from '../../../../core/integration/registry/integration-provider.interface';
export declare const AZURE_DEVOPS_UNFURL_PATTERNS: UnfurlPattern[];
export declare function describeAzureDevOpsLink(patternType: string, match: RegExpMatchArray): LinkDescription | null;
