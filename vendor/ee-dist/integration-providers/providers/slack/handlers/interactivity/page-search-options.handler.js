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
exports.PageSearchOptionsHandler = void 0;
const common_1 = require("@nestjs/common");
const slack_identity_resolver_1 = require("../../identity/slack-identity.resolver");
const search_service_1 = require("../../../../../../core/search/search.service");
const slack_utils_1 = require("../../slack.utils");
let PageSearchOptionsHandler = class PageSearchOptionsHandler {
    constructor(identity, search) {
        this.identity = identity;
        this.search = search;
        this.type = 'block_suggestion:page_id';
    }
    async handle(payload, ctx) {
        const resolved = await this.identity.resolveSlackUser(payload.team.id, payload.user.id);
        if (!resolved) {
            ctx.__options = { options: [] };
            return;
        }
        const query = payload.value ?? '';
        const searchParams = {
            query,
            spaceId: undefined,
            limit: 20,
        };
        const result = await this.search.searchPage(searchParams, {
            userId: resolved.user.id,
            workspaceId: ctx.workspace.id,
        });
        ctx.__options = {
            options: (result.items ?? []).map((p) => {
                const option = {
                    text: { type: 'plain_text', text: (0, slack_utils_1.optionText)(p.title || '(Untitled)') },
                    value: p.id,
                };
                const description = (0, slack_utils_1.optionText)(p.highlight?.replace(/<\/?(b|mark)>/gi, '')) || (0, slack_utils_1.optionText)(p.space?.name);
                if (description)
                    option.description = { type: 'plain_text', text: description };
                return option;
            }),
        };
    }
};
exports.PageSearchOptionsHandler = PageSearchOptionsHandler;
exports.PageSearchOptionsHandler = PageSearchOptionsHandler = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [slack_identity_resolver_1.SlackIdentityResolver,
        search_service_1.SearchService])
], PageSearchOptionsHandler);
//# sourceMappingURL=page-search-options.handler.js.map