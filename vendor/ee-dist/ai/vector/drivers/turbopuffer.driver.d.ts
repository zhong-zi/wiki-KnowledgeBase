import { KyselyDB } from "../../../../database/types/kysely.types";
import { Queue } from 'bullmq';
import { EnvironmentService } from '../../../../integrations/environment/environment.service';
import { EmbeddingFingerprint, UpsertPageChunksParams, VectorDriver, VectorSearchHit, VectorSearchParams } from '../interfaces/vector-driver.interface';
export declare class TurbopufferDriver implements VectorDriver {
    private readonly environmentService;
    private readonly db;
    private readonly aiQueue;
    private readonly logger;
    private client;
    constructor(environmentService: EnvironmentService, db: KyselyDB, aiQueue: Queue);
    getDriverName(): string;
    isReady(): Promise<boolean>;
    init(): Promise<void>;
    validate(): Promise<void>;
    currentFingerprint(): EmbeddingFingerprint;
    private findAiSearchWorkspaces;
    upsertPageChunks(params: UpsertPageChunksParams): Promise<void>;
    search(params: VectorSearchParams): Promise<VectorSearchHit[]>;
    deletePages(pageIds: string[], workspaceId: string): Promise<void>;
    movePagesToSpace(pageIds: string[], spaceId: string, workspaceId: string): Promise<void>;
    deleteSpace(spaceId: string, workspaceId: string): Promise<void>;
    deleteWorkspace(workspaceId: string): Promise<void>;
    prewarm(workspaceId: string): Promise<void>;
    private embeddingDimensions;
    private getClient;
    private namespace;
    private write;
}
