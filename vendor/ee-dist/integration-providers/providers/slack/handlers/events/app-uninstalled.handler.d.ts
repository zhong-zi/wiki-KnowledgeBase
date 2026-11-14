import { SlackHandler, SlackHandlerContext } from '../slack-handler.interface';
import { SlackEventEnvelope } from '../../webhook/slack-event.dispatcher';
import { IntegrationRepo } from '../../../../../../core/integration/repos/integration.repo';
import { IntegrationConnectionRepo } from '../../../../../../core/integration/repos/integration-connection.repo';
type AppUninstalledEvent = SlackEventEnvelope & {
    event: {
        type: 'app_uninstalled';
    };
};
export declare class AppUninstalledHandler implements SlackHandler<AppUninstalledEvent> {
    private readonly integrationRepo;
    private readonly connectionRepo;
    readonly type = "app_uninstalled";
    private readonly logger;
    constructor(integrationRepo: IntegrationRepo, connectionRepo: IntegrationConnectionRepo);
    handle(envelope: AppUninstalledEvent, ctx: SlackHandlerContext): Promise<void>;
}
export {};
