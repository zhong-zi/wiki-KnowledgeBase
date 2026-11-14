import { OnApplicationBootstrap, OnModuleDestroy } from '@nestjs/common';
import { Queue } from 'bullmq';
import { KyselyDB } from "../../../database/types/kysely.types";
export declare class SiemSchedulerService implements OnApplicationBootstrap, OnModuleDestroy {
    private readonly queue;
    private readonly db;
    private readonly logger;
    private retryTimer;
    private refreshTimer;
    private retryDelayMs;
    private destroyed;
    constructor(queue: Queue, db: KyselyDB);
    onApplicationBootstrap(): Promise<void>;
    onModuleDestroy(): void;
    private registerSweepScheduler;
    private startPeriodicRefresh;
    dueDestinationsQuery(now: Date): import("kysely").SelectQueryBuilder<import("../../../database/types/db.interface").DbInterface, "siemDestinations", {
        id: string;
    }>;
    sweep(): Promise<number>;
}
