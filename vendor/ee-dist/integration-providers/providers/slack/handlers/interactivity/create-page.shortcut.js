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
var CreatePageShortcut_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreatePageShortcut = void 0;
const common_1 = require("@nestjs/common");
const slack_handler_interface_1 = require("../slack-handler.interface");
const slack_identity_resolver_1 = require("../../identity/slack-identity.resolver");
const slack_mrkdwn_to_md_1 = require("../../content/slack-mrkdwn-to-md");
const markdown_title_1 = require("../../content/markdown-title");
const modal_content_stash_service_1 = require("../../content/modal-content-stash.service");
const new_page_blocks_1 = require("../../blocks/new-page.blocks");
let CreatePageShortcut = CreatePageShortcut_1 = class CreatePageShortcut {
    constructor(identity, stash) {
        this.identity = identity;
        this.stash = stash;
        this.type = 'message_action:create_page';
        this.logger = new common_1.Logger(CreatePageShortcut_1.name);
    }
    async handle(payload, ctx) {
        const resolved = await this.identity.resolveSlackUser(payload.team.id, payload.user.id);
        if (!resolved) {
            await this.promptAccountLink(ctx, payload.user.id);
            return;
        }
        const message = payload.message;
        if (!message || !payload.trigger_id)
            return;
        const senderName = message.user ? await this.resolveSenderName(ctx, message.user) : undefined;
        const channelName = payload.channel?.name ?? payload.channel?.id ?? '';
        const userResolver = async (id) => (await this.resolveSenderName(ctx, id)) || id;
        const content = await (0, slack_mrkdwn_to_md_1.slackMessagesToMarkdown)([{ text: message.text }], { userResolver });
        try {
            const contentKey = await this.stash.put({ integrationId: ctx.integration.id, slackUserId: payload.user.id }, content);
            const view = (0, new_page_blocks_1.buildNewPageModalView)({
                suggestedTitle: (0, markdown_title_1.markdownToPlainTitle)(content) || 'From Slack',
                contentKey,
                channelId: payload.channel?.id,
                metadata: { sender: senderName, channelName, timestamp: message.ts },
            });
            await ctx.apiClient.viewsOpen({ trigger_id: payload.trigger_id, view });
        }
        catch (err) {
            this.logger.warn(`Could not open the create-page dialog: ${err.message}`);
            await ctx.respond((0, slack_handler_interface_1.ephemeral)(slack_handler_interface_1.DIALOG_OPEN_FAILED_TEXT));
        }
    }
    async resolveSenderName(ctx, slackUserId) {
        try {
            const r = await ctx.apiClient.usersInfo({ user: slackUserId });
            if ('user' in r) {
                return r.user.profile?.display_name || r.user.name;
            }
        }
        catch {
        }
        return undefined;
    }
    async promptAccountLink(ctx, slackUserId) {
        const displayName = (await this.resolveSenderName(ctx, slackUserId)) ?? 'there';
        const blocks = this.identity.buildLinkPrompt({
            slackUserName: `@${displayName}`,
            appUrl: ctx.appUrl,
        });
        await ctx.respond({ response_type: 'ephemeral', blocks });
    }
};
exports.CreatePageShortcut = CreatePageShortcut;
exports.CreatePageShortcut = CreatePageShortcut = CreatePageShortcut_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [slack_identity_resolver_1.SlackIdentityResolver,
        modal_content_stash_service_1.ModalContentStash])
], CreatePageShortcut);
//# sourceMappingURL=create-page.shortcut.js.map