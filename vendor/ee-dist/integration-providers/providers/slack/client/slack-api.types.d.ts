export type SlackApiOk<T> = T & {
    ok: true;
};
export type SlackApiErr = {
    ok: false;
    error: string;
    response_metadata?: {
        messages?: string[];
    };
};
export type SlackApiResult<T> = SlackApiOk<T> | SlackApiErr;
export type SlackOAuthV2Response = {
    ok: boolean;
    access_token: string;
    token_type: 'bot';
    scope: string;
    bot_user_id: string;
    app_id: string;
    team: {
        id: string;
        name: string;
    } | null;
    enterprise: {
        id: string;
        name: string;
    } | null;
    is_enterprise_install: boolean;
    authed_user: {
        id: string;
        scope?: string;
        access_token?: string;
        token_type?: string;
    };
};
export type SlackOpenIdUserInfo = {
    sub: string;
    'https://slack.com/user_id': string;
    'https://slack.com/team_id': string;
    name?: string;
    email?: string;
    email_verified?: boolean;
    picture?: string;
};
export type SlackUser = {
    id: string;
    name: string;
    real_name?: string;
    profile?: {
        display_name?: string;
        email?: string;
        image_72?: string;
    };
};
export type SlackChannel = {
    id: string;
    name: string;
    is_private?: boolean;
    is_im?: boolean;
    is_mpim?: boolean;
    topic?: {
        value?: string;
    };
    purpose?: {
        value?: string;
    };
    num_members?: number;
};
export type SlackMessage = {
    type: 'message';
    ts: string;
    user?: string;
    text?: string;
    bot_id?: string;
    username?: string;
    subtype?: string;
    thread_ts?: string;
    reply_count?: number;
};
export type SlackBlock = Record<string, unknown>;
export type SlackChatUnfurlInput = {
    channel: string;
    ts: string;
    unfurls: Record<string, {
        blocks: SlackBlock[];
    } | {
        text: string;
    }>;
};
