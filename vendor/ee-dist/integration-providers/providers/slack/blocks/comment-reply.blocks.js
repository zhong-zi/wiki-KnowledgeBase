"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildCommentReplyView = buildCommentReplyView;
function buildCommentReplyView(commentId) {
    return {
        type: 'modal',
        callback_id: 'notify_comment_reply_submit',
        private_metadata: JSON.stringify({ commentId }),
        title: { type: 'plain_text', text: 'Reply to comment' },
        submit: { type: 'plain_text', text: 'Reply' },
        close: { type: 'plain_text', text: 'Cancel' },
        blocks: [
            {
                type: 'input',
                block_id: 'reply',
                label: { type: 'plain_text', text: 'Reply' },
                element: {
                    type: 'plain_text_input',
                    action_id: 'reply_text',
                    multiline: true,
                    max_length: 4000,
                    placeholder: { type: 'plain_text', text: 'Write a reply...' },
                },
            },
        ],
    };
}
//# sourceMappingURL=comment-reply.blocks.js.map