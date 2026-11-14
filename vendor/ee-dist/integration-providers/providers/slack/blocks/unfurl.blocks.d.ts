import { SlackBlock } from '../client/slack-api.types';
export type PageUnfurlArgs = {
    pageUrl: string;
    title: string;
    icon?: string | null;
    spaceName: string;
    authorName: string;
    updatedAt: Date;
};
export declare function buildPageUnfurlBlocks(args: PageUnfurlArgs): SlackBlock[];
