"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateDestinationConfig = validateDestinationConfig;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const siem_types_1 = require("../siem.types");
const splunk_url_1 = require("../security/splunk-url");
const HEADER_NAME_RE = /^[A-Za-z0-9-]+$/;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_SECRET_LENGTH = 4096;
const SECRET_RULES = {
    http: { allowed: ['token'], required: [] },
    splunk_hec: { allowed: ['token'], required: ['token'] },
    datadog: { allowed: ['apiKey'], required: ['apiKey'] },
};
function fail(message) {
    throw new common_1.BadRequestException(message);
}
function optionalString(value, field, max = 500) {
    if (value === undefined || value === null || value === '')
        return undefined;
    if (typeof value !== 'string')
        fail(`${field} must be a string`);
    if (value.length > max)
        fail(`${field} must be at most ${max} characters`);
    return value;
}
function requiredUrl(value, field) {
    const raw = optionalString(value, field, 2048);
    if (!raw)
        fail(`${field} is required`);
    let url;
    try {
        url = new URL(raw);
    }
    catch {
        fail(`${field} must be a valid URL`);
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:')
        fail(`${field} must use http or https`);
    return url.toString();
}
function validateTls(value, isCloud) {
    if (value === undefined || value === null)
        return undefined;
    if (typeof value !== 'object' || Array.isArray(value))
        fail('tls must be an object');
    const tls = value;
    if (tls.caCert !== undefined)
        fail('tls.caCert is not supported');
    const rejectUnauthorized = tls.rejectUnauthorized === undefined ? true : tls.rejectUnauthorized;
    if (typeof rejectUnauthorized !== 'boolean')
        fail('tls.rejectUnauthorized must be a boolean');
    if (rejectUnauthorized === false && isCloud)
        fail('Certificate verification cannot be disabled on cloud');
    if (rejectUnauthorized)
        return undefined;
    return { rejectUnauthorized };
}
function validateConfig(type, raw, isCloud) {
    const tls = validateTls(raw.tls, isCloud);
    switch (type) {
        case 'http': {
            if (raw.extraHeaders !== undefined)
                fail('extraHeaders is not supported');
            const authHeaderName = optionalString(raw.authHeaderName, 'authHeaderName', 100) ??
                'Authorization';
            if (!HEADER_NAME_RE.test(authHeaderName))
                fail('authHeaderName may only contain letters, digits and hyphens');
            const authHeaderPrefix = typeof raw.authHeaderPrefix === 'string'
                ? raw.authHeaderPrefix.slice(0, 50)
                : 'Bearer ';
            const format = raw.format ?? 'json';
            if (format !== 'json' && format !== 'ndjson')
                fail('format must be "json" or "ndjson"');
            const config = {
                url: requiredUrl(raw.url, 'url'),
                authHeaderName,
                authHeaderPrefix,
                format,
                ...(tls ? { tls } : {}),
            };
            return config;
        }
        case 'splunk_hec': {
            let url;
            try {
                url = (0, splunk_url_1.normalizeSplunkHecUrl)(String(raw.url ?? ''));
            }
            catch (err) {
                if (err instanceof splunk_url_1.SplunkUrlError)
                    fail(err.message);
                throw err;
            }
            const index = optionalString(raw.index, 'index', 200);
            const host = optionalString(raw.host, 'host', 253);
            const channelId = typeof raw.channelId === 'string' && UUID_RE.test(raw.channelId)
                ? raw.channelId
                : (0, uuid_1.v4)();
            const config = {
                url,
                ...(index ? { index } : {}),
                source: optionalString(raw.source, 'source', 200) ?? 'docmost',
                sourcetype: optionalString(raw.sourcetype, 'sourcetype', 200) ?? 'docmost:audit',
                ...(host ? { host } : {}),
                channelId,
                ...(tls ? { tls } : {}),
            };
            return config;
        }
        case 'datadog': {
            const site = raw.site;
            if (typeof site !== 'string' ||
                !siem_types_1.DATADOG_SITES.includes(site)) {
                fail(`site must be one of ${siem_types_1.DATADOG_SITES.join(', ')}`);
            }
            const tags = optionalString(raw.tags, 'tags', 1000);
            const config = {
                site: site,
                service: optionalString(raw.service, 'service', 200) ?? 'docmost',
                ...(tags ? { tags } : {}),
            };
            return config;
        }
        default:
            fail(`Unsupported destination type "${type}"`);
    }
}
function validateSecrets(type, raw, requireSecrets) {
    if (type === 'http' && raw.signingSecret !== undefined) {
        fail('signingSecret is not supported');
    }
    const rules = SECRET_RULES[type];
    if (!rules)
        fail(`Unsupported destination type "${type}"`);
    const out = {};
    for (const [key, value] of Object.entries(raw)) {
        if (!rules.allowed.includes(key))
            fail(`Unknown secret "${key}" for ${type} destinations`);
        if (value === undefined || value === null || value === '')
            continue;
        if (typeof value !== 'string')
            fail(`${key} must be a string`);
        if (value.length > MAX_SECRET_LENGTH)
            fail(`${key} is too long`);
        out[key] = value;
    }
    if (requireSecrets) {
        for (const key of rules.required) {
            if (!out[key])
                fail(`${key} is required for ${type} destinations`);
        }
    }
    return out;
}
function validateDestinationConfig(input) {
    const config = validateConfig(input.type, input.config ?? {}, input.isCloud);
    const secrets = validateSecrets(input.type, input.secrets ?? {}, input.requireSecrets);
    return { config, secrets };
}
//# sourceMappingURL=destination-config.validator.js.map