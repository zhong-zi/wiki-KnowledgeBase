"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPageUrl = buildPageUrl;
exports.mrkdwnEscape = mrkdwnEscape;
exports.slackLink = slackLink;
function buildPageUrl(appUrl, spaceSlug, pageSlugId) {
    if (!spaceSlug || !pageSlugId)
        return null;
    return `${appUrl}/s/${spaceSlug}/p/${pageSlugId}`;
}
function mrkdwnEscape(text) {
    return (text || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}
function slackLink(url, text) {
    const safe = mrkdwnEscape(text).replace(/\|/g, '&#124;');
    return `<${url}|${safe}>`;
}
//# sourceMappingURL=slack-page-link.js.map