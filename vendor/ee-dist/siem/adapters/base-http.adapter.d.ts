import { IOutboundAgentFactory } from '../../../integrations/outbound/outbound-agent.factory';
import { TlsOptions } from '../siem.types';
export type HttpPostRequest = {
    url: string;
    headers: Record<string, string>;
    body: string;
    tls?: TlsOptions;
};
export type HttpPostResponse = {
    statusCode: number;
    bodyText: string;
};
export declare abstract class BaseHttpAdapter {
    protected readonly agentFactory: IOutboundAgentFactory;
    protected constructor(agentFactory: IOutboundAgentFactory);
    protected measureBody(body: string): number;
    protected commonHeaders(workspaceId: string, contentType: string): Record<string, string>;
    protected post(req: HttpPostRequest): Promise<HttpPostResponse>;
}
