"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildAiAnswerBlocks = buildAiAnswerBlocks;
const slack_utils_1 = require("../slack.utils");
function buildAiAnswerBlocks(args) {
    const blocks = [];
    blocks.push({
        type: 'context',
        elements: [
            { type: 'mrkdwn', text: `_:mag: ${(0, slack_utils_1.truncate)(args.question, 280)}_` },
        ],
    });
    for (const chunk of splitForSection(args.answer)) {
        blocks.push({
            type: 'section',
            text: { type: 'mrkdwn', text: chunk },
        });
    }
    if (args.sources.length > 0) {
        const links = args.sources
            .slice(0, 5)
            .map((s) => `<${args.appUrl}/s/${s.spaceSlug}/p/${s.slugId}|${escapeLink(s.title || 'Untitled')}>`)
            .join(' • ');
        blocks.push({
            type: 'context',
            elements: [{ type: 'mrkdwn', text: `:books: Sources: ${links}` }],
        });
    }
    return blocks;
}
const SECTION_TEXT_LIMIT = 2900;
function splitForSection(text) {
    if (text.length <= SECTION_TEXT_LIMIT)
        return [text];
    const out = [];
    let i = 0;
    while (i < text.length) {
        out.push(text.slice(i, i + SECTION_TEXT_LIMIT));
        i += SECTION_TEXT_LIMIT;
    }
    return out;
}
function escapeLink(text) {
    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/\|/g, '&#124;');
}
//# sourceMappingURL=ai-answer.blocks.js.map