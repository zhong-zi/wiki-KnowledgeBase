"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JIRA_CLOUD_PATTERNS = void 0;
exports.buildJiraDataCenterPatterns = buildJiraDataCenterPatterns;
const canonical_path_1 = require("../../../../core/integration/utils/canonical-path");
const integration_utils_1 = require("../../../../core/integration/utils/integration.utils");
const ISSUE_KEY = String.raw `(?<issue>[A-Za-z0-9]+-\d+)`;
const CLOUD_HOST = String.raw `^https?:\/\/${canonical_path_1.CANONICAL_PATH}[A-Za-z0-9-]+\.`;
const ATLASSIAN_NET = String.raw `[Aa][Tt][Ll][Aa][Ss][Ss][Ii][Aa][Nn]\.[Nn][Ee][Tt]`;
const JIRA_COM = String.raw `[Jj][Ii][Rr][Aa]\.[Cc][Oo][Mm]`;
exports.JIRA_CLOUD_PATTERNS = [
    {
        regex: new RegExp(`${CLOUD_HOST}(?:${ATLASSIAN_NET}|${JIRA_COM})\\/browse\\/${ISSUE_KEY}`),
        type: 'jira-issue',
    },
    {
        regex: new RegExp(`${CLOUD_HOST}${ATLASSIAN_NET}\\/secure\\/RapidBoard\\.jspa\\?(?:.*&)?selectedIssue=${ISSUE_KEY}`),
        type: 'jira-issue',
    },
    {
        regex: new RegExp(`${CLOUD_HOST}${ATLASSIAN_NET}\\/jira\\/software(?:\\/c)?\\/projects\\/[\\w-]+\\/boards\\/\\d+(?:\\/\\w+)?\\?(?:.*&)?selectedIssue=${ISSUE_KEY}`),
        type: 'jira-issue',
    },
];
function buildJiraDataCenterPatterns(baseUrl) {
    const prefix = `^${(0, integration_utils_1.escapeForRegex)(baseUrl)}${canonical_path_1.CANONICAL_PATH}`;
    return [
        {
            regex: new RegExp(`${prefix}\\/browse\\/${ISSUE_KEY}`),
            type: 'jira-issue',
        },
        {
            regex: new RegExp(`${prefix}\\/secure\\/RapidBoard\\.jspa\\?(?:.*&)?selectedIssue=${ISSUE_KEY}`),
            type: 'jira-issue',
        },
    ];
}
//# sourceMappingURL=jira-patterns.js.map