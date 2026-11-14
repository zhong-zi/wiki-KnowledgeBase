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
var NewPageSubmitHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.NewPageSubmitHandler = void 0;
const common_1 = require("@nestjs/common");
const slack_handler_interface_1 = require("../slack-handler.interface");
const slack_identity_resolver_1 = require("../../identity/slack-identity.resolver");
const page_service_1 = require("../../../../../../core/page/services/page.service");
const page_access_service_1 = require("../../../../../../core/page/page-access/page-access.service");
const user_repo_1 = require("../../../../../../database/repos/user/user.repo");
const space_repo_1 = require("../../../../../../database/repos/space/space.repo");
const slack_page_link_1 = require("../../content/slack-page-link");
const private_metadata_1 = require("../../content/private-metadata");
const modal_content_stash_service_1 = require("../../content/modal-content-stash.service");
const slack_notify_1 = require("../../client/slack-notify");
let NewPageSubmitHandler = NewPageSubmitHandler_1 = class NewPageSubmitHandler {
    constructor(identity, userRepo, pageService, spaceRepo, pageAccess, stash) {
        this.identity = identity;
        this.userRepo = userRepo;
        this.pageService = pageService;
        this.spaceRepo = spaceRepo;
        this.pageAccess = pageAccess;
        this.stash = stash;
        this.type = 'view_submission:new_page_submit';
        this.logger = new common_1.Logger(NewPageSubmitHandler_1.name);
    }
    async handle(payload, ctx) {
        const resolved = await this.identity.resolveSlackUser(payload.team.id, payload.user.id);
        if (!resolved)
            return;
        const state = payload.view.state?.values ?? {};
        const spaceId = state?.space?.space_id?.selected_option?.value;
        const title = state?.title?.title_value?.value?.trim() || 'From Slack';
        if (!spaceId)
            return;
        const priv = (0, private_metadata_1.decodePrivateMetadata)(payload.view?.private_metadata);
        const notify = (text) => (0, slack_notify_1.notifySlackUser)(ctx, {
            channelId: priv.channelId,
            slackUserId: payload.user.id,
            text,
        });
        const content = await this.stash.take(priv.contentKey, {
            integrationId: ctx.integration.id,
            slackUserId: payload.user.id,
        });
        if (content === null) {
            await notify(slack_handler_interface_1.DIALOG_EXPIRED_TEXT);
            return;
        }
        const space = await this.spaceRepo.findById(spaceId, ctx.workspace.id);
        if (!space || space.workspaceId !== ctx.workspace.id) {
            await notify('That space is not in your workspace.');
            return;
        }
        const docmostUser = await this.userRepo.findById(resolved.user.id, ctx.workspace.id);
        if (!docmostUser)
            return;
        try {
            await this.pageAccess.validateCanCreate(spaceId, docmostUser);
        }
        catch {
            await notify('You do not have permission to create pages in that space.');
            return;
        }
        try {
            const createPageDto = {
                spaceId,
                title,
                content,
                format: 'markdown',
            };
            const page = await this.pageService.create(resolved.user.id, ctx.workspace.id, createPageDto);
            const url = (0, slack_page_link_1.buildPageUrl)(ctx.appUrl, space.slug, page?.slugId);
            const link = url ? (0, slack_page_link_1.slackLink)(url, title) : `*${title}*`;
            await notify(`Created ${link} in the *${(0, slack_page_link_1.mrkdwnEscape)(space.name)}* space`);
        }
        catch (err) {
            this.logger.error(`Failed to create page from Slack: ${err.message}`);
            await notify('Could not create the page. Check that you have permission to create pages in that space.');
        }
    }
};
exports.NewPageSubmitHandler = NewPageSubmitHandler;
exports.NewPageSubmitHandler = NewPageSubmitHandler = NewPageSubmitHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [slack_identity_resolver_1.SlackIdentityResolver,
        user_repo_1.UserRepo,
        page_service_1.PageService,
        space_repo_1.SpaceRepo,
        page_access_service_1.PageAccessService,
        modal_content_stash_service_1.ModalContentStash])
], NewPageSubmitHandler);
//# sourceMappingURL=new-page-submit.handler.js.map