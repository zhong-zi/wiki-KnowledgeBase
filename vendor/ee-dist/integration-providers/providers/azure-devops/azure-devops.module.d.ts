import { OnModuleInit } from '@nestjs/common';
import { AzureDevOpsProvider } from './azure-devops.provider';
import { IntegrationRegistry } from '../../../../core/integration/registry/integration-registry';
export declare class AzureDevOpsModule implements OnModuleInit {
    private readonly registry;
    private readonly azureDevOpsProvider;
    constructor(registry: IntegrationRegistry, azureDevOpsProvider: AzureDevOpsProvider);
    onModuleInit(): void;
}
