import { EnvironmentService } from '../../../integrations/environment/environment.service';
import { PageRepo } from "../../../database/repos/page/page.repo";
import { KyselyDB } from "../../../database/types/kysely.types";
import { SearchDTO } from '../../../core/search/dto/search.dto';
import { SpaceMemberRepo } from "../../../database/repos/space/space-member.repo";
import { PagePermissionRepo } from "../../../database/repos/page/page-permission.repo";
import { AiService } from "./ai.service";
import { VectorDriver, VectorSearchHit } from "../vector/interfaces/vector-driver.interface";
export type SimilarPageChunk = VectorSearchHit & {
    similarity: number;
    title: string;
    slugId: string;
    spaceSlug: string;
};
export declare class AiSearchService {
    private readonly aiService;
    private readonly environmentService;
    private readonly pageRepo;
    private readonly spaceMemberRepo;
    private readonly pagePermissionRepo;
    private readonly db;
    private readonly vectorDriver;
    private readonly logger;
    private textSplitter;
    constructor(aiService: AiService, environmentService: EnvironmentService, pageRepo: PageRepo, spaceMemberRepo: SpaceMemberRepo, pagePermissionRepo: PagePermissionRepo, db: KyselyDB, vectorDriver: VectorDriver);
    searchSimilarPages(searchParams: SearchDTO, opts: {
        userId: string;
        workspaceId: string;
    }): Promise<SimilarPageChunk[]>;
    private hydrateChunks;
    askAiSearch(searchParams: SearchDTO, opts: {
        userId: string;
        workspaceId: string;
        locale?: string | null;
    }): Promise<{
        stream: AsyncIterable<string>;
        sources: any[];
    }>;
    generatePageEmbeddings(pageId: string): Promise<void>;
    private preparePageText;
    private buildEmbeddingsToStore;
}
