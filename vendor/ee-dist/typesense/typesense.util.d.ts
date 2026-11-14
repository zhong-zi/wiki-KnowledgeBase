import { SearchResponseDto } from '../../core/search/dto/search-response.dto';
import { CollectionCreateSchema } from 'typesense/lib/Typesense/Collections';
import { Page } from "../../database/types/entity.types";
import { SearchResponse } from 'typesense/lib/Typesense/Documents';
export declare function transformSearchResults(result: SearchResponse<any>, spaceMap?: Map<string, any>): SearchResponseDto[];
export declare function transformPageToDocument(page: Partial<Page> & {
    labelIds?: string[];
}): {
    id: string;
    slugId: string;
    title: string;
    icon: string;
    textContent: string;
    workspaceId: string;
    spaceId: string;
    creatorId: string;
    contributorIds: string[];
    labelIds: string[];
    parentPageId: string;
    createdAt: number;
    updatedAt: number;
    deletedAt: Date;
};
export declare function extractTypesenseError(error: any): any;
export declare function isTypesenseCollectionMissing(error: any): boolean;
export declare function sanitizeTypesenseError(error: any): {
    name?: string;
    message?: string;
    httpStatus?: number;
};
export declare function diffCollectionSchema(declared: CollectionCreateSchema, live: Pick<CollectionCreateSchema, 'fields'>): string[];
