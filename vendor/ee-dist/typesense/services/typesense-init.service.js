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
var TypesenseInitService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypesenseInitService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const nestjs_kysely_1 = require("nestjs-kysely");
const typesense_service_1 = require("./typesense.service");
const constants_1 = require("../constants");
const page_search_service_1 = require("./page-search.service");
const typesense_util_1 = require("../typesense.util");
const page_schema_1 = require("../schemas/page.schema");
const attachment_schema_1 = require("../schemas/attachment.schema");
const comment_schema_1 = require("../schemas/comment.schema");
const constants_2 = require("../../../integrations/queue/constants");
const environment_service_1 = require("../../../integrations/environment/environment.service");
let TypesenseInitService = TypesenseInitService_1 = class TypesenseInitService {
    constructor(db, typesenseService, pageSearchService, environmentService, searchQueue) {
        this.db = db;
        this.typesenseService = typesenseService;
        this.pageSearchService = pageSearchService;
        this.environmentService = environmentService;
        this.searchQueue = searchQueue;
        this.logger = new common_1.Logger(TypesenseInitService_1.name);
        this.declaredSchemas = {
            [constants_1.CollectionSchema.PAGE]: page_schema_1.pageSchema,
            [constants_1.CollectionSchema.ATTACHMENT]: attachment_schema_1.attachmentSchema,
            [constants_1.CollectionSchema.COMMENT]: comment_schema_1.commentSchema,
        };
    }
    async onApplicationBootstrap() {
        if (this.environmentService.getSearchDriver() !== 'typesense') {
            await this.removeHealthScheduler();
            return;
        }
        await this.removeLegacyIndexJob();
        await this.searchQueue.upsertJobScheduler(constants_1.SEARCH_HEALTH_SCHEDULER_ID, { every: constants_1.SEARCH_HEALTH_INTERVAL_MS }, {
            name: constants_2.QueueJob.SEARCH_INDEX_PAGES,
            data: {},
            opts: {
                attempts: 3,
                backoff: { type: 'exponential', delay: 30 * 1000 },
            },
        });
        this.logger.debug('Search health scheduler created');
        await this.searchQueue.add(constants_2.QueueJob.SEARCH_INDEX_PAGES, {}, {
            jobId: constants_1.SEARCH_HEALTH_BOOT_JOB_ID,
            removeOnComplete: true,
            removeOnFail: true,
            attempts: 3,
            backoff: { type: 'exponential', delay: 30 * 1000 },
        });
    }
    async checkAndSync() {
        await this.checkCollection(constants_1.CollectionSchema.PAGE);
    }
    async removeHealthScheduler() {
        try {
            const scheduler = await this.searchQueue.getJobScheduler(constants_1.SEARCH_HEALTH_SCHEDULER_ID);
            if (scheduler?.id) {
                await this.searchQueue.removeJobScheduler(constants_1.SEARCH_HEALTH_SCHEDULER_ID);
                this.logger.debug('Search health scheduler removed');
            }
        }
        catch (error) {
        }
    }
    async removeLegacyIndexJob() {
        try {
            const legacy = await this.searchQueue.getJob(constants_2.QueueJob.SEARCH_INDEX_PAGES);
            if (legacy && (await legacy.isFailed())) {
                await legacy.remove();
                this.logger.log('Removed stale failed search-index-pages job');
            }
        }
        catch (error) {
        }
    }
    async checkCollection(collectionName) {
        try {
            const exists = await this.typesenseService
                .getClient()
                .collections(collectionName)
                .exists();
            if (!exists) {
                this.logger.log(`Typesense search index ${collectionName} does not exist, creating and indexing...`);
                await this.createAndIndex(collectionName);
                return;
            }
            const live = await this.typesenseService
                .getClient()
                .collections(collectionName)
                .retrieve();
            const drift = (0, typesense_util_1.diffCollectionSchema)(this.declaredSchemas[collectionName], live);
            if (drift.length > 0) {
                this.logger.log(`Typesense search index ${collectionName} schema is outdated (${drift.join('; ')}), rebuilding the search index...`);
                await this.dropAndRecreate(collectionName);
                return;
            }
            const dbCount = await this.getDbCount(collectionName);
            const tsCount = live.num_documents || 0;
            this.logger.debug(`${collectionName} - DB: ${dbCount}, Typesense: ${tsCount}`);
            const threshold = Math.max(1, Math.floor(dbCount * 0.05));
            if (tsCount - dbCount > threshold) {
                this.logger.log(`Typesense search index ${collectionName} holds ${tsCount - dbCount} stale documents, rebuilding the search index from the database...`);
                await this.dropAndRecreate(collectionName);
            }
            else if (dbCount - tsCount > threshold) {
                this.logger.log(`Typesense search index ${collectionName} is missing ${dbCount - tsCount} documents, re-indexing from the database...`);
                await this.createAndIndex(collectionName);
            }
            else {
                this.logger.debug(`Collection ${collectionName} is in sync`);
            }
        }
        catch (error) {
            throw new Error((0, typesense_util_1.extractTypesenseError)(error));
        }
    }
    async dropAndRecreate(collectionName) {
        try {
            await this.typesenseService
                .getClient()
                .collections(collectionName)
                .delete();
            this.logger.debug(`Dropped Typesense search collection ${collectionName}`);
        }
        catch (error) {
            this.logger.error({ err: (0, typesense_util_1.sanitizeTypesenseError)(error) }, `Error dropping collection ${collectionName}`);
        }
        await this.createAndIndex(collectionName);
    }
    async getDbCount(collectionName) {
        let tableName;
        switch (collectionName) {
            case constants_1.CollectionSchema.PAGE:
                tableName = 'pages';
                break;
            case constants_1.CollectionSchema.ATTACHMENT:
                tableName = 'attachments';
                break;
            case constants_1.CollectionSchema.COMMENT:
                tableName = 'comments';
                break;
            default:
                throw new Error(`Unknown collection: ${collectionName}`);
        }
        const result = await this.db
            .selectFrom(tableName)
            .select((eb) => eb.fn.count('id').as('count'))
            .where('deletedAt', 'is', null)
            .executeTakeFirst();
        return Number(result?.count || 0);
    }
    async createAndIndex(collectionName) {
        try {
            switch (collectionName) {
                case constants_1.CollectionSchema.PAGE:
                    await this.pageSearchService.createPagesCollection();
                    await this.pageSearchService.indexAllPages();
                    break;
                default:
                    this.logger.warn(`No indexing handler for ${collectionName}`);
            }
        }
        catch (error) {
            throw new Error((0, typesense_util_1.extractTypesenseError)(error));
        }
    }
};
exports.TypesenseInitService = TypesenseInitService;
exports.TypesenseInitService = TypesenseInitService = TypesenseInitService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_kysely_1.InjectKysely)()),
    __param(4, (0, bullmq_1.InjectQueue)(constants_2.QueueName.SEARCH_QUEUE)),
    __metadata("design:paramtypes", [Object, typesense_service_1.TypesenseService,
        page_search_service_1.PageSearchService,
        environment_service_1.EnvironmentService,
        bullmq_2.Queue])
], TypesenseInitService);
//# sourceMappingURL=typesense-init.service.js.map