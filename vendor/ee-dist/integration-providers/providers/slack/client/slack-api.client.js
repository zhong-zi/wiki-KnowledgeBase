"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackApiClient = exports.SlackApiError = void 0;
const proxy_fetch_1 = require("../../../../../common/proxy-fetch");
const slack_utils_1 = require("../slack.utils");
const SLACK_API_BASE = 'https://slack.com/api';
class SlackApiError extends Error {
    constructor(code, endpoint, httpStatus, details = []) {
        super(details.length
            ? `Slack API ${endpoint} failed: ${code}: ${details.join('; ')}`
            : `Slack API ${endpoint} failed: ${code}`);
        this.code = code;
        this.endpoint = endpoint;
        this.httpStatus = httpStatus;
        this.details = details;
        this.name = 'SlackApiError';
    }
}
exports.SlackApiError = SlackApiError;
class SlackApiClient {
    constructor(botToken) {
        this.botToken = botToken;
    }
    withToken(token) {
        return new SlackApiClient(token);
    }
    async call(endpoint, body, options = {}) {
        if (!this.botToken) {
            throw new SlackApiError('missing_token', endpoint);
        }
        const retries = options.retries ?? 1;
        let attempt = 0;
        const form = new URLSearchParams();
        for (const [key, value] of Object.entries(body)) {
            if (value === undefined || value === null)
                continue;
            form.append(key, typeof value === 'object' ? JSON.stringify(value) : String(value));
        }
        while (attempt <= retries) {
            attempt++;
            const res = await (0, proxy_fetch_1.proxyFetch)(`${SLACK_API_BASE}/${endpoint}`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/x-www-form-urlencoded; charset=utf-8',
                    authorization: `Bearer ${this.botToken}`,
                },
                body: form.toString(),
                signal: AbortSignal.timeout(10_000),
            });
            if (res.status === 429) {
                if (attempt <= retries) {
                    const retryAfter = Number(res.headers.get('retry-after') ?? '1');
                    await (0, slack_utils_1.sleep)(retryAfter * 1000);
                    continue;
                }
                throw new SlackApiError('rate_limited', endpoint, 429);
            }
            if (res.status >= 500) {
                if (attempt <= retries) {
                    await (0, slack_utils_1.sleep)(500 * attempt);
                    continue;
                }
                throw new SlackApiError('http_error', endpoint, res.status);
            }
            const json = (await res.json().catch(() => ({})));
            if (!('ok' in json)) {
                throw new SlackApiError('invalid_response', endpoint, res.status);
            }
            if (json.ok === false) {
                throw new SlackApiError(json.error, endpoint, res.status, json.response_metadata?.messages ?? []);
            }
            return json;
        }
        throw new SlackApiError('exhausted_retries', endpoint);
    }
    chatPostMessage(body) {
        return this.call('chat.postMessage', body);
    }
    chatPostEphemeral(body) {
        return this.call('chat.postEphemeral', body);
    }
    chatUnfurl(body) {
        return this.call('chat.unfurl', body);
    }
    conversationsHistory(body) {
        return this.call('conversations.history', body);
    }
    conversationsReplies(body) {
        return this.call('conversations.replies', body);
    }
    conversationsInfo(body) {
        return this.call('conversations.info', body);
    }
    conversationsList(body) {
        return this.call('conversations.list', body);
    }
    conversationsOpen(body) {
        return this.call('conversations.open', body);
    }
    conversationsMembers(body) {
        return this.call('conversations.members', body);
    }
    usersInfo(body) {
        return this.call('users.info', body);
    }
    openIdUserInfo() {
        return this.call('openid.connect.userInfo', {});
    }
    async getUserDisplayName(userId) {
        try {
            const res = await this.usersInfo({ user: userId });
            if (!('user' in res))
                return undefined;
            const u = res.user;
            return u.real_name || u.profile?.display_name || u.name || undefined;
        }
        catch {
            return undefined;
        }
    }
    viewsOpen(body) {
        return this.call('views.open', body);
    }
    viewsUpdate(body) {
        return this.call('views.update', body);
    }
    viewsPublish(body) {
        return this.call('views.publish', body);
    }
}
exports.SlackApiClient = SlackApiClient;
//# sourceMappingURL=slack-api.client.js.map