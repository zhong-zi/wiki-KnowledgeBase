import { Workspace } from "../../../database/types/entity.types";
import { UserRepo } from "../../../database/repos/user/user.repo";
import { KyselyDB } from "../../../database/types/kysely.types";
import { GroupUserRepo } from "../../../database/repos/group/group-user.repo";
import { IntegrationConnectionRepo } from '../../../core/integration/repos/integration-connection.repo';
import { WsService } from '../../../ws/ws.service';
import { CollabAccessService } from '../../../collaboration/services/collab-access.service';
export declare class ScimUserService {
    private readonly userRepo;
    private readonly groupUserRepo;
    private readonly db;
    private readonly integrationConnectionRepo;
    private readonly wsService;
    private readonly collabAccessService;
    private readonly logger;
    constructor(userRepo: UserRepo, groupUserRepo: GroupUserRepo, db: KyselyDB, integrationConnectionRepo: IntegrationConnectionRepo, wsService: WsService, collabAccessService: CollabAccessService);
    handleGetUser(userId: string, workspace: Workspace): Promise<any>;
    handleGetUsers(resource: any, workspace: Workspace): Promise<any>;
    handleCreateUser(data: any, workspace: Workspace): Promise<any>;
    handleUpdateUser(userId: any, data: any, workspace: Workspace): Promise<any>;
    handleDeleteUser(userId: string, workspace: Workspace): Promise<void>;
}
