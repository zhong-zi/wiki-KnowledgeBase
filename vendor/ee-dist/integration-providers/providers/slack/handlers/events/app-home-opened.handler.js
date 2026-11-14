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
var AppHomeOpenedHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppHomeOpenedHandler = void 0;
const common_1 = require("@nestjs/common");
const slack_identity_resolver_1 = require("../../identity/slack-identity.resolver");
const home_blocks_1 = require("../../blocks/home.blocks");
let AppHomeOpenedHandler = AppHomeOpenedHandler_1 = class AppHomeOpenedHandler {
    constructor(identity) {
        this.identity = identity;
        this.type = 'app_home_opened';
        this.logger = new common_1.Logger(AppHomeOpenedHandler_1.name);
    }
    async handle(envelope, ctx) {
        if (envelope.event.tab !== 'home')
            return;
        const slackUserId = envelope.event.user;
        const slackTeamId = envelope.team_id;
        const resolved = await this.identity.resolveSlackUser(slackTeamId, slackUserId);
        const appUrl = ctx.appUrl;
        const view = resolved
            ? (0, home_blocks_1.buildHomeView)({
                isLinked: true,
                displayName: resolved.user.name,
                appUrl,
            })
            : (0, home_blocks_1.buildHomeView)({ isLinked: false, appUrl });
        try {
            await ctx.apiClient.viewsPublish({ user_id: slackUserId, view });
        }
        catch (err) {
            this.logger.warn(`views.publish failed for ${slackUserId}: ${err.message}`);
        }
    }
};
exports.AppHomeOpenedHandler = AppHomeOpenedHandler;
exports.AppHomeOpenedHandler = AppHomeOpenedHandler = AppHomeOpenedHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [slack_identity_resolver_1.SlackIdentityResolver])
], AppHomeOpenedHandler);
//# sourceMappingURL=app-home-opened.handler.js.map