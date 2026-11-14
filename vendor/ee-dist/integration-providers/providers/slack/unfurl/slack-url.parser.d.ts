export type ParsedPageUrl = {
    slugId: string;
    spaceSlug: string;
};
export declare function parseDocmostPageUrl(rawUrl: string, acceptedHosts: ReadonlySet<string>): ParsedPageUrl | null;
