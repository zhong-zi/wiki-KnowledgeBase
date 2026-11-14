import { OnModuleInit } from '@nestjs/common';
import { SlackHandler, SlackHandlerContext } from '../handlers/slack-handler.interface';
export type SlackEventEnvelope = {
    type: 'event_callback';
    event: {
        type: string;
        [k: string]: unknown;
    };
    team_id: string;
};
export declare const SLACK_EVENT_HANDLERS = "SLACK_EVENT_HANDLERS";
export declare class SlackEventDispatcher implements OnModuleInit {
    private readonly registered;
    private readonly logger;
    private readonly handlers;
    constructor(registered?: SlackHandler<SlackEventEnvelope>[]);
    onModuleInit(): void;
    register(handler: SlackHandler<SlackEventEnvelope>): void;
    dispatch(envelope: SlackEventEnvelope, ctx: SlackHandlerContext): Promise<void>;
}
