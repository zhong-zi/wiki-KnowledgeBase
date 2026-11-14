import { SlackHandler, SlackHandlerContext } from '../slack-handler.interface';
import { SlackEventEnvelope } from '../../webhook/slack-event.dispatcher';
import { DomainService } from '../../../../../../integrations/environment/domain.service';
import { PageRepo } from "../../../../../../database/repos/page/page.repo";
import { PagePermissionRepo } from "../../../../../../database/repos/page/page-permission.repo";
import { SpaceMemberRepo } from "../../../../../../database/repos/space/space-member.repo";
import { UserRepo } from "../../../../../../database/repos/user/user.repo";
import { SpaceRepo } from "../../../../../../database/repos/space/space.repo";
import { SlackIdentityResolver } from '../../identity/slack-identity.resolver';
type LinkSharedEvent = SlackEventEnvelope & {
    event: {
        type: 'link_shared';
        channel: string;
        message_ts: string;
        user: string;
        links: Array<{
            url: string;
            domain: string;
        }>;
    };
};
export declare class LinkSharedHandler implements SlackHandler<LinkSharedEvent> {
    private readonly domainService;
    private readonly pageRepo;
    private readonly pagePermissionRepo;
    private readonly spaceMemberRepo;
    private readonly userRepo;
    private readonly spaceRepo;
    private readonly identity;
    readonly type = "link_shared";
    private readonly logger;
    constructor(domainService: DomainService, pageRepo: PageRepo, pagePermissionRepo: PagePermissionRepo, spaceMemberRepo: SpaceMemberRepo, userRepo: UserRepo, spaceRepo: SpaceRepo, identity: SlackIdentityResolver);
    handle(envelope: LinkSharedEvent, ctx: SlackHandlerContext): Promise<void>;
    private sendLinkPromptDm;
}
export {};
