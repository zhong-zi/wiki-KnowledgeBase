import { UnfurlResult } from '../../../../../core/integration/registry/integration-provider.interface';
export declare class SlackUnfurlService {
    assertCanViewChannel(botToken: string, channelId: string, slackUserId: string): Promise<void>;
    unfurlMessage(botToken: string, channelId: string, rawTs: string, threadTs: string | null, teamName: string | undefined, url: string): Promise<UnfurlResult>;
    unfurlChannel(botToken: string, channelId: string, teamName: string | undefined, url: string): Promise<UnfurlResult>;
    private permalinkTsToMessageTs;
    private fetchMessage;
    private resolveAuthor;
    private resolveChannelLabel;
    private cleanText;
}
