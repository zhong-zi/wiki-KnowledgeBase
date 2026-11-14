import { SlackHandler, SlackHandlerContext } from '../slack-handler.interface';
import { SlackSlashCommandPayload } from '../../webhook/slack-command.dispatcher';
import { SlackIdentityResolver } from '../../identity/slack-identity.resolver';
import { PageService } from '../../../../../../core/page/services/page.service';
export declare class RecentCommand implements SlackHandler<SlackSlashCommandPayload> {
    private readonly identity;
    private readonly pageService;
    readonly type = "recent";
    constructor(identity: SlackIdentityResolver, pageService: PageService);
    handle(payload: SlackSlashCommandPayload, ctx: SlackHandlerContext): Promise<void>;
}
