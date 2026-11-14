import { SlackApiOk, SlackChannel, SlackChatUnfurlInput, SlackMessage, SlackUser, SlackBlock, SlackOpenIdUserInfo } from './slack-api.types';
export declare class SlackApiError extends Error {
    readonly code: string;
    readonly endpoint: string;
    readonly httpStatus?: number;
    readonly details: string[];
    readonly name = "SlackApiError";
    constructor(code: string, endpoint: string, httpStatus?: number, details?: string[]);
}
type CallOptions = {
    retries?: number;
};
export declare class SlackApiClient {
    private readonly botToken;
    constructor(botToken: string | null);
    withToken(token: string): SlackApiClient;
    call<T = Record<string, unknown>>(endpoint: string, body: Record<string, unknown>, options?: CallOptions): Promise<SlackApiOk<T>>;
    chatPostMessage(body: {
        channel: string;
        text?: string;
        blocks?: SlackBlock[];
        thread_ts?: string;
    }): Promise<SlackApiOk<{
        ts: string;
        channel: string;
    }>>;
    chatPostEphemeral(body: {
        channel: string;
        user: string;
        text?: string;
        blocks?: SlackBlock[];
    }): Promise<SlackApiOk<{
        message_ts: string;
    }>>;
    chatUnfurl(body: SlackChatUnfurlInput): Promise<SlackApiOk<Record<string, unknown>>>;
    conversationsHistory(body: {
        channel: string;
        limit?: number;
        latest?: string;
        inclusive?: boolean;
    }): Promise<SlackApiOk<{
        messages: SlackMessage[];
        has_more: boolean;
    }>>;
    conversationsReplies(body: {
        channel: string;
        ts: string;
        latest?: string;
        inclusive?: boolean;
        limit?: number;
    }): Promise<SlackApiOk<{
        messages: SlackMessage[];
        has_more: boolean;
    }>>;
    conversationsInfo(body: {
        channel: string;
    }): Promise<SlackApiOk<{
        channel: SlackChannel;
    }>>;
    conversationsList(body: {
        types?: string;
        limit?: number;
        cursor?: string;
    }): Promise<SlackApiOk<{
        channels: SlackChannel[];
        response_metadata?: {
            next_cursor: string;
        };
    }>>;
    conversationsOpen(body: {
        users: string;
    }): Promise<SlackApiOk<{
        channel: {
            id: string;
        };
    }>>;
    conversationsMembers(body: {
        channel: string;
        limit?: number;
        cursor?: string;
    }): Promise<SlackApiOk<{
        members: string[];
        response_metadata?: {
            next_cursor?: string;
        };
    }>>;
    usersInfo(body: {
        user: string;
    }): Promise<SlackApiOk<{
        user: SlackUser;
    }>>;
    openIdUserInfo(): Promise<SlackApiOk<SlackOpenIdUserInfo>>;
    getUserDisplayName(userId: string): Promise<string | undefined>;
    viewsOpen(body: {
        trigger_id: string;
        view: Record<string, unknown>;
    }): Promise<SlackApiOk<Record<string, unknown>>>;
    viewsUpdate(body: {
        view_id: string;
        view: Record<string, unknown>;
    }): Promise<SlackApiOk<Record<string, unknown>>>;
    viewsPublish(body: {
        user_id: string;
        view: Record<string, unknown>;
        hash?: string;
    }): Promise<SlackApiOk<Record<string, unknown>>>;
}
export {};
