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
var VectorSyncService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorSyncService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const kysely_1 = require("kysely");
const environment_service_1 = require("../../../integrations/environment/environment.service");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const constants_1 = require("../../../integrations/queue/constants");
const workspace_repo_1 = require("../../../database/repos/workspace/workspace.repo");
const ai_service_1 = require("./ai.service");
const vector_constants_1 = require("../vector/vector.constants");
const turbopuffer_driver_1 = require("../vector/drivers/turbopuffer.driver");
const turbopuffer_utils_1 = require("../vector/drivers/turbopuffer.utils");
let VectorSyncService = VectorSyncService_1 = class VectorSyncService {
    constructor(db, environmentService, aiQueue, aiService, vectorDriver, workspaceRepo) {
        this.db = db;
        this.environmentService = environmentService;
        this.aiQueue = aiQueue;
        this.aiService = aiService;
        this.vectorDriver = vectorDriver;
        this.workspaceRepo = workspaceRepo;
        this.logger = new common_1.Logger(VectorSyncService_1.name);
    }
    async handlePageEmbeds(pageIds, workspaceId) {
        if (!this.aiService.isDriverConfigured())
            return;
        if (pageIds.length === 0 || !workspaceId)
            return;
        const workspace = await this.db
            .selectFrom('workspaces')
            .select(['settings'])
            .where('id', '=', workspaceId)
            .executeTakeFirst();
        const aiSearchEnabled = workspace?.settings?.['ai']?.['search'] === true;
        if (!aiSearchEnabled)
            return;
        const delay = this.environmentService.isDevelopment()
            ? 30 * 1000
            : 10 * 60 * 1000;
        const jobs = pageIds.map((pageId) => ({
            name: constants_1.QueueJob.GENERATE_PAGE_EMBEDDINGS,
            data: { pageId },
            opts: {
                jobId: pageId,
                delay,
                removeOnComplete: true,
                removeOnFail: true,
                attempts: 2,
                backoff: {
                    type: 'fixed',
                    delay: 2 * 60 * 1000,
                },
            },
        }));
        await this.aiQueue.addBulk(jobs);
    }
    async handlePageMovedToSpace(pageIds, spaceId, workspaceId) {
        if (pageIds.length === 0)
            return;
        await this.vectorDriver.movePagesToSpace(pageIds, spaceId, workspaceId);
    }
    async handlePageDeletion(pageIds, workspaceId) {
        if (pageIds.length === 0)
            return;
        await this.vectorDriver.deletePages(pageIds, workspaceId);
    }
    async handleSpaceDeletion(spaceId, workspaceId) {
        if (!spaceId)
            return;
        await this.vectorDriver.deleteSpace(spaceId, workspaceId);
    }
    async handleCreateEmbeddingsForWorkspace(data) {
        if (!this.aiService.isDriverConfigured())
            return;
        const { workspaceId, global } = data;
        if (global && !workspaceId) {
            await this.queuePagesForEmbedding();
            return;
        }
        if (!workspaceId)
            return;
        const workspace = await this.db
            .selectFrom('workspaces')
            .select(['settings'])
            .where('id', '=', workspaceId)
            .executeTakeFirst();
        const aiSearchEnabled = workspace?.settings?.['ai']?.['search'] === true;
        if (!aiSearchEnabled)
            return;
        const deleteJobId = `ai-search-disabled-${workspaceId}`;
        const pendingDelete = await this.aiQueue.getJob(deleteJobId);
        let updatedAfter;
        if (pendingDelete) {
            const state = await pendingDelete.getState();
            if (state === 'delayed') {
                updatedAfter = new Date(pendingDelete.timestamp - vector_constants_1.EMBED_RESUME_CLOCK_SKEW_MS);
            }
            try {
                await pendingDelete.remove();
                this.logger.debug(`Cancelled pending AI search delete job for workspace ${workspaceId}`);
            }
            catch (err) {
                this.logger.debug({ err }, 'Failed to cancel pending delete job');
                updatedAfter = undefined;
            }
        }
        if (this.vectorDriver instanceof turbopuffer_driver_1.TurbopufferDriver) {
            const current = this.vectorDriver.currentFingerprint();
            const stored = workspace.settings?.['ai']?.['embedding'];
            if (!(0, turbopuffer_utils_1.fingerprintMatches)(stored, current)) {
                await this.vectorDriver.deleteWorkspace(workspaceId);
                updatedAfter = undefined;
            }
            await this.queuePagesForEmbedding(workspaceId, updatedAfter);
            await this.workspaceRepo.updateAiEmbeddingFingerprint(workspaceId, current);
            return;
        }
        if (updatedAfter) {
            const hasEmbeddings = await this.db
                .selectFrom('pageEmbeddings')
                .select('id')
                .where('workspaceId', '=', workspaceId)
                .limit(1)
                .executeTakeFirst();
            if (!hasEmbeddings) {
                updatedAfter = undefined;
            }
        }
        await this.queuePagesForEmbedding(workspaceId, updatedAfter);
    }
    async handleDeleteEmbeddingsForWorkspace(workspaceId) {
        if (!workspaceId)
            return;
        await this.vectorDriver.deleteWorkspace(workspaceId);
    }
    async handleResetEmbeddingsForWorkspace(workspaceId) {
        if (!workspaceId)
            return;
        await this.vectorDriver.deleteWorkspace(workspaceId);
        await this.aiQueue.add(constants_1.QueueJob.WORKSPACE_CREATE_EMBEDDINGS, {
            workspaceId,
        });
    }
    async queuePagesForEmbedding(workspaceId, updatedAfter) {
        let lastId = null;
        const BATCH_SIZE = 2000;
        let processed = 0;
        this.logger.debug(workspaceId
            ? `Starting to queue pages for embedding for workspace ${workspaceId}`
            : 'Starting to queue pages for embedding across all workspaces with AI search enabled');
        while (true) {
            let query = this.db
                .selectFrom('pages')
                .select('id')
                .where('deletedAt', 'is', null);
            if (workspaceId) {
                query = query.where('workspaceId', '=', workspaceId);
            }
            else {
                query = query.where(({ eb }) => eb.exists(eb
                    .selectFrom('workspaces')
                    .whereRef('workspaces.id', '=', 'pages.workspaceId')
                    .where((0, kysely_1.sql) `${kysely_1.sql.ref('settings')}->'ai'->>'search'`, '=', 'true')));
            }
            const pages = await query
                .$if(Boolean(updatedAfter), (qb) => qb.where('updatedAt', '>', updatedAfter))
                .$if(Boolean(lastId), (qb) => qb.where('id', '>', lastId))
                .orderBy('id', 'asc')
                .limit(BATCH_SIZE)
                .execute();
            if (pages.length === 0)
                break;
            const jobs = pages.map((page) => ({
                name: constants_1.QueueJob.GENERATE_PAGE_EMBEDDINGS,
                data: { pageId: page.id },
                opts: {
                    jobId: page.id,
                    removeOnComplete: true,
                    removeOnFail: true,
                    attempts: 2,
                    backoff: {
                        type: 'fixed',
                        delay: 2 * 60 * 1000,
                    },
                },
            }));
            await this.aiQueue.addBulk(jobs);
            lastId = pages[pages.length - 1].id;
            processed += pages.length;
        }
        this.logger.debug(workspaceId
            ? `Successfully queued ${processed} pages for embedding for workspace ${workspaceId}`
            : `Successfully queued ${processed} pages for embedding across all workspaces`);
    }
};
exports.VectorSyncService = VectorSyncService;
exports.VectorSyncService = VectorSyncService = VectorSyncService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __param(2, (0, bullmq_1.InjectQueue)(constants_1.QueueName.AI_QUEUE)),
    __param(4, (0, common_1.Inject)(vector_constants_1.VECTOR_DRIVER_TOKEN)),
    __metadata("design:paramtypes", [Object, environment_service_1.EnvironmentService,
        bullmq_2.Queue,
        ai_service_1.AiService, Object, workspace_repo_1.WorkspaceRepo])
], VectorSyncService);
//# sourceMappingURL=vector-sync.service.js.map