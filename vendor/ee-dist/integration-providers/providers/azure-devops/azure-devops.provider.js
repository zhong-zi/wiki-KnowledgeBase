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
var AzureDevOpsProvider_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AzureDevOpsProvider = exports.AZURE_DEVOPS_TYPE = void 0;
const common_1 = require("@nestjs/common");
const features_1 = require("../../../../common/features");
const integration_provider_interface_1 = require("../../../../core/integration/registry/integration-provider.interface");
const environment_service_1 = require("../../../../integrations/environment/environment.service");
const azure_devops_service_1 = require("./azure-devops.service");
const azure_devops_patterns_1 = require("./azure-devops-patterns");
const azure_devops_utils_1 = require("./azure-devops.utils");
exports.AZURE_DEVOPS_TYPE = 'azure_devops';
let AzureDevOpsProvider = AzureDevOpsProvider_1 = class AzureDevOpsProvider extends integration_provider_interface_1.IntegrationProvider {
    constructor(azureDevOpsService, environmentService) {
        super();
        this.azureDevOpsService = azureDevOpsService;
        this.logger = new common_1.Logger(AzureDevOpsProvider_1.name);
        this.definition = {
            type: exports.AZURE_DEVOPS_TYPE,
            name: 'Azure DevOps',
            description: 'Link previews for work items and pull requests',
            icon: exports.AZURE_DEVOPS_TYPE,
            capabilities: ['oauth', 'unfurl'],
            requiresFeature: features_1.Feature.INTEGRATIONS_ADVANCED,
            oauth: (0, azure_devops_utils_1.buildOAuthConfig)(azure_devops_utils_1.DEFAULT_TENANT),
            unfurlPatterns: azure_devops_patterns_1.AZURE_DEVOPS_UNFURL_PATTERNS,
        };
        if (environmentService.isCloud()) {
            this.definition.hidden = true;
        }
        try {
            (0, azure_devops_utils_1.resolveTenant)();
        }
        catch (err) {
            this.logger.warn(`${err.message}; Azure DevOps sign-in and token refresh are refused until it is fixed`);
        }
    }
    getOAuthConfig() {
        return (0, azure_devops_utils_1.buildOAuthConfig)();
    }
    async resolveAccount(opts) {
        return this.azureDevOpsService.getAccount(opts.accessToken);
    }
    async unfurl(opts) {
        const { match, patternType, accessToken, url } = opts;
        const org = match[1];
        switch (patternType) {
            case 'azure-devops-work-item':
                return this.azureDevOpsService.unfurlWorkItem(accessToken, org, parseInt(match[3], 10), url);
            case 'azure-devops-pr':
                return this.azureDevOpsService.unfurlPullRequest(accessToken, org, parseInt(match[4], 10), url);
            default:
                throw new Error(`Unknown Azure DevOps pattern type: ${patternType}`);
        }
    }
    describeLink(patternType, match) {
        return (0, azure_devops_patterns_1.describeAzureDevOpsLink)(patternType, match);
    }
};
exports.AzureDevOpsProvider = AzureDevOpsProvider;
exports.AzureDevOpsProvider = AzureDevOpsProvider = AzureDevOpsProvider_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [azure_devops_service_1.AzureDevOpsService,
        environment_service_1.EnvironmentService])
], AzureDevOpsProvider);
//# sourceMappingURL=azure-devops.provider.js.map