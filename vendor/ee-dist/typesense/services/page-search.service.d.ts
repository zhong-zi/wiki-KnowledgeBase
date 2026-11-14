import { PageRepo } from "../../../database/repos/page/page.repo";
import { PagePermissionRepo } from "../../../database/repos/page/page-permission.repo";
import { SearchDTO } from '../../../core/search/dto/search.dto';
import { SpaceMemberRepo } from "../../../database/repos/space/space-member.repo";
import { ShareRepo } from "../../../database/repos/share/share.repo";
import { KyselyDB } from "../../../database/types/kysely.types";
import { TypesenseService } from "./typesense.service";
export declare class PageSearchService {
    private readonly db;
    private readonly typesenseService;
    private readonly pageRepo;
    private readonly pagePermissionRepo;
    private readonly spaceMemberRepo;
    private readonly shareRepo;
    private readonly logger;
    constructor(db: KyselyDB, typesenseService: TypesenseService, pageRepo: PageRepo, pagePermissionRepo: PagePermissionRepo, spaceMemberRepo: SpaceMemberRepo, shareRepo: ShareRepo);
    createPagesCollection(): Promise<void>;
    searchPage(searchParams: SearchDTO, opts: {
        userId?: string;
        workspaceId: string;
        publicPageIds?: string[];
    }): Promise<{
        items: import("../../../core/search/dto/search-response.dto").SearchResponseDto[];
    }>;
    indexAllPages(workspaceId?: string): Promise<void>;
}
