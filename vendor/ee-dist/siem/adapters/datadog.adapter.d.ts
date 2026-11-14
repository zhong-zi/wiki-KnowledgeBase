import { BaseHttpAdapter } from './base-http.adapter';
import { SiemAdapter } from './adapter.types';
import { OutboundAgentFactory } from '../../../integrations/outbound/outbound-agent.factory';
import { ResolvedDestination, SiemEvent } from '../siem.types';
export declare class DatadogAdapter extends BaseHttpAdapter implements SiemAdapter {
    readonly type: "datadog";
    readonly maxBatchSize = 500;
    readonly maxPayloadBytes: number;
    constructor(agentFactory: OutboundAgentFactory);
    measure(events: SiemEvent[], destination: ResolvedDestination): number;
    send(events: SiemEvent[], destination: ResolvedDestination): Promise<void>;
    private buildBody;
}
