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
exports.SlackProvider = void 0;
const common_1 = require("@nestjs/common");
const integration_provider_interface_1 = require("../../../../core/integration/registry/integration-provider.interface");
const features_1 = require("../../../../common/features");
const integration_utils_1 = require("../../../../core/integration/utils/integration.utils");
const integration_repo_1 = require("../../../../core/integration/repos/integration.repo");
const integration_connection_repo_1 = require("../../../../core/integration/repos/integration-connection.repo");
const slack_api_client_1 = require("./client/slack-api.client");
const slack_unfurl_service_1 = require("./unfurl/slack-unfurl.service");
const SLACK_IDENTITY_OAUTH = {
    authUrl: 'https://slack.com/openid/connect/authorize',
    tokenUrl: 'https://slack.com/api/openid.connect.token',
    scopes: ['openid', 'profile', 'email'],
};
const SLACK_OAUTH = {
    authUrl: 'https://slack.com/oauth/v2/authorize',
    tokenUrl: 'https://slack.com/api/oauth.v2.access',
    connectionScope: 'workspace',
    scopes: [
        'chat:write',
        'channels:read',
        'groups:read',
        'channels:history',
        'groups:history',
        'im:history',
        'mpim:history',
        'im:write',
        'mpim:write',
        'commands',
        'links:read',
        'links:write',
        'users:read',
        'users:read.email',
    ],
    identity: SLACK_IDENTITY_OAUTH,
};
const SLACK_UNFURL_PATTERNS = [
    {
        regex: /^https?:\/\/[a-z0-9-]+\.slack\.com\/archives\/([a-zA-Z0-9-]+)\/p(\d+)(?:\?thread_ts=[\d.]+&cid=[A-Za-z\d]+)?$/,
        type: 'slack-message',
    },
    {
        regex: /^https?:\/\/[a-z0-9-]+\.slack\.com\/archives\/([a-zA-Z0-9-]+)\/?$/,
        type: 'slack-channel',
    },
];
let SlackProvider = class SlackProvider extends integration_provider_interface_1.IntegrationProvider {
    constructor(integrationRepo, connectionRepo, slackUnfurlService) {
        super();
        this.integrationRepo = integrationRepo;
        this.connectionRepo = connectionRepo;
        this.slackUnfurlService = slackUnfurlService;
        this.definition = {
            type: 'slack',
            name: 'Slack',
            description: 'Search Docmost, get notifications as DMs, save Slack messages, and unfurl links in both apps',
            icon: 'slack',
            capabilities: ['oauth', 'unfurl'],
            hidden: true,
            requiresFeature: features_1.Feature.INTEGRATIONS,
            unfurlPatterns: SLACK_UNFURL_PATTERNS,
            oauth: SLACK_OAUTH,
        };
    }
    getOAuthConfig(workspaceSettings) {
        const teamId = workspaceSettings?.slackTeamId;
        return {
            ...SLACK_OAUTH,
            identity: {
                ...SLACK_IDENTITY_OAUTH,
                ...(teamId ? { authParams: { team: teamId } } : {}),
            },
        };
    }
    async resolveIdentity(opts) {
        const accessToken = opts.tokenResponse.access_token;
        if (!accessToken) {
            throw new common_1.BadRequestException('Slack did not return an identity token');
        }
        const info = await new slack_api_client_1.SlackApiClient(accessToken).openIdUserInfo();
        const slackUserId = info['https://slack.com/user_id'];
        const slackTeamId = info['https://slack.com/team_id'];
        if (!slackUserId || !slackTeamId) {
            throw new common_1.BadRequestException('Slack identity response is incomplete');
        }
        const installedTeamId = opts.settings?.slackTeamId;
        if (!installedTeamId || slackTeamId !== installedTeamId) {
            throw new integration_provider_interface_1.IdentityTenantMismatchError(`Slack account is in workspace ${slackTeamId}, but ${installedTeamId ?? 'no workspace'} is installed`);
        }
        if (!info.email) {
            throw new common_1.BadRequestException('Slack did not return the account email; grant the email user scope to the Slack app');
        }
        if (info.email_verified === false) {
            throw new common_1.BadRequestException('Slack has not verified the email on this account');
        }
        return {
            account: (0, integration_utils_1.toProviderAccount)({ id: slackUserId, displayName: info.name }),
            email: info.email,
            metadata: {
                slackTeamId,
                linkedAt: new Date().toISOString(),
            },
        };
    }
    async unfurl(opts) {
        const { match, patternType, accessToken, url, settings, userId, integrationId } = opts;
        const channelId = match[1];
        const teamName = settings?.slackTeamName;
        const link = await this.connectionRepo.findUserLinkByUserId(integrationId, userId);
        if (!link?.providerUserId) {
            throw new integration_provider_interface_1.UnfurlNeedsConnectionError();
        }
        await this.slackUnfurlService.assertCanViewChannel(accessToken, channelId, link.providerUserId);
        switch (patternType) {
            case 'slack-message':
                return this.slackUnfurlService.unfurlMessage(accessToken, channelId, match[2], this.threadTsFromUrl(url), teamName, url);
            case 'slack-channel':
                return this.slackUnfurlService.unfurlChannel(accessToken, channelId, teamName, url);
            default:
                throw new Error(`Unknown Slack pattern type: ${patternType}`);
        }
    }
    describeLink(patternType, match, url) {
        let host;
        try {
            host = new URL(url).host;
        }
        catch {
            host = undefined;
        }
        switch (patternType) {
            case 'slack-message':
                return { title: 'Slack message', description: host };
            case 'slack-channel':
                return { title: 'Slack channel', description: host };
            default:
                return null;
        }
    }
    threadTsFromUrl(url) {
        try {
            return new URL(url).searchParams.get('thread_ts');
        }
        catch {
            return null;
        }
    }
    async resolveAccount(opts) {
        const slackUserId = opts.tokenResponse.authed_user
            ?.id;
        const displayName = slackUserId
            ? await new slack_api_client_1.SlackApiClient(opts.accessToken).getUserDisplayName(slackUserId)
            : undefined;
        return (0, integration_utils_1.toProviderAccount)({ id: slackUserId, displayName });
    }
    async onConnected(opts) {
        const response = opts.metadata;
        const teamId = response.team?.id;
        if (!teamId) {
            throw new common_1.BadRequestException(response.is_enterprise_install
                ? 'Org-wide Slack installs (Enterprise Grid) are not supported; install Docmost into a single Slack workspace'
                : `Slack OAuth response has no team; cannot bind integration ${opts.integrationId}`);
        }
        const teamHolder = await this.integrationRepo.findByTypeAndSettingsField('slack', 'slackTeamId', teamId, opts.trx);
        if (teamHolder && teamHolder.id !== opts.integrationId) {
            throw new integration_provider_interface_1.IntegrationTenantInUseError(`Slack workspace ${teamId} is already connected to another Docmost workspace`);
        }
        await this.integrationRepo.update(opts.integrationId, {
            settings: {
                slackTeamId: teamId,
                slackTeamName: response.team?.name,
                botUserId: response.bot_user_id,
            },
        }, opts.trx);
        if (opts.account) {
            await this.connectionRepo.upsertUserLink({
                integrationId: opts.integrationId,
                workspaceId: opts.workspaceId,
                userId: opts.userId,
                providerUserId: opts.account.id,
                metadata: {
                    slackTeamId: teamId,
                    linkedAt: new Date().toISOString(),
                    account: opts.account,
                },
            }, opts.trx);
        }
    }
};
exports.SlackProvider = SlackProvider;
exports.SlackProvider = SlackProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [integration_repo_1.IntegrationRepo,
        integration_connection_repo_1.IntegrationConnectionRepo,
        slack_unfurl_service_1.SlackUnfurlService])
], SlackProvider);
//# sourceMappingURL=slack.provider.js.map