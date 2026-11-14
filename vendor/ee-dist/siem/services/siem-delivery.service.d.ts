import { Cache } from 'cache-manager';
import { KyselyDB } from "../../../database/types/kysely.types";
import { LicenseCheckService } from '../../../integrations/environment/license-check.service';
import { IAuditStore } from '../../audit/stores/audit-store.types';
import { AuditEnrichmentService } from '../../audit/services/audit-enrichment.service';
import { SiemEventBuilder } from './siem-event.builder';
import { SiemDestinationService } from './siem-destination.service';
import { SiemNotificationService } from './siem-notification.service';
import { SiemAdapterRegistry } from '../adapters/adapter.registry';
export type DeliveryOutcome = {
    delivered: number;
    batches: number;
    failed: boolean;
};
export declare class SiemDeliveryService {
    private readonly db;
    private readonly auditStore;
    private readonly enrichment;
    private readonly eventBuilder;
    private readonly registry;
    private readonly destinations;
    private readonly cache;
    private readonly licenseCheck;
    private readonly notifications;
    private readonly logger;
    constructor(db: KyselyDB, auditStore: IAuditStore, enrichment: AuditEnrichmentService, eventBuilder: SiemEventBuilder, registry: SiemAdapterRegistry, destinations: SiemDestinationService, cache: Cache, licenseCheck: LicenseCheckService, notifications: SiemNotificationService);
    deliver(destinationId: string): Promise<DeliveryOutcome>;
    private sendChunk;
    private recordFailure;
    private isLicensed;
}
