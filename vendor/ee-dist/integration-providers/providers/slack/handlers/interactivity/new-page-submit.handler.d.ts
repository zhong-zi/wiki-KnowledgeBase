import { SlackHandler, SlackHandlerContext } from '../slack-handler.interface';
import { SlackInteractivityPayload } from '../../webhook/slack-interactivity.dispatcher';
import { SlackIdentityResolver } from '../../identity/slack-identity.resolver';
import { PageService } from '../../../../../../core/page/services/page.service';
import { PageAccessService } from '../../../../../../core/page/page-access/page-access.service';
import { UserRepo } from "../../../../../../database/repos/user/user.repo";
import { SpaceRepo } from "../../../../../../database/repos/space/space.repo";
import { ModalContentStash } from '../../content/modal-content-stash.service';
export declare class NewPageSubmitHandler implements SlackHandler<SlackInteractivityPayload> {
    private readonly identity;
    private readonly userRepo;
    private readonly pageService;
    private readonly spaceRepo;
    private readonly pageAccess;
    private readonly stash;
    readonly type = "view_submission:new_page_submit";
    private readonly logger;
    constructor(identity: SlackIdentityResolver, userRepo: UserRepo, pageService: PageService, spaceRepo: SpaceRepo, pageAccess: PageAccessService, stash: ModalContentStash);
    handle(payload: SlackInteractivityPayload, ctx: SlackHandlerContext): Promise<void>;
}
