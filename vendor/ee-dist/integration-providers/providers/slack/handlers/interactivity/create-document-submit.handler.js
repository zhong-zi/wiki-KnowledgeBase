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
var CreateDocumentSubmitHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDocumentSubmitHandler = void 0;
const common_1 = require("@nestjs/common");
const slack_identity_resolver_1 = require("../../identity/slack-identity.resolver");
const page_service_1 = require("../../../../../../core/page/services/page.service");
const page_access_service_1 = require("../../../../../../core/page/page-access/page-access.service");
const user_repo_1 = require("../../../../../../database/repos/user/user.repo");
const space_repo_1 = require("../../../../../../database/repos/space/space.repo");
const slack_page_link_1 = require("../../content/slack-page-link");
const slack_notify_1 = require("../../client/slack-notify");
let CreateDocumentSubmitHandler = CreateDocumentSubmitHandler_1 = class CreateDocumentSubmitHandler {
    constructor(identity, userRepo, spaceRepo, pageService, pageAccess) {
        this.identity = identity;
        this.userRepo = userRepo;
        this.spaceRepo = spaceRepo;
        this.pageService = pageService;
        this.pageAccess = pageAccess;
        this.type = 'view_submission:create_document_submit';
        this.logger = new common_1.Logger(CreateDocumentSubmitHandler_1.name);
    }
    async handle(payload, ctx) {
        const resolved = await this.identity.resolveSlackUser(payload.team.id, payload.user.id);
        if (!resolved)
            return;
        const state = payload.view.state?.values ?? {};
        const title = (state?.title?.title_value?.value ?? '').trim();
        const spaceId = state?.space?.space_id?.selected_option?.value;
        const description = (state?.description?.description_value?.value ?? '').trim();
        if (!title || !spaceId)
            return;
        const space = await this.spaceRepo.findById(spaceId, ctx.workspace.id);
        if (!space || space.workspaceId !== ctx.workspace.id) {
            await (0, slack_notify_1.notifySlackUser)(ctx, {
                slackUserId: payload.user.id,
                text: 'That space is not in your workspace.',
            });
            return;
        }
        const docmostUser = await this.userRepo.findById(resolved.user.id, ctx.workspace.id);
        if (!docmostUser)
            return;
        try {
            await this.pageAccess.validateCanCreate(spaceId, docmostUser);
        }
        catch {
            await (0, slack_notify_1.notifySlackUser)(ctx, {
                slackUserId: payload.user.id,
                text: 'You do not have permission to create pages in that space.',
            });
            return;
        }
        try {
            const dto = {
                spaceId,
                title,
                content: description ? description : undefined,
                format: description ? 'markdown' : undefined,
            };
            const page = await this.pageService.create(resolved.user.id, ctx.workspace.id, dto);
            const url = (0, slack_page_link_1.buildPageUrl)(ctx.appUrl, space.slug, page?.slugId);
            const link = url ? (0, slack_page_link_1.slackLink)(url, title) : `*${title}*`;
            await (0, slack_notify_1.notifySlackUser)(ctx, {
                slackUserId: payload.user.id,
                text: `Created ${link}`,
            });
        }
        catch (err) {
            this.logger.error(`Failed to create document from home: ${err.message}`);
            await (0, slack_notify_1.notifySlackUser)(ctx, {
                slackUserId: payload.user.id,
                text: 'Could not create the page. Check that you have permission to create pages in that space.',
            });
        }
    }
};
exports.CreateDocumentSubmitHandler = CreateDocumentSubmitHandler;
exports.CreateDocumentSubmitHandler = CreateDocumentSubmitHandler = CreateDocumentSubmitHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [slack_identity_resolver_1.SlackIdentityResolver,
        user_repo_1.UserRepo,
        space_repo_1.SpaceRepo,
        page_service_1.PageService,
        page_access_service_1.PageAccessService])
], CreateDocumentSubmitHandler);
//# sourceMappingURL=create-document-submit.handler.js.map