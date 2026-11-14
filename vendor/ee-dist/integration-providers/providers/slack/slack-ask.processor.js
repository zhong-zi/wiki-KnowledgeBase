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
var SlackAskProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackAskProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const constants_1 = require("../../../../integrations/queue/constants");
const ai_search_service_1 = require("../../../ai/services/ai-search.service");
const environment_service_1 = require("../../../../integrations/environment/environment.service");
const markdown_to_mrkdwn_1 = require("./content/markdown-to-mrkdwn");
const ai_answer_blocks_1 = require("./blocks/ai-answer.blocks");
const slack_utils_1 = require("./slack.utils");
let SlackAskProcessor = SlackAskProcessor_1 = class SlackAskProcessor extends bullmq_1.WorkerHost {
    constructor(aiSearch, env) {
        super();
        this.aiSearch = aiSearch;
        this.env = env;
        this.logger = new common_1.Logger(SlackAskProcessor_1.name);
    }
    async process(job) {
        if (job.name !== constants_1.QueueJob.SLACK_ASK)
            return;
        const { question, userId, workspaceId, responseUrl, locale } = job.data;
        try {
            const { stream, sources } = await this.aiSearch.askAiSearch({ query: question }, { userId, workspaceId, locale: locale ?? null });
            let answer = '';
            for await (const chunk of stream) {
                answer += chunk;
            }
            if (!answer.trim()) {
                await (0, slack_utils_1.postToResponseUrl)(responseUrl, {
                    response_type: 'ephemeral',
                    replace_original: true,
                    text: ':mag: No answer was generated. Try rephrasing the question.',
                });
                return;
            }
            const blocks = (0, ai_answer_blocks_1.buildAiAnswerBlocks)({
                question,
                answer: (0, markdown_to_mrkdwn_1.markdownToMrkdwn)(answer),
                sources: sources.map((s) => ({
                    title: s.title ?? '',
                    spaceSlug: s.spaceSlug ?? '',
                    slugId: s.slugId ?? '',
                })),
                appUrl: job.data.appUrl ?? this.env.getAppUrl(),
            });
            await (0, slack_utils_1.postToResponseUrl)(responseUrl, {
                response_type: 'ephemeral',
                replace_original: true,
                blocks,
            });
        }
        catch (err) {
            this.logger.error(`slack ask job failed for workspace=${workspaceId} user=${userId}: ${err.message}`);
            const userMessage = err.message || 'AI search failed.';
            await (0, slack_utils_1.postToResponseUrl)(responseUrl, {
                response_type: 'ephemeral',
                replace_original: true,
                text: `:warning: ${userMessage}`,
            });
        }
    }
};
exports.SlackAskProcessor = SlackAskProcessor;
exports.SlackAskProcessor = SlackAskProcessor = SlackAskProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(constants_1.QueueName.SLACK_ASK),
    __metadata("design:paramtypes", [ai_search_service_1.AiSearchService,
        environment_service_1.EnvironmentService])
], SlackAskProcessor);
//# sourceMappingURL=slack-ask.processor.js.map