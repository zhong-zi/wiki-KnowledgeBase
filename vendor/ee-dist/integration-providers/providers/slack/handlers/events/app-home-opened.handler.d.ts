import { SlackHandler, SlackHandlerContext } from '../slack-handler.interface';
import { SlackEventEnvelope } from '../../webhook/slack-event.dispatcher';
import { SlackIdentityResolver } from '../../identity/slack-identity.resolver';
type AppHomeOpenedEvent = SlackEventEnvelope & {
    event: {
        type: 'app_home_opened';
        user: string;
        tab: 'home' | 'messages';
    };
};
export declare class AppHomeOpenedHandler implements SlackHandler<AppHomeOpenedEvent> {
    private readonly identity;
    readonly type = "app_home_opened";
    private readonly logger;
    constructor(identity: SlackIdentityResolver);
    handle(envelope: AppHomeOpenedEvent, ctx: SlackHandlerContext): Promise<void>;
}
export {};
