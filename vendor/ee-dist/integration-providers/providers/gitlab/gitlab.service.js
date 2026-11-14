"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GitLabService = void 0;
const common_1 = require("@nestjs/common");
const integration_provider_interface_1 = require("../../../../core/integration/registry/integration-provider.interface");
const relative_time_1 = require("../../../../core/integration/utils/relative-time");
const provider_fetch_1 = require("../../../../core/integration/utils/provider-fetch");
const integration_utils_1 = require("../../../../core/integration/utils/integration.utils");
const gitlab_utils_1 = require("./gitlab.utils");
let GitLabService = class GitLabService {
    async getAccount(accessToken, apiBaseUrl) {
        const data = await this.apiGet(accessToken, apiBaseUrl, '/user');
        return (0, integration_utils_1.toProviderAccount)({
            id: data.id,
            displayName: data.name,
            username: data.username,
        });
    }
    async unfurlMergeRequest(accessToken, apiBaseUrl, projectPath, iid, url) {
        const encodedProject = encodeURIComponent(projectPath);
        const data = await this.apiGet(accessToken, apiBaseUrl, `/projects/${encodedProject}/merge_requests/${iid}`);
        const authorName = (0, gitlab_utils_1.userName)(data.author);
        const updatedAt = (0, integration_utils_1.stringOrUndefined)(data.updated_at) ?? (0, integration_utils_1.stringOrUndefined)(data.created_at);
        const state = (0, integration_utils_1.stringOrUndefined)(data.state);
        const draft = data.draft === true || data.work_in_progress === true;
        const desc = [
            `!${iid}`,
            updatedAt && (0, relative_time_1.relativeTime)(updatedAt),
            authorName,
        ].filter(Boolean).join(' · ');
        return {
            title: (0, integration_utils_1.stringOrUndefined)(data.title) ?? `Merge Request !${iid}`,
            description: desc,
            url,
            provider: 'gitlab',
            providerIcon: 'gitlab',
            status: this.formatMrStatus(state, draft),
            statusColor: this.getMrStatusColor(state, draft),
            author: authorName,
            authorAvatarUrl: (0, integration_utils_1.stringOrUndefined)(data.author?.avatar_url),
            metadata: {
                type: 'mr',
                iid,
                project: projectPath,
                labels: (0, gitlab_utils_1.stringArray)(data.labels),
                draft,
            },
        };
    }
    async unfurlIssue(accessToken, apiBaseUrl, projectPath, iid, url) {
        const encodedProject = encodeURIComponent(projectPath);
        const data = await this.apiGet(accessToken, apiBaseUrl, `/projects/${encodedProject}/issues/${iid}`);
        const issueAuthor = (0, gitlab_utils_1.userName)(data.author);
        const updatedAt = (0, integration_utils_1.stringOrUndefined)(data.updated_at) ?? (0, integration_utils_1.stringOrUndefined)(data.created_at);
        const state = (0, integration_utils_1.stringOrUndefined)(data.state);
        const issueDesc = [
            `#${iid}`,
            updatedAt && (0, relative_time_1.relativeTime)(updatedAt),
            issueAuthor,
        ].filter(Boolean).join(' · ');
        return {
            title: (0, integration_utils_1.stringOrUndefined)(data.title) ?? `Issue #${iid}`,
            description: issueDesc,
            url,
            provider: 'gitlab',
            providerIcon: 'gitlab',
            status: state,
            statusColor: state === 'opened' ? 'green' : 'blue',
            author: issueAuthor,
            authorAvatarUrl: (0, integration_utils_1.stringOrUndefined)(data.author?.avatar_url),
            metadata: {
                type: 'issue',
                iid,
                project: projectPath,
                labels: (0, gitlab_utils_1.stringArray)(data.labels),
                assignees: (0, gitlab_utils_1.stringArray)(Array.isArray(data.assignees) ? data.assignees.map(gitlab_utils_1.userName) : []),
            },
        };
    }
    async unfurlProject(accessToken, apiBaseUrl, projectPath, url) {
        const encodedProject = encodeURIComponent(projectPath);
        const data = await this.apiGet(accessToken, apiBaseUrl, `/projects/${encodedProject}`);
        const visibility = data.visibility === 'public' ? 'Public' : data.visibility === 'internal' ? 'Internal' : 'Private';
        return {
            title: (0, integration_utils_1.stringOrUndefined)(data.name) ?? projectPath,
            description: (0, integration_utils_1.stringOrUndefined)(data.description)?.slice(0, 200),
            url,
            provider: 'gitlab',
            providerIcon: 'gitlab',
            status: visibility,
            statusColor: data.visibility === 'public' ? 'green' : 'gray',
            author: (0, integration_utils_1.stringOrUndefined)(data.namespace?.name),
            authorAvatarUrl: (0, integration_utils_1.stringOrUndefined)(data.avatar_url) ??
                (0, integration_utils_1.stringOrUndefined)(data.namespace?.avatar_url),
            metadata: {
                type: 'project',
                project: projectPath,
                stars: (0, gitlab_utils_1.numberOrUndefined)(data.star_count),
                forks: (0, gitlab_utils_1.numberOrUndefined)(data.forks_count),
                defaultBranch: (0, integration_utils_1.stringOrUndefined)(data.default_branch),
            },
        };
    }
    async unfurlCommit(accessToken, apiBaseUrl, projectPath, commitSha, url) {
        const encodedProject = encodeURIComponent(projectPath);
        const data = await this.apiGet(accessToken, apiBaseUrl, `/projects/${encodedProject}/repository/commits/${commitSha}`);
        const sha = (0, integration_utils_1.stringOrUndefined)(data.id);
        const shortSha = (0, integration_utils_1.stringOrUndefined)(data.short_id) ?? sha?.slice(0, 8);
        const committedAt = (0, integration_utils_1.stringOrUndefined)(data.committed_date) ??
            (0, integration_utils_1.stringOrUndefined)(data.created_at);
        const authorName = (0, integration_utils_1.stringOrUndefined)(data.author_name);
        const stats = data.stats && typeof data.stats === 'object'
            ? {
                additions: (0, gitlab_utils_1.numberOrUndefined)(data.stats.additions),
                deletions: (0, gitlab_utils_1.numberOrUndefined)(data.stats.deletions),
                total: (0, gitlab_utils_1.numberOrUndefined)(data.stats.total),
            }
            : undefined;
        const commitDesc = [
            shortSha,
            committedAt && (0, relative_time_1.relativeTime)(committedAt),
            authorName,
        ].filter(Boolean).join(' · ');
        return {
            title: (0, integration_utils_1.stringOrUndefined)(data.title) ??
                (0, integration_utils_1.stringOrUndefined)(data.message)?.split('\n')[0] ??
                `Commit ${commitSha.slice(0, 8)}`,
            description: commitDesc,
            url,
            provider: 'gitlab',
            providerIcon: 'gitlab',
            author: authorName,
            authorAvatarUrl: undefined,
            metadata: {
                type: 'commit',
                sha,
                shortSha,
                project: projectPath,
                stats,
            },
        };
    }
    async unfurlIssuesList(accessToken, apiBaseUrl, projectPath, url) {
        const encodedProject = encodeURIComponent(projectPath);
        const data = await this.apiGet(accessToken, apiBaseUrl, `/projects/${encodedProject}?statistics=false`);
        return {
            title: `Issues · ${(0, integration_utils_1.stringOrUndefined)(data.name) ?? projectPath}`,
            description: projectPath,
            url,
            provider: 'gitlab',
            providerIcon: 'gitlab',
            author: (0, integration_utils_1.stringOrUndefined)(data.namespace?.name),
            authorAvatarUrl: (0, integration_utils_1.stringOrUndefined)(data.avatar_url) ??
                (0, integration_utils_1.stringOrUndefined)(data.namespace?.avatar_url),
            metadata: {
                type: 'issues-list',
                project: projectPath,
                openIssuesCount: (0, gitlab_utils_1.numberOrUndefined)(data.open_issues_count),
            },
        };
    }
    async unfurlMergesList(accessToken, apiBaseUrl, projectPath, url) {
        const encodedProject = encodeURIComponent(projectPath);
        const data = await this.apiGet(accessToken, apiBaseUrl, `/projects/${encodedProject}?statistics=false`);
        return {
            title: `Merge Requests · ${(0, integration_utils_1.stringOrUndefined)(data.name) ?? projectPath}`,
            description: projectPath,
            url,
            provider: 'gitlab',
            providerIcon: 'gitlab',
            author: (0, integration_utils_1.stringOrUndefined)(data.namespace?.name),
            authorAvatarUrl: (0, integration_utils_1.stringOrUndefined)(data.avatar_url) ??
                (0, integration_utils_1.stringOrUndefined)(data.namespace?.avatar_url),
            metadata: {
                type: 'merges-list',
                project: projectPath,
            },
        };
    }
    formatMrStatus(state, draft) {
        if (state === 'merged')
            return 'merged';
        if (draft)
            return 'draft';
        return state;
    }
    getMrStatusColor(state, draft) {
        if (state === 'merged')
            return 'violet';
        if (draft)
            return 'gray';
        if (state === 'opened')
            return 'green';
        if (state === 'closed')
            return 'red';
        return 'gray';
    }
    async apiGet(accessToken, apiBaseUrl, path) {
        const response = await (0, provider_fetch_1.providerApiFetch)('GitLab', `${apiBaseUrl}${path}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
        });
        const body = await response.json();
        if (!body || typeof body !== 'object' || Array.isArray(body)) {
            throw new integration_provider_interface_1.ProviderApiError('GitLab', 502, 'malformed response');
        }
        return body;
    }
};
exports.GitLabService = GitLabService;
exports.GitLabService = GitLabService = __decorate([
    (0, common_1.Injectable)()
], GitLabService);
//# sourceMappingURL=gitlab.service.js.map