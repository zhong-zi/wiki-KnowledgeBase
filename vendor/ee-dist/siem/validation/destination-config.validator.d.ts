import { SiemConfig, SiemDestinationType, SiemSecrets } from '../siem.types';
export type ValidateDestinationInput = {
    type: SiemDestinationType;
    config: Record<string, unknown>;
    secrets: Record<string, unknown>;
    isCloud: boolean;
    requireSecrets: boolean;
};
export type ValidatedDestination = {
    config: SiemConfig;
    secrets: SiemSecrets;
};
export declare function validateDestinationConfig(input: ValidateDestinationInput): ValidatedDestination;
