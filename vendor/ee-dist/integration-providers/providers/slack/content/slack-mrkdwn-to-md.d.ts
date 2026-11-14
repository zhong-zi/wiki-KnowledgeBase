export type PageMentionLookup = {
    id: string;
    slugId: string;
    title: string;
};
export type SlackMrkdwnOpts = {
    userResolver: (slackUserId: string) => Promise<string>;
    pageResolver?: (url: string) => Promise<PageMentionLookup | null>;
};
export declare function slackMrkdwnToMarkdown(text: string, opts: SlackMrkdwnOpts): Promise<string>;
export type SlackMessageInput = {
    text?: string;
    user?: string;
    ts?: string;
};
export declare function slackMessagesToMarkdown(messages: SlackMessageInput[], opts: SlackMrkdwnOpts): Promise<string>;
export declare function slackMessagesToConversationMarkdown(messages: SlackMessageInput[], opts: SlackMrkdwnOpts): Promise<string>;
export declare function escapeMarkdownInline(s: string): string;
