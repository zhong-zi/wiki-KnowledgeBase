"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPageUnfurlBlocks = buildPageUnfurlBlocks;
function buildPageUnfurlBlocks(args) {
    const iconPrefix = args.icon ? `${args.icon} ` : '';
    return [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `*<${args.pageUrl}|${iconPrefix}${escapeForMrkdwn(args.title)}>*`,
            },
        },
        {
            type: 'context',
            elements: [
                {
                    type: 'mrkdwn',
                    text: `*${escapeForMrkdwn(args.spaceName)}* · Updated ${relativeTime(args.updatedAt)} · by ${escapeForMrkdwn(args.authorName)}`,
                },
            ],
        },
    ];
}
function escapeForMrkdwn(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
function relativeTime(date) {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60)
        return 'just now';
    const mins = Math.floor(seconds / 60);
    if (mins < 60)
        return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24)
        return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
}
//# sourceMappingURL=unfurl.blocks.js.map