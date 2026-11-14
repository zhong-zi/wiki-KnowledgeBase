import { KyselyDB } from "../../../../database/types/kysely.types";
import { VectorDriver } from '../interfaces/vector-driver.interface';
export declare class VectorPrewarmService {
    private readonly vectorDriver;
    private readonly db;
    private readonly logger;
    private readonly warmedAt;
    constructor(vectorDriver: VectorDriver, db: KyselyDB);
    prewarm(workspaceId: string): Promise<void>;
    private shouldWarm;
}
