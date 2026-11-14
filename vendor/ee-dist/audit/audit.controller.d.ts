import { AuditService } from './services/audit.service';
import { AuditQueryService } from './services/audit-query.service';
import { ListAuditLogsDto, UpdateAuditRetentionDto } from './dto/audit-log.dto';
import { User, Workspace } from "../../database/types/entity.types";
import { PaginationOptions } from "../../database/pagination/pagination-options";
import WorkspaceAbilityFactory from '../../core/casl/abilities/workspace-ability.factory';
import { EnvironmentService } from '../../integrations/environment/environment.service';
export declare class AuditController {
    private readonly auditService;
    private readonly auditQueryService;
    private readonly workspaceAbility;
    private readonly environmentService;
    constructor(auditService: AuditService, auditQueryService: AuditQueryService, workspaceAbility: WorkspaceAbilityFactory, environmentService: EnvironmentService);
    listAuditLogs(dto: ListAuditLogsDto, pagination: PaginationOptions, user: User, workspace: Workspace): Promise<{
        items: {
            resource?: import("./services/audit-enrichment.service").EnrichedResource;
            actor?: import("./services/audit-enrichment.service").EnrichedActor;
            id: string;
            workspaceId: string;
            actorId: string | null;
            actorType: string;
            event: string;
            resourceType: string;
            resourceId: string | null;
            spaceId: string | null;
            changes: Record<string, any> | null;
            metadata: Record<string, any> | null;
            ipAddress: string | null;
            userAgent: string | null;
            createdAt: Date;
        }[];
        meta: {
            limit: number;
            hasNextPage: boolean;
            hasPrevPage: boolean;
            nextCursor: string | null;
            prevCursor: string | null;
        };
    }>;
    getRetention(user: User, workspace: Workspace): Promise<{
        retentionDays: number;
    }>;
    updateRetention(dto: UpdateAuditRetentionDto, user: User, workspace: Workspace): Promise<{
        retentionDays: number;
    }>;
}
