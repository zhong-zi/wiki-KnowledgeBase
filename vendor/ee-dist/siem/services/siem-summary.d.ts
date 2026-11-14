export type SummaryPrincipal = {
    type: 'user' | 'group';
    id: string;
    name: string | null;
};
export type SummaryContext = {
    id: string;
    name: string | null;
};
export type SummaryInput = {
    event: string;
    actorName: string | null;
    resource: {
        type: string;
        id: string | null;
        name: string | null;
    };
    space: {
        name: string | null;
    } | null;
    changes: {
        before?: Record<string, unknown>;
        after?: Record<string, unknown>;
    } | null;
    metadata: Record<string, unknown> | null;
    principal: SummaryPrincipal | null;
    contextPage: SummaryContext | null;
    contextSpace: SummaryContext | null;
};
export declare function buildSummary(input: SummaryInput): string;
