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
var AskCommand_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AskCommand = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const slack_handler_interface_1 = require("../slack-handler.interface");
const slack_identity_resolver_1 = require("../../identity/slack-identity.resolver");
const link_prompt_blocks_1 = require("../../blocks/link-prompt.blocks");
const user_repo_1 = require("../../../../../../database/repos/user/user.repo");
const constants_1 = require("../../../../../../integrations/queue/constants");
const slack_utils_1 = require("../../slack.utils");
let AskCommand = AskCommand_1 = class AskCommand {
    constructor(identity, userRepo, askQueue) {
        this.identity = identity;
        this.userRepo = userRepo;
        this.askQueue = askQueue;
        this.type = 'ask';
        this.logger = new common_1.Logger(AskCommand_1.name);
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
        const aiSearchEnabled = ctx.workspace.settings?.ai?.search === true;
        if (!aiSearchEnabled) {
            await ctx.respond((0, slack_handler_interface_1.ephemeral)('Ask AI is not enabled for this workspace. Ask a workspace admin to enable it in Settings → AI.'));
            return;
        }
        const question = payload.text.replace(/^ask\s*/i, '').trim();
        if (!question) {
            await ctx.respond((0, slack_handler_interface_1.ephemeral)('Usage: `/docmost ask <your question>`'));
            return;
        }
        if (!payload.response_url) {
            await ctx.respond((0, slack_handler_interface_1.ephemeral)("Couldn't process the request: no response URL."));
            return;
        }
        await ctx.respond({
            response_type: 'ephemeral',
            text: `:mag: Searching the knowledge base for: _${(0, slack_utils_1.truncate)(question, 200)}_`,
        });
        const docmostUser = await this.userRepo.findById(resolved.user.id, ctx.workspace.id);
        const job = {
            question,
            userId: resolved.user.id,
            workspaceId: ctx.workspace.id,
            responseUrl: payload.response_url,
            locale: docmostUser?.locale ?? null,
            appUrl: ctx.appUrl,
        };
        try {
            await this.askQueue.add(constants_1.QueueJob.SLACK_ASK, job);
        }
        catch (err) {
            this.logger.error(`Failed to enqueue ask job: ${err.message}`);
            await (0, slack_utils_1.postToResponseUrl)(payload.response_url, {
                response_type: 'ephemeral',
                replace_original: true,
                text: ':warning: Could not start the AI search. Please try again.',
            });
        }
    }
};
exports.AskCommand = AskCommand;
exports.AskCommand = AskCommand = AskCommand_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(2, (0, bullmq_1.InjectQueue)(constants_1.QueueName.SLACK_ASK)),
    __metadata("design:paramtypes", [slack_identity_resolver_1.SlackIdentityResolver,
        user_repo_1.UserRepo,
        bullmq_2.Queue])
], AskCommand);
//# sourceMappingURL=ask.command.js.map