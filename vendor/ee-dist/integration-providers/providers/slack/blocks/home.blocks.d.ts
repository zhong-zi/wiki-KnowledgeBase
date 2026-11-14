import { SlackBlock } from '../client/slack-api.types';
export type HomeViewArgs = {
    isLinked: true;
    displayName?: string;
    appUrl: string;
} | {
    isLinked: false;
    appUrl: string;
};
export declare function buildHomeView(args: HomeViewArgs): {
    type: 'home';
    blocks: SlackBlock[];
};
