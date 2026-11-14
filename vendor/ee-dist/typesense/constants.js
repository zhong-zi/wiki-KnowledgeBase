"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TYPESENSE_LOCALE = exports.SEARCH_HEALTH_INTERVAL_MS = exports.SEARCH_HEALTH_BOOT_JOB_ID = exports.SEARCH_HEALTH_SCHEDULER_ID = exports.TYPESENSE_SCHEDULER_ID = exports.CollectionSchema = void 0;
var CollectionSchema;
(function (CollectionSchema) {
    CollectionSchema["PAGE"] = "pages";
    CollectionSchema["ATTACHMENT"] = "attachments";
    CollectionSchema["COMMENT"] = "comments";
})(CollectionSchema || (exports.CollectionSchema = CollectionSchema = {}));
exports.TYPESENSE_SCHEDULER_ID = 'typesense-flush-scheduler';
exports.SEARCH_HEALTH_SCHEDULER_ID = 'search-health-scheduler';
exports.SEARCH_HEALTH_BOOT_JOB_ID = 'search-health-boot-check';
exports.SEARCH_HEALTH_INTERVAL_MS = 60 * 60 * 1000;
exports.TYPESENSE_LOCALE = process.env.TYPESENSE_LOCALE?.toLowerCase() || 'en';
//# sourceMappingURL=constants.js.map