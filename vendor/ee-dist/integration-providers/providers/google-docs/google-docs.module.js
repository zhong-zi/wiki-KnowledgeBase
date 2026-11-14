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
exports.GoogleDocsModule = void 0;
const common_1 = require("@nestjs/common");
const google_docs_provider_1 = require("./google-docs.provider");
const google_docs_service_1 = require("./google-docs.service");
const integration_registry_1 = require("../../../../core/integration/registry/integration-registry");
const integration_module_1 = require("../../../../core/integration/integration.module");
let GoogleDocsModule = class GoogleDocsModule {
    constructor(registry, googleDocsProvider) {
        this.registry = registry;
        this.googleDocsProvider = googleDocsProvider;
    }
    onModuleInit() {
        this.registry.register(this.googleDocsProvider);
    }
};
exports.GoogleDocsModule = GoogleDocsModule;
exports.GoogleDocsModule = GoogleDocsModule = __decorate([
    (0, common_1.Module)({
        imports: [integration_module_1.IntegrationModule],
        providers: [google_docs_provider_1.GoogleDocsProvider, google_docs_service_1.GoogleDocsService],
        exports: [google_docs_provider_1.GoogleDocsProvider],
    }),
    __metadata("design:paramtypes", [integration_registry_1.IntegrationRegistry,
        google_docs_provider_1.GoogleDocsProvider])
], GoogleDocsModule);
//# sourceMappingURL=google-docs.module.js.map