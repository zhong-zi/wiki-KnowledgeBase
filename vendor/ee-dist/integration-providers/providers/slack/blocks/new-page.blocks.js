"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildNewPageModalView = buildNewPageModalView;
const private_metadata_1 = require("../content/private-metadata");
function buildNewPageModalView(args) {
    return {
        type: 'modal',
        callback_id: 'new_page_submit',
        title: { type: 'plain_text', text: 'New page from message' },
        submit: { type: 'plain_text', text: 'Create' },
        close: { type: 'plain_text', text: 'Cancel' },
        private_metadata: (0, private_metadata_1.encodePrivateMetadata)({
            contentKey: args.contentKey,
            channelId: args.channelId,
            metadata: args.metadata,
        }),
        blocks: [
            {
                type: 'input',
                block_id: 'space',
                label: { type: 'plain_text', text: 'Space' },
                element: {
                    type: 'external_select',
                    action_id: 'space_id',
                    min_query_length: 0,
                    placeholder: { type: 'plain_text', text: 'Choose a space' },
                },
            },
            {
                type: 'input',
                block_id: 'title',
                label: { type: 'plain_text', text: 'Page title' },
                element: {
                    type: 'plain_text_input',
                    action_id: 'title_value',
                    initial_value: args.suggestedTitle,
                },
            },
        ],
    };
}
//# sourceMappingURL=new-page.blocks.js.map