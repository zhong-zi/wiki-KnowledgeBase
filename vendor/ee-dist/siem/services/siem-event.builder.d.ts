import { DomainService } from '../../../integrations/environment/domain.service';
import { EnrichedAuditRow } from '../../audit/services/audit-enrichment.service';
import { SiemEvent, SiemWorkspace, WorkspaceSummary } from '../siem.types';
export declare function truncateIfNeeded(event: SiemEvent): SiemEvent;
export declare function toSiemEvent(row: EnrichedAuditRow, workspace: SiemWorkspace, baseUrl: string): SiemEvent;
export declare class SiemEventBuilder {
    private readonly domainService;
    constructor(domainService: DomainService);
    build(rows: EnrichedAuditRow[], workspace: WorkspaceSummary): SiemEvent[];
    buildTestEvent(workspace: WorkspaceSummary, actor: {
        id: string;
        name: string | null;
        email: string | null;
    }, destination: {
        id: string;
        name: string;
    }): SiemEvent;
    minimal(event: SiemEvent): SiemEvent;
    private resolveWorkspace;
}
