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
exports.HelpCommand = void 0;
const common_1 = require("@nestjs/common");
const slack_identity_resolver_1 = require("../../identity/slack-identity.resolver");
const help_blocks_1 = require("../../blocks/help.blocks");
let HelpCommand = class HelpCommand {
    constructor(identity) {
        this.identity = identity;
        this.type = 'help';
    }
    async handle(payload, ctx) {
        const resolved = await this.identity.resolveSlackUser(payload.team_id, payload.user_id);
        const isLinked = !!resolved;
        const blocks = (0, help_blocks_1.buildHelpBlocks)({
            isLinked,
            appUrl: ctx.appUrl,
        });
        await ctx.respond({ response_type: 'ephemeral', blocks });
    }
};
exports.HelpCommand = HelpCommand;
exports.HelpCommand = HelpCommand = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [slack_identity_resolver_1.SlackIdentityResolver])
], HelpCommand);
//# sourceMappingURL=help.command.js.map