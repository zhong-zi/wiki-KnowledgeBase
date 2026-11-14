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
var GitLabProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitLabProvider = void 0;
const common_1 = require("@nestjs/common");
const integration_provider_interface_1 = require("../../../../core/integration/registry/integration-provider.interface");
const features_1 = require("../../../../common/features");
const gitlab_service_1 = require("./gitlab.service");
const gitlab_patterns_1 = require("./gitlab-patterns");
const integration_utils_1 = require("../../../../core/integration/utils/integration.utils");
const DEFAULT_BASE_URL = 'https://gitlab.com';
let GitLabProvider = GitLabProvider_1 = class GitLabProvider extends integration_provider_interface_1.IntegrationProvider {
    constructor(gitlabService) {
        super();
        this.gitlabService = gitlabService;
        this.logger = new common_1.Logger(GitLabProvider_1.name);
        this.definition = {
            type: 'gitlab',
            name: 'GitLab',
            description: 'Link previews for projects, merge requests, issues, and commits',
            icon: 'gitlab',
            capabilities: ['oauth', 'unfurl'],
            requiresFeature: features_1.Feature.INTEGRATIONS,
            oauth: {
                authUrl: 'https://gitlab.com/oauth/authorize',
                tokenUrl: 'https://gitlab.com/oauth/token',
                scopes: ['read_api', 'read_user'],
            },
        };
        const configured = process.env.INTEGRATION_GITLAB_URL;
        if (configured && !(0, integration_utils_1.normalizeBaseUrl)(configured)) {
            this.logger.warn(`INTEGRATION_GITLAB_URL is not a valid http(s) URL; falling back to ${DEFAULT_BASE_URL}`);
        }
    }
    getOAuthConfig(settings) {
        const baseUrl = this.resolveBaseUrl();
        return {
            authUrl: `${baseUrl}/oauth/authorize`,
            tokenUrl: `${baseUrl}/oauth/token`,
            scopes: ['read_api', 'read_user'],
        };
    }
    getUnfurlPatterns(settings) {
        return (0, gitlab_patterns_1.buildGitLabPatterns)(this.resolveBaseUrl());
    }
    getUnfurlHosts(settings) {
        return [new URL(this.resolveBaseUrl()).hostname];
    }
    async resolveAccount(opts) {
        return this.gitlabService.getAccount(opts.accessToken, this.resolveApiBaseUrl());
    }
    async unfurl(opts) {
        const { match, patternType, accessToken, url } = opts;
        const apiBaseUrl = this.resolveApiBaseUrl();
        switch (patternType) {
            case 'gitlab-mr': {
                const projectPath = match[1];
                const iid = parseInt(match[2], 10);
                return this.gitlabService.unfurlMergeRequest(accessToken, apiBaseUrl, projectPath, iid, url);
            }
            case 'gitlab-issue': {
                const projectPath = match[1];
                const iid = parseInt(match[2], 10);
                return this.gitlabService.unfurlIssue(accessToken, apiBaseUrl, projectPath, iid, url);
            }
            case 'gitlab-project': {
                const projectPath = `${match[1]}/${match[2]}`;
                return this.gitlabService.unfurlProject(accessToken, apiBaseUrl, projectPath, url);
            }
            case 'gitlab-commit': {
                const projectPath = match[1];
                const commitSha = match[2];
                return this.gitlabService.unfurlCommit(accessToken, apiBaseUrl, projectPath, commitSha, url);
            }
            case 'gitlab-commit-in-mr': {
                const projectPath = match[1];
                const commitSha = match[3];
                return this.gitlabService.unfurlCommit(accessToken, apiBaseUrl, projectPath, commitSha, url);
            }
            case 'gitlab-work-item-drawer': {
                const target = this.decodeWorkItemShowParam(url);
                if (!target) {
                    throw new integration_provider_interface_1.UnfurlForbiddenError('Could not decode work item show param');
                }
                return this.gitlabService.unfurlIssue(accessToken, apiBaseUrl, target.fullPath, target.iid, url);
            }
            case 'gitlab-issues-list': {
                const projectPath = match[1];
                return this.gitlabService.unfurlIssuesList(accessToken, apiBaseUrl, projectPath, url);
            }
            case 'gitlab-merges-list': {
                const projectPath = match[1];
                return this.gitlabService.unfurlMergesList(accessToken, apiBaseUrl, projectPath, url);
            }
            default:
                throw new Error(`Unknown GitLab pattern type: ${patternType}`);
        }
    }
    describeLink(patternType, match, url) {
        const projectPath = match[1];
        switch (patternType) {
            case 'gitlab-mr':
                return { title: `Merge Request !${match[2]}`, description: projectPath };
            case 'gitlab-issue':
                return { title: `Issue #${match[2]}`, description: projectPath };
            case 'gitlab-work-item-drawer': {
                const target = this.decodeWorkItemShowParam(url);
                return target
                    ? { title: `Issue #${target.iid}`, description: target.fullPath }
                    : { title: 'Work item', description: projectPath };
            }
            case 'gitlab-commit':
                return { title: `Commit ${match[2].slice(0, 8)}`, description: projectPath };
            case 'gitlab-commit-in-mr':
                return { title: `Commit ${match[3].slice(0, 8)}`, description: projectPath };
            case 'gitlab-issues-list':
                return { title: 'Issues', description: projectPath };
            case 'gitlab-merges-list':
                return { title: 'Merge Requests', description: projectPath };
            case 'gitlab-project':
                return { title: `${match[1]}/${match[2]}` };
            default:
                return null;
        }
    }
    decodeWorkItemShowParam(url) {
        try {
            const show = new URL(url).searchParams.get('show');
            if (!show)
                return null;
            const base64 = show.replace(/-/g, '+').replace(/_/g, '/');
            const payload = JSON.parse(Buffer.from(base64, 'base64').toString('utf8'));
            const iid = parseInt(payload.iid, 10);
            if (typeof payload.full_path !== 'string' || Number.isNaN(iid)) {
                return null;
            }
            return { fullPath: payload.full_path, iid };
        }
        catch {
            return null;
        }
    }
    resolveBaseUrl() {
        const baseUrl = process.env.INTEGRATION_GITLAB_URL;
        return (baseUrl && (0, integration_utils_1.normalizeBaseUrl)(baseUrl)) || DEFAULT_BASE_URL;
    }
    resolveApiBaseUrl() {
        return `${this.resolveBaseUrl()}/api/v4`;
    }
};
exports.GitLabProvider = GitLabProvider;
exports.GitLabProvider = GitLabProvider = GitLabProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [gitlab_service_1.GitLabService])
], GitLabProvider);
//# sourceMappingURL=gitlab.provider.js.map