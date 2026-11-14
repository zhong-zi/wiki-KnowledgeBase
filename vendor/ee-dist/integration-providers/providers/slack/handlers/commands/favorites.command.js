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
exports.FavoritesCommand = void 0;
const common_1 = require("@nestjs/common");
const slack_identity_resolver_1 = require("../../identity/slack-identity.resolver");
const favorite_service_1 = require("../../../../../../core/favorite/services/favorite.service");
const favorite_repo_1 = require("../../../../../../database/repos/favorite/favorite.repo");
const pagination_options_1 = require("../../../../../../database/pagination/pagination-options");
const list_blocks_1 = require("../../blocks/list.blocks");
const link_prompt_blocks_1 = require("../../blocks/link-prompt.blocks");
let FavoritesCommand = class FavoritesCommand {
    constructor(identity, favoriteService) {
        this.identity = identity;
        this.favoriteService = favoriteService;
        this.type = 'favorites';
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
        const result = await this.favoriteService.getUserFavorites(resolved.user.id, ctx.workspace.id, pagination, favorite_repo_1.FavoriteType.PAGE);
        const items = (result.items ?? []).map((f) => ({
            title: f.page?.title || f.title || '(Untitled)',
            url: `${ctx.appUrl}/s/${f.page?.space?.slug ?? f.space?.slug ?? ''}/p/${f.page?.slugId ?? f.slugId}`,
            spaceName: f.page?.space?.name ?? f.space?.name,
        }));
        await ctx.respond({
            response_type: 'ephemeral',
            blocks: (0, list_blocks_1.buildListBlocks)({
                heading: 'Your favorite pages',
                items,
                emptyText: 'No favorites yet.',
            }),
        });
    }
};
exports.FavoritesCommand = FavoritesCommand;
exports.FavoritesCommand = FavoritesCommand = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [slack_identity_resolver_1.SlackIdentityResolver,
        favorite_service_1.FavoriteService])
], FavoritesCommand);
//# sourceMappingURL=favorites.command.js.map