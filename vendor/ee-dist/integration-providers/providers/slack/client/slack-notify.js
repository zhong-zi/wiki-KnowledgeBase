"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notifySlackUser = notifySlackUser;
const common_1 = require("@nestjs/common");
const log = new common_1.Logger('SlackNotify');
async function notifySlackUser(ctx, opts) {
    if (opts.channelId) {
        try {
            await ctx.apiClient.chatPostEphemeral({
                channel: opts.channelId,
                user: opts.slackUserId,
                text: opts.text,
                blocks: opts.blocks,
            });
            return;
        }
        catch (err) {
            log.debug(`Ephemeral to ${opts.channelId}/${opts.slackUserId} failed (${err.message}); falling back to DM`);
        }
    }
    try {
        const dm = await ctx.apiClient.conversationsOpen({ users: opts.slackUserId });
        if ('channel' in dm) {
            await ctx.apiClient.chatPostMessage({
                channel: dm.channel.id,
                text: opts.text,
                blocks: opts.blocks,
            });
        }
    }
    catch (err) {
        log.warn(`Failed to notify Slack user ${opts.slackUserId}: ${err.message}`);
    }
}
//# sourceMappingURL=slack-notify.js.map