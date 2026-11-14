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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackController = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const public_decorator_1 = require("../../../../../common/decorators/public.decorator");
const skip_transform_decorator_1 = require("../../../../../common/decorators/skip-transform.decorator");
const slack_signature_guard_1 = require("../client/slack-signature.guard");
const slack_event_dispatcher_1 = require("./slack-event.dispatcher");
const slack_command_dispatcher_1 = require("./slack-command.dispatcher");
const slack_interactivity_dispatcher_1 = require("./slack-interactivity.dispatcher");
const slack_handler_context_builder_1 = require("../handlers/slack-handler-context.builder");
const constants_1 = require("../../../../../integrations/queue/constants");
const slack_handler_interface_1 = require("../handlers/slack-handler.interface");
let SlackController = class SlackController {
    constructor(events, commands, interactivity, contextBuilder, slackQueue) {
        this.events = events;
        this.commands = commands;
        this.interactivity = interactivity;
        this.contextBuilder = contextBuilder;
        this.slackQueue = slackQueue;
    }
    async eventsEndpoint(body, req) {
        if (body?.type === 'url_verification') {
            return { challenge: body.challenge };
        }
        const rawBody = (req.rawBody ?? Buffer.from(JSON.stringify(body))).toString('utf8');
        await this.slackQueue.add(constants_1.QueueJob.SLACK_EVENT, { envelope: body, rawBody });
        return { ok: true };
    }
    async commandsEndpoint(body, req) {
        const rawBody = (req.rawBody ?? Buffer.from('')).toString('utf8');
        const ctx = await this.contextBuilder.fromTeamId(body.team_id, rawBody, body.response_url);
        if (!ctx)
            return (0, slack_handler_interface_1.ephemeral)('This Slack workspace is not connected to Docmost.');
        setImmediate(() => this.commands.dispatch(body, ctx).catch((e) => console.error('slack command dispatch failed', e)));
        return '';
    }
    async interactivityEndpoint(body, req) {
        const payload = JSON.parse(body.payload);
        const rawBody = (req.rawBody ?? Buffer.from('')).toString('utf8');
        const ctx = await this.contextBuilder.fromTeamId(payload.team?.id, rawBody, payload.response_url);
        if (!ctx)
            return (0, slack_handler_interface_1.ephemeral)('Not connected.');
        if (payload.type === 'block_suggestion') {
            await this.interactivity.dispatch(payload, ctx);
            return ctx.__options ?? { options: [] };
        }
        setImmediate(() => this.interactivity.dispatch(payload, ctx).catch((e) => console.error('slack interactivity dispatch failed', e)));
        return '';
    }
};
exports.SlackController = SlackController;
__decorate([
    (0, public_decorator_1.Public)(),
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Post)('events'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SlackController.prototype, "eventsEndpoint", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Post)('commands'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SlackController.prototype, "commandsEndpoint", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, skip_transform_decorator_1.SkipTransform)(),
    (0, common_1.Post)('interactivity'),
    (0, common_1.HttpCode)(200),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SlackController.prototype, "interactivityEndpoint", null);
exports.SlackController = SlackController = __decorate([
    (0, common_1.Controller)('integrations/slack'),
    (0, common_1.UseGuards)(slack_signature_guard_1.SlackSignatureGuard),
    __param(4, (0, bullmq_1.InjectQueue)(constants_1.QueueName.SLACK_INBOUND)),
    __metadata("design:paramtypes", [slack_event_dispatcher_1.SlackEventDispatcher,
        slack_command_dispatcher_1.SlackCommandDispatcher,
        slack_interactivity_dispatcher_1.SlackInteractivityDispatcher,
        slack_handler_context_builder_1.SlackHandlerContextBuilder,
        bullmq_2.Queue])
], SlackController);
//# sourceMappingURL=slack.controller.js.map