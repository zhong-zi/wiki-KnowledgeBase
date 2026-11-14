import { SlackHandler, SlackHandlerContext } from '../slack-handler.interface';
import { SlackSlashCommandPayload } from '../../webhook/slack-command.dispatcher';
import { SlackIdentityResolver } from '../../identity/slack-identity.resolver';
import { SearchService } from '../../../../../../core/search/search.service';
export declare class SearchCommand implements SlackHandler<SlackSlashCommandPayload> {
    private readonly identity;
    private readonly search;
    readonly type = "search";
    constructor(identity: SlackIdentityResolver, search: SearchService);
    handle(payload: SlackSlashCommandPayload, ctx: SlackHandlerContext): Promise<void>;
}
