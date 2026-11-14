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
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotifyCommand = void 0;
const common_1 = require("@nestjs/common");
const slack_handler_interface_1 = require("../slack-handler.interface");
const slack_identity_resolver_1 = require("../../identity/slack-identity.resolver");
const slack_notify_prefs_service_1 = require("../../notifications/slack-notify-prefs.service");
const link_prompt_blocks_1 = require("../../blocks/link-prompt.blocks");
const notification_blocks_1 = require("../../blocks/notification.blocks");
let NotifyCommand = class NotifyCommand {
    constructor(identity, prefs) {
        this.identity = identity;
        this.prefs = prefs;
        this.type = 'notify';
    }
    async handle(payload, ctx) {
        const resolved = await this.identity.resolveSlackUser(payload.team_id, payload.user_id);
        if (!resolved) {
            await ctx.respond({
                response_type: 'ephemeral',
                blocks: (0, link_prompt_blocks_1.buildLinkPromptBlocks)({
                    appUrl: ctx.appUrl,
                    slackUserName: `<@${payload.user_id}>`,
                }),
            });
            return;
        }
        const arg = payload.text.replace(/^notify\s*/i, '').trim().toLowerCase();
        if (arg !== '' && arg !== 'on' && arg !== 'off') {
            await ctx.respond((0, slack_handler_interface_1.ephemeral)('Usage: `/docmost notify [off]`'));
            return;
        }
        const enable = arg !== 'off';
        const saved = await this.prefs.setEnabled(ctx.integration.id, resolved.user.id, enable);
        if (!saved) {
            await ctx.respond((0, slack_handler_interface_1.ephemeral)('Could not find your Slack link. Run `/docmost help` to reconnect.'));
            return;
        }
        if (!enable) {
            await ctx.respond((0, slack_handler_interface_1.ephemeral)('Slack notifications are off. Run `/docmost notify` to turn them back on.'));
            return;
        }
        await ctx.respond({
            response_type: 'ephemeral',
            blocks: (0, notification_blocks_1.buildNotifyOnBlocks)(),
        });
    }
};
exports.NotifyCommand = NotifyCommand;
exports.NotifyCommand = NotifyCommand = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [slack_identity_resolver_1.SlackIdentityResolver,
        slack_notify_prefs_service_1.SlackNotifyPrefsService])
], NotifyCommand);
//# sourceMappingURL=notify.command.js.map