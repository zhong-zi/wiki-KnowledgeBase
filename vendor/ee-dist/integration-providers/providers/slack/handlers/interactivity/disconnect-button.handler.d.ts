import { SlackHandler, SlackHandlerContext } from '../slack-handler.interface';
import { SlackInteractivityPayload } from '../../webhook/slack-interactivity.dispatcher';
import { SlackIdentityResolver } from '../../identity/slack-identity.resolver';
import { IntegrationConnectionRepo } from '../../../../../../core/integration/repos/integration-connection.repo';
export declare class DisconnectButtonHandler implements SlackHandler<SlackInteractivityPayload> {
    private readonly identity;
    private readonly connectionRepo;
    readonly type = "block_actions:disconnect_docmost";
    private readonly logger;
    constructor(identity: SlackIdentityResolver, connectionRepo: IntegrationConnectionRepo);
    handle(payload: SlackInteractivityPayload, ctx: SlackHandlerContext): Promise<void>;
}
