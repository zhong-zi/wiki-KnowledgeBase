"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoogleDocsService = void 0;
const common_1 = require("@nestjs/common");
const provider_fetch_1 = require("../../../../core/integration/utils/provider-fetch");
const integration_utils_1 = require("../../../../core/integration/utils/integration.utils");
const DRIVE_API = 'https://www.googleapis.com/drive/v3';
const FILE_TYPE_LABELS = {
    'application/vnd.google-apps.document': 'Document',
    'application/vnd.google-apps.spreadsheet': 'Spreadsheet',
    'application/vnd.google-apps.presentation': 'Presentation',
    'application/vnd.google-apps.form': 'Form',
    'application/vnd.google-apps.drawing': 'Drawing',
};
let GoogleDocsService = class GoogleDocsService {
    async getAccount(accessToken) {
        const data = await this.apiGet(accessToken, '/about?fields=user');
        return (0, integration_utils_1.toProviderAccount)({
            id: data.user?.permissionId,
            displayName: data.user?.displayName,
        });
    }
    async unfurlFile(accessToken, fileId, url) {
        const data = await this.apiGet(accessToken, `/files/${fileId}?fields=id,name,mimeType,iconLink,owners,modifiedTime,lastModifyingUser,webViewLink`);
        const owner = data.owners?.[0];
        const fileType = FILE_TYPE_LABELS[data.mimeType] ?? 'File';
        return {
            title: data.name,
            description: fileType,
            url,
            provider: 'google_docs',
            providerIcon: 'google_docs',
            author: owner?.displayName,
            authorAvatarUrl: owner?.photoLink,
            metadata: {
                type: fileType.toLowerCase(),
                fileId: data.id,
                mimeType: data.mimeType,
                iconLink: data.iconLink,
                lastModifiedBy: data.lastModifyingUser?.displayName,
            },
        };
    }
    async apiGet(accessToken, path) {
        const response = await (0, provider_fetch_1.providerApiFetch)('Google Drive', `${DRIVE_API}${path}`, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                Accept: 'application/json',
            },
        });
        return response.json();
    }
};
exports.GoogleDocsService = GoogleDocsService;
exports.GoogleDocsService = GoogleDocsService = __decorate([
    (0, common_1.Injectable)()
], GoogleDocsService);
//# sourceMappingURL=google-docs.service.js.map