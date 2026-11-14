"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntegrationProvidersModule = void 0;
const common_1 = require("@nestjs/common");
const jira_module_1 = require("./providers/jira/jira.module");
const google_docs_module_1 = require("./providers/google-docs/google-docs.module");
const azure_devops_module_1 = require("./providers/azure-devops/azure-devops.module");
const gitlab_module_1 = require("./providers/gitlab/gitlab.module");
let IntegrationProvidersModule = class IntegrationProvidersModule {
};
exports.IntegrationProvidersModule = IntegrationProvidersModule;
exports.IntegrationProvidersModule = IntegrationProvidersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            jira_module_1.JiraModule,
            google_docs_module_1.GoogleDocsModule,
            azure_devops_module_1.AzureDevOpsModule,
            gitlab_module_1.GitLabModule,
        ],
    })
], IntegrationProvidersModule);
//# sourceMappingURL=integration-providers.module.js.map