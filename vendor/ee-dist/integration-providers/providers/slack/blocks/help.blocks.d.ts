import { SlackBlock } from '../client/slack-api.types';
export type HelpArgs = {
    isLinked: boolean;
    appUrl: string;
};
export declare function buildHelpBlocks({ isLinked, appUrl }: HelpArgs): SlackBlock[];
