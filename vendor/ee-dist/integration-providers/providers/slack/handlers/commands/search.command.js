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
exports.SearchCommand = void 0;
const common_1 = require("@nestjs/common");
const slack_handler_interface_1 = require("../slack-handler.interface");
const slack_identity_resolver_1 = require("../../identity/slack-identity.resolver");
const search_service_1 = require("../../../../../../core/search/search.service");
const list_blocks_1 = require("../../blocks/list.blocks");
const link_prompt_blocks_1 = require("../../blocks/link-prompt.blocks");
let SearchCommand = class SearchCommand {
    constructor(identity, search) {
        this.identity = identity;
        this.search = search;
        this.type = 'search';
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
        const query = payload.text.replace(/^search\s+/i, '').trim();
        if (!query) {
            await ctx.respond((0, slack_handler_interface_1.ephemeral)('Usage: `/docmost search <keyword>`'));
            return;
        }
        const result = await this.search.searchPage({ query, limit: 10, titleOnly: true }, { userId: resolved.user.id, workspaceId: ctx.workspace.id });
        const items = (result.items ?? []).map((p) => ({
            title: p.title || '(Untitled)',
            url: `${ctx.appUrl}/s/${p.space?.slug ?? ''}/p/${p.slugId}`,
            spaceName: p.space?.name,
        }));
        await ctx.respond({
            response_type: 'ephemeral',
            blocks: (0, list_blocks_1.buildListBlocks)({
                heading: `Search: \`${query}\``,
                items,
                emptyText: 'No matches.',
            }),
        });
    }
};
exports.SearchCommand = SearchCommand;
exports.SearchCommand = SearchCommand = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [slack_identity_resolver_1.SlackIdentityResolver,
        search_service_1.SearchService])
], SearchCommand);
//# sourceMappingURL=search.command.js.map