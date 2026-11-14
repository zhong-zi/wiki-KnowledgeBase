"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.confluenceStatusColorMap = exports.confluencePanelColorMap = exports.confluenceEmoticonMap = void 0;
exports.fixSelfClosingTags = fixSelfClosingTags;
exports.confluencePanelCalloutType = confluencePanelCalloutType;
const htmlVoidElements = new Set([
    'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input',
    'link', 'meta', 'param', 'source', 'track', 'wbr',
]);
function fixSelfClosingTags(html) {
    return html.replace(/<([a-zA-Z][a-zA-Z0-9]*)\b([^>]*?)\/>/g, (match, tag, attrs) => {
        if (htmlVoidElements.has(tag.toLowerCase())) {
            return match;
        }
        return `<${tag}${attrs}></${tag}>`;
    });
}
exports.confluenceEmoticonMap = {
    'smile': '\u{1F642}',
    'sad': '\u{1F61E}',
    'cheeky': '\u{1F61B}',
    'laugh': '\u{1F600}',
    'wink': '\u{1F609}',
    'thumbs-up': '\u{1F44D}',
    'thumbs-down': '\u{1F44E}',
    'information': '\u{2139}\u{FE0F}',
    'info': '\u{2139}\u{FE0F}',
    'tick': '\u{2705}',
    'cross': '\u{274C}',
    'error': '\u{274C}',
    'warning': '\u{26A0}\u{FE0F}',
    'plus': '\u{2795}',
    'minus': '\u{2796}',
    'question': '\u{2753}',
    'light-on': '\u{1F4A1}',
    'light-off': '\u{1F4A1}',
    'yellow-star': '\u{2B50}',
    'star': '\u{2B50}',
    'red-star': '\u{2B50}',
    'green-star': '\u{2B50}',
    'blue-star': '\u{2B50}',
    'heart': '\u{2764}\u{FE0F}',
    'broken-heart': '\u{1F494}',
};
exports.confluencePanelColorMap = {
    '#ffffff': 'default',
    '#f4f5f7': 'default',
    '#deebff': 'info',
    '#e9f2ff': 'info',
    '#b3d4ff': 'info',
    '#4c9aff': 'info',
    '#e6fcff': 'info',
    '#b3f5ff': 'info',
    '#79e2f2': 'info',
    '#eae6ff': 'note',
    '#f3f0ff': 'note',
    '#c0b6f2': 'note',
    '#998dd9': 'note',
    '#e3fcef': 'success',
    '#dcfff1': 'success',
    '#abf5d1': 'success',
    '#57d9a3': 'success',
    '#fffae6': 'warning',
    '#fff7d6': 'warning',
    '#fff0b3': 'warning',
    '#ffc400': 'warning',
    '#ffebe6': 'danger',
    '#ffeceb': 'danger',
    '#ffbdad': 'danger',
    '#ff8f73': 'danger',
};
function backgroundColorHex(style) {
    const hex = style.match(/background-color\s*:\s*(#[0-9a-f]{3,8})/i);
    if (hex) {
        return hex[1].toLowerCase();
    }
    const rgb = style.match(/background-color\s*:\s*rgb\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*\)/i);
    if (rgb) {
        return ('#' +
            rgb
                .slice(1, 4)
                .map((channel) => Number(channel).toString(16).padStart(2, '0'))
                .join(''));
    }
    return null;
}
function confluencePanelCalloutType(...styles) {
    for (const style of styles) {
        if (!style) {
            continue;
        }
        const hex = backgroundColorHex(style);
        if (hex) {
            return exports.confluencePanelColorMap[hex] ?? 'info';
        }
    }
    return 'info';
}
exports.confluenceStatusColorMap = {
    'aui-lozenge-success': 'green',
    'aui-lozenge-complete': 'green',
    'aui-lozenge-error': 'red',
    'aui-lozenge-removed': 'red',
    'aui-lozenge-current': 'blue',
    'aui-lozenge-inprogress': 'blue',
    'aui-lozenge-moved': 'yellow',
    'aui-lozenge-new': 'purple',
};
//# sourceMappingURL=confluence-import.utils.js.map