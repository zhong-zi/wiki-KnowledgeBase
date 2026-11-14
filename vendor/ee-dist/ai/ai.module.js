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
var AiModule_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AiModule = void 0;
const common_1 = require("@nestjs/common");
const ai_content_controller_1 = require("./controllers/ai-content.controller");
const ai_service_1 = require("./services/ai.service");
const ai_search_service_1 = require("./services/ai-search.service");
const page_embeddings_repo_1 = require("./repos/page-embeddings.repo");
const vector_processor_1 = require("./processors/vector.processor");
const ai_provider_1 = require("./providers/ai.provider");
const vector_sync_service_1 = require("./services/vector-sync.service");
const environment_service_1 = require("../../integrations/environment/environment.service");
const drivers_1 = require("./vector/drivers");
const vector_provider_1 = require("./vector/providers/vector.provider");
const vector_constants_1 = require("./vector/vector.constants");
const vector_prewarm_service_1 = require("./vector/services/vector-prewarm.service");
let AiModule = AiModule_1 = class AiModule {
    constructor(vectorProcessor, environmentService, vectorDriver) {
        this.vectorProcessor = vectorProcessor;
        this.environmentService = environmentService;
        this.vectorDriver = vectorDriver;
        this.logger = new common_1.Logger(AiModule_1.name);
    }
    async onApplicationBootstrap() {
        try {
            if (this.environmentService.getAiDriver()?.length > 0) {
                await this.vectorProcessor.worker.pause();
                await this.vectorDriver.init();
                await this.vectorDriver.validate();
                await this.vectorProcessor.worker.resume();
            }
        }
        catch (err) {
            this.logger.error({ err }, 'AI module bootstrap failed');
            await this.vectorProcessor.worker?.resume();
        }
    }
};
exports.AiModule = AiModule;
exports.AiModule = AiModule = AiModule_1 = __decorate([
    (0, common_1.Module)({
        controllers: [ai_content_controller_1.AiContentController],
        providers: [
            ai_provider_1.aiDriverConfigProvider,
            ai_provider_1.aiDriverProvider,
            ai_service_1.AiService,
            ai_search_service_1.AiSearchService,
            page_embeddings_repo_1.PageEmbeddingsRepo,
            vector_sync_service_1.VectorSyncService,
            vector_processor_1.VectorProcessor,
            drivers_1.PgVectorDriver,
            drivers_1.TurbopufferDriver,
            vector_provider_1.vectorDriverProvider,
            vector_prewarm_service_1.VectorPrewarmService,
        ],
        exports: [ai_service_1.AiService, ai_search_service_1.AiSearchService, ai_provider_1.aiDriverConfigProvider],
    }),
    __param(2, (0, common_1.Inject)(vector_constants_1.VECTOR_DRIVER_TOKEN)),
    __metadata("design:paramtypes", [vector_processor_1.VectorProcessor,
        environment_service_1.EnvironmentService, Object])
], AiModule);
//# sourceMappingURL=ai.module.js.map