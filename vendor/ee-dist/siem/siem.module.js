"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiemModule = void 0;
const common_1 = require("@nestjs/common");
const siem_controller_1 = require("./siem.controller");
const http_adapter_1 = require("./adapters/http.adapter");
const splunk_hec_adapter_1 = require("./adapters/splunk-hec.adapter");
const datadog_adapter_1 = require("./adapters/datadog.adapter");
const adapter_registry_1 = require("./adapters/adapter.registry");
const siem_event_builder_1 = require("./services/siem-event.builder");
const siem_destination_service_1 = require("./services/siem-destination.service");
const siem_delivery_service_1 = require("./services/siem-delivery.service");
const siem_notification_service_1 = require("./services/siem-notification.service");
const siem_scheduler_service_1 = require("./services/siem-scheduler.service");
const siem_processor_1 = require("./processors/siem.processor");
const notification_module_1 = require("../../core/notification/notification.module");
let SiemModule = class SiemModule {
};
exports.SiemModule = SiemModule;
exports.SiemModule = SiemModule = __decorate([
    (0, common_1.Module)({
        imports: [notification_module_1.NotificationModule],
        controllers: [siem_controller_1.SiemController],
        providers: [
            http_adapter_1.HttpAdapter,
            splunk_hec_adapter_1.SplunkHecAdapter,
            datadog_adapter_1.DatadogAdapter,
            adapter_registry_1.SiemAdapterRegistry,
            siem_event_builder_1.SiemEventBuilder,
            siem_destination_service_1.SiemDestinationService,
            siem_delivery_service_1.SiemDeliveryService,
            siem_notification_service_1.SiemNotificationService,
            siem_scheduler_service_1.SiemSchedulerService,
            siem_processor_1.SiemProcessor,
        ],
    })
], SiemModule);
//# sourceMappingURL=siem.module.js.map