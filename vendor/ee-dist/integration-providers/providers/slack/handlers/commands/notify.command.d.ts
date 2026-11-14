import { SlackHandler, SlackHandlerContext } from '../slack-handler.interface';
import { SlackSlashCommandPayload } from '../../webhook/slack-command.dispatcher';
import { SlackIdentityResolver } from '../../identity/slack-identity.resolver';
import { SlackNotifyPrefsService } from '../../notifications/slack-notify-prefs.service';
export declare class NotifyCommand implements SlackHandler<SlackSlashCommandPayload> {
    private readonly identity;
    private readonly prefs;
    readonly type = "notify";
    constructor(identity: SlackIdentityResolver, prefs: SlackNotifyPrefsService);
    handle(payload: SlackSlashCommandPayload, ctx: SlackHandlerContext): Promise<void>;
}
