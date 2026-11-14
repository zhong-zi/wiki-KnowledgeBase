import { KyselyDB } from "../../../database/types/kysely.types";
import { NotificationRepo } from "../../../database/repos/notification/notification.repo";
import { DomainService } from '../../../integrations/environment/domain.service';
import { NotificationService } from '../../../core/notification/notification.service';
import { SiemDestinationType } from '../siem.types';
export type SiemDestinationNotice = {
    id: string;
    name: string;
    type: SiemDestinationType;
    workspaceId: string;
    hostname: string | null;
    creatorId: string | null;
};
export type SiemDestinationFailureNotice = SiemDestinationNotice & {
    failingSince: Date;
    lastError: string;
};
export declare class SiemNotificationService {
    private readonly db;
    private readonly notifications;
    private readonly notificationRepo;
    private readonly domainService;
    private readonly logger;
    constructor(db: KyselyDB, notifications: NotificationService, notificationRepo: NotificationRepo, domainService: DomainService);
    destinationFailing(notice: SiemDestinationFailureNotice): Promise<void>;
    destinationDisabled(notice: SiemDestinationFailureNotice): Promise<void>;
    destinationRecovered(notice: SiemDestinationNotice): Promise<void>;
    private notify;
}
