import { KyselyDB } from "../../../../database/types/kysely.types";
import { Queue } from 'bullmq';
import { EnvironmentService } from '../../../../integrations/environment/environment.service';
import { PageEmbeddingsRepo } from '../../repos/page-embeddings.repo';
import { UpsertPageChunksParams, VectorDriver, VectorSearchHit, VectorSearchParams } from '../interfaces/vector-driver.interface';
export declare class PgVectorDriver implements VectorDriver {
    private readonly db;
    private readonly environmentService;
    private readonly pageEmbeddingsRepo;
    private readonly aiQueue;
    private readonly logger;
    constructor(db: KyselyDB, environmentService: EnvironmentService, pageEmbeddingsRepo: PageEmbeddingsRepo, aiQueue: Queue);
    getDriverName(): string;
    isReady(): Promise<boolean>;
    init(): Promise<void>;
    validate(): Promise<void>;
    upsertPageChunks(params: UpsertPageChunksParams): Promise<void>;
    search(params: VectorSearchParams): Promise<VectorSearchHit[]>;
    deletePages(pageIds: string[]): Promise<void>;
    movePagesToSpace(pageIds: string[], spaceId: string): Promise<void>;
    deleteSpace(spaceId: string): Promise<void>;
    deleteWorkspace(workspaceId: string): Promise<void>;
    prewarm(): Promise<void>;
    private checkModelMismatch;
    private createIndexIfNotExists;
    private resetEmbeddings;
}
