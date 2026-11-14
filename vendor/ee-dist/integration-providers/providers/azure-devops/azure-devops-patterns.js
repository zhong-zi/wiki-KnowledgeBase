"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AZURE_DEVOPS_UNFURL_PATTERNS = void 0;
exports.describeAzureDevOpsLink = describeAzureDevOpsLink;
const canonical_path_1 = require("../../../../core/integration/utils/canonical-path");
const ORG = String.raw `([A-Za-z0-9-]+)`;
const PROJECT = String.raw `\/((?!_)[^\/?#]+)`;
const ID_END = String.raw `(?=[\/?#]|$)`;
const ORG_PREFIXES = [
    String.raw `^https:\/\/${canonical_path_1.CANONICAL_PATH}dev\.azure\.com\/${ORG}`,
    String.raw `^https:\/\/${canonical_path_1.CANONICAL_PATH}${ORG}\.visualstudio\.com(?:\/DefaultCollection)?`,
];
exports.AZURE_DEVOPS_UNFURL_PATTERNS = ORG_PREFIXES.flatMap((prefix) => [
    {
        regex: new RegExp(`${prefix}(?:${PROJECT})?\\/_git\\/([^\\/?#]+)\\/pullrequest\\/(\\d{1,10})${ID_END}`),
        type: 'azure-devops-pr',
    },
    {
        regex: new RegExp(`${prefix}(?:${PROJECT})?\\/_workitems\\/edit\\/(\\d{1,10})${ID_END}`),
        type: 'azure-devops-work-item',
    },
    {
        regex: new RegExp(`${prefix}${PROJECT}\\/_(?:boards|backlogs|sprints)\\/[^?#]*\\?(?:[^#]*&)?workitem=(\\d{1,10})(?=[&#]|$)`),
        type: 'azure-devops-work-item',
    },
]);
const UNSAFE_DISPLAY_TEXT = /[\/\p{Cc}\p{Cf}\p{Zl}\p{Zp}]/gu;
function encodeUnsafe(text) {
    return text.replace(UNSAFE_DISPLAY_TEXT, encodeURIComponent);
}
function decode(value) {
    let decoded = value;
    try {
        decoded = decodeURIComponent(value);
    }
    catch {
        return encodeUnsafe(value);
    }
    return encodeUnsafe(decoded) === decoded ? decoded : encodeUnsafe(value);
}
function describeAzureDevOpsLink(patternType, match) {
    const org = match[1];
    const project = match[2] ? decode(match[2]) : undefined;
    switch (patternType) {
        case 'azure-devops-work-item':
            return {
                title: `Work Item #${match[3]}`,
                description: [org, project].filter(Boolean).join('/'),
            };
        case 'azure-devops-pr':
            return {
                title: `Pull Request #${match[4]}`,
                description: [org, project, decode(match[3])].filter(Boolean).join('/'),
            };
        default:
            return null;
    }
}
//# sourceMappingURL=azure-devops-patterns.js.map