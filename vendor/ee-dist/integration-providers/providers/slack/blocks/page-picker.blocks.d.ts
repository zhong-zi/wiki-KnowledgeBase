import { SlackBlock } from '../client/slack-api.types';
import { ModalPrivateMetadata } from '../content/private-metadata';
export type PagePickerArgs = {
    title: string;
    contentKey: string;
    channelId?: string;
    metadata: ModalPrivateMetadata['metadata'];
};
export declare function buildPagePickerModalView(args: PagePickerArgs): {
    type: string;
    callback_id: string;
    title: {
        type: string;
        text: string;
    };
    submit: {
        type: string;
        text: string;
    };
    close: {
        type: string;
        text: string;
    };
    private_metadata: string;
    blocks: SlackBlock[];
};
