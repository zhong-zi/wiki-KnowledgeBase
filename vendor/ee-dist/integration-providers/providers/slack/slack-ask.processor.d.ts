import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { AiSearchService } from '../../../ai/services/ai-search.service';
import { EnvironmentService } from '../../../../integrations/environment/environment.service';
import type { SlackAskJobPayload } from './handlers/commands/ask.command';
export declare class SlackAskProcessor extends WorkerHost {
    private readonly aiSearch;
    private readonly env;
    private readonly logger;
    constructor(aiSearch: AiSearchService, env: EnvironmentService);
    process(job: Job<SlackAskJobPayload>): Promise<void>;
}
