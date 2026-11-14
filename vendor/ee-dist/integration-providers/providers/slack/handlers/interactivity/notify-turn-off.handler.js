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
var NotifyTurnOffHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotifyTurnOffHandler = void 0;
const common_1 = require("@nestjs/common");
const slack_identity_resolver_1 = require("../../identity/slack-identity.resolver");
const slack_notify_prefs_service_1 = require("../../notifications/slack-notify-prefs.service");
let NotifyTurnOffHandler = NotifyTurnOffHandler_1 = class NotifyTurnOffHandler {
    constructor(identity, prefs) {
        this.identity = identity;
        this.prefs = prefs;
        this.type = 'block_actions:notify_turn_off';
        this.logger = new common_1.Logger(NotifyTurnOffHandler_1.name);
    }
    async handle(payload, ctx) {
        const resolved = await this.identity.resolveSlackUser(payload.team.id, payload.user.id);
        if (resolved) {
            await this.prefs.setEnabled(ctx.integration.id, resolved.user.id, false);
            this.logger.log(`Slack notifications turned off for user ${resolved.user.id}`);
        }
        await ctx.respond({
            response_type: 'ephemeral',
            replace_original: !!payload.container?.is_ephemeral,
            text: 'Notifications turned off. Run `/docmost notify` to turn them back on.',
        });
    }
};
exports.NotifyTurnOffHandler = NotifyTurnOffHandler;
exports.NotifyTurnOffHandler = NotifyTurnOffHandler = NotifyTurnOffHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [slack_identity_resolver_1.SlackIdentityResolver,
        slack_notify_prefs_service_1.SlackNotifyPrefsService])
], NotifyTurnOffHandler);
//# sourceMappingURL=notify-turn-off.handler.js.map