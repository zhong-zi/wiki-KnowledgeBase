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
exports.TestSiemDestinationDto = exports.SiemDestinationIdDto = exports.UpdateSiemDestinationDto = exports.CreateSiemDestinationDto = exports.SIEM_DESTINATION_TYPES = void 0;
const class_validator_1 = require("class-validator");
exports.SIEM_DESTINATION_TYPES = [
    'http',
    'splunk_hec',
    'datadog',
];
class CreateSiemDestinationDto {
}
exports.CreateSiemDestinationDto = CreateSiemDestinationDto;
__decorate([
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], CreateSiemDestinationDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsIn)(exports.SIEM_DESTINATION_TYPES),
    __metadata("design:type", String)
], CreateSiemDestinationDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateSiemDestinationDto.prototype, "config", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], CreateSiemDestinationDto.prototype, "secrets", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateSiemDestinationDto.prototype, "enabled", void 0);
class UpdateSiemDestinationDto {
}
exports.UpdateSiemDestinationDto = UpdateSiemDestinationDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], UpdateSiemDestinationDto.prototype, "destinationId", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.Length)(1, 100),
    __metadata("design:type", String)
], UpdateSiemDestinationDto.prototype, "name", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateSiemDestinationDto.prototype, "config", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], UpdateSiemDestinationDto.prototype, "secrets", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], UpdateSiemDestinationDto.prototype, "enabled", void 0);
class SiemDestinationIdDto {
}
exports.SiemDestinationIdDto = SiemDestinationIdDto;
__decorate([
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], SiemDestinationIdDto.prototype, "destinationId", void 0);
class TestSiemDestinationDto {
}
exports.TestSiemDestinationDto = TestSiemDestinationDto;
__decorate([
    (0, class_validator_1.IsIn)(exports.SIEM_DESTINATION_TYPES),
    __metadata("design:type", String)
], TestSiemDestinationDto.prototype, "type", void 0);
__decorate([
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], TestSiemDestinationDto.prototype, "config", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], TestSiemDestinationDto.prototype, "secrets", void 0);
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsUUID)(),
    __metadata("design:type", String)
], TestSiemDestinationDto.prototype, "destinationId", void 0);
//# sourceMappingURL=siem-destination.dto.js.map