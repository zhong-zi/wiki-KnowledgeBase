import { SlackHandler, SlackHandlerContext } from '../slack-handler.interface';
import { SlackInteractivityPayload } from '../../webhook/slack-interactivity.dispatcher';
import { SlackIdentityResolver } from '../../identity/slack-identity.resolver';
import { PageRepo } from "../../../../../../database/repos/page/page.repo";
import { UserRepo } from "../../../../../../database/repos/user/user.repo";
import { PageAccessService } from '../../../../../../core/page/page-access/page-access.service';
import { SlackPageWriter } from '../../content/slack-page-writer.service';
import { ModalContentStash } from '../../content/modal-content-stash.service';
export declare class PagePickerSubmitHandler implements SlackHandler<SlackInteractivityPayload> {
    private readonly identity;
    private readonly pageRepo;
    private readonly userRepo;
    private readonly pageAccess;
    private readonly writer;
    private readonly stash;
    readonly type = "view_submission:add_message_submit";
    private readonly logger;
    constructor(identity: SlackIdentityResolver, pageRepo: PageRepo, userRepo: UserRepo, pageAccess: PageAccessService, writer: SlackPageWriter, stash: ModalContentStash);
    handle(payload: SlackInteractivityPayload, ctx: SlackHandlerContext): Promise<void>;
}
