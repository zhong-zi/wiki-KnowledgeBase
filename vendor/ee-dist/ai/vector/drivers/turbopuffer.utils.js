"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TURBOPUFFER_SEARCH_ATTRIBUTES = void 0;
exports.buildNamespaceName = buildNamespaceName;
exports.buildChunkId = buildChunkId;
exports.buildVectorSchema = buildVectorSchema;
exports.buildUpsertColumns = buildUpsertColumns;
exports.buildPrunePredicate = buildPrunePredicate;
exports.buildSpaceFilter = buildSpaceFilter;
exports.fingerprintMatches = fingerprintMatches;
exports.toSearchHits = toSearchHits;
const NAMESPACE_PATTERN = /^[A-Za-z0-9\-_.]{1,128}$/;
exports.TURBOPUFFER_SEARCH_ATTRIBUTES = [
    'page_id',
    'space_id',
    'chunk_index',
    'chunk_start',
    'chunk_length',
];
function buildNamespaceName(prefix, workspaceId) {
    const name = `${prefix}-${workspaceId}`;
    if (!NAMESPACE_PATTERN.test(name)) {
        throw new Error(`Invalid turbopuffer namespace name: ${name}`);
    }
    return name;
}
function buildChunkId(pageId, chunkIndex) {
    return `${pageId}:${chunkIndex}`;
}
function buildVectorSchema(dimensions) {
    return {
        vector: { type: `[${dimensions}]f16`, ann: true },
        page_id: { type: 'uuid', filterable: true },
        space_id: { type: 'uuid', filterable: true },
        chunk_index: { type: 'uint', filterable: true },
        chunk_start: { type: 'uint', filterable: false },
        chunk_length: { type: 'uint', filterable: false },
    };
}
function buildUpsertColumns(pageId, spaceId, chunks) {
    return {
        id: chunks.map((chunk) => buildChunkId(pageId, chunk.chunkIndex)),
        vector: chunks.map((chunk) => chunk.embedding),
        page_id: chunks.map(() => pageId),
        space_id: chunks.map(() => spaceId),
        chunk_index: chunks.map((chunk) => chunk.chunkIndex),
        chunk_start: chunks.map((chunk) => chunk.chunkStart),
        chunk_length: chunks.map((chunk) => chunk.chunkLength),
    };
}
function buildPrunePredicate(pageId, chunkCount) {
    return [
        'And',
        [
            ['page_id', 'Eq', pageId],
            ['chunk_index', 'Gte', chunkCount],
        ],
    ];
}
function buildSpaceFilter(spaceIds) {
    if (spaceIds === null)
        return undefined;
    if (spaceIds.length === 1)
        return ['space_id', 'Eq', spaceIds[0]];
    return ['space_id', 'In', spaceIds];
}
function fingerprintMatches(stored, current) {
    const candidate = stored;
    return (candidate?.['driver'] === current.driver &&
        candidate?.['model'] === current.model &&
        Number(candidate?.['dimensions']) === current.dimensions);
}
function toSearchHits(rows, maxDistance) {
    if (!rows?.length)
        return [];
    return rows
        .filter((row) => typeof row.$dist === 'number' && row.$dist < maxDistance)
        .map((row) => ({
        pageId: String(row.page_id),
        spaceId: String(row.space_id),
        chunkIndex: Number(row.chunk_index),
        chunkStart: Number(row.chunk_start),
        chunkLength: Number(row.chunk_length),
        distance: row.$dist,
    }));
}
//# sourceMappingURL=turbopuffer.utils.js.map