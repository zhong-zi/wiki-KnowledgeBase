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
exports.SiemAdapterRegistry = void 0;
const common_1 = require("@nestjs/common");
const http_adapter_1 = require("./http.adapter");
const splunk_hec_adapter_1 = require("./splunk-hec.adapter");
const datadog_adapter_1 = require("./datadog.adapter");
let SiemAdapterRegistry = class SiemAdapterRegistry {
    constructor(http, splunk, datadog) {
        this.adapters = new Map([
            [http.type, http],
            [splunk.type, splunk],
            [datadog.type, datadog],
        ]);
    }
    get(type) {
        const adapter = this.adapters.get(type);
        if (!adapter)
            throw new Error(`No SIEM adapter registered for type "${type}"`);
        return adapter;
    }
};
exports.SiemAdapterRegistry = SiemAdapterRegistry;
exports.SiemAdapterRegistry = SiemAdapterRegistry = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [http_adapter_1.HttpAdapter, splunk_hec_adapter_1.SplunkHecAdapter, datadog_adapter_1.DatadogAdapter])
], SiemAdapterRegistry);
//# sourceMappingURL=adapter.registry.js.map