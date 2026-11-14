import { OnApplicationBootstrap } from '@nestjs/common';
import { VectorProcessor } from './processors/vector.processor';
import { EnvironmentService } from '../../integrations/environment/environment.service';
import { VectorDriver } from './vector/interfaces/vector-driver.interface';
export declare class AiModule implements OnApplicationBootstrap {
    private readonly vectorProcessor;
    private readonly environmentService;
    private readonly vectorDriver;
    private readonly logger;
    constructor(vectorProcessor: VectorProcessor, environmentService: EnvironmentService, vectorDriver: VectorDriver);
    onApplicationBootstrap(): Promise<void>;
}
