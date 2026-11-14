"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postToResponseUrl = postToResponseUrl;
exports.sleep = sleep;
exports.truncate = truncate;
exports.parseSubcommand = parseSubcommand;
exports.modalContentKeyPrefix = modalContentKeyPrefix;
exports.optionText = optionText;
exports.applyMetadataPrefix = applyMetadataPrefix;
exports.extractCommentText = extractCommentText;
const proxy_fetch_1 = require("../../../../common/proxy-fetch");
const collaboration_util_1 = require("../../../../collaboration/collaboration.util");
const slack_mrkdwn_to_md_1 = require("./content/slack-mrkdwn-to-md");
const slack_timestamp_1 = require("./content/slack-timestamp");
const MODAL_CONTENT_KEY_PREFIX = 'slack:modal:';
const OPTION_TEXT_MAX = 75;
async function postToResponseUrl(responseUrl, body) {
    await (0, proxy_fetch_1.proxyFetch)(responseUrl, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(10_000),
    });
}
function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}
function truncate(s, max) {
    return s.length > max ? s.slice(0, max - 1) + '…' : s;
}
function parseSubcommand(text) {
    const trimmed = (text ?? '').trim();
    if (trimmed === '')
        return 'help';
    const first = trimmed.split(/\s+/)[0];
    return first.toLowerCase();
}
function modalContentKeyPrefix(integrationId) {
    return `${MODAL_CONTENT_KEY_PREFIX}${integrationId}:`;
}
function optionText(value) {
    const text = (value ?? '').replace(/\s+/g, ' ').trim();
    return Array.from(text).slice(0, OPTION_TEXT_MAX).join('');
}
function applyMetadataPrefix(markdown, metadata, selected) {
    const parts = [];
    if (selected.includes('sender') && metadata.sender) {
        parts.push(`From @${(0, slack_mrkdwn_to_md_1.escapeMarkdownInline)(metadata.sender)}`);
    }
    if (selected.includes('channel') && metadata.channelName) {
        parts.push(`in #${(0, slack_mrkdwn_to_md_1.escapeMarkdownInline)(metadata.channelName)}`);
    }
    if (selected.includes('timestamp')) {
        const when = (0, slack_timestamp_1.formatSlackTimestamp)(metadata.timestamp);
        if (when)
            parts.push(`· ${(0, slack_mrkdwn_to_md_1.escapeMarkdownInline)(when)}`);
    }
    if (parts.length === 0)
        return markdown;
    return `*${parts.join(' ')}*\n\n${markdown}`;
}
function extractCommentText(content) {
    if (!content)
        return null;
    try {
        const text = (0, collaboration_util_1.jsonToText)(content).trim();
        if (!text)
            return null;
        const chars = Array.from(text);
        return chars.length > 300 ? `${chars.slice(0, 300).join('')}…` : text;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=slack.utils.js.map