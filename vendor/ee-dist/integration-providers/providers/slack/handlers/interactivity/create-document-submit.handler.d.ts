import { SlackHandler, SlackHandlerContext } from '../slack-handler.interface';
import { SlackInteractivityPayload } from '../../webhook/slack-interactivity.dispatcher';
import { SlackIdentityResolver } from '../../identity/slack-identity.resolver';
import { PageService } from '../../../../../../core/page/services/page.service';
import { PageAccessService } from '../../../../../../core/page/page-access/page-access.service';
import { UserRepo } from "../../../../../../database/repos/user/user.repo";
import { SpaceRepo } from "../../../../../../database/repos/space/space.repo";
export declare class CreateDocumentSubmitHandler implements SlackHandler<SlackInteractivityPayload> {
    private readonly identity;
    private readonly userRepo;
    private readonly spaceRepo;
    private readonly pageService;
    private readonly pageAccess;
    readonly type = "view_submission:create_document_submit";
    private readonly logger;
    constructor(identity: SlackIdentityResolver, userRepo: UserRepo, spaceRepo: SpaceRepo, pageService: PageService, pageAccess: PageAccessService);
    handle(payload: SlackInteractivityPayload, ctx: SlackHandlerContext): Promise<void>;
}
