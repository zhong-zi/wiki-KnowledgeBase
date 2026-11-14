import { SlackHandler, SlackHandlerContext } from '../slack-handler.interface';
import { SlackInteractivityPayload } from '../../webhook/slack-interactivity.dispatcher';
import { SlackIdentityResolver } from '../../identity/slack-identity.resolver';
import { SearchService } from '../../../../../../core/search/search.service';
export declare class PageSearchOptionsHandler implements SlackHandler<SlackInteractivityPayload> {
    private readonly identity;
    private readonly search;
    readonly type = "block_suggestion:page_id";
    constructor(identity: SlackIdentityResolver, search: SearchService);
    handle(payload: SlackInteractivityPayload, ctx: SlackHandlerContext): Promise<void>;
}
