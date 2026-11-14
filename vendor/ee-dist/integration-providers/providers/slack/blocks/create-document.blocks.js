"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCreateDocumentView = buildCreateDocumentView;
function buildCreateDocumentView() {
    return {
        type: 'modal',
        callback_id: 'create_document_submit',
        title: { type: 'plain_text', text: 'New Document' },
        submit: { type: 'plain_text', text: 'Create' },
        close: { type: 'plain_text', text: 'Cancel' },
        blocks: [
            {
                type: 'input',
                block_id: 'title',
                label: { type: 'plain_text', text: 'Title' },
                element: {
                    type: 'plain_text_input',
                    action_id: 'title_value',
                    placeholder: { type: 'plain_text', text: 'Enter a title...' },
                    max_length: 200,
                },
            },
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
                block_id: 'description',
                optional: true,
                label: { type: 'plain_text', text: 'Description' },
                element: {
                    type: 'plain_text_input',
                    action_id: 'description_value',
                    multiline: true,
                    placeholder: { type: 'plain_text', text: 'Optional description that becomes the first paragraph' },
                },
            },
        ],
    };
}
//# sourceMappingURL=create-document.blocks.js.map