"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildHomeSearchView = buildHomeSearchView;
function buildHomeSearchView() {
    return {
        type: 'modal',
        callback_id: 'home_search_submit',
        title: { type: 'plain_text', text: 'Search Docs' },
        submit: { type: 'plain_text', text: 'Open' },
        close: { type: 'plain_text', text: 'Cancel' },
        blocks: [
            {
                type: 'input',
                block_id: 'page',
                label: { type: 'plain_text', text: 'Page' },
                element: {
                    type: 'external_select',
                    action_id: 'page_id',
                    min_query_length: 1,
                    placeholder: { type: 'plain_text', text: 'Search pages...' },
                },
            },
        ],
    };
}
//# sourceMappingURL=home-search.blocks.js.map