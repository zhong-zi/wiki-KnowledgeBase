import { OnModuleInit } from '@nestjs/common';
import { GitLabProvider } from './gitlab.provider';
import { IntegrationRegistry } from '../../../../core/integration/registry/integration-registry';
export declare class GitLabModule implements OnModuleInit {
    private readonly registry;
    private readonly gitlabProvider;
    constructor(registry: IntegrationRegistry, gitlabProvider: GitLabProvider);
    onModuleInit(): void;
}
