import { Queue } from 'bullmq';
import { SlackHandler, SlackHandlerContext } from '../slack-handler.interface';
import { SlackSlashCommandPayload } from '../../webhook/slack-command.dispatcher';
import { SlackIdentityResolver } from '../../identity/slack-identity.resolver';
import { UserRepo } from "../../../../../../database/repos/user/user.repo";
export type SlackAskJobPayload = {
    question: string;
    userId: string;
    workspaceId: string;
    responseUrl: string;
    locale?: string | null;
    appUrl: string;
};
export declare class AskCommand implements SlackHandler<SlackSlashCommandPayload> {
    private readonly identity;
    private readonly userRepo;
    private readonly askQueue;
    readonly type = "ask";
    private readonly logger;
    constructor(identity: SlackIdentityResolver, userRepo: UserRepo, askQueue: Queue);
    handle(payload: SlackSlashCommandPayload, ctx: SlackHandlerContext): Promise<void>;
}
