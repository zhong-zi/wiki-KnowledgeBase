import type { ModalPrivateMetadata } from './content/private-metadata';
export declare function postToResponseUrl(responseUrl: string, body: Record<string, unknown>): Promise<void>;
export declare function sleep(ms: number): Promise<void>;
export declare function truncate(s: string, max: number): string;
export declare function parseSubcommand(text: string): string;
export declare function modalContentKeyPrefix(integrationId: string): string;
export declare function optionText(value: string | null | undefined): string;
export declare function applyMetadataPrefix(markdown: string, metadata: ModalPrivateMetadata['metadata'], selected: string[]): string;
export declare function extractCommentText(content: unknown): string | null;
