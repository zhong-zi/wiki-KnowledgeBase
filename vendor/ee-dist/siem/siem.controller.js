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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SiemController = void 0;
const common_1 = require("@nestjs/common");
const throttler_1 = require("@nestjs/throttler");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const auth_user_decorator_1 = require("../../common/decorators/auth-user.decorator");
const auth_workspace_decorator_1 = require("../../common/decorators/auth-workspace.decorator");
const workspace_ability_factory_1 = require("../../core/casl/abilities/workspace-ability.factory");
const workspace_ability_type_1 = require("../../core/casl/interfaces/workspace-ability.type");
const feature_guard_1 = require("../licence/guards/feature.guard");
const feature_registry_1 = require("../licence/feature-registry");
const throttler_names_1 = require("../../integrations/throttle/throttler-names");
const user_throttler_guard_1 = require("../../integrations/throttle/user-throttler.guard");
const siem_destination_service_1 = require("./services/siem-destination.service");
const siem_destination_dto_1 = require("./dto/siem-destination.dto");
let SiemController = class SiemController {
    constructor(destinations, workspaceAbility) {
        this.destinations = destinations;
        this.workspaceAbility = workspaceAbility;
    }
    async list(user, workspace) {
        this.assertOwner(user, workspace);
        return this.destinations.list(workspace.id);
    }
    async create(dto, user, workspace) {
        this.assertOwner(user, workspace);
        return this.destinations.create(workspace.id, user.id, dto);
    }
    async update(dto, user, workspace) {
        this.assertOwner(user, workspace);
        return this.destinations.update(workspace.id, dto);
    }
    async remove(dto, user, workspace) {
        this.assertOwner(user, workspace);
        await this.destinations.remove(workspace.id, dto.destinationId);
    }
    async retry(dto, user, workspace) {
        this.assertOwner(user, workspace);
        await this.destinations.retry(workspace.id, dto.destinationId);
    }
    async test(dto, user, workspace) {
        this.assertOwner(user, workspace);
        return this.destinations.test({ id: workspace.id, name: workspace.name, hostname: workspace.hostname }, { id: user.id, name: user.name, email: user.email }, dto);
    }
    assertOwner(user, workspace) {
        const ability = this.workspaceAbility.createForUser(user, workspace);
        if (ability.cannot(workspace_ability_type_1.WorkspaceCaslAction.Manage, workspace_ability_type_1.WorkspaceCaslSubject.Audit)) {
            throw new common_1.ForbiddenException();
        }
    }
};
exports.SiemController = SiemController;
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('destinations'),
    __param(0, (0, auth_user_decorator_1.AuthUser)()),
    __param(1, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], SiemController.prototype, "list", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('destinations/create'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [siem_destination_dto_1.CreateSiemDestinationDto, Object, Object]),
    __metadata("design:returntype", Promise)
], SiemController.prototype, "create", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('destinations/update'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [siem_destination_dto_1.UpdateSiemDestinationDto, Object, Object]),
    __metadata("design:returntype", Promise)
], SiemController.prototype, "update", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('destinations/delete'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [siem_destination_dto_1.SiemDestinationIdDto, Object, Object]),
    __metadata("design:returntype", Promise)
], SiemController.prototype, "remove", null);
__decorate([
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('destinations/retry'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [siem_destination_dto_1.SiemDestinationIdDto, Object, Object]),
    __metadata("design:returntype", Promise)
], SiemController.prototype, "retry", null);
__decorate([
    (0, common_1.UseGuards)(user_throttler_guard_1.UserThrottlerGuard),
    (0, throttler_1.SkipThrottle)({
        ...throttler_names_1.ALL_NAMED_THROTTLERS_SKIPPED,
        [throttler_names_1.SIEM_TEST_THROTTLER]: false,
    }),
    (0, throttler_1.Throttle)({ [throttler_names_1.SIEM_TEST_THROTTLER]: { limit: 10, ttl: 60_000 } }),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, common_1.Post)('destinations/test'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, auth_user_decorator_1.AuthUser)()),
    __param(2, (0, auth_workspace_decorator_1.AuthWorkspace)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [siem_destination_dto_1.TestSiemDestinationDto, Object, Object]),
    __metadata("design:returntype", Promise)
], SiemController.prototype, "test", null);
exports.SiemController = SiemController = __decorate([
    (0, feature_guard_1.RequireFeature)(feature_registry_1.Feature.SIEM),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, feature_guard_1.FeatureGuard),
    (0, common_1.Controller)('siem'),
    __metadata("design:paramtypes", [siem_destination_service_1.SiemDestinationService,
        workspace_ability_factory_1.default])
], SiemController);
//# sourceMappingURL=siem.controller.js.map