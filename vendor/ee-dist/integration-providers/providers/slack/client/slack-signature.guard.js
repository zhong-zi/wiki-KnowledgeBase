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
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackSignatureGuard = void 0;
const common_1 = require("@nestjs/common");
const crypto_1 = require("crypto");
const environment_service_1 = require("../../../../../integrations/environment/environment.service");
const MAX_TIMESTAMP_DRIFT_SECONDS = 5 * 60;
let SlackSignatureGuard = class SlackSignatureGuard {
    constructor(environmentService) {
        this.environmentService = environmentService;
    }
    async canActivate(context) {
        const signingSecret = this.environmentService.getSlackSigningSecret();
        if (!signingSecret) {
            throw new common_1.UnauthorizedException('Slack signing secret not configured');
        }
        const req = context.switchToHttp().getRequest();
        const signature = req.headers['x-slack-signature'];
        const timestamp = req.headers['x-slack-request-timestamp'];
        const rawBody = req.rawBody;
        if (!signature || !timestamp || !rawBody) {
            throw new common_1.UnauthorizedException('Slack signature headers missing');
        }
        const ts = Number(timestamp);
        if (!Number.isFinite(ts)) {
            throw new common_1.UnauthorizedException('Invalid Slack timestamp header');
        }
        const drift = Math.abs(Math.floor(Date.now() / 1000) - ts);
        if (drift > MAX_TIMESTAMP_DRIFT_SECONDS) {
            throw new common_1.UnauthorizedException('Slack timestamp out of valid window');
        }
        const base = `v0:${timestamp}:${rawBody.toString('utf8')}`;
        const expected = 'v0=' + (0, crypto_1.createHmac)('sha256', signingSecret).update(base).digest('hex');
        const sigBuf = Buffer.from(signature);
        const expBuf = Buffer.from(expected);
        if (sigBuf.length !== expBuf.length || !(0, crypto_1.timingSafeEqual)(sigBuf, expBuf)) {
            throw new common_1.UnauthorizedException('Slack invalid signature');
        }
        return true;
    }
};
exports.SlackSignatureGuard = SlackSignatureGuard;
exports.SlackSignatureGuard = SlackSignatureGuard = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [environment_service_1.EnvironmentService])
], SlackSignatureGuard);
//# sourceMappingURL=slack-signature.guard.js.map