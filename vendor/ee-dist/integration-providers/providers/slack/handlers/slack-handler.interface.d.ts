import { Integration, Workspace } from "../../../../../database/types/entity.types";
import { SlackApiClient } from '../client/slack-api.client';
import { SlackBlock } from '../client/slack-api.types';
export type SlackEphemeralResponse = {
    response_type: 'ephemeral';
    text?: string;
    blocks?: SlackBlock[];
    replace_original?: boolean;
};
export type SlackInChannelResponse = {
    response_type: 'in_channel';
    text?: string;
    blocks?: SlackBlock[];
};
export type SlackResponse = SlackEphemeralResponse | SlackInChannelResponse;
export type SlackHandlerContext = {
    integration: Integration;
    workspace: Workspace;
    appUrl: string;
    rawBody: string;
    apiClient: SlackApiClient;
    respond: (payload: SlackResponse) => Promise<void>;
};
export interface SlackHandler<TPayload> {
    readonly type: string;
    handle(payload: TPayload, ctx: SlackHandlerContext): Promise<void>;
}
export declare function ephemeral(text: string): SlackEphemeralResponse;
export declare const DIALOG_OPEN_FAILED_TEXT = "Couldn't open the dialog. Please try again.";
export declare const DIALOG_EXPIRED_TEXT = "That dialog has expired. Run the shortcut again.";
