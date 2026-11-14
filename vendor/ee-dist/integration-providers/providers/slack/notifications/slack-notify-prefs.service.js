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
exports.SlackNotifyPrefsService = void 0;
const common_1 = require("@nestjs/common");
const kysely_1 = require("kysely");
const integration_repo_1 = require("../../../../../core/integration/repos/integration.repo");
const integration_connection_repo_1 = require("../../../../../core/integration/repos/integration-connection.repo");
let SlackNotifyPrefsService = class SlackNotifyPrefsService {
    constructor(integrationRepo, connectionRepo) {
        this.integrationRepo = integrationRepo;
        this.connectionRepo = connectionRepo;
    }
    async getEnabledLink(workspaceId, userId) {
        const integration = await this.integrationRepo.findByWorkspaceAndType(workspaceId, 'slack');
        if (!integration)
            return null;
        const link = await this.connectionRepo.findUserLinkByUserId(integration.id, userId);
        if (!link)
            return null;
        const metadata = link.metadata;
        return metadata?.notifyEnabled === true ? link : null;
    }
    async setEnabled(integrationId, userId, enabled) {
        const link = await this.connectionRepo.findUserLinkByUserId(integrationId, userId);
        if (!link)
            return false;
        const metadata = {
            ...(link.metadata ?? {}),
            notifyEnabled: enabled,
        };
        try {
            await this.connectionRepo.update(link.id, { metadata });
        }
        catch (err) {
            if (err instanceof kysely_1.NoResultError)
                return false;
            throw err;
        }
        return true;
    }
};
exports.SlackNotifyPrefsService = SlackNotifyPrefsService;
exports.SlackNotifyPrefsService = SlackNotifyPrefsService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [integration_repo_1.IntegrationRepo,
        integration_connection_repo_1.IntegrationConnectionRepo])
], SlackNotifyPrefsService);
//# sourceMappingURL=slack-notify-prefs.service.js.map