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
var OAuthPasswordResetListener_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthPasswordResetListener = exports.UserPasswordResetEvent = void 0;
const common_1 = require("@nestjs/common");
const event_emitter_1 = require("@nestjs/event-emitter");
const event_contants_1 = require("../../../common/events/event.contants");
const oauth_repo_1 = require("../repos/oauth.repo");
class UserPasswordResetEvent {
}
exports.UserPasswordResetEvent = UserPasswordResetEvent;
let OAuthPasswordResetListener = OAuthPasswordResetListener_1 = class OAuthPasswordResetListener {
    constructor(oauthRepo) {
        this.oauthRepo = oauthRepo;
        this.logger = new common_1.Logger(OAuthPasswordResetListener_1.name);
    }
    async handlePasswordReset(event) {
        const revoked = await this.oauthRepo.revokeAllGrantsForUser(event.userId, event.workspaceId);
        if (revoked > 0) {
            this.logger.debug(`revoked ${revoked} oauth grant(s) for user ${event.userId} after password reset`);
        }
    }
};
exports.OAuthPasswordResetListener = OAuthPasswordResetListener;
__decorate([
    (0, event_emitter_1.OnEvent)(event_contants_1.EventName.USER_PASSWORD_RESET),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [UserPasswordResetEvent]),
    __metadata("design:returntype", Promise)
], OAuthPasswordResetListener.prototype, "handlePasswordReset", null);
exports.OAuthPasswordResetListener = OAuthPasswordResetListener = OAuthPasswordResetListener_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [oauth_repo_1.OAuthRepo])
], OAuthPasswordResetListener);
//# sourceMappingURL=oauth-password-reset.listener.js.map