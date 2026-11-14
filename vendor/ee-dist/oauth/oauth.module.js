"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuthModule = void 0;
const common_1 = require("@nestjs/common");
const token_module_1 = require("../../core/auth/token.module");
const oauth_repo_1 = require("./repos/oauth.repo");
const oauth_password_reset_listener_1 = require("./listeners/oauth-password-reset.listener");
const oauth_engine_factory_1 = require("./engine/oauth-engine.factory");
const oauth_client_service_1 = require("./services/oauth-client.service");
const oauth_authorize_service_1 = require("./services/oauth-authorize.service");
const oauth_metadata_service_1 = require("./services/oauth-metadata.service");
const oauth_token_service_1 = require("./services/oauth-token.service");
const oauth_strategy_service_1 = require("./services/oauth-strategy.service");
const oauth_grant_service_1 = require("./services/oauth-grant.service");
const oauth_cleanup_service_1 = require("./services/oauth-cleanup.service");
const oauth_controller_1 = require("./oauth.controller");
const well_known_controller_1 = require("./well-known.controller");
let OAuthModule = class OAuthModule {
};
exports.OAuthModule = OAuthModule;
exports.OAuthModule = OAuthModule = __decorate([
    (0, common_1.Module)({
        imports: [token_module_1.TokenModule],
        controllers: [oauth_controller_1.OAuthController, well_known_controller_1.OAuthWellKnownController],
        providers: [
            oauth_repo_1.OAuthRepo,
            oauth_engine_factory_1.OAuthEngineFactory,
            oauth_client_service_1.OAuthClientService,
            oauth_authorize_service_1.OAuthAuthorizeService,
            oauth_metadata_service_1.OAuthMetadataService,
            oauth_token_service_1.OAuthTokenService,
            oauth_strategy_service_1.OAuthStrategyService,
            oauth_grant_service_1.OAuthGrantService,
            oauth_cleanup_service_1.OAuthCleanupService,
            oauth_password_reset_listener_1.OAuthPasswordResetListener,
        ],
        exports: [oauth_repo_1.OAuthRepo, oauth_engine_factory_1.OAuthEngineFactory, oauth_strategy_service_1.OAuthStrategyService],
    })
], OAuthModule);
//# sourceMappingURL=oauth.module.js.map