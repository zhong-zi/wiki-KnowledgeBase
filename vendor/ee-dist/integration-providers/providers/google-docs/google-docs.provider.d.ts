import { IntegrationProvider, IntegrationDefinition, ProviderAccount, ResolveAccountOpts, UnfurlOpts, UnfurlResult } from '../../../../core/integration/registry/integration-provider.interface';
import { GoogleDocsService } from './google-docs.service';
export declare class GoogleDocsProvider extends IntegrationProvider {
    private readonly googleDocsService;
    definition: IntegrationDefinition;
    constructor(googleDocsService: GoogleDocsService);
    resolveAccount(opts: ResolveAccountOpts): Promise<ProviderAccount>;
    unfurl(opts: UnfurlOpts): Promise<UnfurlResult>;
}
