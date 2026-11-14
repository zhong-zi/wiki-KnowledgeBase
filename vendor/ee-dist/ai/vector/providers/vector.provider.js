"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.vectorDriverProvider = void 0;
const environment_service_1 = require("../../../../integrations/environment/environment.service");
const vector_constants_1 = require("../vector.constants");
const drivers_1 = require("../drivers");
exports.vectorDriverProvider = {
    provide: vector_constants_1.VECTOR_DRIVER_TOKEN,
    useFactory: (environmentService, pgVectorDriver, turbopufferDriver) => environmentService.getAiVectorDriver() === vector_constants_1.VectorDriverName.TURBOPUFFER
        ? turbopufferDriver
        : pgVectorDriver,
    inject: [environment_service_1.EnvironmentService, drivers_1.PgVectorDriver, drivers_1.TurbopufferDriver],
};
//# sourceMappingURL=vector.provider.js.map