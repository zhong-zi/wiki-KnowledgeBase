import { OnModuleInit } from '@nestjs/common';
import { JiraProvider } from './jira.provider';
import { IntegrationRegistry } from '../../../../core/integration/registry/integration-registry';
export declare class JiraModule implements OnModuleInit {
    private readonly registry;
    private readonly jiraProvider;
    constructor(registry: IntegrationRegistry, jiraProvider: JiraProvider);
    onModuleInit(): void;
}
