"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AiSearchService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiSearchService = void 0;
const common_1 = require("@nestjs/common");
const textsplitters_1 = require("@langchain/textsplitters");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const page_repo_1 = require("../../../database/repos/page/page.repo");
const nestjs_kysely_1 = require("nestjs-kysely");
const helpers_1 = require("../../../common/helpers");
const space_member_repo_1 = require("../../../database/repos/space/space-member.repo");
const page_permission_repo_1 = require("../../../database/repos/page/page-permission.repo");
const ai_service_1 = require("./ai.service");
const ai_constants_1 = require("../ai.constants");
const locale_language_1 = require("../utils/locale-language");
const vector_constants_1 = require("../vector/vector.constants");
let AiSearchService = AiSearchService_1 = class AiSearchService {
    constructor(aiService, environmentService, pageRepo, spaceMemberRepo, pagePermissionRepo, db, vectorDriver) {
        this.aiService = aiService;
        this.environmentService = environmentService;
        this.pageRepo = pageRepo;
        this.spaceMemberRepo = spaceMemberRepo;
        this.pagePermissionRepo = pagePermissionRepo;
        this.db = db;
        this.vectorDriver = vectorDriver;
        this.logger = new common_1.Logger(AiSearchService_1.name);
        this.textSplitter = new textsplitters_1.RecursiveCharacterTextSplitter({
            chunkSize: 5500,
            chunkOverlap: 200,
            separators: [
                '\n\n',
                '\n',
                '. ',
                ', ',
                ' ',
                '',
            ],
        });
    }
    async searchSimilarPages(searchParams, opts) {
        const { query } = searchParams;
        const searchQuery = query?.trim();
        if (!searchQuery || searchQuery.length < 1) {
            return [];
        }
        if (!this.environmentService.getAiEmbeddingModel()?.length) {
            throw new common_1.BadRequestException('AI embedding model is not configured');
        }
        const embedding = await this.aiService.generateEmbeddings(query);
        const spaceIds = searchParams?.spaceId
            ? [searchParams.spaceId]
            : await this.spaceMemberRepo.getUserSpaceIds(opts.userId);
        const hits = await this.vectorDriver.search({
            workspaceId: opts.workspaceId,
            spaceIds,
            embedding,
            limit: vector_constants_1.VECTOR_SEARCH_LIMIT,
            maxDistance: vector_constants_1.VECTOR_SEARCH_MAX_DISTANCE,
        });
        const results = await this.hydrateChunks(hits, spaceIds);
        if (results.length === 0)
            return [];
        const accessibleIds = await this.pagePermissionRepo.filterAccessiblePageIds({
            pageIds: [...new Set(results.map((r) => r.pageId))],
            userId: opts.userId,
        });
        const accessibleSet = new Set(accessibleIds);
        return results.filter((result) => accessibleSet.has(result.pageId));
    }
    async hydrateChunks(hits, allowedSpaceIds) {
        if (hits.length === 0)
            return [];
        const pages = await this.db
            .selectFrom('pages as p')
            .innerJoin('spaces as s', 's.id', 'p.spaceId')
            .select([
            'p.id',
            'p.title',
            'p.slugId',
            'p.spaceId',
            's.slug as spaceSlug',
        ])
            .where('p.id', 'in', [...new Set(hits.map((hit) => hit.pageId))])
            .where('p.deletedAt', 'is', null)
            .execute();
        const pagesById = new Map(pages.map((page) => [page.id, page]));
        const allowedSpaces = new Set(allowedSpaceIds);
        return hits.flatMap((hit) => {
            const page = pagesById.get(hit.pageId);
            if (!page || !allowedSpaces.has(page.spaceId))
                return [];
            return [
                {
                    ...hit,
                    spaceId: page.spaceId,
                    similarity: 1 - hit.distance,
                    title: page.title,
                    slugId: page.slugId,
                    spaceSlug: page.spaceSlug,
                },
            ];
        });
    }
    async askAiSearch(searchParams, opts) {
        const { userId, workspaceId, locale } = opts;
        const { query } = searchParams;
        if (!(await this.vectorDriver.isReady())) {
            throw new common_1.BadRequestException('AI embeddings store is not configured');
        }
        if (!this.aiService.isDriverConfigured()) {
            throw new common_1.BadRequestException('AI driver is not configured');
        }
        const languageDirective = (0, locale_language_1.buildLanguageDirective)(locale);
        const defaultLanguage = (0, locale_language_1.languageFromLocale)(locale);
        const systemPrompt = 'You are a helpful AI assistant for a collaborative team workspace.' +
            ' Answer questions based on the provided context from pages in the workspace. Be concise, accurate, and professional.' +
            `\n\n${languageDirective}`;
        const searchResults = await this.searchSimilarPages(searchParams, {
            userId,
            workspaceId,
        });
        if (!searchResults || searchResults.length === 0) {
            async function* emptyStream() {
                yield "I couldn't find any relevant pages in your workspace for that query.";
            }
            return {
                stream: emptyStream(),
                sources: [],
            };
        }
        const pageIds = [...new Set(searchResults.map((r) => r.pageId))];
        const pages = await this.db
            .selectFrom('pages')
            .select(['id', 'textContent'])
            .where('id', 'in', pageIds)
            .execute();
        const pageContentMap = new Map(pages.map((p) => [
            p.id,
            p.textContent ? (0, helpers_1.collapseBlankLines)(p.textContent) : p.textContent,
        ]));
        const validChunks = searchResults
            .map((result) => {
            const pageContent = pageContentMap.get(result.pageId);
            if (!pageContent)
                return null;
            const chunkText = pageContent
                .substring(result.chunkStart, result.chunkStart + result.chunkLength)
                .trim();
            return {
                pageId: result.pageId,
                title: result.title,
                slugId: result.slugId,
                spaceSlug: result.spaceSlug,
                chunkText,
                distance: result.distance,
                similarity: result.similarity,
                chunkIndex: result.chunkIndex,
            };
        })
            .filter((chunk) => chunk !== null && chunk.chunkText.length > 0);
        if (validChunks.length === 0) {
            async function* emptyStream() {
                yield 'Unable to retrieve content from the knowledge base.';
            }
            return {
                stream: emptyStream(),
                sources: [],
            };
        }
        const contextText = validChunks
            .map((chunk, index) => `${chunk.title}]\n${chunk.chunkText}\n`)
            .join('\n---\n');
        const userPrompt = `Context from knowledge base: ${contextText}
      User Question: ${query}
      Please provide a concise but comprehensive answer based on the context above.
      Your answer must not be more than 200 words. Unless the user asked for length.
      You are not a chatbot, you are a search and information retrieval assistant.

      Reminder: answer in the same language as the "User Question" above. Default to ${defaultLanguage} if the question's language is unclear. Do not reply in English unless the question is in English.
      `;
        try {
            const stream = await this.aiService.generateCompletionStream({
                systemPrompt,
                userPrompt,
                temperature: 0.2,
                maxTokens: ai_constants_1.DEFAULT_AI_CONFIG.maxTokens,
                stream: true,
            });
            return {
                stream,
                sources: validChunks.map((chunk) => ({
                    pageId: chunk.pageId,
                    title: chunk.title,
                    slugId: chunk.slugId,
                    spaceSlug: chunk.spaceSlug,
                    similarity: chunk.similarity,
                    distance: chunk.distance,
                    chunkIndex: chunk.chunkIndex,
                    excerpt: chunk.chunkText.substring(0, 200) +
                        (chunk.chunkText.length > 200 ? '...' : ''),
                })),
            };
        }
        catch (error) {
            this.logger.error({ err: error }, 'Failed to generate AI search response');
            throw new common_1.BadRequestException('Failed to generate AI search response. Please try again later.');
        }
    }
    async generatePageEmbeddings(pageId) {
        if (!this.aiService.isDriverConfigured())
            return;
        const page = await this.pageRepo.findById(pageId, {
            includeTextContent: true,
        });
        if (!page || page.deletedAt)
            return;
        const workspace = await this.db
            .selectFrom('workspaces')
            .select(['id', 'settings'])
            .where('id', '=', page.workspaceId)
            .executeTakeFirst();
        const isAiSearchEnabled = workspace?.settings?.['ai']?.['search'] === true;
        if (!isAiSearchEnabled)
            return;
        if (!page?.textContent || page.textContent.length < 200)
            return;
        const pageText = this.preparePageText(page);
        const documents = await this.textSplitter.createDocuments([pageText], [{ pageId: page.id, title: page.title }]);
        this.logger.debug(`Split page ${page.id} into ${documents.length} chunks`);
        const embeddings = await this.aiService.generateEmbeddingsBatch(documents.map((doc) => doc.pageContent));
        const titlePrefixLength = page.title?.trim()
            ? `# ${page.title}\n\n`.length
            : 0;
        const embeddingsToStore = this.buildEmbeddingsToStore({
            documents,
            embeddings,
            pageText,
            titlePrefixLength,
        });
        await this.vectorDriver.upsertPageChunks({
            pageId: page.id,
            spaceId: page.spaceId,
            workspaceId: page.workspaceId,
            modelName: this.environmentService.getAiEmbeddingModel(),
            chunks: embeddingsToStore,
        });
    }
    preparePageText(page) {
        let text = page.textContent;
        if (page.title?.trim()) {
            text = `# ${page.title}\n\n${text}`;
        }
        const MAX_TEXT_LENGTH = 100000;
        if (text.length > MAX_TEXT_LENGTH) {
            this.logger.debug(`Page ${page.id} text truncated from ${text.length} to ${MAX_TEXT_LENGTH}`);
            text = text.substring(0, MAX_TEXT_LENGTH);
        }
        return (0, helpers_1.collapseBlankLines)(text);
    }
    buildEmbeddingsToStore(opts) {
        const { embeddings, documents, pageText, titlePrefixLength } = opts;
        let currentPosition = 0;
        return documents.map((doc, i) => {
            const chunkStartInModified = pageText.indexOf(doc.pageContent, currentPosition);
            const chunkLength = doc.pageContent.length;
            const chunkStart = Math.max(0, chunkStartInModified - titlePrefixLength);
            currentPosition = chunkStartInModified + chunkLength - 200;
            return {
                chunkIndex: i,
                chunkStart,
                chunkLength,
                embedding: embeddings[i],
            };
        });
    }
};
exports.AiSearchService = AiSearchService;
exports.AiSearchService = AiSearchService = AiSearchService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(5, (0, nestjs_kysely_1.InjectKysely)()),
    __param(6, (0, common_1.Inject)(vector_constants_1.VECTOR_DRIVER_TOKEN)),
    __metadata("design:paramtypes", [ai_service_1.AiService,
        environment_service_1.EnvironmentService,
        page_repo_1.PageRepo,
        space_member_repo_1.SpaceMemberRepo,
        page_permission_repo_1.PagePermissionRepo, Object, Object])
], AiSearchService);
//# sourceMappingURL=ai-search.service.js.map