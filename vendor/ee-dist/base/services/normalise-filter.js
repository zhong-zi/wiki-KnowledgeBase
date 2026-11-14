"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.normaliseFilter = normaliseFilter;
const common_1 = require("@nestjs/common");
const engine_1 = require("../engine");
function normaliseFilter(raw) {
    if (!raw)
        return undefined;
    const parsed = engine_1.filterGroupSchema.safeParse(raw);
    if (!parsed.success) {
        throw new common_1.BadRequestException({
            message: 'Invalid filter tree',
            issues: parsed.error.issues,
        });
    }
    try {
        (0, engine_1.validateFilterTree)(parsed.data);
    }
    catch (err) {
        throw new common_1.BadRequestException(err.message);
    }
    return parsed.data;
}
//# sourceMappingURL=normalise-filter.js.map