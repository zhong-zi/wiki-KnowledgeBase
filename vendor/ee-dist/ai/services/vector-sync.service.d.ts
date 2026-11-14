import { KyselyDB } from "../../../database/types/kysely.types";
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { Queue } from 'bullmq';
import { WorkspaceRepo } from "../../../database/repos/workspace/workspace.repo";
import { AiService } from './ai.service';
import { VectorDriver } from '../vector/interfaces/vector-driver.interface';
export declare class VectorSyncService {
    private readonly db;
    private readonly environmentService;
    private readonly aiQueue;
    private readonly aiService;
    private readonly vectorDriver;
    private readonly workspaceRepo;
    private readonly logger;
    constructor(db: KyselyDB, environmentService: EnvironmentService, aiQueue: Queue, aiService: AiService, vectorDriver: VectorDriver, workspaceRepo: WorkspaceRepo);
    handlePageEmbeds(pageIds: string[], workspaceId: string): Promise<void>;
    handlePageMovedToSpace(pageIds: string[], spaceId: string, workspaceId: string): Promise<void>;
    handlePageDeletion(pageIds: string[], workspaceId: string): Promise<void>;
    handleSpaceDeletion(spaceId: string, workspaceId: string): Promise<void>;
    handleCreateEmbeddingsForWorkspace(data: {
        workspaceId: string | null;
        global?: boolean;
    }): Promise<void>;
    handleDeleteEmbeddingsForWorkspace(workspaceId: string): Promise<void>;
    handleResetEmbeddingsForWorkspace(workspaceId: string): Promise<void>;
    private queuePagesForEmbedding;
}
