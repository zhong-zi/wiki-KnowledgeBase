"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildHelpBlocks = buildHelpBlocks;
const connect_url_1 = require("./connect-url");
function buildHelpBlocks({ isLinked, appUrl }) {
    const commandLines = [
        '`/docmost search <query>`  Search page titles',
        '`/docmost ask <question>`  Ask AI to answer from your workspace docs',
        '`/docmost recent`          Recently updated pages',
        '`/docmost favorites`       Your favorite pages',
        '`/docmost notify`          Get your Docmost notifications as Slack DMs',
        '`/docmost help`            Show this help',
    ];
    const actionElement = isLinked
        ? {
            type: 'button',
            text: { type: 'plain_text', text: 'Disconnect Docmost' },
            action_id: 'disconnect_docmost',
            style: 'danger',
        }
        : {
            type: 'button',
            text: { type: 'plain_text', text: 'Connect Docmost' },
            action_id: 'connect_docmost_link',
            url: (0, connect_url_1.buildConnectUrl)(appUrl),
            style: 'primary',
        };
    return [
        { type: 'section', text: { type: 'mrkdwn', text: '*Docmost for Slack*' } },
        { type: 'section', text: { type: 'mrkdwn', text: commandLines.join('\n') } },
        { type: 'actions', elements: [actionElement] },
    ];
}
//# sourceMappingURL=help.blocks.js.map