"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transformSearchResults = transformSearchResults;
exports.transformPageToDocument = transformPageToDocument;
exports.extractTypesenseError = extractTypesenseError;
exports.isTypesenseCollectionMissing = isTypesenseCollectionMissing;
exports.sanitizeTypesenseError = sanitizeTypesenseError;
exports.diffCollectionSchema = diffCollectionSchema;
const Errors_1 = require("typesense/lib/Typesense/Errors");
function transformSearchResults(result, spaceMap) {
    return (result.hits?.map((hit) => {
        const doc = hit.document;
        const highlight = hit.highlights
            ?.find((h) => h.field === 'textContent')
            ?.snippet?.replace(/\r\n|\r|\n/g, ' ')
            .replace(/\s+/g, ' ');
        const matchedText = [
            ...new Set(Array.from(highlight?.matchAll(/<mark>([^<]*)<\/mark>/gi) ?? [], (match) => match[1])),
        ];
        return {
            id: doc.id,
            slugId: doc.slugId,
            title: doc.title,
            icon: doc.icon,
            parentPageId: doc.parentPageId,
            creatorId: doc.creatorId,
            rank: hit.text_match,
            highlight: highlight || '',
            matchedText,
            wholeWord: false,
            createdAt: new Date(doc.createdAt),
            updatedAt: new Date(doc.updatedAt),
            space: spaceMap?.get(doc.spaceId) || null,
        };
    }) ?? []);
}
function transformPageToDocument(page) {
    return {
        id: page.id,
        slugId: page.slugId,
        title: page.title,
        icon: page.icon,
        textContent: page.textContent
            ?.replace(/\n{2,}/g, '\n\n')
            .replace(/\s+/g, ' ')
            .trim(),
        workspaceId: page.workspaceId,
        spaceId: page.spaceId,
        creatorId: page.creatorId,
        contributorIds: page.contributorIds,
        labelIds: page.labelIds ?? [],
        parentPageId: page.parentPageId,
        createdAt: new Date(page.createdAt).getTime(),
        updatedAt: new Date(page.updatedAt).getTime(),
        deletedAt: page.deletedAt,
    };
}
function extractTypesenseError(error) {
    return error?.['errors']?.[0] || error;
}
function isTypesenseCollectionMissing(error) {
    return error instanceof Errors_1.ObjectNotFound || error?.httpStatus === 404;
}
function sanitizeTypesenseError(error) {
    const cause = extractTypesenseError(error);
    return {
        name: cause?.name || cause?.constructor?.name,
        message: cause?.message || String(cause),
        httpStatus: cause?.httpStatus,
    };
}
function diffCollectionSchema(declared, live) {
    const liveFields = new Map((live.fields ?? []).map((field) => [field.name, field]));
    const drift = [];
    for (const field of declared.fields ?? []) {
        if (field.name === 'id')
            continue;
        const liveField = liveFields.get(field.name);
        if (!liveField) {
            drift.push(`${field.name}: missing`);
            continue;
        }
        if (liveField.type !== field.type) {
            drift.push(`${field.name}: type ${liveField.type} != ${field.type}`);
        }
        if ((liveField.facet ?? false) !== (field.facet ?? false)) {
            drift.push(`${field.name}: facet mismatch`);
        }
        if ((liveField.optional ?? false) !== (field.optional ?? false)) {
            drift.push(`${field.name}: optional mismatch`);
        }
        if (field.locale && (liveField.locale ?? '') !== field.locale) {
            drift.push(`${field.name}: locale ${liveField.locale || 'none'} != ${field.locale}`);
        }
        if (field.num_dim && liveField.num_dim !== field.num_dim) {
            drift.push(`${field.name}: num_dim ${liveField.num_dim} != ${field.num_dim}`);
        }
    }
    return drift;
}
//# sourceMappingURL=typesense.util.js.map