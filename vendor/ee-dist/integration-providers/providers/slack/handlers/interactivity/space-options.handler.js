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
exports.SpaceOptionsHandler = void 0;
const common_1 = require("@nestjs/common");
const slack_identity_resolver_1 = require("../../identity/slack-identity.resolver");
const space_member_repo_1 = require("../../../../../../database/repos/space/space-member.repo");
const pagination_options_1 = require("../../../../../../database/pagination/pagination-options");
let SpaceOptionsHandler = class SpaceOptionsHandler {
    constructor(identity, spaceMemberRepo) {
        this.identity = identity;
        this.spaceMemberRepo = spaceMemberRepo;
        this.type = 'block_suggestion:space_id';
    }
    async handle(payload, ctx) {
        const resolved = await this.identity.resolveSlackUser(payload.team.id, payload.user.id);
        if (!resolved) {
            ctx.__options = { options: [] };
            return;
        }
        const pagination = new pagination_options_1.PaginationOptions();
        pagination.query = (payload.value ?? '').trim();
        pagination.limit = 20;
        const result = await this.spaceMemberRepo.getUserSpaces(resolved.user.id, pagination);
        const spaces = result.items.filter((s) => s.workspaceId === ctx.workspace.id);
        ctx.__options = {
            options: spaces.map((s) => ({
                text: { type: 'plain_text', text: s.name.slice(0, 75) },
                value: s.id,
            })),
        };
    }
};
exports.SpaceOptionsHandler = SpaceOptionsHandler;
exports.SpaceOptionsHandler = SpaceOptionsHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [slack_identity_resolver_1.SlackIdentityResolver,
        space_member_repo_1.SpaceMemberRepo])
], SpaceOptionsHandler);
//# sourceMappingURL=space-options.handler.js.map