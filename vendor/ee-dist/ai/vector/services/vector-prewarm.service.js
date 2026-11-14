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
var VectorPrewarmService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorPrewarmService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_kysely_1 = require("nestjs-kysely");
const vector_constants_1 = require("../vector.constants");
let VectorPrewarmService = VectorPrewarmService_1 = class VectorPrewarmService {
    constructor(vectorDriver, db) {
        this.vectorDriver = vectorDriver;
        this.db = db;
        this.logger = new common_1.Logger(VectorPrewarmService_1.name);
        this.warmedAt = new Map();
    }
    async prewarm(workspaceId) {
        if (!workspaceId)
            return;
        if (this.vectorDriver.getDriverName() !== vector_constants_1.VectorDriverName.TURBOPUFFER) {
            return;
        }
        if (!this.shouldWarm(workspaceId))
            return;
        try {
            const workspace = await this.db
                .selectFrom('workspaces')
                .select(['settings'])
                .where('id', '=', workspaceId)
                .executeTakeFirst();
            if (workspace?.settings?.['ai']?.['search'] !== true)
                return;
            await this.vectorDriver.prewarm(workspaceId);
        }
        catch (err) {
            this.logger.debug({ err }, `Failed to warm vector cache`);
        }
    }
    shouldWarm(workspaceId) {
        const now = Date.now();
        const last = this.warmedAt.get(workspaceId);
        if (last && now - last < vector_constants_1.VECTOR_PREWARM_TTL_MS)
            return false;
        this.warmedAt.set(workspaceId, now);
        return true;
    }
};
exports.VectorPrewarmService = VectorPrewarmService;
exports.VectorPrewarmService = VectorPrewarmService = VectorPrewarmService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, common_1.Inject)(vector_constants_1.VECTOR_DRIVER_TOKEN)),
    __param(1, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [Object, Object])
], VectorPrewarmService);
//# sourceMappingURL=vector-prewarm.service.js.map