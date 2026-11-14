export declare function buildHomeSearchView(): {
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
            min_query_length: number;
            placeholder: {
                type: string;
                text: string;
            };
        };
    }[];
};
