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
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureDevOpsModule = void 0;
const common_1 = require("@nestjs/common");
const azure_devops_provider_1 = require("./azure-devops.provider");
const azure_devops_service_1 = require("./azure-devops.service");
const integration_registry_1 = require("../../../../core/integration/registry/integration-registry");
const integration_module_1 = require("../../../../core/integration/integration.module");
let AzureDevOpsModule = class AzureDevOpsModule {
    constructor(registry, azureDevOpsProvider) {
        this.registry = registry;
        this.azureDevOpsProvider = azureDevOpsProvider;
    }
    onModuleInit() {
        this.registry.register(this.azureDevOpsProvider);
    }
};
exports.AzureDevOpsModule = AzureDevOpsModule;
exports.AzureDevOpsModule = AzureDevOpsModule = __decorate([
    (0, common_1.Module)({
        imports: [integration_module_1.IntegrationModule],
        providers: [azure_devops_provider_1.AzureDevOpsProvider, azure_devops_service_1.AzureDevOpsService],
        exports: [azure_devops_provider_1.AzureDevOpsProvider],
    }),
    __metadata("design:paramtypes", [integration_registry_1.IntegrationRegistry,
        azure_devops_provider_1.AzureDevOpsProvider])
], AzureDevOpsModule);
//# sourceMappingURL=azure-devops.module.js.map