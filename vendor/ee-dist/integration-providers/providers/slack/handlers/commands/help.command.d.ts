import { SlackHandler, SlackHandlerContext } from '../slack-handler.interface';
import { SlackSlashCommandPayload } from '../../webhook/slack-command.dispatcher';
import { SlackIdentityResolver } from '../../identity/slack-identity.resolver';
export declare class HelpCommand implements SlackHandler<SlackSlashCommandPayload> {
    private readonly identity;
    readonly type = "help";
    constructor(identity: SlackIdentityResolver);
    handle(payload: SlackSlashCommandPayload, ctx: SlackHandlerContext): Promise<void>;
}
