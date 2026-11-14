import { SlackHandler, SlackHandlerContext } from '../slack-handler.interface';
import { SlackInteractivityPayload } from '../../webhook/slack-interactivity.dispatcher';
import { SlackIdentityResolver } from '../../identity/slack-identity.resolver';
import { CommentRepo } from "../../../../../../database/repos/comment/comment.repo";
import { PageRepo } from "../../../../../../database/repos/page/page.repo";
import { UserRepo } from "../../../../../../database/repos/user/user.repo";
import { PageAccessService } from '../../../../../../core/page/page-access/page-access.service';
import { CommentService } from '../../../../../../core/comment/comment.service';
import { IAuditService } from '../../../../../../integrations/audit/audit.service';
export declare class NotifyCommentReplySubmitHandler implements SlackHandler<SlackInteractivityPayload> {
    private readonly identity;
    private readonly commentRepo;
    private readonly pageRepo;
    private readonly pageAccess;
    private readonly userRepo;
    private readonly commentService;
    private readonly auditService;
    readonly type = "view_submission:notify_comment_reply_submit";
    private readonly logger;
    constructor(identity: SlackIdentityResolver, commentRepo: CommentRepo, pageRepo: PageRepo, pageAccess: PageAccessService, userRepo: UserRepo, commentService: CommentService, auditService: IAuditService);
    handle(payload: SlackInteractivityPayload, ctx: SlackHandlerContext): Promise<void>;
}
