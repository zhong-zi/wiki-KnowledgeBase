import { OnModuleInit } from '@nestjs/common';
import { SlackHandler, SlackHandlerContext } from '../handlers/slack-handler.interface';
export type SlackInteractivityPayload = {
    type: 'message_action' | 'view_submission' | 'block_actions' | 'view_closed' | 'block_suggestion';
    team: {
        id: string;
    };
    user: {
        id: string;
        name?: string;
    };
    callback_id?: string;
    view?: {
        callback_id?: string;
        state?: Record<string, unknown>;
        private_metadata?: string;
    };
    actions?: Array<{
        action_id: string;
        value?: string;
        url?: string;
        selected_option?: {
            value: string;
        };
    }>;
    container?: {
        is_ephemeral?: boolean;
    };
    message?: {
        ts: string;
        text?: string;
        user?: string;
    };
    channel?: {
        id: string;
        name?: string;
    };
    trigger_id?: string;
    response_url?: string;
    action_id?: string;
    value?: string;
};
export declare const SLACK_INTERACTIVITY_HANDLERS = "SLACK_INTERACTIVITY_HANDLERS";
export declare class SlackInteractivityDispatcher implements OnModuleInit {
    private readonly registered;
    private readonly logger;
    private readonly handlers;
    constructor(registered?: SlackHandler<SlackInteractivityPayload>[]);
    onModuleInit(): void;
    register(handler: SlackHandler<SlackInteractivityPayload>): void;
    dispatch(payload: SlackInteractivityPayload, ctx: SlackHandlerContext): Promise<void>;
    private keyFor;
}
