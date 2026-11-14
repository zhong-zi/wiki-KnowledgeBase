import type { Server, Socket } from 'socket.io';
import { BaseRepo } from "../repos/base.repo";
import { UserRepo } from "../../../database/repos/user/user.repo";
import { BasePresenceService } from './base-presence.service';
import { PageAccessService } from '../../../core/page/page-access/page-access.service';
import { SpaceMemberRepo } from "../../../database/repos/space/space-member.repo";
import { PagePermissionRepo } from "../../../database/repos/page/page-permission.repo";
type BaseOutbound = {
    operation: `base:${string}`;
} & Record<string, unknown>;
export declare class BaseWsService {
    private readonly baseRepo;
    private readonly userRepo;
    private readonly pageAccessService;
    private readonly presence;
    private readonly spaceMemberRepo;
    private readonly pagePermissionRepo;
    private readonly logger;
    private server;
    constructor(baseRepo: BaseRepo, userRepo: UserRepo, pageAccessService: PageAccessService, presence: BasePresenceService, spaceMemberRepo: SpaceMemberRepo, pagePermissionRepo: PagePermissionRepo);
    setServer(server: Server): void;
    isBaseEvent(data: any): boolean;
    handleInbound(client: Socket, raw: unknown): Promise<void>;
    emitToBase(pageId: string, payload: BaseOutbound): void;
    removeUsersFromSpaceBases(userIds: string[], spaceId: string): Promise<void>;
    removeSubscribersWithoutAccess(pageIds: string[]): Promise<void>;
    private removeLocalSubscribersWithoutAccess;
    handleDisconnect(client: Socket): Promise<void>;
    private subscribe;
    private unsubscribe;
    private handlePresence;
    private handlePresenceLeave;
    private canReadBase;
    private subscriptionsFor;
}
export {};
