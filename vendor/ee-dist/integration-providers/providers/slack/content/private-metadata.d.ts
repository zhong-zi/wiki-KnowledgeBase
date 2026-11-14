export type ModalPrivateMetadata = {
    contentKey: string;
    channelId?: string;
    metadata: {
        sender?: string;
        channelName?: string;
        timestamp?: string;
    };
};
export declare function encodePrivateMetadata(m: ModalPrivateMetadata): string;
export declare function decodePrivateMetadata(raw: string | undefined): ModalPrivateMetadata;
