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
var SiemSchedulerService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiemSchedulerService = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const nestjs_kysely_1 = require("nestjs-kysely");
const constants_1 = require("../../../integrations/queue/constants");
const siem_constants_1 = require("../siem.constants");
let SiemSchedulerService = SiemSchedulerService_1 = class SiemSchedulerService {
    constructor(queue, db) {
        this.queue = queue;
        this.db = db;
        this.logger = new common_1.Logger(SiemSchedulerService_1.name);
        this.retryTimer = null;
        this.refreshTimer = null;
        this.retryDelayMs = siem_constants_1.SIEM_SCHEDULER_RETRY_BASE_MS;
        this.destroyed = false;
    }
    async onApplicationBootstrap() {
        await this.registerSweepScheduler();
    }
    onModuleDestroy() {
        this.destroyed = true;
        if (this.retryTimer)
            clearTimeout(this.retryTimer);
        if (this.refreshTimer)
            clearInterval(this.refreshTimer);
        this.retryTimer = null;
        this.refreshTimer = null;
    }
    async registerSweepScheduler() {
        try {
            await this.queue.upsertJobScheduler(siem_constants_1.SIEM_SWEEP_SCHEDULER_ID, { every: siem_constants_1.SIEM_SWEEP_EVERY_MS }, {
                name: constants_1.QueueJob.SIEM_SWEEP,
                data: {},
                opts: { removeOnComplete: true, removeOnFail: true },
            });
            this.retryDelayMs = siem_constants_1.SIEM_SCHEDULER_RETRY_BASE_MS;
            this.startPeriodicRefresh();
        }
        catch (err) {
            this.logger.error({ err, retryInMs: this.retryDelayMs }, 'Failed to register SIEM sweep scheduler; retrying');
            if (this.destroyed)
                return;
            if (this.retryTimer)
                clearTimeout(this.retryTimer);
            this.retryTimer = setTimeout(() => {
                void this.registerSweepScheduler();
            }, this.retryDelayMs);
            this.retryDelayMs = Math.min(this.retryDelayMs * 2, siem_constants_1.SIEM_SCHEDULER_RETRY_MAX_MS);
        }
    }
    startPeriodicRefresh() {
        if (this.refreshTimer || this.destroyed)
            return;
        this.refreshTimer = setInterval(() => {
            void this.registerSweepScheduler();
        }, siem_constants_1.SIEM_SCHEDULER_REFRESH_MS);
    }
    dueDestinationsQuery(now) {
        return this.db
            .selectFrom('siemDestinations')
            .select('id')
            .where('enabled', '=', true)
            .where((eb) => eb.or([eb('nextAttemptAt', 'is', null), eb('nextAttemptAt', '<=', now)]));
    }
    async sweep() {
        const due = await this.dueDestinationsQuery(new Date()).execute();
        for (const { id } of due) {
            try {
                await this.queue.add(constants_1.QueueJob.SIEM_DELIVER, { destinationId: id }, { jobId: (0, siem_constants_1.siemDeliverJobId)(id), removeOnComplete: true, removeOnFail: true });
            }
            catch (err) {
                this.logger.error({ err, destinationId: id }, 'Failed to enqueue SIEM delivery');
            }
        }
        return due.length;
    }
};
exports.SiemSchedulerService = SiemSchedulerService;
exports.SiemSchedulerService = SiemSchedulerService = SiemSchedulerService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, bullmq_1.InjectQueue)(constants_1.QueueName.SIEM_QUEUE)),
    __param(1, (0, nestjs_kysely_1.InjectKysely)()),
    __metadata("design:paramtypes", [bullmq_2.Queue, Object])
], SiemSchedulerService);
//# sourceMappingURL=siem-scheduler.service.js.map