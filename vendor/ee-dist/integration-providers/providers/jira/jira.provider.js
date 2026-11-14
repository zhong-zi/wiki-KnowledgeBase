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
var JiraProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.JiraProvider = void 0;
const common_1 = require("@nestjs/common");
const integration_provider_interface_1 = require("../../../../core/integration/registry/integration-provider.interface");
const features_1 = require("../../../../common/features");
const jira_service_1 = require("./jira.service");
const jira_patterns_1 = require("./jira-patterns");
const integration_utils_1 = require("../../../../core/integration/utils/integration.utils");
const CLOUD_OAUTH = {
    authUrl: 'https://auth.atlassian.com/authorize',
    tokenUrl: 'https://auth.atlassian.com/oauth/token',
    scopes: ['read:jira-work', 'read:jira-user', 'offline_access'],
    credentialsKey: 'atlassian',
    authParams: { audience: 'api.atlassian.com', prompt: 'consent' },
};
let JiraProvider = JiraProvider_1 = class JiraProvider extends integration_provider_interface_1.IntegrationProvider {
    constructor(jiraService) {
        super();
        this.jiraService = jiraService;
        this.logger = new common_1.Logger(JiraProvider_1.name);
        this.definition = {
            type: 'jira',
            name: 'Jira',
            description: 'Link previews for Jira issues',
            icon: 'jira',
            capabilities: ['oauth', 'unfurl'],
            requiresFeature: features_1.Feature.INTEGRATIONS,
            oauth: CLOUD_OAUTH,
        };
        const configured = process.env.INTEGRATION_JIRA_URL;
        if (configured && !(0, integration_utils_1.normalizeBaseUrl)(configured)) {
            this.logger.warn('INTEGRATION_JIRA_URL is not a valid http(s) URL; falling back to Jira Cloud');
        }
    }
    getOAuthConfig(settings) {
        const baseUrl = this.resolveBaseUrl();
        if (!baseUrl)
            return CLOUD_OAUTH;
        return {
            authUrl: `${baseUrl}/rest/oauth2/latest/authorize`,
            tokenUrl: `${baseUrl}/rest/oauth2/latest/token`,
            scopes: ['READ'],
        };
    }
    getUnfurlPatterns(settings) {
        const baseUrl = this.resolveBaseUrl();
        return baseUrl ? (0, jira_patterns_1.buildJiraDataCenterPatterns)(baseUrl) : jira_patterns_1.JIRA_CLOUD_PATTERNS;
    }
    getUnfurlHosts(settings) {
        const baseUrl = this.resolveBaseUrl();
        if (!baseUrl)
            return ['*.atlassian.net', '*.jira.com'];
        return [new URL(baseUrl).hostname];
    }
    async resolveAccount(opts) {
        return this.jiraService.getAccount(opts.accessToken, this.resolveBaseUrl());
    }
    async unfurl(opts) {
        const { match, accessToken, url } = opts;
        const issueKey = match.groups?.issue ?? match[1];
        const host = this.resolveBaseUrl() ?? new URL(url).origin;
        return this.jiraService.unfurlIssue(accessToken, host, issueKey, url);
    }
    resolveBaseUrl() {
        const baseUrl = process.env.INTEGRATION_JIRA_URL;
        return baseUrl ? (0, integration_utils_1.normalizeBaseUrl)(baseUrl) : null;
    }
    describeLink(patternType, match, url) {
        const issueKey = match.groups?.issue ?? match[1];
        if (!issueKey)
            return null;
        let host;
        try {
            host = new URL(url).host;
        }
        catch {
            host = undefined;
        }
        return { title: issueKey, description: host };
    }
};
exports.JiraProvider = JiraProvider;
exports.JiraProvider = JiraProvider = JiraProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [jira_service_1.JiraService])
], JiraProvider);
//# sourceMappingURL=jira.provider.js.map