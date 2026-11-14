"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SLACK_NOTIFY_TYPES = void 0;
exports.buildNotificationDm = buildNotificationDm;
exports.buildNotifyOnBlocks = buildNotifyOnBlocks;
const slack_page_link_1 = require("../content/slack-page-link");
const notification_constants_1 = require("../../../../../core/notification/notification.constants");
const SENTENCES = new Map([
    [
        notification_constants_1.NotificationType.COMMENT_USER_MENTION,
        (a, p) => `:speech_balloon: ${a} mentioned you in a comment on ${p}`,
    ],
    [
        notification_constants_1.NotificationType.COMMENT_CREATED,
        (a, p) => `:speech_balloon: ${a} commented on ${p}`,
    ],
    [
        notification_constants_1.NotificationType.COMMENT_RESOLVED,
        (a, p) => `:white_check_mark: ${a} resolved a comment on ${p}`,
    ],
    [
        notification_constants_1.NotificationType.PAGE_USER_MENTION,
        (a, p) => `:memo: ${a} mentioned you on ${p}`,
    ],
    [notification_constants_1.NotificationType.PAGE_UPDATED, (a, p) => `:pencil2: ${a} edited ${p}`],
    [
        notification_constants_1.NotificationType.PAGE_VERIFICATION_EXPIRING,
        (_, p) => `:hourglass_flowing_sand: ${p} needs to be re-verified soon`,
    ],
    [
        notification_constants_1.NotificationType.PAGE_VERIFICATION_EXPIRED,
        (_, p) => `:hourglass: Verification for ${p} has expired`,
    ],
    [
        notification_constants_1.NotificationType.PAGE_VERIFIED,
        (a, p) => `:white_check_mark: ${a} verified ${p}`,
    ],
    [
        notification_constants_1.NotificationType.PAGE_APPROVAL_REQUESTED,
        (a, p) => `:raised_hand: ${a} requested your approval on ${p}`,
    ],
    [
        notification_constants_1.NotificationType.PAGE_APPROVAL_REJECTED,
        (a, p) => `:leftwards_arrow_with_hook: ${a} returned ${p} for revision`,
    ],
]);
exports.SLACK_NOTIFY_TYPES = new Set(SENTENCES.keys());
function buildNotificationDm(args) {
    const sentence = SENTENCES.get(args.type);
    if (!sentence)
        return null;
    const actor = `*${(0, slack_page_link_1.mrkdwnEscape)(args.actorName)}*`;
    const page = args.pageUrl
        ? (0, slack_page_link_1.slackLink)(args.pageUrl, args.pageTitle)
        : `*${(0, slack_page_link_1.mrkdwnEscape)(args.pageTitle)}*`;
    const sectionText = args.commentQuote
        ? `${sentence(actor, page)}\n${quoteLines(args.commentQuote)}`
        : sentence(actor, page);
    const actionElements = args.replyCommentId
        ? [replyButton(args.replyCommentId), turnOffButton()]
        : [turnOffButton()];
    return {
        text: sentence((0, slack_page_link_1.mrkdwnEscape)(args.actorName), (0, slack_page_link_1.mrkdwnEscape)(args.pageTitle)),
        blocks: [
            { type: 'section', text: { type: 'mrkdwn', text: sectionText } },
            { type: 'actions', elements: actionElements },
        ],
    };
}
function quoteLines(quote) {
    return (0, slack_page_link_1.mrkdwnEscape)(quote)
        .split('\n')
        .map((line) => `> ${line}`)
        .join('\n');
}
function buildNotifyOnBlocks() {
    return [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: ":bell: Slack notifications are *on*. I'll DM you when:",
            },
        },
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: [
                    '• Someone mentions you in a comment or replies in your thread',
                    '• Someone comments on a page you watch',
                    '• Someone mentions you on a page',
                    '• Your comment is resolved',
                    '• A page you watch is edited',
                    '• A page you verify needs re-verification soon',
                    '• Verification for a page you verify has expired',
                    '• A page you verify is verified',
                    '• Someone requests your verification approval',
                    '• Your verification request is returned for revision',
                ].join('\n'),
            },
        },
        { type: 'actions', elements: [turnOffButton()] },
    ];
}
function turnOffButton() {
    return {
        type: 'button',
        text: { type: 'plain_text', text: 'Turn off notifications' },
        action_id: 'notify_turn_off',
    };
}
function replyButton(commentId) {
    return {
        type: 'button',
        text: { type: 'plain_text', text: 'Reply' },
        style: 'primary',
        action_id: 'notify_comment_reply',
        value: commentId,
    };
}
//# sourceMappingURL=notification.blocks.js.map