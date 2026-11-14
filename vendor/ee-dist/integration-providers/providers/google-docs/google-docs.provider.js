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
exports.GoogleDocsProvider = void 0;
const common_1 = require("@nestjs/common");
const integration_provider_interface_1 = require("../../../../core/integration/registry/integration-provider.interface");
const features_1 = require("../../../../common/features");
const google_docs_service_1 = require("./google-docs.service");
let GoogleDocsProvider = class GoogleDocsProvider extends integration_provider_interface_1.IntegrationProvider {
    constructor(googleDocsService) {
        super();
        this.googleDocsService = googleDocsService;
        this.definition = {
            type: 'google_docs',
            name: 'Google Docs',
            description: 'Link previews for Google Docs, Sheets, Slides, and Drive files',
            icon: 'google_docs',
            capabilities: ['oauth', 'unfurl'],
            hidden: true,
            requiresFeature: features_1.Feature.INTEGRATIONS,
            oauth: {
                authUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
                tokenUrl: 'https://oauth2.googleapis.com/token',
                scopes: ['https://www.googleapis.com/auth/drive.metadata.readonly'],
                credentialsKey: 'google',
            },
            unfurlPatterns: [
                {
                    regex: /^https?:\/\/docs\.google\.com\/document\/d\/([\w-]+)/,
                    type: 'google-doc',
                },
                {
                    regex: /^https?:\/\/docs\.google\.com\/spreadsheets\/d\/([\w-]+)/,
                    type: 'google-sheet',
                },
                {
                    regex: /^https?:\/\/docs\.google\.com\/presentation\/d\/([\w-]+)/,
                    type: 'google-slides',
                },
                {
                    regex: /^https?:\/\/docs\.google\.com\/forms\/d\/([\w-]+)/,
                    type: 'google-form',
                },
                {
                    regex: /^https?:\/\/drive\.google\.com\/file\/d\/([\w-]+)/,
                    type: 'google-drive-file',
                },
            ],
        };
    }
    async resolveAccount(opts) {
        return this.googleDocsService.getAccount(opts.accessToken);
    }
    async unfurl(opts) {
        const { match, accessToken, url } = opts;
        const fileId = match[1];
        return this.googleDocsService.unfurlFile(accessToken, fileId, url);
    }
};
exports.GoogleDocsProvider = GoogleDocsProvider;
exports.GoogleDocsProvider = GoogleDocsProvider = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [google_docs_service_1.GoogleDocsService])
], GoogleDocsProvider);
//# sourceMappingURL=google-docs.provider.js.map