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
var SlackCommandDispatcher_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackCommandDispatcher = exports.SLACK_COMMAND_HANDLERS = void 0;
const common_1 = require("@nestjs/common");
const slack_handler_interface_1 = require("../handlers/slack-handler.interface");
const slack_utils_1 = require("../slack.utils");
exports.SLACK_COMMAND_HANDLERS = 'SLACK_COMMAND_HANDLERS';
let SlackCommandDispatcher = SlackCommandDispatcher_1 = class SlackCommandDispatcher {
    constructor(registered = []) {
        this.registered = registered;
        this.logger = new common_1.Logger(SlackCommandDispatcher_1.name);
        this.handlers = new Map();
        this.fallback = null;
    }
    onModuleInit() {
        for (const h of this.registered) {
            this.handlers.set(h.type, h);
            if (h.type === 'help')
                this.fallback = h;
        }
    }
    register(handler) {
        this.handlers.set(handler.type, handler);
        if (handler.type === 'help')
            this.fallback = handler;
    }
    async dispatch(payload, ctx) {
        const sub = (0, slack_utils_1.parseSubcommand)(payload.text);
        const handler = this.handlers.get(sub) ?? this.fallback;
        if (!handler) {
            await ctx.respond((0, slack_handler_interface_1.ephemeral)(`Unknown subcommand: ${sub}`));
            return;
        }
        await handler.handle(payload, ctx);
    }
};
exports.SlackCommandDispatcher = SlackCommandDispatcher;
exports.SlackCommandDispatcher = SlackCommandDispatcher = SlackCommandDispatcher_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, common_1.Inject)(exports.SLACK_COMMAND_HANDLERS)),
    __metadata("design:paramtypes", [Array])
], SlackCommandDispatcher);
//# sourceMappingURL=slack-command.dispatcher.js.map