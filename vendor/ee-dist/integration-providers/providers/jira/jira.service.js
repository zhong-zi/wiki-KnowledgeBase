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
exports.JiraService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_ioredis_1 = require("@nestjs-labs/nestjs-ioredis");
const crypto_1 = require("crypto");
const cheerio_1 = require("cheerio");
const integration_provider_interface_1 = require("../../../../core/integration/registry/integration-provider.interface");
const provider_fetch_1 = require("../../../../core/integration/utils/provider-fetch");
const integration_utils_1 = require("../../../../core/integration/utils/integration.utils");
const ACCESSIBLE_RESOURCES_URL = 'https://api.atlassian.com/oauth/token/accessible-resources';
const ACCESSIBLE_RESOURCES_PROVIDER = 'Jira accessible-resources';
const RESOURCES_CACHE_PREFIX = 'jira:resources:';
const RESOURCES_CACHE_TTL_SECONDS = 600;
const ISSUE_FIELDS = [
    'summary',
    'description',
    'status',
    'assignee',
    'issuetype',
    'priority',
    'labels',
    'reporter',
    'updated',
    'created',
].join(',');
let JiraService = class JiraService {
    constructor(redisService) {
        this.redisService = redisService;
        this.redis = this.redisService.getOrThrow();
    }
    async getAccount(accessToken, dataCenterBaseUrl) {
        if (dataCenterBaseUrl) {
            const data = await this.apiGet(accessToken, dataCenterBaseUrl, '/rest/api/2/myself');
            return (0, integration_utils_1.toProviderAccount)({
                id: data.key,
                displayName: data.displayName,
                username: data.name,
            });
        }
        const [site] = await this.getAccessibleResources(accessToken);
        if (!site) {
            throw new integration_provider_interface_1.ProviderApiError('Jira', 502, 'no accessible Jira site');
        }
        const data = await this.apiGet(accessToken, `https://api.atlassian.com/ex/jira/${site.id}`, '/rest/api/3/myself');
        return (0, integration_utils_1.toProviderAccount)({
            id: data.accountId,
            displayName: data.displayName,
        });
    }
    async unfurlIssue(accessToken, host, issueKey, url) {
        const apiBase = await this.resolveApiBase(accessToken, host);
        const isCloud = this.isCloudHost(host);
        const data = await this.apiGet(accessToken, apiBase, isCloud
            ? `/rest/api/3/issue/${issueKey}?fields=${ISSUE_FIELDS}`
            : `/rest/api/2/issue/${issueKey}?fields=${ISSUE_FIELDS}&expand=renderedFields`);
        const fields = data.fields ?? {};
        const statusName = fields.status?.name;
        const statusCategory = fields.status?.statusCategory?.key;
        return {
            title: fields.summary ?? issueKey,
            description: isCloud
                ? this.extractDescription(fields.description)
                : this.extractRenderedDescription(data.renderedFields?.description),
            url,
            provider: 'jira',
            providerIcon: 'jira',
            status: statusName,
            statusColor: this.getStatusColor(statusCategory),
            author: fields.assignee?.displayName,
            authorAvatarUrl: fields.assignee?.avatarUrls?.['48x48'],
            metadata: {
                type: 'issue',
                issueKey,
                issueType: fields.issuetype?.name,
                issueTypeIconUrl: fields.issuetype?.iconUrl,
                priority: fields.priority?.name,
                labels: fields.labels ?? [],
                reporter: fields.reporter?.displayName,
                updatedAt: fields.updated ?? fields.created,
            },
        };
    }
    extractDescription(description) {
        if (!description)
            return undefined;
        if (typeof description === 'string') {
            return description.slice(0, 200);
        }
        if (description.content) {
            const texts = [];
            for (const block of description.content) {
                if (block.type === 'paragraph' && block.content) {
                    for (const inline of block.content) {
                        if (inline.type === 'text' && inline.text) {
                            texts.push(inline.text);
                        }
                    }
                }
                if (texts.join(' ').length > 200)
                    break;
            }
            const joined = texts.join(' ');
            return joined.length > 0 ? joined.slice(0, 200) : undefined;
        }
        return undefined;
    }
    extractRenderedDescription(html) {
        if (typeof html !== 'string')
            return undefined;
        const $ = (0, cheerio_1.load)(html, null, false);
        $('script, style').remove();
        const text = $.text().replace(/\s+/g, ' ').trim();
        return text.length > 0 ? text.slice(0, 200) : undefined;
    }
    getStatusColor(statusCategory) {
        switch (statusCategory) {
            case 'new':
                return 'blue';
            case 'indeterminate':
                return 'yellow';
            case 'done':
                return 'green';
            default:
                return 'gray';
        }
    }
    isCloudHost(host) {
        const { hostname } = new URL(host);
        return (hostname.endsWith('.atlassian.net') || hostname.endsWith('.jira.com'));
    }
    async resolveApiBase(accessToken, host) {
        if (!this.isCloudHost(host)) {
            return host.replace(/\/+$/, '');
        }
        const site = new URL(host);
        site.protocol = 'https:';
        const cloudId = await this.resolveCloudId(accessToken, site.origin);
        return `https://api.atlassian.com/ex/jira/${cloudId}`;
    }
    async resolveCloudId(accessToken, origin) {
        const resources = await this.getAccessibleResources(accessToken);
        const site = resources.find((resource) => {
            try {
                return new URL(resource.url).origin === origin;
            }
            catch {
                return false;
            }
        });
        if (!site) {
            throw new integration_provider_interface_1.UnfurlForbiddenError(`Jira site ${origin} is not accessible with this connection`);
        }
        return site.id;
    }
    async getAccessibleResources(accessToken) {
        const digest = (0, crypto_1.createHash)('sha256').update(accessToken).digest('hex');
        const cacheKey = `${RESOURCES_CACHE_PREFIX}${digest}`;
        const cached = await this.redis.get(cacheKey);
        if (cached !== null)
            return JSON.parse(cached);
        const response = await (0, provider_fetch_1.providerApiFetch)(ACCESSIBLE_RESOURCES_PROVIDER, ACCESSIBLE_RESOURCES_URL, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
        });
        const body = await response.json();
        if (!Array.isArray(body)) {
            throw new integration_provider_interface_1.ProviderApiError(ACCESSIBLE_RESOURCES_PROVIDER, 502, 'malformed response');
        }
        const resources = body
            .filter((entry) => typeof entry?.id === 'string' && typeof entry?.url === 'string')
            .map((entry) => ({ id: entry.id, url: entry.url }));
        await this.redis.set(cacheKey, JSON.stringify(resources), 'EX', RESOURCES_CACHE_TTL_SECONDS);
        return resources;
    }
    async apiGet(accessToken, host, path) {
        const response = await (0, provider_fetch_1.providerApiFetch)('Jira', `${host}${path}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
        });
        return response.json();
    }
};
exports.JiraService = JiraService;
exports.JiraService = JiraService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [nestjs_ioredis_1.RedisService])
], JiraService);
//# sourceMappingURL=jira.service.js.map