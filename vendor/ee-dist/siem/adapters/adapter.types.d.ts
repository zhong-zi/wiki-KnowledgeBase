import { ResolvedDestination, SiemDestinationType, SiemEvent } from '../siem.types';
export interface SiemAdapter {
    readonly type: SiemDestinationType;
    readonly maxBatchSize: number;
    readonly maxPayloadBytes: number;
    send(events: SiemEvent[], destination: ResolvedDestination): Promise<void>;
    measure(events: SiemEvent[], destination: ResolvedDestination): number;
}
export declare class SiemDeliveryError extends Error {
    readonly retryable: boolean;
    readonly statusCode?: number;
    constructor(message: string, retryable: boolean, statusCode?: number);
}
export declare function isRetryableStatus(status: number): boolean;
