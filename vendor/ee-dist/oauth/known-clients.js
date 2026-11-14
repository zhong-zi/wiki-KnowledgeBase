"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KNOWN_CLIENT_ORIGINS = void 0;
exports.resolveVerifiedName = resolveVerifiedName;
exports.KNOWN_CLIENT_ORIGINS = {
    'https://claude.ai': 'Claude',
    'https://claude.com': 'Claude',
    'https://chatgpt.com': 'ChatGPT',
    'https://cursor.com': 'Cursor',
    'https://www.cursor.com': 'Cursor',
    'https://vscode.dev': 'Visual Studio Code',
    'https://insiders.vscode.dev': 'Visual Studio Code',
};
function resolveVerifiedName(redirectUri) {
    try {
        return exports.KNOWN_CLIENT_ORIGINS[new URL(redirectUri).origin] ?? null;
    }
    catch {
        return null;
    }
}
//# sourceMappingURL=known-clients.js.map