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
var SlackProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackProcessor = void 0;
const bullmq_1 = require("@nestjs/bullmq");
const common_1 = require("@nestjs/common");
const constants_1 = require("../../../../integrations/queue/constants");
const slack_event_dispatcher_1 = require("./webhook/slack-event.dispatcher");
const slack_handler_context_builder_1 = require("./handlers/slack-handler-context.builder");
let SlackProcessor = SlackProcessor_1 = class SlackProcessor extends bullmq_1.WorkerHost {
    constructor(events, contextBuilder) {
        super();
        this.events = events;
        this.contextBuilder = contextBuilder;
        this.logger = new common_1.Logger(SlackProcessor_1.name);
    }
    async process(job) {
        if (job.name === constants_1.QueueJob.SLACK_EVENT) {
            const { envelope, rawBody } = job.data;
            const ctx = await this.contextBuilder.fromTeamId(envelope.team_id, rawBody);
            if (!ctx) {
                this.logger.warn(`No active integration for team ${envelope.team_id}; dropping event`);
                return;
            }
            await this.events.dispatch(envelope, ctx);
        }
    }
};
exports.SlackProcessor = SlackProcessor;
exports.SlackProcessor = SlackProcessor = SlackProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(constants_1.QueueName.SLACK_INBOUND),
    __metadata("design:paramtypes", [slack_event_dispatcher_1.SlackEventDispatcher,
        slack_handler_context_builder_1.SlackHandlerContextBuilder])
], SlackProcessor);
//# sourceMappingURL=slack.processor.js.map