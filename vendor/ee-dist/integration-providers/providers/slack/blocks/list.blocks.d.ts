import { SlackBlock } from '../client/slack-api.types';
export type ListItem = {
    title: string;
    url: string;
    spaceName?: string;
    subtitle?: string;
};
export declare function buildListBlocks(args: {
    heading: string;
    items: ListItem[];
    emptyText: string;
}): SlackBlock[];
