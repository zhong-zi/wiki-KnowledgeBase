"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DIALOG_EXPIRED_TEXT = exports.DIALOG_OPEN_FAILED_TEXT = void 0;
exports.ephemeral = ephemeral;
function ephemeral(text) {
    return { response_type: 'ephemeral', text };
}
exports.DIALOG_OPEN_FAILED_TEXT = "Couldn't open the dialog. Please try again.";
exports.DIALOG_EXPIRED_TEXT = 'That dialog has expired. Run the shortcut again.';
//# sourceMappingURL=slack-handler.interface.js.map