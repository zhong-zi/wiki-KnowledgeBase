import { FastifyReply } from 'fastify';
import { User, Workspace } from "../../../database/types/entity.types";
import { AiSearchService } from "../services/ai-search.service";
import { SearchDTO } from '../../../core/search/dto/search.dto';
import SpaceAbilityFactory from '../../../core/casl/abilities/space-ability.factory';
import { AiGenerateDto } from '../dto/ai-content.dto';
import { AiService } from '../services/ai.service';
import { VectorPrewarmService } from '../vector/services/vector-prewarm.service';
export declare class AiContentController {
    private readonly vectorService;
    private readonly spaceAbility;
    private readonly aiService;
    private readonly vectorPrewarmService;
    constructor(vectorService: AiSearchService, spaceAbility: SpaceAbilityFactory, aiService: AiService, vectorPrewarmService: VectorPrewarmService);
    hintVectorCache(workspace: Workspace): Promise<void>;
    ragSearch(searchDto: SearchDTO, user: User, workspace: Workspace, reply: FastifyReply): Promise<void>;
    generateStream(dto: AiGenerateDto, user: User, workspace: Workspace, reply: FastifyReply): Promise<void>;
}
