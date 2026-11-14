"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildGitLabPatterns = buildGitLabPatterns;
const canonical_path_1 = require("../../../../core/integration/utils/canonical-path");
const integration_utils_1 = require("../../../../core/integration/utils/integration.utils");
function buildGitLabPatterns(baseUrl) {
    const prefix = `^${(0, integration_utils_1.escapeForRegex)(baseUrl)}${canonical_path_1.CANONICAL_PATH}`;
    return [
        {
            regex: new RegExp(`${prefix}\\/(.+)\\/-\\/merge_requests\\/(\\d+)\\/diffs\\?.*commit_id=([a-f0-9]+)`),
            type: 'gitlab-commit-in-mr',
        },
        {
            regex: new RegExp(`${prefix}\\/(.+)\\/-\\/merge_requests\\/(\\d+)`),
            type: 'gitlab-mr',
        },
        {
            regex: new RegExp(`${prefix}\\/(.+)\\/-\\/issues\\/(\\d+)`),
            type: 'gitlab-issue',
        },
        {
            regex: new RegExp(`${prefix}\\/(.+)\\/-\\/work_items\\/(\\d+)`),
            type: 'gitlab-issue',
        },
        {
            regex: new RegExp(`${prefix}\\/(.+)\\/-\\/work_items\\/?\\?(?:.*&)?show=`),
            type: 'gitlab-work-item-drawer',
        },
        {
            regex: new RegExp(`${prefix}\\/(.+)\\/-\\/commits?\\/([a-f0-9]+)`),
            type: 'gitlab-commit',
        },
        {
            regex: new RegExp(`${prefix}\\/(.+)\\/-\\/issues(?:\\/)?(?:\\?.*)?$`),
            type: 'gitlab-issues-list',
        },
        {
            regex: new RegExp(`${prefix}\\/(.+)\\/-\\/merge_requests(?:\\/)?(?:\\?.*)?$`),
            type: 'gitlab-merges-list',
        },
        {
            regex: new RegExp(`${prefix}\\/([a-zA-Z0-9\\-_.]+)\\/([a-zA-Z0-9\\-_]+)\\/?$`),
            type: 'gitlab-project',
        },
    ];
}
//# sourceMappingURL=gitlab-patterns.js.map