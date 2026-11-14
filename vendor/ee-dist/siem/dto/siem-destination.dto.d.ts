import { SiemDestinationType } from '../siem.types';
export declare const SIEM_DESTINATION_TYPES: SiemDestinationType[];
export declare class CreateSiemDestinationDto {
    name: string;
    type: SiemDestinationType;
    config: Record<string, unknown>;
    secrets?: Record<string, unknown>;
    enabled?: boolean;
}
export declare class UpdateSiemDestinationDto {
    destinationId: string;
    name?: string;
    config?: Record<string, unknown>;
    secrets?: Record<string, unknown>;
    enabled?: boolean;
}
export declare class SiemDestinationIdDto {
    destinationId: string;
}
export declare class TestSiemDestinationDto {
    type: SiemDestinationType;
    config: Record<string, unknown>;
    secrets?: Record<string, unknown>;
    destinationId?: string;
}
