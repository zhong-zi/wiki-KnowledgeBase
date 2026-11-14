export declare function buildCreateDocumentView(): {
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
    blocks: ({
        type: string;
        block_id: string;
        label: {
            type: string;
            text: string;
        };
        element: {
            type: string;
            action_id: string;
            placeholder: {
                type: string;
                text: string;
            };
            max_length: number;
            min_query_length?: undefined;
            multiline?: undefined;
        };
        optional?: undefined;
    } | {
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
            max_length?: undefined;
            multiline?: undefined;
        };
        optional?: undefined;
    } | {
        type: string;
        block_id: string;
        optional: boolean;
        label: {
            type: string;
            text: string;
        };
        element: {
            type: string;
            action_id: string;
            multiline: boolean;
            placeholder: {
                type: string;
                text: string;
            };
            max_length?: undefined;
            min_query_length?: undefined;
        };
    })[];
};
