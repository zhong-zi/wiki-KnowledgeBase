export declare function buildCommentReplyView(commentId: string): {
    type: string;
    callback_id: string;
    private_metadata: string;
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
    blocks: {
        type: string;
        block_id: string;
        label: {
            type: string;
            text: string;
        };
        element: {
            type: string;
            action_id: string;
            multiline: boolean;
            max_length: number;
            placeholder: {
                type: string;
                text: string;
            };
        };
    }[];
};
