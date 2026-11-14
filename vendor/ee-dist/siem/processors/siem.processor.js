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
var SiemProcessor_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiemProcessor = void 0;
const common_1 = require("@nestjs/common");
const bullmq_1 = require("@nestjs/bullmq");
const bullmq_2 = require("bullmq");
const constants_1 = require("../../../integrations/queue/constants");
const siem_scheduler_service_1 = require("../services/siem-scheduler.service");
const siem_delivery_service_1 = require("../services/siem-delivery.service");
let SiemProcessor = SiemProcessor_1 = class SiemProcessor extends bullmq_1.WorkerHost {
    constructor(scheduler, delivery) {
        super();
        this.scheduler = scheduler;
        this.delivery = delivery;
        this.logger = new common_1.Logger(SiemProcessor_1.name);
    }
    async process(job) {
        switch (job.name) {
            case constants_1.QueueJob.SIEM_SWEEP:
                await this.scheduler.sweep();
                break;
            case constants_1.QueueJob.SIEM_DELIVER:
                await this.delivery.deliver(job.data.destinationId);
                break;
            default:
                this.logger.warn(`Unknown SIEM job ${job.name}`);
        }
    }
    onFailed(job) {
        this.logger.error(`SIEM job ${job?.name} failed. Reason: ${job?.failedReason}`);
    }
    async onModuleDestroy() {
        if (this.worker) {
            await this.worker.close();
        }
    }
};
exports.SiemProcessor = SiemProcessor;
__decorate([
    (0, bullmq_1.OnWorkerEvent)('failed'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [bullmq_2.Job]),
    __metadata("design:returntype", void 0)
], SiemProcessor.prototype, "onFailed", null);
exports.SiemProcessor = SiemProcessor = SiemProcessor_1 = __decorate([
    (0, bullmq_1.Processor)(constants_1.QueueName.SIEM_QUEUE, { concurrency: 5 }),
    __metadata("design:paramtypes", [siem_scheduler_service_1.SiemSchedulerService,
        siem_delivery_service_1.SiemDeliveryService])
], SiemProcessor);
//# sourceMappingURL=siem.processor.js.map