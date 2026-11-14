import { Queue } from 'bullmq';
import { FastifyRequest } from 'fastify';
import { SlackEventDispatcher } from './slack-event.dispatcher';
import { SlackCommandDispatcher } from './slack-command.dispatcher';
import { SlackInteractivityDispatcher } from './slack-interactivity.dispatcher';
import { SlackHandlerContextBuilder } from '../handlers/slack-handler-context.builder';
type RawBodyRequest = FastifyRequest & {
    rawBody?: Buffer;
};
export declare class SlackController {
    private readonly events;
    private readonly commands;
    private readonly interactivity;
    private readonly contextBuilder;
    private readonly slackQueue;
    constructor(events: SlackEventDispatcher, commands: SlackCommandDispatcher, interactivity: SlackInteractivityDispatcher, contextBuilder: SlackHandlerContextBuilder, slackQueue: Queue);
    eventsEndpoint(body: any, req: RawBodyRequest): Promise<{
        challenge: any;
        ok?: undefined;
    } | {
        ok: boolean;
        challenge?: undefined;
    }>;
    commandsEndpoint(body: any, req: RawBodyRequest): Promise<"" | import("../handlers/slack-handler.interface").SlackEphemeralResponse>;
    interactivityEndpoint(body: any, req: RawBodyRequest): Promise<any>;
}
export {};
