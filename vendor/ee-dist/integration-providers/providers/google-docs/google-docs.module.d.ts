import { OnModuleInit } from '@nestjs/common';
import { GoogleDocsProvider } from './google-docs.provider';
import { IntegrationRegistry } from '../../../../core/integration/registry/integration-registry';
export declare class GoogleDocsModule implements OnModuleInit {
    private readonly registry;
    private readonly googleDocsProvider;
    constructor(registry: IntegrationRegistry, googleDocsProvider: GoogleDocsProvider);
    onModuleInit(): void;
}
