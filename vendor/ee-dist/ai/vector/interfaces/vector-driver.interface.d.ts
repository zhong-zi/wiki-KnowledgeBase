export type PageChunk = {
    chunkIndex: number;
    chunkStart: number;
    chunkLength: number;
    embedding: number[];
};
export type UpsertPageChunksParams = {
    pageId: string;
    spaceId: string;
    workspaceId: string;
    modelName: string;
    chunks: PageChunk[];
};
export type VectorSearchParams = {
    workspaceId: string;
    spaceIds: string[] | null;
    embedding: number[];
    limit: number;
    maxDistance: number;
};
export type VectorSearchHit = {
    pageId: string;
    spaceId: string;
    chunkIndex: number;
    chunkStart: number;
    chunkLength: number;
    distance: number;
};
export type EmbeddingFingerprint = {
    driver: string;
    model: string;
    dimensions: number;
};
export interface VectorDriver {
    isReady(): Promise<boolean>;
    init(): Promise<void>;
    validate(): Promise<void>;
    upsertPageChunks(params: UpsertPageChunksParams): Promise<void>;
    search(params: VectorSearchParams): Promise<VectorSearchHit[]>;
    deletePages(pageIds: string[], workspaceId: string): Promise<void>;
    movePagesToSpace(pageIds: string[], spaceId: string, workspaceId: string): Promise<void>;
    deleteSpace(spaceId: string, workspaceId: string): Promise<void>;
    deleteWorkspace(workspaceId: string): Promise<void>;
    prewarm(workspaceId: string): Promise<void>;
    getDriverName(): string;
}
