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
exports.RegisterClientDto = void 0;
exports.registerClientValidationError = registerClientValidationError;
const class_validator_1 = require("class-validator");
const oauth_constants_1 = require("../oauth.constants");
function registerClientValidationError(response) {
    const res = response;
    if (typeof res?.error === 'string' &&
        typeof res?.error_description === 'string') {
        return { error: res.error, error_description: res.error_description };
    }
    const first = Array.isArray(res?.message) ? res.message[0] : res?.message;
    return {
        error: 'invalid_client_metadata',
        error_description: typeof first === 'string' ? first : 'Invalid client metadata',
    };
}
class RegisterClientDto {
}
exports.RegisterClientDto = RegisterClientDto;
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(oauth_constants_1.MAX_CLIENT_NAME_LENGTH),
    __metadata("design:type", String)
], RegisterClientDto.prototype, "client_name", void 0);
__decorate([
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.ArrayNotEmpty)(),
    (0, class_validator_1.ArrayMaxSize)(oauth_constants_1.MAX_REDIRECT_URIS),
    (0, class_validator_1.IsString)({ each: true }),
    (0, class_validator_1.MaxLength)(oauth_constants_1.MAX_REDIRECT_URI_LENGTH, { each: true }),
    __metadata("design:type", Array)
], RegisterClientDto.prototype, "redirect_uris", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(oauth_constants_1.MAX_REDIRECT_URI_LENGTH),
    __metadata("design:type", String)
], RegisterClientDto.prototype, "client_uri", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(oauth_constants_1.MAX_REDIRECT_URI_LENGTH),
    __metadata("design:type", String)
], RegisterClientDto.prototype, "logo_uri", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(64),
    __metadata("design:type", String)
], RegisterClientDto.prototype, "scope", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], RegisterClientDto.prototype, "grant_types", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsArray)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], RegisterClientDto.prototype, "response_types", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], RegisterClientDto.prototype, "token_endpoint_auth_method", void 0);
//# sourceMappingURL=register-client.dto.js.map