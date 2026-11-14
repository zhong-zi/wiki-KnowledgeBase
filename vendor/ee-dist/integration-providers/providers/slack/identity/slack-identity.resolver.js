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
exports.SlackIdentityResolver = void 0;
const common_1 = require("@nestjs/common");
const integration_repo_1 = require("../../../../../core/integration/repos/integration.repo");
const integration_connection_repo_1 = require("../../../../../core/integration/repos/integration-connection.repo");
const user_repo_1 = require("../../../../../database/repos/user/user.repo");
const workspace_repo_1 = require("../../../../../database/repos/workspace/workspace.repo");
const helpers_1 = require("../../../../../common/helpers");
const link_prompt_blocks_1 = require("../blocks/link-prompt.blocks");
let SlackIdentityResolver = class SlackIdentityResolver {
    constructor(integrationRepo, connectionRepo, userRepo, workspaceRepo) {
        this.integrationRepo = integrationRepo;
        this.connectionRepo = connectionRepo;
        this.userRepo = userRepo;
        this.workspaceRepo = workspaceRepo;
    }
    async resolveSlackUser(slackTeamId, slackUserId) {
        const integration = await this.integrationRepo.findByTypeAndSettingsField('slack', 'slackTeamId', slackTeamId);
        if (!integration)
            return null;
        const userLink = await this.connectionRepo.findUserLink(integration.id, slackUserId);
        if (userLink) {
            return this.hydrate(integration, userLink.userId);
        }
        return null;
    }
    buildLinkPrompt(args) {
        return (0, link_prompt_blocks_1.buildLinkPromptBlocks)({
            appUrl: args.appUrl,
            slackUserName: args.slackUserName,
        });
    }
    async hydrate(integration, userId) {
        const [user, workspace] = await Promise.all([
            this.userRepo.findById(userId, integration.workspaceId),
            this.workspaceRepo.findById(integration.workspaceId),
        ]);
        if (!user || (0, helpers_1.isUserDisabled)(user) || !workspace)
            return null;
        return {
            user: { id: user.id, name: user.name, email: user.email },
            workspace: { id: workspace.id, name: workspace.name },
            integration: { id: integration.id },
        };
    }
};
exports.SlackIdentityResolver = SlackIdentityResolver;
exports.SlackIdentityResolver = SlackIdentityResolver = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [integration_repo_1.IntegrationRepo,
        integration_connection_repo_1.IntegrationConnectionRepo,
        user_repo_1.UserRepo,
        workspace_repo_1.WorkspaceRepo])
], SlackIdentityResolver);
//# sourceMappingURL=slack-identity.resolver.js.map