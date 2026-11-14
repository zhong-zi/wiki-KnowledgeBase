"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DEFAULT_TENANT = exports.AZURE_DEVOPS_SCOPES = void 0;
exports.resolveTenant = resolveTenant;
exports.buildOAuthConfig = buildOAuthConfig;
exports.branchName = branchName;
const common_1 = require("@nestjs/common");
const AZURE_DEVOPS_RESOURCE = '499b84ac-1321-427f-aa17-267ca6975798';
exports.AZURE_DEVOPS_SCOPES = [
    `${AZURE_DEVOPS_RESOURCE}/vso.work`,
    `${AZURE_DEVOPS_RESOURCE}/vso.code`,
    `${AZURE_DEVOPS_RESOURCE}/vso.profile`,
    'offline_access',
];
exports.DEFAULT_TENANT = 'organizations';
const TENANT = /^[A-Za-z0-9](?:[A-Za-z0-9.-]{0,251}[A-Za-z0-9])?$/;
function resolveTenant() {
    const configured = process.env.INTEGRATION_MICROSOFT_TENANT_ID?.trim();
    if (!configured)
        return exports.DEFAULT_TENANT;
    if (!TENANT.test(configured)) {
        throw new common_1.BadRequestException('INTEGRATION_MICROSOFT_TENANT_ID is not a tenant id or domain');
    }
    return configured;
}
function buildOAuthConfig(tenant = resolveTenant()) {
    const base = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0`;
    return {
        authUrl: `${base}/authorize`,
        tokenUrl: `${base}/token`,
        scopes: exports.AZURE_DEVOPS_SCOPES,
        credentialsKey: 'microsoft',
        scopeOnRefresh: true,
    };
}
function branchName(ref) {
    return ref?.replace(/^refs\/heads\//, '');
}
//# sourceMappingURL=azure-devops.utils.js.map