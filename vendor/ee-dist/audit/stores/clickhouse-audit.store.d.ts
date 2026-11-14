import { ClickHouseClient } from '@clickhouse/client';
import { AuditLogData } from '../../../common/events/audit-events';
import { PaginationOptions } from "../../../database/pagination/pagination-options";
import { CursorPaginationResult } from "../../../database/pagination/cursor-pagination";
import { IAuditStore, AuditStoreRow, AuditCursor, AuditReadResult } from './audit-store.types';
import { AuditLogFilters } from './postgres-audit.store';
export declare class ClickHouseAuditStore implements IAuditStore {
    private readonly client;
    readonly visibilityLagMs = 30000;
    private readonly logger;
    private serverGeneratesId;
    constructor(client: ClickHouseClient);
    insert(data: AuditLogData): Promise<void>;
    insertBatch(data: AuditLogData[]): Promise<void>;
    private hasServerGeneratedId;
    private probeIdDefault;
    findByWorkspace(workspaceId: string, filters: AuditLogFilters, pagination: PaginationOptions): Promise<CursorPaginationResult<AuditStoreRow>>;
    deleteOlderThan(days: number, workspaceId: string): Promise<number>;
    findAfterCursor(workspaceId: string, cursor: AuditCursor, limit: number, until: Date): Promise<AuditReadResult>;
    private toClickHouseDateTime;
    private toRow;
    private fromRow;
    private parseJson;
    private encodeCursor;
    private decodeCursor;
}
