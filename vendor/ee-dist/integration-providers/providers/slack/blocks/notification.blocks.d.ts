import { SlackBlock } from '../client/slack-api.types';
export declare const SLACK_NOTIFY_TYPES: ReadonlySet<string>;
export type NotificationDmArgs = {
    type: string;
    actorName: string;
    pageTitle: string;
    pageUrl: string | null;
    commentQuote?: string | null;
    replyCommentId?: string | null;
};
export declare function buildNotificationDm(args: NotificationDmArgs): {
    text: string;
    blocks: SlackBlock[];
} | null;
export declare function buildNotifyOnBlocks(): SlackBlock[];
