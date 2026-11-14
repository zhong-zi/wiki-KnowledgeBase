"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FORBIDDEN_REDIRECT_SCHEMES = exports.MAX_CLIENT_NAME_LENGTH = exports.MAX_REDIRECT_URI_LENGTH = exports.MAX_REDIRECT_URIS = exports.MAX_DYNAMIC_CLIENTS_PER_WORKSPACE = exports.REFRESH_TOKEN_TTL_DAYS = exports.ACCESS_TOKEN_TTL = exports.AUTH_CODE_TTL_MS = exports.OAUTH_SCOPES = void 0;
exports.OAUTH_SCOPES = ['read', 'write'];
exports.AUTH_CODE_TTL_MS = 60 * 1000;
exports.ACCESS_TOKEN_TTL = '1h';
exports.REFRESH_TOKEN_TTL_DAYS = 30;
exports.MAX_DYNAMIC_CLIENTS_PER_WORKSPACE = 100;
exports.MAX_REDIRECT_URIS = 10;
exports.MAX_REDIRECT_URI_LENGTH = 512;
exports.MAX_CLIENT_NAME_LENGTH = 128;
exports.FORBIDDEN_REDIRECT_SCHEMES = ['javascript:', 'data:', 'vbscript:', 'file:', 'blob:'];
//# sourceMappingURL=oauth.constants.js.map