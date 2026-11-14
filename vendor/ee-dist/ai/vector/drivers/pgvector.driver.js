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
var PgVectorDriver_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PgVectorDriver = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const kysely_1 = require("kysely");
const fs_1 = require("fs");
const path = require("path");
const pgvector = require("pgvector/kysely");
const kysely_2 = require("pgvector/kysely");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const environment_service_1 = require("../../../../integrations/environment/environment.service");
const constants_1 = require("../../../../integrations/queue/constants");
const page_embeddings_repo_1 = require("../../repos/page-embeddings.repo");
const model_presets_1 = require("../../config/model-presets");
const ai_constants_1 = require("../../ai.constants");
const utils_1 = require("../../../../database/utils");
const vector_constants_1 = require("../vector.constants");
let PgVectorDriver = PgVectorDriver_1 = class PgVectorDriver {
    constructor(db, environmentService, pageEmbeddingsRepo, aiQueue) {
        this.db = db;
        this.environmentService = environmentService;
        this.pageEmbeddingsRepo = pageEmbeddingsRepo;
        this.aiQueue = aiQueue;
        this.logger = new common_1.Logger(PgVectorDriver_1.name);
    }
    getDriverName() {
        return vector_constants_1.VectorDriverName.PGVECTOR;
    }
    async isReady() {
        if (!(await this.pageEmbeddingsRepo.isPgVectorEnabled()))
            return false;
        return this.pageEmbeddingsRepo.isPageEmbeddingsTableExists();
    }
    async init() {
        const migrationProvider = new kysely_1.FileMigrationProvider({
            fs: fs_1.promises,
            path,
            migrationFolder: path.join(__dirname, '..', '..', 'migrations'),
        });
        const migrations = await migrationProvider.getMigrations();
        const migrationList = Object.keys(migrations)
            .sort()
            .map((name) => ({ ...migrations[name], name }));
        const lockOptions = Object.freeze({
            lockTable: kysely_1.DEFAULT_MIGRATION_LOCK_TABLE,
            lockRowId: kysely_1.MIGRATION_LOCK_ID,
        });
        const pgAdapter = this.db.getExecutor().adapter;
        const run = async (db) => {
            try {
                await pgAdapter.acquireMigrationLock(this.db, lockOptions);
                for (let i = 0; i < migrationList.length; i++) {
                    await migrationList[i].up(this.db);
                }
            }
            finally {
                await pgAdapter.releaseMigrationLock(this.db, lockOptions);
            }
        };
        await this.db.transaction().execute(run);
    }
    async validate() {
        if (!(await this.isReady()))
            return;
        const configuredModel = this.environmentService.getAiEmbeddingModel();
        if (!configuredModel?.trim()?.length) {
            this.logger.warn('AI embedding model is not configured.');
            return;
        }
        const modelPreset = (0, model_presets_1.getModelPreset)(configuredModel);
        const configuredDimension = this.environmentService.getAiEmbeddingDimension() ||
            modelPreset?.dimensions ||
            ai_constants_1.MAX_VECTOR_DIMENSIONS;
        const modelMismatch = await this.checkModelMismatch(configuredModel);
        if (modelMismatch) {
            this.logger.warn(`Embedding model mismatch: Existing model: ${modelMismatch.storedModel}. New model=${configuredModel}. Resetting embeddings.`);
            await this.resetEmbeddings(configuredDimension);
            return;
        }
        const indexResult = await (0, kysely_1.sql) `
      SELECT indexdef
      FROM pg_indexes
      WHERE tablename = 'page_embeddings'
      AND indexname = 'page_embeddings_embedding_idx'
    `.execute(this.db);
        if (!indexResult.rows || indexResult.rows.length === 0) {
            await this.createIndexIfNotExists(configuredDimension);
            return;
        }
        const indexDef = indexResult.rows[0].indexdef;
        const dimensionMatch = indexDef.match(/halfvec\((\d+)\)/);
        const storedDimension = dimensionMatch
            ? parseInt(dimensionMatch[1], 10)
            : null;
        if (!storedDimension) {
            this.logger.debug('Could not extract dimension from index, skipping validation');
            return;
        }
        if (storedDimension !== configuredDimension) {
            this.logger.warn(`Dimension mismatch: stored=${storedDimension}, configured=${configuredDimension}. Resetting embeddings.`);
            await this.resetEmbeddings(configuredDimension);
        }
    }
    async upsertPageChunks(params) {
        const { pageId, spaceId, workspaceId, modelName, chunks } = params;
        await (0, utils_1.executeTx)(this.db, async (trx) => {
            await this.pageEmbeddingsRepo.deleteByPageId(pageId, { trx });
            if (chunks.length === 0)
                return;
            await this.pageEmbeddingsRepo.insertPageEmbeddingBatch(chunks.map((chunk) => ({
                pageId,
                embedding: pgvector.toSql(chunk.embedding),
                modelName,
                modelDimensions: chunk.embedding.length,
                chunkIndex: chunk.chunkIndex,
                chunkStart: chunk.chunkStart,
                chunkLength: chunk.chunkLength,
                metadata: {},
                spaceId,
                workspaceId,
            })), { trx });
        });
    }
    async search(params) {
        const { workspaceId, spaceIds, embedding, limit, maxDistance } = params;
        if (spaceIds?.length === 0)
            return [];
        let query = this.db
            .selectFrom('pageEmbeddings as pe')
            .select([
            'pe.pageId',
            'pe.spaceId',
            'pe.chunkIndex',
            'pe.chunkStart',
            'pe.chunkLength',
            (0, kysely_1.sql) `pe.embedding <=> ${pgvector.toSql(embedding)}`.as('distance'),
        ])
            .where((0, kysely_2.cosineDistance)('embedding', embedding), '<', maxDistance)
            .orderBy((0, kysely_2.cosineDistance)('embedding', embedding))
            .limit(limit);
        query = spaceIds
            ? query.where('pe.spaceId', 'in', spaceIds)
            : query.where('pe.workspaceId', '=', workspaceId);
        const rows = await query.execute();
        return rows.map((row) => ({
            pageId: row.pageId,
            spaceId: row.spaceId,
            chunkIndex: Number(row.chunkIndex),
            chunkStart: Number(row.chunkStart),
            chunkLength: Number(row.chunkLength),
            distance: Number(row.distance),
        }));
    }
    async deletePages(pageIds) {
        if (pageIds.length === 0)
            return;
        await this.db
            .deleteFrom('pageEmbeddings')
            .where('pageId', 'in', pageIds)
            .execute();
    }
    async movePagesToSpace(pageIds, spaceId) {
        if (pageIds.length === 0)
            return;
        await this.db
            .updateTable('pageEmbeddings')
            .set({ spaceId })
            .where('pageId', 'in', pageIds)
            .execute();
    }
    async deleteSpace(spaceId) {
        if (!spaceId)
            return;
        await this.db
            .deleteFrom('pageEmbeddings')
            .where('spaceId', '=', spaceId)
            .execute();
    }
    async deleteWorkspace(workspaceId) {
        if (!workspaceId)
            return;
        await this.db
            .deleteFrom('pageEmbeddings')
            .where('workspaceId', '=', workspaceId)
            .execute();
    }
    async prewarm() {
        return;
    }
    async checkModelMismatch(configuredModel) {
        try {
            const result = await this.db
                .selectFrom('pageEmbeddings')
                .select(['id', 'modelName'])
                .limit(1)
                .executeTakeFirst();
            if (!result)
                return null;
            if (result.modelName !== configuredModel) {
                return { storedModel: result.modelName };
            }
            return null;
        }
        catch (error) {
            this.logger.debug({ err: error }, 'Could not check model mismatch');
            return null;
        }
    }
    async createIndexIfNotExists(dimension) {
        this.logger.debug(`Creating vector index with ${dimension} dimensions`);
        try {
            await (0, kysely_1.sql) `
        CREATE INDEX CONCURRENTLY IF NOT EXISTS page_embeddings_embedding_idx
        ON page_embeddings
        USING hnsw ((embedding::halfvec(${kysely_1.sql.lit(dimension)})) halfvec_cosine_ops)
        WITH (m = 16, ef_construction = 64)
      `.execute(this.db);
            this.logger.debug(`Created HNSW index (${dimension}D)`);
        }
        catch (error) {
            this.logger.error({ err: error }, `Failed to create index (${dimension}D)`);
            throw error;
        }
    }
    async resetEmbeddings(newDimension) {
        try {
            const jobs = await this.aiQueue.getJobs([
                'waiting',
                'delayed',
                'prioritized',
                'waiting-children',
                'failed',
            ]);
            const embeddingJobs = jobs.filter((job) => job?.name === constants_1.QueueJob.GENERATE_PAGE_EMBEDDINGS ||
                job?.name === constants_1.QueueJob.WORKSPACE_CREATE_EMBEDDINGS);
            if (embeddingJobs.length > 0) {
                await Promise.allSettled(embeddingJobs.map((job) => job.remove()));
                this.logger.debug(`Removed ${embeddingJobs.length} pending embedding jobs`);
            }
        }
        catch (err) {
            this.logger.debug({ err }, 'Failed to clear pending embedding jobs');
        }
        try {
            await (0, kysely_1.sql) `DROP INDEX CONCURRENTLY IF EXISTS page_embeddings_embedding_idx`.execute(this.db);
            await (0, kysely_1.sql) `TRUNCATE TABLE page_embeddings CASCADE`.execute(this.db);
            await this.createIndexIfNotExists(newDimension);
            this.logger.log(`Page vector embeddings was reset. Model: ${this.environmentService.getAiEmbeddingModel()}; Dimensions: ${newDimension}.`);
            await this.aiQueue.add(constants_1.QueueJob.WORKSPACE_CREATE_EMBEDDINGS, { workspaceId: null, global: true }, {
                jobId: 'global-reembedding',
                delay: 30000,
                removeOnComplete: true,
            });
        }
        catch (error) {
            this.logger.error({ err: error }, 'Failed to reset page embeddings');
            throw error;
        }
    }
};
exports.PgVectorDriver = PgVectorDriver;
exports.PgVectorDriver = PgVectorDriver = PgVectorDriver_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __param(3, (0, bullmq_1.InjectQueue)(constants_1.QueueName.AI_QUEUE)),
    __metadata("design:paramtypes", [Object, environment_service_1.EnvironmentService,
        page_embeddings_repo_1.PageEmbeddingsRepo,
        bullmq_2.Queue])
], PgVectorDriver);
//# sourceMappingURL=pgvector.driver.js.map