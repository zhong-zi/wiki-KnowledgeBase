import { KyselyDB } from "../../../database/types/kysely.types";
import { AuditLogFilters } from '../stores/postgres-audit.store';
import { IAuditStore } from '../stores/audit-store.types';
import { PaginationOptions } from "../../../database/pagination/pagination-options";
import { AuditEnrichmentService } from './audit-enrichment.service';
export declare class AuditQueryService {
    private readonly auditStore;
    private readonly db;
    private readonly enrichment;
    constructor(auditStore: IAuditStore, db: KyselyDB, enrichment: AuditEnrichmentService);
    findByWorkspace(workspaceId: string, filters: AuditLogFilters, pagination: PaginationOptions): Promise<{
        items: {
            resource?: import("./audit-enrichment.service").EnrichedResource;
            actor?: import("./audit-enrichment.service").EnrichedActor;
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
    getRetention(workspaceId: string): Promise<number>;
    updateRetention(workspaceId: string, retentionDays: number): Promise<void>;
}
