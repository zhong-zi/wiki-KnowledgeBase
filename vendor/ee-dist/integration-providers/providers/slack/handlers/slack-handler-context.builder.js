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
exports.SlackHandlerContextBuilder = void 0;
const common_1 = require("@nestjs/common");
const integration_repo_1 = require("../../../../../core/integration/repos/integration.repo");
const integration_connection_repo_1 = require("../../../../../core/integration/repos/integration-connection.repo");
const oauth_service_1 = require("../../../../../core/integration/oauth/oauth.service");
const integration_provider_interface_1 = require("../../../../../core/integration/registry/integration-provider.interface");
const workspace_repo_1 = require("../../../../../database/repos/workspace/workspace.repo");
const domain_service_1 = require("../../../../../integrations/environment/domain.service");
const slack_api_client_1 = require("../client/slack-api.client");
const slack_utils_1 = require("../slack.utils");
let SlackHandlerContextBuilder = class SlackHandlerContextBuilder {
    constructor(integrationRepo, connectionRepo, workspaceRepo, oauthService, domainService) {
        this.integrationRepo = integrationRepo;
        this.connectionRepo = connectionRepo;
        this.workspaceRepo = workspaceRepo;
        this.oauthService = oauthService;
        this.domainService = domainService;
    }
    async fromTeamId(slackTeamId, rawBody, responseUrl) {
        const integration = await this.integrationRepo.findByTypeAndSettingsField('slack', 'slackTeamId', slackTeamId);
        if (!integration)
            return null;
        return this.fromIntegration(integration, rawBody, responseUrl);
    }
    async fromWorkspaceId(workspaceId) {
        const integration = await this.integrationRepo.findByWorkspaceAndType(workspaceId, 'slack');
        if (!integration)
            return null;
        return this.fromIntegration(integration, '');
    }
    async fromIntegration(integration, rawBody, responseUrl) {
        const workspaceConn = await this.connectionRepo.findWorkspaceConnection(integration.id);
        if (!workspaceConn?.accessToken)
            return null;
        const workspace = await this.workspaceRepo.findById(integration.workspaceId);
        if (!workspace)
            return null;
        const accessToken = await this.oauthService
            .getValidAccessToken(workspaceConn)
            .catch((err) => {
            if (err instanceof integration_provider_interface_1.TokenExpiredError)
                return null;
            throw err;
        });
        if (!accessToken)
            return null;
        const apiClient = new slack_api_client_1.SlackApiClient(accessToken);
        return {
            integration,
            workspace,
            appUrl: this.domainService.getWorkspaceUrl(workspace),
            rawBody,
            apiClient,
            respond: responseUrl
                ? (payload) => (0, slack_utils_1.postToResponseUrl)(responseUrl, payload)
                : async () => { },
        };
    }
};
exports.SlackHandlerContextBuilder = SlackHandlerContextBuilder;
exports.SlackHandlerContextBuilder = SlackHandlerContextBuilder = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [integration_repo_1.IntegrationRepo,
        integration_connection_repo_1.IntegrationConnectionRepo,
        workspace_repo_1.WorkspaceRepo,
        oauth_service_1.OAuthService,
        domain_service_1.DomainService])
], SlackHandlerContextBuilder);
//# sourceMappingURL=slack-handler-context.builder.js.map