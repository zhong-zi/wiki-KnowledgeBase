"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.numberOrUndefined = numberOrUndefined;
exports.stringArray = stringArray;
exports.userName = userName;
const integration_utils_1 = require("../../../../core/integration/utils/integration.utils");
function numberOrUndefined(value) {
    return typeof value === 'number' ? value : undefined;
}
function stringArray(value) {
    return Array.isArray(value)
        ? value.filter((item) => typeof item === 'string')
        : [];
}
function userName(user) {
    return (0, integration_utils_1.stringOrUndefined)(user?.name) ?? (0, integration_utils_1.stringOrUndefined)(user?.username);
}
//# sourceMappingURL=gitlab.utils.js.map