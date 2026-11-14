import { OnModuleInit } from '@nestjs/common';
import { SlackProvider } from './slack.provider';
import { IntegrationRegistry } from '../../../../core/integration/registry/integration-registry';
export declare class SlackModule implements OnModuleInit {
    private readonly registry;
    private readonly slackProvider;
    constructor(registry: IntegrationRegistry, slackProvider: SlackProvider);
    onModuleInit(): void;
}
