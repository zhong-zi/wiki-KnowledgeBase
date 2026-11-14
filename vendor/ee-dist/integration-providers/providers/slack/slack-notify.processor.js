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
var SlackNotifyProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackNotifyProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const bullmq_2 = require("bullmq");
const constants_1 = require("../../../../integrations/queue/constants");
const page_repo_1 = require("../../../../database/repos/page/page.repo");
const comment_repo_1 = require("../../../../database/repos/comment/comment.repo");
const page_permission_repo_1 = require("../../../../database/repos/page/page-permission.repo");
const user_repo_1 = require("../../../../database/repos/user/user.repo");
const slack_api_client_1 = require("./client/slack-api.client");
const slack_handler_context_builder_1 = require("./handlers/slack-handler-context.builder");
const slack_notify_prefs_service_1 = require("./notifications/slack-notify-prefs.service");
const notification_blocks_1 = require("./blocks/notification.blocks");
const slack_page_link_1 = require("./content/slack-page-link");
const notification_constants_1 = require("../../../../core/notification/notification.constants");
const helpers_1 = require("../../../../common/helpers");
const slack_utils_1 = require("./slack.utils");
const COMMENT_TYPES = new Set([
    notification_constants_1.NotificationType.COMMENT_CREATED,
    notification_constants_1.NotificationType.COMMENT_USER_MENTION,
    notification_constants_1.NotificationType.COMMENT_RESOLVED,
]);
const REPLYABLE_TYPES = new Set([
    notification_constants_1.NotificationType.COMMENT_CREATED,
    notification_constants_1.NotificationType.COMMENT_USER_MENTION,
]);
const PERMANENT_SLACK_ERRORS = new Set([
    'missing_token',
    'invalid_auth',
    'not_authed',
    'account_inactive',
    'token_revoked',
    'missing_scope',
    'user_not_found',
    'users_not_found',
    'cannot_dm_bot',
    'is_bot',
]);
let SlackNotifyProcessor = SlackNotifyProcessor_1 = class SlackNotifyProcessor extends bullmq_1.WorkerHost {
    constructor(contextBuilder, prefs, pageRepo, commentRepo, pagePermissionRepo, userRepo) {
        super();
        this.contextBuilder = contextBuilder;
        this.prefs = prefs;
        this.pageRepo = pageRepo;
        this.commentRepo = commentRepo;
        this.pagePermissionRepo = pagePermissionRepo;
        this.userRepo = userRepo;
        this.logger = new common_1.Logger(SlackNotifyProcessor_1.name);
    }
    async process(job) {
        if (job.name !== constants_1.QueueJob.SLACK_NOTIFICATION)
            return;
        const { workspaceId, userId, type, actorId, pageId, commentId } = job.data;
        if (!pageId || !notification_blocks_1.SLACK_NOTIFY_TYPES.has(type))
            return;
        const link = await this.prefs.getEnabledLink(workspaceId, userId);
        if (!link?.providerUserId)
            return;
        const recipient = await this.userRepo.findById(userId, workspaceId);
        if (!recipient || (0, helpers_1.isUserDisabled)(recipient))
            return;
        const ctx = await this.contextBuilder.fromWorkspaceId(workspaceId);
        if (!ctx)
            return;
        const page = await this.pageRepo.findById(pageId, { includeSpace: true });
        if (!page || page.deletedAt || page.workspaceId !== workspaceId)
            return;
        const accessible = await this.pagePermissionRepo.filterAccessiblePageIds({
            pageIds: [pageId],
            userId,
        });
        if (accessible.length === 0)
            return;
        const actor = actorId
            ? await this.userRepo.findById(actorId, workspaceId)
            : null;
        let commentQuote = null;
        let replyCommentId = null;
        if (COMMENT_TYPES.has(type) && commentId) {
            try {
                const comment = await this.commentRepo.findById(commentId);
                if (comment && !comment.deletedAt && comment.pageId === pageId) {
                    commentQuote = (0, slack_utils_1.extractCommentText)(comment.content);
                    if (REPLYABLE_TYPES.has(type))
                        replyCommentId = comment.id;
                }
            }
            catch (err) {
                this.logger.debug(`Comment lookup for quote failed: ${err.message}`);
            }
        }
        const dm = (0, notification_blocks_1.buildNotificationDm)({
            type,
            actorName: actor?.name ?? 'Someone',
            pageTitle: page.title || '(Untitled)',
            pageUrl: (0, slack_page_link_1.buildPageUrl)(ctx.appUrl, page.space?.slug, page.slugId),
            commentQuote,
            replyCommentId,
        });
        if (!dm)
            return;
        try {
            const opened = await ctx.apiClient.conversationsOpen({
                users: link.providerUserId,
            });
            if (!('channel' in opened))
                return;
            await ctx.apiClient.chatPostMessage({
                channel: opened.channel.id,
                text: dm.text,
                blocks: dm.blocks,
            });
        }
        catch (err) {
            if (err instanceof slack_api_client_1.SlackApiError && PERMANENT_SLACK_ERRORS.has(err.code)) {
                this.logger.warn(`Dropping Slack DM for notification ${job.data.notificationId}: ${err.code}`);
                return;
            }
            throw err;
        }
    }
    onFailed(job) {
        if (job.attemptsMade < (job.opts.attempts ?? 1))
            return;
        this.logger.warn(`Slack notification DM failed: notification=${job.data?.notificationId} workspace=${job.data?.workspaceId} user=${job.data?.userId} reason=${job.failedReason}`);
    }
};
exports.SlackNotifyProcessor = SlackNotifyProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], SlackNotifyProcessor.prototype, "onFailed", null);
exports.SlackNotifyProcessor = SlackNotifyProcessor = SlackNotifyProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(constants_1.QueueName.SLACK_NOTIFY),
    __metadata("design:paramtypes", [slack_handler_context_builder_1.SlackHandlerContextBuilder,
        slack_notify_prefs_service_1.SlackNotifyPrefsService,
        page_repo_1.PageRepo,
        comment_repo_1.CommentRepo,
        page_permission_repo_1.PagePermissionRepo,
        user_repo_1.UserRepo])
], SlackNotifyProcessor);
//# sourceMappingURL=slack-notify.processor.js.map