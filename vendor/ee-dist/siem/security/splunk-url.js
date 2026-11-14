"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplunkUrlError = void 0;
exports.normalizeSplunkHecUrl = normalizeSplunkHecUrl;
class SplunkUrlError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SplunkUrlError';
    }
}
exports.SplunkUrlError = SplunkUrlError;
const HINT = 'Enter the HEC base URL (for example https://splunk.example.com:8088) or the full /services/collector/event endpoint';
function normalizeSplunkHecUrl(input) {
    let url;
    try {
        url = new URL((input ?? '').trim());
    }
    catch {
        throw new SplunkUrlError(`Invalid Splunk HEC URL. ${HINT}`);
    }
    if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        throw new SplunkUrlError(`Splunk HEC URL must use http or https. ${HINT}`);
    }
    const path = url.pathname.replace(/\/+$/, '');
    if (path === '' || path === '/services/collector' || path === '/services/collector/event') {
        url.pathname = '/services/collector/event';
    }
    else {
        throw new SplunkUrlError(`Unsupported Splunk HEC path "${path}". ${HINT}`);
    }
    url.search = '';
    url.hash = '';
    return url.toString();
}
//# sourceMappingURL=splunk-url.js.map