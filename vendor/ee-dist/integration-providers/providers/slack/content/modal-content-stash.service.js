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
exports.ModalContentStash = exports.MODAL_CONTENT_TTL_SECONDS = void 0;
const common_1 = require("@nestjs/common");
const nestjs_ioredis_1 = require("@nestjs-labs/nestjs-ioredis");
const crypto_1 = require("crypto");
const slack_utils_1 = require("../slack.utils");
exports.MODAL_CONTENT_TTL_SECONDS = 300;
let ModalContentStash = class ModalContentStash {
    constructor(redisService) {
        this.redisService = redisService;
        this.redis = this.redisService.getOrThrow();
    }
    async put(owner, content) {
        const key = `${(0, slack_utils_1.modalContentKeyPrefix)(owner.integrationId)}${(0, crypto_1.randomUUID)()}`;
        const value = { ...owner, content };
        await this.redis.set(key, JSON.stringify(value), 'EX', exports.MODAL_CONTENT_TTL_SECONDS);
        return key;
    }
    async take(key, owner) {
        if (!key || !key.startsWith((0, slack_utils_1.modalContentKeyPrefix)(owner.integrationId)))
            return null;
        const results = await this.redis.multi().get(key).del(key).exec();
        const raw = results?.[0]?.[1];
        if (typeof raw !== 'string')
            return null;
        let parsed;
        try {
            parsed = JSON.parse(raw);
        }
        catch {
            return null;
        }
        if (parsed?.integrationId !== owner.integrationId ||
            parsed?.slackUserId !== owner.slackUserId) {
            return null;
        }
        return typeof parsed.content === 'string' ? parsed.content : null;
    }
};
exports.ModalContentStash = ModalContentStash;
exports.ModalContentStash = ModalContentStash = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_ioredis_1.RedisService])
], ModalContentStash);
//# sourceMappingURL=modal-content-stash.service.js.map