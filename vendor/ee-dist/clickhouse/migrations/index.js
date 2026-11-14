"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.migrations = void 0;
const migration001 = require("./001_audit");
const migration002 = require("./002_audit_user_agent");
const migration003 = require("./003_audit_id_default");
exports.migrations = [
    { name: '001_audit', up: migration001.up },
    { name: '002_audit_user_agent', up: migration002.up },
    { name: '003_audit_id_default', up: migration003.up },
];
//# sourceMappingURL=index.js.map