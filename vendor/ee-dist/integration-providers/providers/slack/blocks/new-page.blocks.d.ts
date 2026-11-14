import { SlackBlock } from '../client/slack-api.types';
import { ModalPrivateMetadata } from '../content/private-metadata';
export declare function buildNewPageModalView(args: {
    suggestedTitle: string;
    contentKey: string;
    channelId?: string;
    metadata: ModalPrivateMetadata['metadata'];
}): {
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
