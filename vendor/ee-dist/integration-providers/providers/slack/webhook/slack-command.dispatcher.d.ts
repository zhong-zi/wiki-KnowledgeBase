import { OnModuleInit } from '@nestjs/common';
import { SlackHandler, SlackHandlerContext } from '../handlers/slack-handler.interface';
export type SlackSlashCommandPayload = {
    team_id: string;
    user_id: string;
    command: string;
    text: string;
    channel_id: string;
    trigger_id: string;
    response_url: string;
};
export declare const SLACK_COMMAND_HANDLERS = "SLACK_COMMAND_HANDLERS";
export declare class SlackCommandDispatcher implements OnModuleInit {
    private readonly registered;
    private readonly logger;
    private readonly handlers;
    private fallback;
    constructor(registered?: SlackHandler<SlackSlashCommandPayload>[]);
    onModuleInit(): void;
    register(handler: SlackHandler<SlackSlashCommandPayload>): void;
    dispatch(payload: SlackSlashCommandPayload, ctx: SlackHandlerContext): Promise<void>;
}
