"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.parseDocmostPageUrl = parseDocmostPageUrl;
function parseDocmostPageUrl(rawUrl, acceptedHosts) {
    let url;
    try {
        url = new URL(rawUrl);
    }
    catch {
        return null;
    }
    if (!acceptedHosts.has(url.host))
        return null;
    const match = url.pathname.match(/^\/s\/([^/]+)\/p\/(.+)$/);
    if (!match)
        return null;
    const spaceSlug = match[1];
    const tail = match[2];
    const lastDash = tail.lastIndexOf('-');
    if (lastDash === -1)
        return null;
    const slugId = tail.slice(lastDash + 1);
    if (!slugId)
        return null;
    return { slugId, spaceSlug };
}
//# sourceMappingURL=slack-url.parser.js.map