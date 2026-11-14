import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { SlackEventDispatcher } from './webhook/slack-event.dispatcher';
import { SlackHandlerContextBuilder } from './handlers/slack-handler-context.builder';
export declare class SlackProcessor extends WorkerHost {
    private readonly events;
    private readonly contextBuilder;
    private readonly logger;
    constructor(events: SlackEventDispatcher, contextBuilder: SlackHandlerContextBuilder);
    process(job: Job): Promise<void>;
}
