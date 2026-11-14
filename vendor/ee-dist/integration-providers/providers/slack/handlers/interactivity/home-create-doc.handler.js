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
var HomeCreateDocHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeCreateDocHandler = void 0;
const common_1 = require("@nestjs/common");
const slack_identity_resolver_1 = require("../../identity/slack-identity.resolver");
const create_document_blocks_1 = require("../../blocks/create-document.blocks");
let HomeCreateDocHandler = HomeCreateDocHandler_1 = class HomeCreateDocHandler {
    constructor(identity) {
        this.identity = identity;
        this.type = 'block_actions:home_create_doc';
        this.logger = new common_1.Logger(HomeCreateDocHandler_1.name);
    }
    async handle(payload, ctx) {
        if (!payload.trigger_id)
            return;
        const resolved = await this.identity.resolveSlackUser(payload.team.id, payload.user.id);
        if (!resolved) {
            this.logger.debug(`Unlinked user ${payload.user.id} clicked home_create_doc; ignoring`);
            return;
        }
        await ctx.apiClient.viewsOpen({
            trigger_id: payload.trigger_id,
            view: (0, create_document_blocks_1.buildCreateDocumentView)(),
        });
    }
};
exports.HomeCreateDocHandler = HomeCreateDocHandler;
exports.HomeCreateDocHandler = HomeCreateDocHandler = HomeCreateDocHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [slack_identity_resolver_1.SlackIdentityResolver])
], HomeCreateDocHandler);
//# sourceMappingURL=home-create-doc.handler.js.map