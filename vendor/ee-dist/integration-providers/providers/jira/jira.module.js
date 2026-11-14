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
exports.JiraModule = void 0;
const common_1 = require("@nestjs/common");
const jira_provider_1 = require("./jira.provider");
const jira_service_1 = require("./jira.service");
const integration_registry_1 = require("../../../../core/integration/registry/integration-registry");
const integration_module_1 = require("../../../../core/integration/integration.module");
let JiraModule = class JiraModule {
    constructor(registry, jiraProvider) {
        this.registry = registry;
        this.jiraProvider = jiraProvider;
    }
    onModuleInit() {
        this.registry.register(this.jiraProvider);
    }
};
exports.JiraModule = JiraModule;
exports.JiraModule = JiraModule = __decorate([
    (0, common_1.Module)({
        imports: [integration_module_1.IntegrationModule],
        providers: [jira_provider_1.JiraProvider, jira_service_1.JiraService],
        exports: [jira_provider_1.JiraProvider],
    }),
    __metadata("design:paramtypes", [integration_registry_1.IntegrationRegistry,
        jira_provider_1.JiraProvider])
], JiraModule);
//# sourceMappingURL=jira.module.js.map