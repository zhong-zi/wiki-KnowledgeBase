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
var DisconnectButtonHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.DisconnectButtonHandler = void 0;
const common_1 = require("@nestjs/common");
const slack_identity_resolver_1 = require("../../identity/slack-identity.resolver");
const integration_connection_repo_1 = require("../../../../../../core/integration/repos/integration-connection.repo");
let DisconnectButtonHandler = DisconnectButtonHandler_1 = class DisconnectButtonHandler {
    constructor(identity, connectionRepo) {
        this.identity = identity;
        this.connectionRepo = connectionRepo;
        this.type = 'block_actions:disconnect_docmost';
        this.logger = new common_1.Logger(DisconnectButtonHandler_1.name);
    }
    async handle(payload, ctx) {
        const resolved = await this.identity.resolveSlackUser(payload.team.id, payload.user.id);
        if (!resolved) {
            await ctx.respond({
                response_type: 'ephemeral',
                replace_original: true,
                text: 'No Docmost account is linked.',
            });
            return;
        }
        await this.connectionRepo.deleteUserLink(ctx.integration.id, resolved.user.id);
        this.logger.log(`Disconnected Docmost user ${resolved.user.id} from Slack user ${payload.user.id}`);
        await ctx.respond({
            response_type: 'ephemeral',
            replace_original: true,
            text: 'Disconnected. Run `/docmost help` to reconnect.',
        });
    }
};
exports.DisconnectButtonHandler = DisconnectButtonHandler;
exports.DisconnectButtonHandler = DisconnectButtonHandler = DisconnectButtonHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [slack_identity_resolver_1.SlackIdentityResolver,
        integration_connection_repo_1.IntegrationConnectionRepo])
], DisconnectButtonHandler);
//# sourceMappingURL=disconnect-button.handler.js.map