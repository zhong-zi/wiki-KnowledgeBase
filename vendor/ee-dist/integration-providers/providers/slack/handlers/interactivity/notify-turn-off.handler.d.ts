import { SlackHandler, SlackHandlerContext } from '../slack-handler.interface';
import { SlackInteractivityPayload } from '../../webhook/slack-interactivity.dispatcher';
import { SlackIdentityResolver } from '../../identity/slack-identity.resolver';
import { SlackNotifyPrefsService } from '../../notifications/slack-notify-prefs.service';
export declare class NotifyTurnOffHandler implements SlackHandler<SlackInteractivityPayload> {
    private readonly identity;
    private readonly prefs;
    readonly type = "block_actions:notify_turn_off";
    private readonly logger;
    constructor(identity: SlackIdentityResolver, prefs: SlackNotifyPrefsService);
    handle(payload: SlackInteractivityPayload, ctx: SlackHandlerContext): Promise<void>;
}
