import { OnApplicationBootstrap } from '@nestjs/common';
import { Queue } from 'bullmq';
import { KyselyDB } from "../../../database/types/kysely.types";
import { TypesenseService } from './typesense.service';
import { PageSearchService } from './page-search.service';
import { EnvironmentService } from '../../../integrations/environment/environment.service';
export declare class TypesenseInitService implements OnApplicationBootstrap {
    private readonly db;
    private readonly typesenseService;
    private readonly pageSearchService;
    private readonly environmentService;
    private readonly searchQueue;
    private readonly logger;
    private readonly declaredSchemas;
    constructor(db: KyselyDB, typesenseService: TypesenseService, pageSearchService: PageSearchService, environmentService: EnvironmentService, searchQueue: Queue);
    onApplicationBootstrap(): Promise<void>;
    checkAndSync(): Promise<void>;
    private removeHealthScheduler;
    private removeLegacyIndexJob;
    private checkCollection;
    private dropAndRecreate;
    private getDbCount;
    private createAndIndex;
}
