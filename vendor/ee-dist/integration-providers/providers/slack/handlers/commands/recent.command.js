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
exports.RecentCommand = void 0;
const common_1 = require("@nestjs/common");
const slack_identity_resolver_1 = require("../../identity/slack-identity.resolver");
const page_service_1 = require("../../../../../../core/page/services/page.service");
const pagination_options_1 = require("../../../../../../database/pagination/pagination-options");
const list_blocks_1 = require("../../blocks/list.blocks");
const link_prompt_blocks_1 = require("../../blocks/link-prompt.blocks");
let RecentCommand = class RecentCommand {
    constructor(identity, pageService) {
        this.identity = identity;
        this.pageService = pageService;
        this.type = 'recent';
    }
    async handle(payload, ctx) {
        const resolved = await this.identity.resolveSlackUser(payload.team_id, payload.user_id);
        if (!resolved) {
            await ctx.respond({
                response_type: 'ephemeral',
                blocks: (0, link_prompt_blocks_1.buildLinkPromptBlocks)({
                    appUrl: ctx.appUrl,
                    slackUserName: `<@${payload.user_id}>`,
                }),
            });
            return;
        }
        const pagination = new pagination_options_1.PaginationOptions();
        pagination.limit = 15;
        const result = await this.pageService.getRecentPages(resolved.user.id, pagination);
        const items = (result.items ?? []).map((p) => ({
            title: p.title || '(Untitled)',
            url: `${ctx.appUrl}/s/${p.space?.slug ?? ''}/p/${p.slugId}`,
            spaceName: p.space?.name,
        }));
        await ctx.respond({
            response_type: 'ephemeral',
            blocks: (0, list_blocks_1.buildListBlocks)({
                heading: 'Recently updated pages',
                items,
                emptyText: 'No recent pages.',
            }),
        });
    }
};
exports.RecentCommand = RecentCommand;
exports.RecentCommand = RecentCommand = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [slack_identity_resolver_1.SlackIdentityResolver,
        page_service_1.PageService])
], RecentCommand);
//# sourceMappingURL=recent.command.js.map