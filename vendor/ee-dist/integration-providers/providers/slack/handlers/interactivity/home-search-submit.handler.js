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
var HomeSearchSubmitHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HomeSearchSubmitHandler = void 0;
const common_1 = require("@nestjs/common");
const slack_identity_resolver_1 = require("../../identity/slack-identity.resolver");
const page_repo_1 = require("../../../../../../database/repos/page/page.repo");
const user_repo_1 = require("../../../../../../database/repos/user/user.repo");
const page_access_service_1 = require("../../../../../../core/page/page-access/page-access.service");
const slack_page_link_1 = require("../../content/slack-page-link");
const slack_notify_1 = require("../../client/slack-notify");
const PAGE_UNAVAILABLE_TEXT = "That page isn't available.";
let HomeSearchSubmitHandler = HomeSearchSubmitHandler_1 = class HomeSearchSubmitHandler {
    constructor(identity, pageRepo, userRepo, pageAccess) {
        this.identity = identity;
        this.pageRepo = pageRepo;
        this.userRepo = userRepo;
        this.pageAccess = pageAccess;
        this.type = 'view_submission:home_search_submit';
        this.logger = new common_1.Logger(HomeSearchSubmitHandler_1.name);
    }
    async handle(payload, ctx) {
        const resolved = await this.identity.resolveSlackUser(payload.team.id, payload.user.id);
        if (!resolved)
            return;
        const state = payload.view.state?.values ?? {};
        const pageId = state?.page?.page_id?.selected_option?.value;
        if (!pageId)
            return;
        const page = await this.pageRepo.findById(pageId, { includeSpace: true });
        if (!page || page.deletedAt || page.workspaceId !== ctx.workspace.id) {
            await (0, slack_notify_1.notifySlackUser)(ctx, { slackUserId: payload.user.id, text: PAGE_UNAVAILABLE_TEXT });
            return;
        }
        const user = await this.userRepo.findById(resolved.user.id, ctx.workspace.id);
        if (!user)
            return;
        try {
            await this.pageAccess.validateCanView(page, user);
        }
        catch {
            await (0, slack_notify_1.notifySlackUser)(ctx, { slackUserId: payload.user.id, text: PAGE_UNAVAILABLE_TEXT });
            return;
        }
        const title = page.title || '(Untitled)';
        const url = (0, slack_page_link_1.buildPageUrl)(ctx.appUrl, page.space?.slug, page.slugId);
        const link = url ? (0, slack_page_link_1.slackLink)(url, title) : `*${title}*`;
        await (0, slack_notify_1.notifySlackUser)(ctx, {
            slackUserId: payload.user.id,
            text: `:open_book: ${link}`,
        });
    }
};
exports.HomeSearchSubmitHandler = HomeSearchSubmitHandler;
exports.HomeSearchSubmitHandler = HomeSearchSubmitHandler = HomeSearchSubmitHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [slack_identity_resolver_1.SlackIdentityResolver,
        page_repo_1.PageRepo,
        user_repo_1.UserRepo,
        page_access_service_1.PageAccessService])
], HomeSearchSubmitHandler);
//# sourceMappingURL=home-search-submit.handler.js.map