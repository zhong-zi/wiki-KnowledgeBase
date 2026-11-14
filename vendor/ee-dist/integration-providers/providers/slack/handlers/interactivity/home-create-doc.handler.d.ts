import { SlackHandler, SlackHandlerContext } from '../slack-handler.interface';
import { SlackInteractivityPayload } from '../../webhook/slack-interactivity.dispatcher';
import { SlackIdentityResolver } from '../../identity/slack-identity.resolver';
export declare class HomeCreateDocHandler implements SlackHandler<SlackInteractivityPayload> {
    private readonly identity;
    readonly type = "block_actions:home_create_doc";
    private readonly logger;
    constructor(identity: SlackIdentityResolver);
    handle(payload: SlackInteractivityPayload, ctx: SlackHandlerContext): Promise<void>;
}
