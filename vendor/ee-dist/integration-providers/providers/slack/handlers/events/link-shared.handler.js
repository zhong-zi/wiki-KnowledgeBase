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
var LinkSharedHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkSharedHandler = void 0;
const common_1 = require("@nestjs/common");
const domain_service_1 = require("../../../../../../integrations/environment/domain.service");
const page_repo_1 = require("../../../../../../database/repos/page/page.repo");
const page_permission_repo_1 = require("../../../../../../database/repos/page/page-permission.repo");
const space_member_repo_1 = require("../../../../../../database/repos/space/space-member.repo");
const user_repo_1 = require("../../../../../../database/repos/user/user.repo");
const space_repo_1 = require("../../../../../../database/repos/space/space.repo");
const slack_identity_resolver_1 = require("../../identity/slack-identity.resolver");
const slack_url_parser_1 = require("../../unfurl/slack-url.parser");
const unfurl_blocks_1 = require("../../blocks/unfurl.blocks");
const link_prompt_blocks_1 = require("../../blocks/link-prompt.blocks");
let LinkSharedHandler = LinkSharedHandler_1 = class LinkSharedHandler {
    constructor(domainService, pageRepo, pagePermissionRepo, spaceMemberRepo, userRepo, spaceRepo, identity) {
        this.domainService = domainService;
        this.pageRepo = pageRepo;
        this.pagePermissionRepo = pagePermissionRepo;
        this.spaceMemberRepo = spaceMemberRepo;
        this.userRepo = userRepo;
        this.spaceRepo = spaceRepo;
        this.identity = identity;
        this.type = 'link_shared';
        this.logger = new common_1.Logger(LinkSharedHandler_1.name);
    }
    async handle(envelope, ctx) {
        const slackUserId = envelope.event.user;
        const slackTeamId = envelope.team_id;
        const resolved = await this.identity.resolveSlackUser(slackTeamId, slackUserId);
        if (!resolved) {
            await this.sendLinkPromptDm(ctx, slackUserId);
            return;
        }
        const acceptedHosts = new Set([
            new URL(ctx.appUrl).host,
            new URL(this.domainService.getUrl(ctx.workspace.hostname ?? undefined)).host,
        ]);
        const unfurls = {};
        const uniqueByUrl = new Map();
        for (const link of envelope.event.links) {
            if (!uniqueByUrl.has(link.url))
                uniqueByUrl.set(link.url, link.url);
        }
        for (const url of uniqueByUrl.keys()) {
            const parsed = (0, slack_url_parser_1.parseDocmostPageUrl)(url, acceptedHosts);
            if (!parsed)
                continue;
            const page = await this.pageRepo.findById(parsed.slugId);
            if (!page || page.deletedAt || page.workspaceId !== ctx.workspace.id)
                continue;
            const inSpace = await this.spaceMemberRepo.getUserIdsWithSpaceAccess([resolved.user.id], page.spaceId);
            if (inSpace.size === 0)
                continue;
            const withPageAccess = await this.pagePermissionRepo.getUserIdsWithPageAccess(page.id, [resolved.user.id]);
            if (withPageAccess.length === 0)
                continue;
            const [author, space] = await Promise.all([
                this.userRepo.findById(page.creatorId, ctx.workspace.id),
                this.spaceRepo.findById(page.spaceId, ctx.workspace.id),
            ]);
            unfurls[url] = {
                blocks: (0, unfurl_blocks_1.buildPageUnfurlBlocks)({
                    pageUrl: url,
                    title: page.title || '(Untitled)',
                    icon: page.icon,
                    spaceName: space?.name ?? '',
                    authorName: author?.name ?? '',
                    updatedAt: page.updatedAt,
                }),
            };
        }
        if (Object.keys(unfurls).length === 0)
            return;
        await ctx.apiClient.chatUnfurl({
            channel: envelope.event.channel,
            ts: envelope.event.message_ts,
            unfurls,
        });
    }
    async sendLinkPromptDm(ctx, slackUserId) {
        const dm = await ctx.apiClient.conversationsOpen({ users: slackUserId });
        if (!('channel' in dm))
            return;
        const slackUser = await ctx.apiClient.usersInfo({ user: slackUserId });
        const displayName = 'user' in slackUser
            ? slackUser.user.profile?.display_name || slackUser.user.name
            : 'there';
        const blocks = (0, link_prompt_blocks_1.buildLinkPromptBlocks)({
            appUrl: ctx.appUrl,
            slackUserName: `@${displayName}`,
        });
        await ctx.apiClient.chatPostMessage({ channel: dm.channel.id, blocks });
    }
};
exports.LinkSharedHandler = LinkSharedHandler;
exports.LinkSharedHandler = LinkSharedHandler = LinkSharedHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [domain_service_1.DomainService,
        page_repo_1.PageRepo,
        page_permission_repo_1.PagePermissionRepo,
        space_member_repo_1.SpaceMemberRepo,
        user_repo_1.UserRepo,
        space_repo_1.SpaceRepo,
        slack_identity_resolver_1.SlackIdentityResolver])
], LinkSharedHandler);
//# sourceMappingURL=link-shared.handler.js.map