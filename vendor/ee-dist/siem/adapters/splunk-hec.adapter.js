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
exports.SplunkHecAdapter = void 0;
const common_1 = require("@nestjs/common");
const base_http_adapter_1 = require("./base-http.adapter");
const adapter_types_1 = require("./adapter.types");
const outbound_agent_factory_1 = require("../../../integrations/outbound/outbound-agent.factory");
const siem_constants_1 = require("../siem.constants");
function extractHecText(message) {
    const start = message.indexOf('{');
    if (start < 0)
        return null;
    try {
        const parsed = JSON.parse(message.slice(start));
        return typeof parsed?.text === 'string' ? parsed.text : null;
    }
    catch {
        return null;
    }
}
function decorateHecError(err) {
    if (err instanceof adapter_types_1.SiemDeliveryError && err.statusCode) {
        const text = extractHecText(err.message);
        if (text) {
            return new adapter_types_1.SiemDeliveryError(`Splunk HEC rejected the request (HTTP ${err.statusCode}): ${text}`, err.retryable, err.statusCode);
        }
    }
    return err;
}
let SplunkHecAdapter = class SplunkHecAdapter extends base_http_adapter_1.BaseHttpAdapter {
    constructor(agentFactory) {
        super(agentFactory);
        this.type = 'splunk_hec';
        this.maxBatchSize = 100;
        this.maxPayloadBytes = siem_constants_1.SIEM_MAX_PAYLOAD_BYTES;
    }
    measure(events, destination) {
        const config = destination.config;
        return this.measureBody(this.buildBody(events, config));
    }
    async send(events, destination) {
        const config = destination.config;
        const { token } = destination.secrets;
        const body = this.buildBody(events, config);
        const headers = {
            ...this.commonHeaders(destination.workspaceId, 'application/json'),
            authorization: `Splunk ${token}`,
            'x-splunk-request-channel': config.channelId,
        };
        try {
            await this.post({ url: config.url, headers, body, tls: config.tls });
        }
        catch (err) {
            throw decorateHecError(err);
        }
    }
    buildBody(events, config) {
        return events
            .map((event) => JSON.stringify({
            time: Date.parse(event.timestamp) / 1000,
            host: config.host || event.workspace.hostname,
            source: config.source,
            sourcetype: config.sourcetype,
            ...(config.index ? { index: config.index } : {}),
            event,
        }))
            .join('\n');
    }
};
exports.SplunkHecAdapter = SplunkHecAdapter;
exports.SplunkHecAdapter = SplunkHecAdapter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [outbound_agent_factory_1.OutboundAgentFactory])
], SplunkHecAdapter);
//# sourceMappingURL=splunk-hec.adapter.js.map