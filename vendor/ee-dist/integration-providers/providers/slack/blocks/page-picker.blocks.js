"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildPagePickerModalView = buildPagePickerModalView;
const private_metadata_1 = require("../content/private-metadata");
function buildPagePickerModalView(args) {
    return {
        type: 'modal',
        callback_id: 'add_message_submit',
        title: { type: 'plain_text', text: args.title.slice(0, 24) },
        submit: { type: 'plain_text', text: 'Add' },
        close: { type: 'plain_text', text: 'Cancel' },
        private_metadata: (0, private_metadata_1.encodePrivateMetadata)({
            contentKey: args.contentKey,
            channelId: args.channelId,
            metadata: args.metadata,
        }),
        blocks: [
            {
                type: 'input',
                block_id: 'page',
                label: { type: 'plain_text', text: 'Target page' },
                element: {
                    type: 'external_select',
                    action_id: 'page_id',
                    min_query_length: 1,
                    placeholder: { type: 'plain_text', text: 'Search pages...' },
                },
            },
            {
                type: 'input',
                block_id: 'placement',
                label: { type: 'plain_text', text: 'Placement' },
                element: {
                    type: 'radio_buttons',
                    action_id: 'placement_value',
                    initial_option: bottomOpt(),
                    options: [bottomOpt(), topOpt()],
                },
            },
            {
                type: 'input',
                block_id: 'metadata_toggles',
                optional: true,
                label: { type: 'plain_text', text: 'Include' },
                element: {
                    type: 'checkboxes',
                    action_id: 'metadata_values',
                    options: [
                        { text: { type: 'plain_text', text: 'Sender name' }, value: 'sender' },
                        { text: { type: 'plain_text', text: 'Channel name' }, value: 'channel' },
                        { text: { type: 'plain_text', text: 'Timestamp' }, value: 'timestamp' },
                    ],
                    initial_options: [
                        { text: { type: 'plain_text', text: 'Sender name' }, value: 'sender' },
                        { text: { type: 'plain_text', text: 'Channel name' }, value: 'channel' },
                        { text: { type: 'plain_text', text: 'Timestamp' }, value: 'timestamp' },
                    ],
                },
            },
        ],
    };
}
function bottomOpt() {
    return { text: { type: 'plain_text', text: 'Add to bottom of page' }, value: 'bottom' };
}
function topOpt() {
    return { text: { type: 'plain_text', text: 'Add to top of page' }, value: 'top' };
}
//# sourceMappingURL=page-picker.blocks.js.map