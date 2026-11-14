"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SlackUnfurlService = void 0;
const common_1 = require("@nestjs/common");
const integration_provider_interface_1 = require("../../../../../core/integration/registry/integration-provider.interface");
const slack_api_client_1 = require("../client/slack-api.client");
const relative_time_1 = require("../../../../../core/integration/utils/relative-time");
const MAX_MENTION_LOOKUPS = 5;
const MAX_TEXT_LENGTH = 4000;
const MAX_MEMBER_PAGES = 10;
let SlackUnfurlService = class SlackUnfurlService {
    async assertCanViewChannel(botToken, channelId, slackUserId) {
        const api = new slack_api_client_1.SlackApiClient(botToken);
        const info = await api.conversationsInfo({ channel: channelId });
        if (!('channel' in info))
            throw new integration_provider_interface_1.UnfurlForbiddenError();
        const channel = info.channel;
        if (!channel.is_private && !channel.is_im && !channel.is_mpim)
            return;
        let cursor;
        for (let page = 0; page < MAX_MEMBER_PAGES; page++) {
            const res = await api.conversationsMembers({
                channel: channelId,
                limit: 200,
                cursor,
            });
            if (!('members' in res))
                break;
            if (res.members.includes(slackUserId))
                return;
            cursor = res.response_metadata?.next_cursor || undefined;
            if (!cursor)
                break;
        }
        throw new integration_provider_interface_1.UnfurlForbiddenError();
    }
    async unfurlMessage(botToken, channelId, rawTs, threadTs, teamName, url) {
        const api = new slack_api_client_1.SlackApiClient(botToken);
        const ts = this.permalinkTsToMessageTs(rawTs);
        const message = await this.fetchMessage(api, channelId, ts, threadTs);
        if (!message) {
            throw new Error(`Slack message ${ts} not found in ${channelId}`);
        }
        const [channelLabel, author] = await Promise.all([
            this.resolveChannelLabel(api, channelId),
            this.resolveAuthor(api, message),
        ]);
        const text = await this.cleanText(api, message.text ?? '');
        const postedAt = new Date(parseFloat(message.ts) * 1000).toISOString();
        return {
            title: `${author.name} · ${(0, relative_time_1.relativeTime)(postedAt)}`,
            description: text || undefined,
            url,
            provider: 'slack',
            providerIcon: 'slack',
            status: channelLabel,
            author: author.name,
            authorAvatarUrl: author.avatarUrl,
            metadata: {
                type: 'message',
                channelId,
                ts: message.ts,
                replyCount: message.reply_count,
                teamName,
            },
        };
    }
    async unfurlChannel(botToken, channelId, teamName, url) {
        const api = new slack_api_client_1.SlackApiClient(botToken);
        const info = await api.conversationsInfo({ channel: channelId });
        if (!('channel' in info)) {
            throw new Error(`Slack channel ${channelId} not found`);
        }
        const channel = info.channel;
        const description = channel.purpose?.value || channel.topic?.value || teamName;
        return {
            title: channel.is_im ? 'Direct message' : `#${channel.name}`,
            description: description || undefined,
            url,
            provider: 'slack',
            providerIcon: 'slack',
            status: channel.is_private ? 'private' : undefined,
            metadata: {
                type: 'channel',
                channelId,
                memberCount: channel.num_members,
                teamName,
            },
        };
    }
    permalinkTsToMessageTs(rawTs) {
        if (rawTs.length <= 6)
            return rawTs;
        return `${rawTs.slice(0, rawTs.length - 6)}.${rawTs.slice(-6)}`;
    }
    async fetchMessage(api, channel, ts, threadTs) {
        if (threadTs && threadTs !== ts) {
            const replies = await api.conversationsReplies({
                channel,
                ts: threadTs,
                latest: ts,
                inclusive: true,
                limit: 1,
            });
            const message = 'messages' in replies
                ? replies.messages?.find((m) => m.ts === ts)
                : undefined;
            if (message)
                return message;
        }
        const history = await api.conversationsHistory({
            channel,
            latest: ts,
            inclusive: true,
            limit: 1,
        });
        const message = 'messages' in history ? history.messages?.[0] : undefined;
        if (message?.ts === ts)
            return message;
        const replies = await api.conversationsReplies({
            channel,
            ts,
            inclusive: true,
            limit: 1,
        });
        if (!('messages' in replies))
            return null;
        return replies.messages?.find((m) => m.ts === ts) ?? null;
    }
    async resolveAuthor(api, message) {
        if (!message.user) {
            return { name: message.username || 'App' };
        }
        try {
            const res = await api.usersInfo({ user: message.user });
            if (!('user' in res))
                return { name: 'Unknown user' };
            return {
                name: res.user.profile?.display_name ||
                    res.user.real_name ||
                    res.user.name,
                avatarUrl: res.user.profile?.image_72,
            };
        }
        catch {
            return { name: 'Unknown user' };
        }
    }
    async resolveChannelLabel(api, channelId) {
        try {
            const info = await api.conversationsInfo({ channel: channelId });
            if (!('channel' in info))
                return undefined;
            if (info.channel.is_im)
                return 'DM';
            return info.channel.name ? `#${info.channel.name}` : undefined;
        }
        catch {
            return undefined;
        }
    }
    async cleanText(api, raw) {
        const mentionIds = [
            ...new Set([...raw.matchAll(/<@([A-Z0-9]+)(?:\|[^>]*)?>/g)].map((m) => m[1])),
        ].slice(0, MAX_MENTION_LOOKUPS);
        const names = new Map();
        await Promise.all(mentionIds.map(async (id) => {
            try {
                const res = await api.usersInfo({ user: id });
                if (!('user' in res))
                    return;
                names.set(id, res.user.profile?.display_name ||
                    res.user.real_name ||
                    res.user.name);
            }
            catch {
            }
        }));
        const text = raw
            .replace(/<@([A-Z0-9]+)\|([^>]*)>/g, (_, id, label) => `@${names.get(id) || label || 'user'}`)
            .replace(/<@([A-Z0-9]+)>/g, (_, id) => `@${names.get(id) || 'user'}`)
            .replace(/<#[A-Z0-9]+\|([^>]*)>/g, '#$1')
            .replace(/<!([^|>]+)(?:\|([^>]*))?>/g, (_, cmd, label) => `@${label || cmd}`)
            .replace(/<(https?:\/\/[^|>]+)\|([^>]*)>/g, '$2')
            .replace(/<(https?:\/\/[^>]+)>/g, '$1')
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&')
            .replace(/[^\S\n]+/g, ' ')
            .replace(/ ?\n ?/g, '\n')
            .replace(/\n{3,}/g, '\n\n')
            .trim();
        return text.length > MAX_TEXT_LENGTH
            ? `${text.slice(0, MAX_TEXT_LENGTH)}…`
            : text;
    }
};
exports.SlackUnfurlService = SlackUnfurlService;
exports.SlackUnfurlService = SlackUnfurlService = __decorate([
    (0, common_1.Injectable)()
], SlackUnfurlService);
//# sourceMappingURL=slack-unfurl.service.js.map