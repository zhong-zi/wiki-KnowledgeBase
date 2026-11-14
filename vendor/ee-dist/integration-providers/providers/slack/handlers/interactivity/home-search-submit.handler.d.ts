import { SlackHandler, SlackHandlerContext } from '../slack-handler.interface';
import { SlackInteractivityPayload } from '../../webhook/slack-interactivity.dispatcher';
import { SlackIdentityResolver } from '../../identity/slack-identity.resolver';
import { PageRepo } from "../../../../../../database/repos/page/page.repo";
import { UserRepo } from "../../../../../../database/repos/user/user.repo";
import { PageAccessService } from '../../../../../../core/page/page-access/page-access.service';
export declare class HomeSearchSubmitHandler implements SlackHandler<SlackInteractivityPayload> {
    private readonly identity;
    private readonly pageRepo;
    private readonly userRepo;
    private readonly pageAccess;
    readonly type = "view_submission:home_search_submit";
    private readonly logger;
    constructor(identity: SlackIdentityResolver, pageRepo: PageRepo, userRepo: UserRepo, pageAccess: PageAccessService);
    handle(payload: SlackInteractivityPayload, ctx: SlackHandlerContext): Promise<void>;
}
