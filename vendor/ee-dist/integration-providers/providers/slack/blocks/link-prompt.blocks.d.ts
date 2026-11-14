import { SlackBlock } from '../client/slack-api.types';
export type LinkPromptArgs = {
    appUrl: string;
    slackUserName: string;
};
export declare function buildLinkPromptBlocks({ appUrl, slackUserName, }: LinkPromptArgs): SlackBlock[];
