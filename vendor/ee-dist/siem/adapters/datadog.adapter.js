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
exports.DatadogAdapter = void 0;
const common_1 = require("@nestjs/common");
const base_http_adapter_1 = require("./base-http.adapter");
const outbound_agent_factory_1 = require("../../../integrations/outbound/outbound-agent.factory");
const siem_constants_1 = require("../siem.constants");
let DatadogAdapter = class DatadogAdapter extends base_http_adapter_1.BaseHttpAdapter {
    constructor(agentFactory) {
        super(agentFactory);
        this.type = 'datadog';
        this.maxBatchSize = 500;
        this.maxPayloadBytes = siem_constants_1.SIEM_MAX_PAYLOAD_BYTES;
    }
    measure(events, destination) {
        const config = destination.config;
        return this.measureBody(this.buildBody(events, config));
    }
    async send(events, destination) {
        const config = destination.config;
        const { apiKey } = destination.secrets;
        const url = `https://http-intake.logs.${config.site}/api/v2/logs`;
        const body = this.buildBody(events, config);
        const headers = {
            ...this.commonHeaders(destination.workspaceId, 'application/json'),
            'dd-api-key': apiKey,
        };
        await this.post({ url, headers, body });
    }
    buildBody(events, config) {
        return JSON.stringify(events.map((event) => ({
            ...event,
            ...standardAttributes(event),
            ddsource: 'docmost',
            service: config.service,
            ddtags: [config.tags, `workspace:${event.workspace.id}`].filter(Boolean).join(','),
            hostname: event.workspace.hostname,
            message: event.summary,
        })));
    }
};
exports.DatadogAdapter = DatadogAdapter;
exports.DatadogAdapter = DatadogAdapter = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [outbound_agent_factory_1.OutboundAgentFactory])
], DatadogAdapter);
function standardAttributes(event) {
    const out = { evt: { name: event.event } };
    if (event.actor?.id) {
        out.usr = { id: event.actor.id, name: event.actor.name, email: event.actor.email };
    }
    if (event.client.ip)
        out.network = { client: { ip: event.client.ip } };
    if (event.client.userAgent)
        out.http = { useragent: event.client.userAgent };
    return out;
}
//# sourceMappingURL=datadog.adapter.js.map