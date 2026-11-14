import { EnvironmentService } from '../../../../integrations/environment/environment.service';
import { VectorDriver } from '../interfaces/vector-driver.interface';
import { PgVectorDriver, TurbopufferDriver } from '../drivers';
export declare const vectorDriverProvider: {
    provide: string;
    useFactory: (environmentService: EnvironmentService, pgVectorDriver: PgVectorDriver, turbopufferDriver: TurbopufferDriver) => VectorDriver;
    inject: (typeof EnvironmentService | typeof TurbopufferDriver | typeof PgVectorDriver)[];
};
