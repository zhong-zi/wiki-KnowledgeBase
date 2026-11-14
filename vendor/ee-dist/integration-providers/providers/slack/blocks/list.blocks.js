"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildListBlocks = buildListBlocks;
function buildListBlocks(args) {
    if (args.items.length === 0) {
        return [
            { type: 'section', text: { type: 'mrkdwn', text: `*${args.heading}*` } },
            { type: 'section', text: { type: 'mrkdwn', text: args.emptyText } },
        ];
    }
    const lines = args.items.map((it) => {
        const space = it.spaceName ? ` _${escape(it.spaceName)}_` : '';
        const sub = it.subtitle ? `\n     ${escape(it.subtitle)}` : '';
        return `• <${it.url}|${escape(it.title)}>${space}${sub}`;
    });
    return [
        { type: 'section', text: { type: 'mrkdwn', text: `*${args.heading}*` } },
        { type: 'section', text: { type: 'mrkdwn', text: lines.join('\n') } },
    ];
}
function escape(s) {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
//# sourceMappingURL=list.blocks.js.map