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
var SlackEventDispatcher_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackEventDispatcher = exports.SLACK_EVENT_HANDLERS = void 0;
const common_1 = require("@nestjs/common");
exports.SLACK_EVENT_HANDLERS = 'SLACK_EVENT_HANDLERS';
let SlackEventDispatcher = SlackEventDispatcher_1 = class SlackEventDispatcher {
    constructor(registered = []) {
        this.registered = registered;
        this.logger = new common_1.Logger(SlackEventDispatcher_1.name);
        this.handlers = new Map();
    }
    onModuleInit() {
        for (const h of this.registered)
            this.handlers.set(h.type, h);
    }
    register(handler) {
        this.handlers.set(handler.type, handler);
    }
    async dispatch(envelope, ctx) {
        const handler = this.handlers.get(envelope.event.type);
        if (!handler) {
            this.logger.debug(`No handler for event ${envelope.event.type}`);
            return;
        }
        await handler.handle(envelope, ctx);
    }
};
exports.SlackEventDispatcher = SlackEventDispatcher;
exports.SlackEventDispatcher = SlackEventDispatcher = SlackEventDispatcher_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Optional)()),
    __param(0, (0, common_1.Inject)(exports.SLACK_EVENT_HANDLERS)),
    __metadata("design:paramtypes", [Array])
], SlackEventDispatcher);
//# sourceMappingURL=slack-event.dispatcher.js.map