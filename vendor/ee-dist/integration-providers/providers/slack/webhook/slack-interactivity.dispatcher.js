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
var SlackInteractivityDispatcher_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackInteractivityDispatcher = exports.SLACK_INTERACTIVITY_HANDLERS = void 0;
const common_1 = require("@nestjs/common");
exports.SLACK_INTERACTIVITY_HANDLERS = 'SLACK_INTERACTIVITY_HANDLERS';
let SlackInteractivityDispatcher = SlackInteractivityDispatcher_1 = class SlackInteractivityDispatcher {
    constructor(registered = []) {
        this.registered = registered;
        this.logger = new common_1.Logger(SlackInteractivityDispatcher_1.name);
        this.handlers = new Map();
    }
    onModuleInit() {
        for (const h of this.registered)
            this.handlers.set(h.type, h);
    }
    register(handler) {
        this.handlers.set(handler.type, handler);
    }
    async dispatch(payload, ctx) {
        const key = this.keyFor(payload);
        const handler = this.handlers.get(key);
        if (!handler) {
            if (payload.type === 'block_actions' && payload.actions?.[0]?.url)
                return;
            this.logger.debug(`No interactivity handler for ${key}`);
            return;
        }
        await handler.handle(payload, ctx);
    }
    keyFor(payload) {
        switch (payload.type) {
            case 'message_action':
                return `message_action:${payload.callback_id}`;
            case 'view_submission':
                return `view_submission:${payload.view?.callback_id}`;
            case 'block_actions':
                return `block_actions:${payload.actions?.[0]?.action_id ?? ''}`;
            case 'view_closed':
                return `view_closed:${payload.view?.callback_id}`;
            case 'block_suggestion':
                return `block_suggestion:${payload.action_id ?? ''}`;
        }
    }
};
exports.SlackInteractivityDispatcher = SlackInteractivityDispatcher;
exports.SlackInteractivityDispatcher = SlackInteractivityDispatcher = SlackInteractivityDispatcher_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, common_1.Inject)(exports.SLACK_INTERACTIVITY_HANDLERS)),
    __metadata("design:paramtypes", [Array])
], SlackInteractivityDispatcher);
//# sourceMappingURL=slack-interactivity.dispatcher.js.map