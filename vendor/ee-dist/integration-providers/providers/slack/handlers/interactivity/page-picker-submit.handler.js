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
var PagePickerSubmitHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PagePickerSubmitHandler = void 0;
const common_1 = require("@nestjs/common");
const slack_handler_interface_1 = require("../slack-handler.interface");
const slack_identity_resolver_1 = require("../../identity/slack-identity.resolver");
const page_repo_1 = require("../../../../../../database/repos/page/page.repo");
const user_repo_1 = require("../../../../../../database/repos/user/user.repo");
const page_access_service_1 = require("../../../../../../core/page/page-access/page-access.service");
const slack_page_writer_service_1 = require("../../content/slack-page-writer.service");
const modal_content_stash_service_1 = require("../../content/modal-content-stash.service");
const slack_page_link_1 = require("../../content/slack-page-link");
const private_metadata_1 = require("../../content/private-metadata");
const slack_notify_1 = require("../../client/slack-notify");
const slack_utils_1 = require("../../slack.utils");
let PagePickerSubmitHandler = PagePickerSubmitHandler_1 = class PagePickerSubmitHandler {
    constructor(identity, pageRepo, userRepo, pageAccess, writer, stash) {
        this.identity = identity;
        this.pageRepo = pageRepo;
        this.userRepo = userRepo;
        this.pageAccess = pageAccess;
        this.writer = writer;
        this.stash = stash;
        this.type = 'view_submission:add_message_submit';
        this.logger = new common_1.Logger(PagePickerSubmitHandler_1.name);
    }
    async handle(payload, ctx) {
        const resolved = await this.identity.resolveSlackUser(payload.team.id, payload.user.id);
        if (!resolved) {
            this.logger.debug(`Unlinked Slack user ${payload.user.id} submitted picker; dropping`);
            return;
        }
        const state = payload.view.state?.values ?? {};
        const pageId = state?.page?.page_id?.selected_option?.value;
        const placement = state?.placement?.placement_value?.selected_option?.value === 'top' ? 'top' : 'bottom';
        const metaSelected = (state?.metadata_toggles?.metadata_values?.selected_options ?? []).map((o) => o.value);
        if (!pageId)
            return;
        const priv = (0, private_metadata_1.decodePrivateMetadata)(payload.view?.private_metadata);
        const notify = (text) => (0, slack_notify_1.notifySlackUser)(ctx, {
            channelId: priv.channelId,
            slackUserId: payload.user.id,
            text,
        });
        const body = await this.stash.take(priv.contentKey, {
            integrationId: ctx.integration.id,
            slackUserId: payload.user.id,
        });
        if (body === null) {
            await notify(slack_handler_interface_1.DIALOG_EXPIRED_TEXT);
            return;
        }
        const page = await this.pageRepo.findById(pageId, { includeSpace: true });
        if (!page || page.workspaceId !== ctx.workspace.id) {
            await notify('That page is not in your workspace.');
            return;
        }
        const docmostUser = await this.userRepo.findById(resolved.user.id, ctx.workspace.id);
        if (!docmostUser)
            return;
        try {
            await this.pageAccess.validateCanEdit(page, docmostUser);
        }
        catch (err) {
            await notify("You don't have edit access to that page.");
            return;
        }
        const markdown = (0, slack_utils_1.applyMetadataPrefix)(body, priv.metadata, metaSelected);
        try {
            await this.writer.appendToPage(page.id, markdown, placement, docmostUser);
            const title = page.title || '(Untitled)';
            const url = (0, slack_page_link_1.buildPageUrl)(ctx.appUrl, page.space?.slug, page.slugId);
            const link = url ? (0, slack_page_link_1.slackLink)(url, title) : `*${title}*`;
            await notify(`Added to ${link}`);
        }
        catch (err) {
            this.logger.error(`Failed to append Slack content to page ${page.id}: ${err.message}`);
            await notify('Something went wrong saving to the page.');
        }
    }
};
exports.PagePickerSubmitHandler = PagePickerSubmitHandler;
exports.PagePickerSubmitHandler = PagePickerSubmitHandler = PagePickerSubmitHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [slack_identity_resolver_1.SlackIdentityResolver,
        page_repo_1.PageRepo,
        user_repo_1.UserRepo,
        page_access_service_1.PageAccessService,
        slack_page_writer_service_1.SlackPageWriter,
        modal_content_stash_service_1.ModalContentStash])
], PagePickerSubmitHandler);
//# sourceMappingURL=page-picker-submit.handler.js.map