import { KyselyDB } from "../../../database/types/kysely.types";
import { AuditStoreRow } from '../stores/audit-store.types';
export type EnrichedActor = {
    id: string;
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
};
export type EnrichedResource = {
    id: string;
    name: string | null;
    slug?: string | null;
    slugId?: string | null;
    type?: string | null;
};
export type EnrichedSpace = {
    id: string;
    name: string | null;
    slug: string | null;
};
export type EnrichedPrincipal = {
    type: 'user' | 'group';
    id: string;
    name: string | null;
};
export type EnrichedContext = {
    id: string;
    name: string | null;
};
export type EnrichedAuditRow = AuditStoreRow & {
    actor: EnrichedActor | null;
    resource: EnrichedResource | null;
    space: EnrichedSpace | null;
    principal: EnrichedPrincipal | null;
    contextPage: EnrichedContext | null;
    contextSpace: EnrichedContext | null;
};
export declare class AuditEnrichmentService {
    private readonly db;
    constructor(db: KyselyDB);
    resolve(rows: AuditStoreRow[], workspaceId: string): Promise<EnrichedAuditRow[]>;
    private resolveResource;
    private loadUsers;
    private loadPages;
    private loadSpaces;
    private loadGroups;
    private loadTemplates;
    private loadAuthProviders;
}
