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
var NotifyCommentReplyHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotifyCommentReplyHandler = void 0;
const common_1 = require("@nestjs/common");
const slack_identity_resolver_1 = require("../../identity/slack-identity.resolver");
const comment_reply_blocks_1 = require("../../blocks/comment-reply.blocks");
let NotifyCommentReplyHandler = NotifyCommentReplyHandler_1 = class NotifyCommentReplyHandler {
    constructor(identity) {
        this.identity = identity;
        this.type = 'block_actions:notify_comment_reply';
        this.logger = new common_1.Logger(NotifyCommentReplyHandler_1.name);
    }
    async handle(payload, ctx) {
        const commentId = payload.actions?.[0]?.value;
        if (!payload.trigger_id || !commentId)
            return;
        const resolved = await this.identity.resolveSlackUser(payload.team.id, payload.user.id);
        if (!resolved) {
            this.logger.debug(`Unlinked user ${payload.user.id} clicked notify_comment_reply; ignoring`);
            return;
        }
        await ctx.apiClient.viewsOpen({
            trigger_id: payload.trigger_id,
            view: (0, comment_reply_blocks_1.buildCommentReplyView)(commentId),
        });
    }
};
exports.NotifyCommentReplyHandler = NotifyCommentReplyHandler;
exports.NotifyCommentReplyHandler = NotifyCommentReplyHandler = NotifyCommentReplyHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [slack_identity_resolver_1.SlackIdentityResolver])
], NotifyCommentReplyHandler);
//# sourceMappingURL=notify-comment-reply.handler.js.map