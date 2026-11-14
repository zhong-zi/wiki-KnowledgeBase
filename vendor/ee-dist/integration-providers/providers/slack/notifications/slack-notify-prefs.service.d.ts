import { IntegrationRepo } from '../../../../../core/integration/repos/integration.repo';
import { IntegrationConnectionRepo } from '../../../../../core/integration/repos/integration-connection.repo';
import { IntegrationConnection } from "../../../../../database/types/entity.types";
export declare class SlackNotifyPrefsService {
    private readonly integrationRepo;
    private readonly connectionRepo;
    constructor(integrationRepo: IntegrationRepo, connectionRepo: IntegrationConnectionRepo);
    getEnabledLink(workspaceId: string, userId: string): Promise<IntegrationConnection | null>;
    setEnabled(integrationId: string, userId: string, enabled: boolean): Promise<boolean>;
}
