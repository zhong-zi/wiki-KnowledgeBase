import { OnModuleDestroy } from '@nestjs/common';
import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SiemSchedulerService } from '../services/siem-scheduler.service';
import { SiemDeliveryService } from '../services/siem-delivery.service';
export declare class SiemProcessor extends WorkerHost implements OnModuleDestroy {
    private readonly scheduler;
    private readonly delivery;
    private readonly logger;
    constructor(scheduler: SiemSchedulerService, delivery: SiemDeliveryService);
    process(job: Job): Promise<void>;
    onFailed(job: Job): void;
    onModuleDestroy(): Promise<void>;
}
