"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var NotifyCommentReplySubmitHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotifyCommentReplySubmitHandler = void 0;
const common_1 = require("@nestjs/common");
const slack_identity_resolver_1 = require("../../identity/slack-identity.resolver");
const comment_repo_1 = require("../../../../../../database/repos/comment/comment.repo");
const page_repo_1 = require("../../../../../../database/repos/page/page.repo");
const user_repo_1 = require("../../../../../../database/repos/user/user.repo");
const page_access_service_1 = require("../../../../../../core/page/page-access/page-access.service");
const comment_service_1 = require("../../../../../../core/comment/comment.service");
const audit_service_1 = require("../../../../../../integrations/audit/audit.service");
const audit_events_1 = require("../../../../../../common/events/audit-events");
const slack_page_link_1 = require("../../content/slack-page-link");
const slack_notify_1 = require("../../client/slack-notify");
const COMMENT_GONE_MESSAGE = 'That comment no longer exists.';
let NotifyCommentReplySubmitHandler = NotifyCommentReplySubmitHandler_1 = class NotifyCommentReplySubmitHandler {
    constructor(identity, commentRepo, pageRepo, pageAccess, userRepo, commentService, auditService) {
        this.identity = identity;
        this.commentRepo = commentRepo;
        this.pageRepo = pageRepo;
        this.pageAccess = pageAccess;
        this.userRepo = userRepo;
        this.commentService = commentService;
        this.auditService = auditService;
        this.type = 'view_submission:notify_comment_reply_submit';
        this.logger = new common_1.Logger(NotifyCommentReplySubmitHandler_1.name);
    }
    async handle(payload, ctx) {
        const resolved = await this.identity.resolveSlackUser(payload.team.id, payload.user.id);
        if (!resolved)
            return;
        let meta;
        try {
            meta = JSON.parse(payload.view?.private_metadata ?? '{}');
        }
        catch {
            return;
        }
        if (typeof meta.commentId !== 'string')
            return;
        const text = (payload.view.state?.values?.reply?.reply_text?.value ?? '').trim();
        if (!text)
            return;
        const comment = await this.commentRepo.findById(meta.commentId);
        if (!comment || comment.deletedAt || comment.workspaceId !== ctx.workspace.id) {
            await (0, slack_notify_1.notifySlackUser)(ctx, { slackUserId: payload.user.id, text: COMMENT_GONE_MESSAGE });
            return;
        }
        if (comment.resolvedAt) {
            await (0, slack_notify_1.notifySlackUser)(ctx, {
                slackUserId: payload.user.id,
                text: 'That comment thread has been resolved.',
            });
            return;
        }
        const page = await this.pageRepo.findById(comment.pageId, { includeSpace: true });
        if (!page || page.deletedAt || page.workspaceId !== ctx.workspace.id) {
            await (0, slack_notify_1.notifySlackUser)(ctx, { slackUserId: payload.user.id, text: COMMENT_GONE_MESSAGE });
            return;
        }
        const user = await this.userRepo.findById(resolved.user.id, ctx.workspace.id);
        if (!user)
            return;
        try {
            await this.pageAccess.validateCanComment(page, user, ctx.workspace.id);
        }
        catch {
            await (0, slack_notify_1.notifySlackUser)(ctx, {
                slackUserId: payload.user.id,
                text: 'You do not have permission to comment on that page.',
            });
            return;
        }
        const parentCommentId = comment.parentCommentId ?? comment.id;
        try {
            const paragraphs = text
                .split(/\n{2,}/)
                .map((para) => para.trim())
                .filter(Boolean)
                .map((para) => ({
                type: 'paragraph',
                content: [{ type: 'text', text: para }],
            }));
            const content = JSON.stringify({ type: 'doc', content: paragraphs });
            const created = await this.commentService.create({ page, workspaceId: ctx.workspace.id, user }, {
                pageId: page.id,
                content,
                parentCommentId,
                type: 'page',
            });
            this.auditService.logWithContext({
                event: audit_events_1.AuditEvent.COMMENT_CREATED,
                resourceType: audit_events_1.AuditResource.COMMENT,
                resourceId: created.id,
                spaceId: page.spaceId,
                metadata: { pageId: page.id, source: 'slack' },
            }, { workspaceId: ctx.workspace.id, actorId: user.id, actorType: 'user' });
        }
        catch (err) {
            this.logger.warn(`Failed to post Slack comment reply: ${err.message}`);
            await (0, slack_notify_1.notifySlackUser)(ctx, {
                slackUserId: payload.user.id,
                text: 'Could not post your reply. Open the page in Docmost to reply.',
            });
            return;
        }
        const title = page.title || '(Untitled)';
        const url = (0, slack_page_link_1.buildPageUrl)(ctx.appUrl, page.space?.slug, page.slugId);
        const link = url ? (0, slack_page_link_1.slackLink)(url, title) : `*${title}*`;
        await (0, slack_notify_1.notifySlackUser)(ctx, {
            slackUserId: payload.user.id,
            text: `:white_check_mark: Reply posted to ${link}`,
        });
    }
};
exports.NotifyCommentReplySubmitHandler = NotifyCommentReplySubmitHandler;
exports.NotifyCommentReplySubmitHandler = NotifyCommentReplySubmitHandler = NotifyCommentReplySubmitHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(6, (0, common_1.Inject)(audit_service_1.AUDIT_SERVICE)),
    __metadata("design:paramtypes", [slack_identity_resolver_1.SlackIdentityResolver,
        comment_repo_1.CommentRepo,
        page_repo_1.PageRepo,
        page_access_service_1.PageAccessService,
        user_repo_1.UserRepo,
        comment_service_1.CommentService, Object])
], NotifyCommentReplySubmitHandler);
//# sourceMappingURL=notify-comment-reply-submit.handler.js.map