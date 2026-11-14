"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildLinkPromptBlocks = buildLinkPromptBlocks;
const connect_url_1 = require("./connect-url");
function buildLinkPromptBlocks({ appUrl, slackUserName, }) {
    const linkUrl = (0, connect_url_1.buildConnectUrl)(appUrl);
    return [
        {
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: `Hi *${slackUserName}*, connect your Docmost account to use this feature.`,
            },
        },
        {
            type: 'actions',
            elements: [
                {
                    type: 'button',
                    text: { type: 'plain_text', text: 'Connect Docmost' },
                    action_id: 'connect_docmost_link',
                    url: linkUrl,
                    style: 'primary',
                },
            ],
        },
        {
            type: 'context',
            elements: [
                { type: 'mrkdwn', text: 'You will be asked to sign in to Docmost in your browser.' },
            ],
        },
    ];
}
//# sourceMappingURL=link-prompt.blocks.js.map