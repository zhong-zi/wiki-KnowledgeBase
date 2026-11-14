import { SlackHandlerContext } from '../handlers/slack-handler.interface';
import { SlackBlock } from './slack-api.types';
export type NotifyOpts = {
    channelId?: string;
    slackUserId: string;
    text?: string;
    blocks?: SlackBlock[];
};
export declare function notifySlackUser(ctx: SlackHandlerContext, opts: NotifyOpts): Promise<void>;
