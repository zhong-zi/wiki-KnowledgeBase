"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.formatSlackTimestamp = formatSlackTimestamp;
const FORMAT = new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
});
function formatSlackTimestamp(ts) {
    if (!ts)
        return undefined;
    const seconds = Number(ts);
    if (!Number.isFinite(seconds))
        return undefined;
    const date = new Date(seconds * 1000);
    if (Number.isNaN(date.getTime()))
        return undefined;
    return FORMAT.format(date);
}
//# sourceMappingURL=slack-timestamp.js.map