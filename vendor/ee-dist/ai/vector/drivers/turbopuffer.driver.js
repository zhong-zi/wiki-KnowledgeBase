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
var TurbopufferDriver_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TurbopufferDriver = void 0;
const common_1 = require("@nestjs/common");
const turbopuffer_1 = require("@turbopuffer/turbopuffer");
const nestjs_kysely_1 = require("nestjs-kysely");
const kysely_1 = require("kysely");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const environment_service_1 = require("../../../../integrations/environment/environment.service");
const constants_1 = require("../../../../integrations/queue/constants");
const model_presets_1 = require("../../config/model-presets");
const ai_constants_1 = require("../../ai.constants");
const vector_constants_1 = require("../vector.constants");
const turbopuffer_utils_1 = require("./turbopuffer.utils");
let TurbopufferDriver = TurbopufferDriver_1 = class TurbopufferDriver {
    constructor(environmentService, db, aiQueue) {
        this.environmentService = environmentService;
        this.db = db;
        this.aiQueue = aiQueue;
        this.logger = new common_1.Logger(TurbopufferDriver_1.name);
        this.client = null;
    }
    getDriverName() {
        return vector_constants_1.VectorDriverName.TURBOPUFFER;
    }
    async isReady() {
        const apiKey = this.environmentService.getTurbopufferApiKey();
        const region = this.environmentService.getTurbopufferRegion();
        const baseUrl = this.environmentService.getTurbopufferBaseUrl();
        return Boolean(apiKey && (region || baseUrl));
    }
    async init() {
        if (!(await this.isReady())) {
            throw new Error('turbopuffer is not configured. Set TURBOPUFFER_API_KEY and TURBOPUFFER_REGION.');
        }
        await this.getClient().namespaces({
            page_size: 1,
            prefix: this.environmentService.getTurbopufferNamespacePrefix(),
        });
        this.logger.log(`Vector store: turbopuffer (${this.environmentService.getTurbopufferRegion() ??
            this.environmentService.getTurbopufferBaseUrl()}), ${this.embeddingDimensions()}D`);
    }
    async validate() {
        const configuredModel = this.environmentService.getAiEmbeddingModel();
        if (!configuredModel?.trim()?.length) {
            this.logger.warn('AI embedding model is not configured.');
            return;
        }
        const current = this.currentFingerprint();
        const workspaces = await this.findAiSearchWorkspaces();
        for (const workspace of workspaces) {
            const stored = workspace.settings?.['ai']?.['embedding'];
            if ((0, turbopuffer_utils_1.fingerprintMatches)(stored, current)) {
                continue;
            }
            this.logger.warn(`Embedding fingerprint changed for workspace ${workspace.id}. Rebuilding turbopuffer namespace.`);
            await this.aiQueue.add(constants_1.QueueJob.WORKSPACE_RESET_EMBEDDINGS, { workspaceId: workspace.id }, {
                jobId: `reset-embeddings-${workspace.id}`,
                removeOnComplete: true,
                attempts: 3,
                backoff: { type: 'fixed', delay: 60 * 1000 },
            });
        }
    }
    currentFingerprint() {
        return {
            driver: vector_constants_1.VectorDriverName.TURBOPUFFER,
            model: this.environmentService.getAiEmbeddingModel(),
            dimensions: this.embeddingDimensions(),
        };
    }
    async findAiSearchWorkspaces() {
        return this.db
            .selectFrom('workspaces')
            .select(['id', 'settings'])
            .where((0, kysely_1.sql) `${kysely_1.sql.ref('settings')}->'ai'->>'search'`, '=', 'true')
            .execute();
    }
    async upsertPageChunks(params) {
        const { pageId, spaceId, workspaceId, chunks } = params;
        if (chunks.length === 0) {
            await this.deletePages([pageId], workspaceId);
            return;
        }
        await this.namespace(workspaceId).write({
            distance_metric: 'cosine_distance',
            schema: (0, turbopuffer_utils_1.buildVectorSchema)(this.embeddingDimensions()),
            upsert_columns: (0, turbopuffer_utils_1.buildUpsertColumns)(pageId, spaceId, chunks),
            delete_by_filter: (0, turbopuffer_utils_1.buildPrunePredicate)(pageId, chunks.length),
        });
    }
    async search(params) {
        const { workspaceId, spaceIds, embedding, limit, maxDistance } = params;
        if (spaceIds?.length === 0)
            return [];
        try {
            const response = await this.namespace(workspaceId).query({
                rank_by: ['vector', 'ANN', embedding],
                top_k: limit,
                filters: (0, turbopuffer_utils_1.buildSpaceFilter)(spaceIds),
                include_attributes: turbopuffer_utils_1.TURBOPUFFER_SEARCH_ATTRIBUTES,
                consistency: { level: 'strong' },
            }, { timeout: vector_constants_1.TURBOPUFFER_QUERY_TIMEOUT_MS });
            return (0, turbopuffer_utils_1.toSearchHits)(response.rows, maxDistance);
        }
        catch (err) {
            if (err instanceof turbopuffer_1.NotFoundError)
                return [];
            if (err instanceof turbopuffer_1.AuthenticationError ||
                err instanceof turbopuffer_1.PermissionDeniedError) {
                this.logger.error({ err }, 'turbopuffer rejected the API credentials');
                throw new common_1.BadRequestException('Vector search is not configured correctly');
            }
            throw err;
        }
    }
    async deletePages(pageIds, workspaceId) {
        if (pageIds.length === 0)
            return;
        await this.write(workspaceId, {
            delete_by_filter: ['page_id', 'In', pageIds],
        });
    }
    async movePagesToSpace(pageIds, spaceId, workspaceId) {
        if (pageIds.length === 0)
            return;
        await this.write(workspaceId, {
            patch_by_filter: {
                filters: ['page_id', 'In', pageIds],
                patch: { space_id: spaceId },
            },
        });
    }
    async deleteSpace(spaceId, workspaceId) {
        if (!spaceId)
            return;
        await this.write(workspaceId, {
            delete_by_filter: ['space_id', 'Eq', spaceId],
        });
    }
    async deleteWorkspace(workspaceId) {
        if (!workspaceId)
            return;
        try {
            await this.namespace(workspaceId).deleteAll();
        }
        catch (err) {
            if (err instanceof turbopuffer_1.NotFoundError)
                return;
            throw err;
        }
    }
    async prewarm(workspaceId) {
        if (!workspaceId)
            return;
        try {
            await this.namespace(workspaceId).hintCacheWarm();
        }
        catch (err) {
            if (err instanceof turbopuffer_1.NotFoundError)
                return;
            throw err;
        }
    }
    embeddingDimensions() {
        const model = this.environmentService.getAiEmbeddingModel();
        return (this.environmentService.getAiEmbeddingDimension() ||
            (0, model_presets_1.getModelPreset)(model)?.dimensions ||
            ai_constants_1.MAX_VECTOR_DIMENSIONS);
    }
    getClient() {
        if (!this.client) {
            this.client = new turbopuffer_1.Turbopuffer({
                apiKey: this.environmentService.getTurbopufferApiKey(),
                region: this.environmentService.getTurbopufferRegion() || null,
                baseURL: this.environmentService.getTurbopufferBaseUrl() || undefined,
                maxRetries: vector_constants_1.TURBOPUFFER_MAX_RETRIES,
                timeout: vector_constants_1.TURBOPUFFER_WRITE_TIMEOUT_MS,
            });
        }
        return this.client;
    }
    namespace(workspaceId) {
        return this.getClient().namespace((0, turbopuffer_utils_1.buildNamespaceName)(this.environmentService.getTurbopufferNamespacePrefix(), workspaceId));
    }
    async write(workspaceId, params) {
        try {
            await this.namespace(workspaceId).write(params);
        }
        catch (err) {
            if (err instanceof turbopuffer_1.NotFoundError)
                return;
            throw err;
        }
    }
};
exports.TurbopufferDriver = TurbopufferDriver;
exports.TurbopufferDriver = TurbopufferDriver = TurbopufferDriver_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, nestjs_kysely_1.InjectKysely)()),
    __param(2, (0, bullmq_1.InjectQueue)(constants_1.QueueName.AI_QUEUE)),
    __metadata("design:paramtypes", [environment_service_1.EnvironmentService, Object, bullmq_2.Queue])
], TurbopufferDriver);
//# sourceMappingURL=turbopuffer.driver.js.map