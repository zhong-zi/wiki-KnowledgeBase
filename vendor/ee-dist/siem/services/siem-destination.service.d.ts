import { KyselyDB } from "../../../database/types/kysely.types";
import { SiemDestination } from "../../../database/types/entity.types";
import { EncryptionService } from '../../../integrations/encryption/encryption.service';
import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { AuditService } from '../../audit/services/audit.service';
import { OutboundUrlGuard } from '../../../integrations/outbound/outbound-url.guard';
import { SiemAdapterRegistry } from '../adapters/adapter.registry';
import { SiemEventBuilder } from './siem-event.builder';
import { ResolvedDestination, SiemDestinationView, SiemTestResult, WorkspaceSummary } from '../siem.types';
import { CreateSiemDestinationDto, TestSiemDestinationDto, UpdateSiemDestinationDto } from '../dto/siem-destination.dto';
export declare class SiemSecretsUnreadableError extends Error {
    readonly destinationId: string;
    constructor(destinationId: string);
}
export declare class SiemDestinationService {
    private readonly db;
    private readonly encryption;
    private readonly environmentService;
    private readonly urlGuard;
    private readonly registry;
    private readonly eventBuilder;
    private readonly auditService;
    private readonly logger;
    constructor(db: KyselyDB, encryption: EncryptionService, environmentService: EnvironmentService, urlGuard: OutboundUrlGuard, registry: SiemAdapterRegistry, eventBuilder: SiemEventBuilder, auditService: AuditService);
    list(workspaceId: string): Promise<SiemDestinationView[]>;
    create(workspaceId: string, creatorId: string, dto: CreateSiemDestinationDto): Promise<SiemDestinationView>;
    update(workspaceId: string, dto: UpdateSiemDestinationDto): Promise<SiemDestinationView>;
    remove(workspaceId: string, destinationId: string): Promise<void>;
    retry(workspaceId: string, destinationId: string): Promise<void>;
    test(workspace: WorkspaceSummary, user: {
        id: string;
        name: string | null;
        email: string | null;
    }, dto: TestSiemDestinationDto): Promise<SiemTestResult>;
    resolve(row: SiemDestination): ResolvedDestination;
    findByIdForWorkspace(workspaceId: string, destinationId: string): Promise<SiemDestination>;
    private toView;
    private encryptSecrets;
    private decryptSecrets;
    private assertUrlAllowed;
}
