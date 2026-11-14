"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var AzureDevOpsService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureDevOpsService = void 0;
const common_1 = require("@nestjs/common");
const integration_provider_interface_1 = require("../../../../core/integration/registry/integration-provider.interface");
const provider_fetch_1 = require("../../../../core/integration/utils/provider-fetch");
const relative_time_1 = require("../../../../core/integration/utils/relative-time");
const integration_utils_1 = require("../../../../core/integration/utils/integration.utils");
const azure_devops_utils_1 = require("./azure-devops.utils");
const PROVIDER = 'azure_devops';
const PROVIDER_NAME = 'Azure DevOps';
const API_ORIGIN = 'https://dev.azure.com';
const API_VERSION = '7.1';
const PROFILE_API = 'https://app.vssps.visualstudio.com/_apis/profile/profiles';
const WORK_ITEM_FIELDS = [
    'System.Title',
    'System.State',
    'System.WorkItemType',
    'System.TeamProject',
    'System.AssignedTo',
    'System.ChangedDate',
    'System.Tags',
].join(',');
const STATE_CATEGORY_COLORS = new Map([
    ['Proposed', 'gray'],
    ['InProgress', 'blue'],
    ['Resolved', 'orange'],
    ['Completed', 'green'],
    ['Removed', 'gray'],
]);
const PULL_REQUEST_STATUS_COLORS = new Map([
    ['active', 'green'],
    ['draft', 'gray'],
    ['completed', 'violet'],
    ['abandoned', 'red'],
]);
const STATE_CACHE_TTL_MS = 10 * 60 * 1000;
const STATE_CACHE_MAX_ENTRIES = 500;
let AzureDevOpsService = AzureDevOpsService_1 = class AzureDevOpsService {
    constructor() {
        this.logger = new common_1.Logger(AzureDevOpsService_1.name);
        this.stateCategories = new Map();
    }
    async getAccount(accessToken) {
        const data = await this.fetchJson(accessToken, `${PROFILE_API}/me?api-version=${API_VERSION}`);
        return (0, integration_utils_1.toProviderAccount)({ id: data.id, displayName: data.displayName });
    }
    async unfurlWorkItem(accessToken, org, id, url) {
        const data = await this.apiGet(accessToken, org, `/_apis/wit/workitems/${id}?fields=${WORK_ITEM_FIELDS}`);
        const fields = data.fields ?? {};
        const workItemType = (0, integration_utils_1.stringOrUndefined)(fields['System.WorkItemType']);
        const project = (0, integration_utils_1.stringOrUndefined)(fields['System.TeamProject']);
        const state = (0, integration_utils_1.stringOrUndefined)(fields['System.State']);
        const assignee = (0, integration_utils_1.stringOrUndefined)(fields['System.AssignedTo']?.displayName);
        const changedDate = (0, integration_utils_1.stringOrUndefined)(fields['System.ChangedDate']);
        return {
            title: (0, integration_utils_1.stringOrUndefined)(fields['System.Title']) ?? `Work Item #${id}`,
            description: [
                workItemType,
                `#${id}`,
                changedDate && (0, relative_time_1.relativeTime)(changedDate),
                assignee,
            ]
                .filter(Boolean)
                .join(' · '),
            url,
            provider: PROVIDER,
            providerIcon: PROVIDER,
            status: state,
            statusColor: await this.resolveStateColor(accessToken, org, project, workItemType, state),
            author: assignee,
            metadata: {
                type: 'work-item',
                number: id,
                workItemType,
                org,
                project,
                tags: ((0, integration_utils_1.stringOrUndefined)(fields['System.Tags']) ?? '')
                    .split(';')
                    .map((tag) => tag.trim())
                    .filter(Boolean),
                updatedAt: changedDate,
            },
        };
    }
    async unfurlPullRequest(accessToken, org, id, url) {
        const data = await this.apiGet(accessToken, org, `/_apis/git/pullrequests/${id}`);
        const author = (0, integration_utils_1.stringOrUndefined)(data.createdBy?.displayName);
        const status = data.status === 'active' && data.isDraft
            ? 'draft'
            : (0, integration_utils_1.stringOrUndefined)(data.status);
        const changedDate = (0, integration_utils_1.stringOrUndefined)(data.closedDate) ??
            (0, integration_utils_1.stringOrUndefined)(data.creationDate);
        return {
            title: (0, integration_utils_1.stringOrUndefined)(data.title) ?? `Pull Request #${id}`,
            description: [`!${id}`, changedDate && (0, relative_time_1.relativeTime)(changedDate), author]
                .filter(Boolean)
                .join(' · '),
            url,
            provider: PROVIDER,
            providerIcon: PROVIDER,
            status,
            statusColor: PULL_REQUEST_STATUS_COLORS.get(status) ?? 'gray',
            author,
            metadata: {
                type: 'pr',
                number: id,
                org,
                project: (0, integration_utils_1.stringOrUndefined)(data.repository?.project?.name),
                repo: (0, integration_utils_1.stringOrUndefined)(data.repository?.name),
                sourceBranch: (0, azure_devops_utils_1.branchName)((0, integration_utils_1.stringOrUndefined)(data.sourceRefName)),
                targetBranch: (0, azure_devops_utils_1.branchName)((0, integration_utils_1.stringOrUndefined)(data.targetRefName)),
                draft: !!data.isDraft,
                labels: (Array.isArray(data.labels) ? data.labels : [])
                    .map((label) => label?.name)
                    .filter((name) => typeof name === 'string'),
            },
        };
    }
    async resolveStateColor(accessToken, org, project, workItemType, state) {
        if (!project || !workItemType || !state)
            return 'gray';
        if ([project, workItemType].some((name) => name === '.' || name === '..'))
            return 'gray';
        const projectSegment = encodeURIComponent(project);
        const typeSegment = encodeURIComponent(workItemType);
        const key = `${org}/${projectSegment}/${typeSegment}`.toLowerCase();
        let cached = this.stateCategories.get(key);
        if (!cached || cached.expiresAt <= Date.now()) {
            try {
                const data = await this.apiGet(accessToken, org, `/${projectSegment}/_apis/wit/workitemtypes/${typeSegment}/states`);
                const categories = new Map();
                for (const entry of data.value ?? []) {
                    if (typeof entry?.name === 'string' &&
                        typeof entry?.category === 'string') {
                        categories.set(entry.name, entry.category);
                    }
                }
                cached = { categories, expiresAt: Date.now() + STATE_CACHE_TTL_MS };
                this.stateCategories.delete(key);
                if (this.stateCategories.size >= STATE_CACHE_MAX_ENTRIES) {
                    const oldest = this.stateCategories.keys().next().value;
                    if (oldest !== undefined)
                        this.stateCategories.delete(oldest);
                }
                this.stateCategories.set(key, cached);
            }
            catch (err) {
                this.logger.debug(`State categories unavailable for ${key}: ${err.message}`);
                return 'gray';
            }
        }
        return STATE_CATEGORY_COLORS.get(cached.categories.get(state)) ?? 'gray';
    }
    async apiGet(accessToken, org, path) {
        const separator = path.includes('?') ? '&' : '?';
        const url = `${API_ORIGIN}/${encodeURIComponent(org)}${path}${separator}api-version=${API_VERSION}`;
        try {
            return await this.fetchJson(accessToken, url);
        }
        catch (err) {
            if (err instanceof integration_provider_interface_1.TokenInvalidError) {
                throw new integration_provider_interface_1.UnfurlForbiddenError(err.message);
            }
            throw err;
        }
    }
    async fetchJson(accessToken, url) {
        const response = await (0, provider_fetch_1.providerApiFetch)(PROVIDER_NAME, url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
                'X-TFS-FedAuthRedirect': 'Suppress',
            },
        });
        const contentType = response.headers.get('content-type') ?? '';
        if (response.status === 203 || !contentType.includes('json')) {
            throw new integration_provider_interface_1.ProviderApiError(PROVIDER_NAME, 502, 'non-JSON response');
        }
        return response.json();
    }
};
exports.AzureDevOpsService = AzureDevOpsService;
exports.AzureDevOpsService = AzureDevOpsService = AzureDevOpsService_1 = __decorate([
    (0, common_1.Injectable)()
], AzureDevOpsService);
//# sourceMappingURL=azure-devops.service.js.map