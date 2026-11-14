"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseHttpAdapter = void 0;
const undici_1 = require("undici");
const uuid_1 = require("uuid");
const adapter_types_1 = require("./adapter.types");
const outbound_url_guard_1 = require("../../../integrations/outbound/outbound-url.guard");
const siem_constants_1 = require("../siem.constants");
const MAX_ERROR_BODY_BYTES = 64 * 1024;
async function readBoundedBody(body) {
    const chunks = [];
    let total = 0;
    try {
        for await (const chunk of body) {
            const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
            chunks.push(buf);
            total += buf.length;
            if (total >= MAX_ERROR_BODY_BYTES)
                break;
        }
    }
    catch {
    }
    await body.dump().catch(() => { });
    return Buffer.concat(chunks).toString('utf8', 0, MAX_ERROR_BODY_BYTES);
}
const UNDICI_TIMEOUT_CODES = new Set([
    'UND_ERR_CONNECT_TIMEOUT',
    'UND_ERR_HEADERS_TIMEOUT',
    'UND_ERR_BODY_TIMEOUT',
]);
function describeTransportError(err) {
    const e = err;
    const code = e?.cause?.code ?? e?.code;
    if (e?.name === 'TimeoutError' || e?.name === 'AbortError' || UNDICI_TIMEOUT_CODES.has(code)) {
        return `Request timed out after ${siem_constants_1.SIEM_REQUEST_TIMEOUT_MS / 1000}s`;
    }
    const message = e?.cause?.message ?? e?.message ?? 'Network error';
    return code ? `${code}: ${message}` : message;
}
class BaseHttpAdapter {
    constructor(agentFactory) {
        this.agentFactory = agentFactory;
    }
    measureBody(body) {
        return Buffer.byteLength(body, 'utf8');
    }
    commonHeaders(workspaceId, contentType) {
        return {
            'content-type': contentType,
            'user-agent': `Docmost-SIEM/${siem_constants_1.SERVER_VERSION}`,
            'x-docmost-delivery': (0, uuid_1.v4)(),
            'x-docmost-workspace': workspaceId,
        };
    }
    async post(req) {
        let lease;
        try {
            lease = await this.agentFactory.lease(req.url, req.tls);
        }
        catch (err) {
            if (err instanceof outbound_url_guard_1.OutboundUrlError) {
                throw new adapter_types_1.SiemDeliveryError(err.message, err.retryable);
            }
            throw new adapter_types_1.SiemDeliveryError(describeTransportError(err), true);
        }
        try {
            const res = await (0, undici_1.request)(req.url, {
                method: 'POST',
                headers: req.headers,
                body: req.body,
                dispatcher: lease.dispatcher,
                signal: AbortSignal.timeout(siem_constants_1.SIEM_REQUEST_TIMEOUT_MS),
            });
            if (res.statusCode >= 200 && res.statusCode < 300) {
                await res.body.dump().catch(() => { });
                return { statusCode: res.statusCode, bodyText: '' };
            }
            const body = await readBoundedBody(res.body);
            const suffix = body ? `: ${body}` : '';
            throw new adapter_types_1.SiemDeliveryError(`HTTP ${res.statusCode}${suffix}`, (0, adapter_types_1.isRetryableStatus)(res.statusCode), res.statusCode);
        }
        catch (err) {
            if (err instanceof adapter_types_1.SiemDeliveryError)
                throw err;
            throw new adapter_types_1.SiemDeliveryError(describeTransportError(err), true);
        }
        finally {
            await lease.release();
        }
    }
}
exports.BaseHttpAdapter = BaseHttpAdapter;
//# sourceMappingURL=base-http.adapter.js.map