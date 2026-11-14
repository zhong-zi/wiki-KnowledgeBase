"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildHomeView = buildHomeView;
const connect_url_1 = require("./connect-url");
function buildHomeView(args) {
    const blocks = [];
    if (args.isLinked) {
        const greeting = args.displayName
            ? `:wave: Welcome, *${escape(args.displayName)}*`
            : ':wave: Welcome to Docmost';
        blocks.push({ type: 'section', text: { type: 'mrkdwn', text: greeting } });
        blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: 'Create new pages and search your workspace without leaving Slack.',
            },
        });
        blocks.push({
            type: 'actions',
            elements: [
                {
                    type: 'button',
                    text: { type: 'plain_text', text: ':page_facing_up: Create Document' },
                    action_id: 'home_create_doc',
                    style: 'primary',
                },
                {
                    type: 'button',
                    text: { type: 'plain_text', text: ':mag: Search Docs' },
                    action_id: 'home_search',
                },
            ],
        });
    }
    else {
        blocks.push({
            type: 'section',
            text: { type: 'mrkdwn', text: ':wave: *Welcome to Docmost*' },
        });
        blocks.push({
            type: 'section',
            text: {
                type: 'mrkdwn',
                text: 'Connect your Docmost account to create pages and search your workspace from Slack.',
            },
        });
        blocks.push({
            type: 'actions',
            elements: [
                {
                    type: 'button',
                    text: { type: 'plain_text', text: 'Connect Docmost' },
                    action_id: 'connect_docmost_link',
                    url: (0, connect_url_1.buildConnectUrl)(args.appUrl),
                    style: 'primary',
                },
            ],
        });
    }
    return { type: 'home', blocks };
}
function escape(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
//# sourceMappingURL=home.blocks.js.map