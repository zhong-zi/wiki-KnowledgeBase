import { OnModuleDestroy } from '@nestjs/common';
import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AiSearchService } from '../services/ai-search.service';
import { VectorSyncService } from "../services/vector-sync.service";
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { VectorDriver } from "../vector/interfaces/vector-driver.interface";
export declare class VectorProcessor extends WorkerHost implements OnModuleDestroy {
    private readonly aiSearchService;
    private readonly vectorSyncService;
    private readonly environmentService;
    private readonly vectorDriver;
    private readonly logger;
    constructor(aiSearchService: AiSearchService, vectorSyncService: VectorSyncService, environmentService: EnvironmentService, vectorDriver: VectorDriver);
    process(job: Job<any, void>): Promise<void>;
    onActive(job: Job): void;
    onError(job: Job): void;
    onCompleted(job: Job): void;
    onModuleDestroy(): Promise<void>;
}
