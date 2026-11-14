import { SlackBlock } from '../client/slack-api.types';
export type AiAnswerSource = {
    title: string;
    spaceSlug: string;
    slugId: string;
};
export type AiAnswerArgs = {
    question: string;
    answer: string;
    sources: AiAnswerSource[];
    appUrl: string;
};
export declare function buildAiAnswerBlocks(args: AiAnswerArgs): SlackBlock[];
