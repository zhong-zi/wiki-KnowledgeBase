"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MAX_TITLE_LENGTH = void 0;
exports.markdownToPlainTitle = markdownToPlainTitle;
exports.MAX_TITLE_LENGTH = 65;
function markdownToPlainTitle(markdown, maxLength = exports.MAX_TITLE_LENGTH) {
    for (const rawLine of (markdown ?? '').split('\n')) {
        const line = stripInline(stripBlockMarkers(rawLine)).replace(/\s+/g, ' ').trim();
        if (line)
            return Array.from(line).slice(0, maxLength).join('');
    }
    return '';
}
function stripBlockMarkers(line) {
    return line
        .replace(/^\s*```.*$/, '')
        .replace(/^\s*#{1,6}\s+/, '')
        .replace(/^\s*>\s?/, '')
        .replace(/^\s*(?:[-*+]|\d+\.)\s+/, '');
}
function stripInline(line) {
    return line
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/<((?:https?|mailto):[^>\s]+)>/g, '$1')
        .replace(/(\*\*|__)(.+?)\1/g, '$2')
        .replace(/~~(.+?)~~/g, '$1')
        .replace(/`([^`]*)`/g, '$1')
        .replace(/\\([\\*_~`])/g, '$1');
}
//# sourceMappingURL=markdown-title.js.map